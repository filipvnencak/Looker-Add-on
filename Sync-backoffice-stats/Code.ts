
var options = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
    }
};


function getBackofficeData() {
    var month = new Date().getMonth()
    var year = new Date().getFullYear()

    if(month === 0){
        month = 12
    }
    if(month === 12){
        year = year-1
    }
    var url = `https://backoffice.zooza.app/bo-v2/looker/companies?year=${year}&month=${month}`;
// @ts-ignore
    var response = UrlFetchApp.fetch(url, options)

    var ApiResult = JSON.parse(response.getContentText())

    Logger.log("Fetched data: ".concat(JSON.stringify(ApiResult)));

    const formattedData = ApiResult.map(item => ({
        ...item,
        date: item.date ? Utilities.formatDate(new Date(item.date), Session.getScriptTimeZone(), "yyyy-MM") : '1970-01-01'
    }));

    storeDataInSheet(formattedData);
    return formattedData;
}

// Function to store data in Google Sheets
function storeDataInSheet(data) {
    var sheet = SpreadsheetApp.openById('1414ivVHKEVIiUiwPy3mijltDFElU5HWmnuAM4xmU4Y8').getActiveSheet();

    // @ts-ignore
    var response = UrlFetchApp.fetch('https://backoffice.zooza.app/bo-v2/looker/companies/schema', options);
    var sampleData = JSON.parse(response.getContentText());
    var headers = Object.keys(sampleData);  // Get headers from the schema keys

//sheet.appendRow(headers);  // Add headers

    // Write data rows
    data.forEach(function (item) {
        // Add created date for each item before mapping
        item.created = new Date().toLocaleDateString();

        var row = headers.map(function (header) {
            return item[header] || 0;  // Ensure no undefined values
        });

        sheet.appendRow(row);
    });
}
function test(){
    var month = new Date().getMonth()
    var year = new Date().getFullYear()

    if(month === 0){
        month = 12
    }
    if(month === 12){
        year = year-1
    }
    var url = `https://backoffice.zooza.app/bo-v2/looker/companies?year=${year}&month=${month}`;
    Logger.log(url)
}

