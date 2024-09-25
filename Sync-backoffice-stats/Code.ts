/// <reference types="google-apps-script" />
const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
  method: 'get',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'FsSIxImXMWLT2F0rubei'
  }
};


function getBackofficeData() {
  let month = new Date().getMonth();
  let year = new Date().getFullYear()

  if(month === 0){
    month = 12
  }
  if(month === 12){
    year = year-1
  }
  let url = `https://backoffice.zooza.app/bo-v2/looker/companies?year=${year}&month=${month}`;

  let response = UrlFetchApp.fetch(url, options)

  let ApiResult = JSON.parse(response.getContentText())

  Logger.log("Fetched data: ".concat(JSON.stringify(ApiResult)));

  const formattedData = ApiResult.map(item => ({
    ...item,
    date: item.date ? Utilities.formatDate(new Date(item.date), Session.getScriptTimeZone(), "yyyy-MM") : '1970-01-01'
  }));

  storeDataInSheet(formattedData);
  return formattedData;
}

function storeDataInSheet(data) {
  let sheet = SpreadsheetApp.openById('1414ivVHKEVIiUiwPy3mijltDFElU5HWmnuAM4xmU4Y8').getActiveSheet();

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


