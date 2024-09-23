const cc = DataStudioApp.createCommunityConnector();

const options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
    }
};
function getBackofficeData() {

    //@ts-ignore
    const response = UrlFetchApp.fetch('https://backoffice-test.zooza.app/bo-v2/looker/companies', options);
    const ApiResult = JSON.parse(response.getContentText());
    return ApiResult;
}


function getFields() {
    const fields = cc.getFields();
    // @ts-ignore
    const response = UrlFetchApp.fetch('https://backoffice-test.zooza.app/bo-v2/looker/companies/schema', options);
    const sampleData = JSON.parse(response.getContentText());
    // {
    //     "company_id": "number",
    //     "company_name": "string",
    //     "registrations": "number",
    //     "orders": "number",
    //     "schedules": "number",
    //     "attendance": "number",
    //     "attendance_attended": "number",
    //     "active_schedules": "number",
    //     "incomes": "number",
    //     "online_income": "number",
    //     "transactions": "number",
    //     "online_transactions": "number",
    //     "emails_sent": "number",
    //     "widgets_visits": "number",
    //     "events": "number",
    //     "date": "date"
    // }

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
                    .setType(cc.FieldType.YEAR_MONTH_DAY);
                break;
            default:
                throw new Error(`Unknown type: ${type}`);
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
