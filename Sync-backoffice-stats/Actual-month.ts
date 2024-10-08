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
        date: item.date ? Utilities.formatDate(new Date(item.date), Session.getScriptTimeZone(), "yyyy-MM") : '1970-01-01'
    }));
    deleteFirstDay();
    storeDataInSheet(formattedData);
    return formattedData;
}
function deleteFirstDay(): void {
    let sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    let values = sheet.getRange("U2:U" + sheet.getLastRow()).getValues();

    const first_date = new Date(Math.min.apply(null, values.map(function(e) {
        return new Date(e[0]);
    })));
    Logger.log(`First date: ${first_date}`);

    for (let i = values.length - 1; i >= 0; i--) {
        const dateCell = values[i][0];

        if (dateCell) {
            const cellDate = new Date(dateCell);

            if (cellDate.getTime() === first_date.getTime()) {
                sheet.deleteRow(i + 2);
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
