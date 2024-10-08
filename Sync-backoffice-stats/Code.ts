/// <reference types="google-apps-script" />
const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
  method: 'get',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
  }
};
const sheetId = '1414ivVHKEVIiUiwPy3mijltDFElU5HWmnuAM4xmU4Y8'


async function getBackofficeData() {
  let month = new Date().getMonth()+1;
  let year = new Date().getFullYear()

  let url = `https://backoffice.zooza.app/bo-v2/looker/companies?year=${year}&month=${month}`;

  let response = UrlFetchApp.fetch(url, options)

  let ApiResult = JSON.parse(response.getContentText())

  Logger.log("Fetched data: ".concat(JSON.stringify(ApiResult)));

  const formattedData = ApiResult.map(item => ({
    ...item,
    date: item.date ? Utilities.formatDate(new Date(item.date), Session.getScriptTimeZone(), "yyyy-MM") : '1970-01-01'
  }));
  deleteActualMonthData();
  storeDataInSheet(formattedData);
  return formattedData;
}
function deleteActualMonthData(): void {
  let sheet = SpreadsheetApp.openById(sheetId).getSheetByName('monthly');
  let values = sheet.getRange("U2:U" + sheet.getLastRow()).getValues();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();


  for (let i = values.length - 1; i >= 0; i--) {
    const dateCell = values[i][0];

    if (dateCell) {
      const cellDate = new Date(dateCell);

      if (cellDate.getMonth() === currentMonth && cellDate.getFullYear() === currentYear) {

        sheet.deleteRow(i + 2);
      }
    }
  }

  Logger.log('Rows from the current month have been deleted.');
}

function storeDataInSheet(data) {
  let sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();

  let response = UrlFetchApp.fetch('https://backoffice.zooza.app/bo-v2/looker/companies/schema', options);
  let sampleData = JSON.parse(response.getContentText());
  let headers = Object.keys(sampleData);



  data.forEach(function (item) {

    item.created = new Date().toLocaleDateString();

    let row = headers.map(function (header) {
      return item[header] || 0;  // Ensure no undefined values
    });

    sheet.appendRow(row);
  });
}


