import 'node_modules';

//get Rows base on database (dataBaseQuerry)
function _exportReportToSpreadSheetAndGetRows(
  dataBaseQuerry,
  spreadSheetID = '1CESmvINrFTBAoYo909rJOG3Ee9clgk97QD7vghchN3E'
) {
  var spreadSheetNew = SpreadsheetApp.openById(spreadSheetID);
  var report = AdsApp.report(dataBaseQuerry);
  report.exportToSheet(spreadSheetNew.getActiveSheet());
  Logger.log('Report is available at: ' + spreadSheetNew.getUrl());
  return report.rows();
}

//get Rows base on database (dataBaseQuerry)
function _getRows(dataBaseQuerry) {
  var report = AdsApp.report(dataBaseQuerry);
  return report.rows();
}

// google use money as micro value ($1 = 1000000 micro values)
function _normalValToMicros(val) {
  return (val * 1000000).toString();
}

export { _exportReportToSpreadSheetAndGetRows, _getRows, _normalValToMicros };
