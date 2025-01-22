const cc = DataStudioApp.createCommunityConnector();

const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
    }
};

// Fetch data from the API
const fetchData = (url: string): any => {
    try {
        const response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response.getContentText());
    } catch (error) {
        Logger.log(`Error fetching data from ${url}: ${error}`);
        throw new Error('Failed to fetch data from the API');
    }
};

// Define fields for the schema
const getFields = () => {
    const fields = cc.getFields();
    fields.newDimension().setId('created').setName('Created Date').setType(cc.FieldType.YEAR_MONTH_DAY);
    fields.newDimension().setId('3TR').setName('3TR Date').setType(cc.FieldType.YEAR_MONTH_DAY);
    fields.newDimension().setId('active').setName('Active').setType(cc.FieldType.BOOLEAN);
    fields.newDimension().setId('region').setName('Region').setType(cc.FieldType.TEXT);
    fields.newDimension().setId('language').setName('Language').setType(cc.FieldType.TEXT);
    fields.newDimension().setId('name').setName('Name').setType(cc.FieldType.TEXT);

    return fields;
};

// Schema definition
function getSchema() {
    const fields = getFields();
    return cc.newGetSchemaResponse()
        .setFields(fields)
        .build();
}

// Configuration definition
function getConfig() {
    return cc.getConfig().build();
}

// Authentication type definition
function getAuthType() {
    const authTypes = cc.AuthType;
    return cc
        .newAuthTypeResponse()
        .setAuthType(authTypes.NONE)
        .build();
}

// Data fetching logic
const getData = (request: { fields: { name: string }[] }) => {
    const requestedFieldIds = request.fields.map(field => field.name);
    const url = 'https://backoffice.zooza.app/bo-v2/looker/companies-details';
    const data = fetchData(url);

    Logger.log(data);

    const Rows = data.map((item:any) => {
        return requestedFieldIds.map(fieldId => item[fieldId] ?? null);
    });

    const fields = getFields();

    return cc.newGetDataResponse()
        .setFields(fields.forIds(requestedFieldIds))
        .addAllRows(Rows)
        .build();
};
