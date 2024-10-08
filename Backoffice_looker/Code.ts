import {CompanyReport} from "./types";

const cc = DataStudioApp.createCommunityConnector();

const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
    }
};



function getBackofficeData() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const startMonth = 1;
    const url = 'https://backoffice.zooza.app/bo-v2/looker/companies/last_month';

    const ApiResult = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    Logger.log(`Fetched data: ${JSON.stringify(ApiResult)}`);

    const formattedData = ApiResult.map((item: any) => ({
        ...item,
        date: item.date ? Utilities.formatDate(new Date(item.date), Session.getScriptTimeZone(), "YYYY-MM") : '1970-01-01'
    }));
    const schema = getFields();


    return formattedData;
}



function getFields() {
    const fields = cc.getFields();
    const response = UrlFetchApp.fetch('https://backoffice.zooza.app/bo-v2/looker/companies/schema', options);
    const sampleData = JSON.parse(response.getContentText());

    for (const [key, type] of Object.entries(sampleData)) {
        switch (type) {
            case 'number':
                fields.newMetric()
                    .setId(key)
                    .setName(key)
                    .setType(cc.FieldType.NUMBER);
                break;
            case 'string':
                fields.newDimension()
                    .setId(key)
                    .setName(key)
                    .setType(cc.FieldType.TEXT);
                break;
            case 'date':
                fields.newDimension()
                    .setId(key)
                    .setName(key)
                    .setType(cc.FieldType.YEAR_MONTH);
                break;
            default:
                fields.newDimension()
                    .setId(key)
                    .setName(key)
                    .setType(cc.FieldType.TEXT);
                break;
        }
    }

    return fields;
}

function getSchema() {
    return cc.newGetSchemaResponse()
        .setFields(getFields())
        .build();
}

function getData(request: any) {
    const userProperties = PropertiesService.getUserProperties();
    const requestedFieldIds = request.fields.map((field: {name:string}) => field.name);
    const data = getBackofficeData();
    userProperties.setProperty('data', JSON.stringify(data));

    Logger.log(data); // Log the data for debugging
    const Rows = data.map((item:any) => {
        return requestedFieldIds.map((field: string) => item[field]);
    });
    return cc.newGetDataResponse()
        .setFields(getFields().forIds(requestedFieldIds))
        .addAllRows(Rows)
        .build();
}

function getConfig() {
    return cc.getConfig().build();
}

function getAuthType() {
    const authTypes = cc.AuthType;
    return cc
        .newAuthTypeResponse()
        .setAuthType(authTypes.NONE)
        .build();
}
