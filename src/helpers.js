import 'node_modules';

function _exportReportToSpreadSheetAndGetRows(spreadSheetID, querry) {
  var spreadSheetNew = SpreadsheetApp.openById(spreadSheetID);
  var report = AdsApp.report(querry);
  report.exportToSheet(spreadSheetNew.getActiveSheet());
  Logger.log('Report is available at: ' + spreadSheetNew.getUrl());
  return report.rows();
}

function _getRows(querry) {
  var report = AdsApp.report(querry);
  return report.rows();
}

function _normalValToMicros(val) {
  return (val * 1000000).toString();
}

export { _exportReportToSpreadSheetAndGetRows, _getRows, _normalValToMicros };
