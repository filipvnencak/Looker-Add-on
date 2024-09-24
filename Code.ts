const cc = DataStudioApp.createCommunityConnector();

const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
    }
};

function fetchPaginatedData(url: string, year: number, startMonth: number, endMonth: number): any[] {
    let allData = [];

    for (let month = startMonth; month <= endMonth; month++) {
        const paginatedUrl = `${url}?year=${year}&month=${month}`;
        try {
            //@ts-ignore
            const response = UrlFetchApp.fetch(paginatedUrl, options);
            const data = JSON.parse(response.getContentText());
            allData = allData.concat(data);
        } catch (error) {
            Logger.log(`Error fetching data for month ${month}: ${error}`);
        }
    }

    return allData;
}

function getBackofficeData() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const startMonth = 1;
    const url = 'https://backoffice.zooza.app/bo-v2/looker/companies';

    const ApiResult = fetchPaginatedData(url, year, startMonth, month);
    Logger.log(`Fetched data: ${JSON.stringify(ApiResult)}`);

    const formattedData = ApiResult.map(item => ({
        ...item,
        date: item.date ? Utilities.formatDate(new Date(item.date), Session.getScriptTimeZone(), "YYYYMM") : '1970-01-01'
    }));
    const schema = getFields();

    storeDataInSheet(formattedData, schema);
    return formattedData;
}

function storeDataInSheet(data: any[], schema: any) {
    const sheet = SpreadsheetApp.openById('1414ivVHKEVIiUiwPy3mijltDFElU5HWmnuAM4xmU4Y8').getActiveSheet();
    sheet.clear(); // Clear existing content

    // Write headers
    const headers = schema.asArray().map(field => field.getName());
    sheet.appendRow(headers);

    // Write data
    data.forEach(item => {
        const row = headers.map(header => item[header]);
        sheet.appendRow(row);
    });
}

function getFields() {
    const fields = cc.getFields();
    // @ts-ignore
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

function getData(request) {
    const userProperties = PropertiesService.getUserProperties();
    const requestedFieldIds = request.fields.map((field) => field.name);
    const data = getBackofficeData();
    userProperties.setProperty('data', JSON.stringify(data));

    Logger.log(data); // Log the data for debugging
    const Rows = data.map((item) => {
        return requestedFieldIds.map((field) => item[field]);
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
