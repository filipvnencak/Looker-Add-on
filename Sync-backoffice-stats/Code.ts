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
  let sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  let values = sheet.getDataRange().getValues();
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

  for (let i = values.length - 1; i >= 0; i--) {
    let row = values[i];
    let dateCell = row[0]; // Assuming the date is in the first column
    if (dateCell) { // Check if the cell contains a date
      var cellDate = new Date(dateCell); // Convert to a Date object

      if (cellDate.getMonth() + 1 === todayMonth && cellDate.getFullYear() === todayYear) {
        // If the date matches the current month and year, delete the row
        sheet.deleteRow(i + 2); // Add 2 because i is zero-based and data starts at row 2
      }
    }
  }
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


