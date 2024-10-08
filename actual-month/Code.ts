/// <reference types="google-apps-script" />
const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
    }
};
const sheetId = '19bGzBsFl3uR8uuaolKJ1Y2vKb2J4gsJulOGnWN3iPwE'


async function runFetching() {


    let url = `https://backoffice.zooza.app/bo-v2/looker/companies/last_month`;

    let response = UrlFetchApp.fetch(url, options)

    let ApiResult = JSON.parse(response.getContentText())

    Logger.log("Fetched data: ".concat(JSON.stringify(ApiResult)));

    const formattedData = ApiResult.map(item => ({
        ...item,
        date: item.date ? Utilities.formatDate(new Date(item.date), Session.getScriptTimeZone(), "yyyy-MM-dd") : '1970-01-01'
    }));
    deleteOlderThan30Days();
    storeDataInSheet(formattedData);
    return formattedData;
}
function deleteOlderThan30Days(): void {
    let sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    let values = sheet.getRange("U2:U" + sheet.getLastRow()).getValues();

    const today = new Date();
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(today.getDate() - 30);
    Logger.log(`Date 30 days ago: ${date30DaysAgo}`);

    for (let i = values.length - 1; i >= 0; i--) {
        const dateCell = values[i][0];

        if (dateCell) {
            const cellDate = new Date(dateCell);

            if (cellDate < date30DaysAgo) {
                sheet.deleteRow(i + 2); // Add 2 because i is zero-based and data starts at row 2
            }
        }
    }
}
const storeDataInSheet = (data) => {
    let sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();

    let response = UrlFetchApp.fetch('https://backoffice.zooza.app/bo-v2/looker/companies/schema', options);
    let sampleData = JSON.parse(response.getContentText());
    let headers = Object.keys(sampleData);

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    let values = data.map(item => headers.map(header => item[header]));

    sheet.getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length).setValues(values);
};
