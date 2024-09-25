
const options = {
  method: 'GET',
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
// @ts-ignore
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

// Function to store data in Google Sheets
function storeDataInSheet(data) {
  let sheet = SpreadsheetApp.openById('1414ivVHKEVIiUiwPy3mijltDFElU5HWmnuAM4xmU4Y8').getActiveSheet();

  // @ts-ignore
  let response = UrlFetchApp.fetch('https://backoffice.zooza.app/bo-v2/looker/companies/schema', options);
  let sampleData = JSON.parse(response.getContentText());
  let headers = Object.keys(sampleData);  // Get headers from the schema keys

//sheet.appendRow(headers);  // Add headers

  // Write data rows
  data.forEach(function (item) {
    // Add created date for each item before mapping
    item.created = new Date().toLocaleDateString();

    let row = headers.map(function (header) {
      return item[header] || 0;  // Ensure no undefined values
    });

    sheet.appendRow(row);
  });
}


