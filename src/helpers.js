import 'node_modules';

//get Rows base on database (dataBaseQuerry)
function _exportReportToSpreadSheetAndGetRows(dataBaseQuerry, spreadSheetID) {
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

function _microsValToNormal(val) {
  return (val / 1000000).toString();
}

function _deleteEntireCol(sheet, text) {
  var colIndex = _getIndexOfColumnContainText(text);
  if (colIndex) {
    sheet.deleteColumn(colIndex);
  }
}

function _selectEntireColumnWithHeadline(sheet, text) {
  var lastRow = _getLastRowOf(sheet);
  if (lastRow < 2) return;
  var indexColumnContainsText = _getIndexOfColumnContainText(sheet, text);
  if (indexColumnContainsText) {
    var rangeOfColumnContainsText = sheet.getRange(
      2,
      indexColumnContainsText,
      lastRow - 1,
      1 //number of columns from the start column (indexColumnContainsText)
    );
    return rangeOfColumnContainsText;
  }
}

function _findAllCellsContainTextInRange(text, range) {
  var cells = range.createTextFinder(text).findAll();
  return cells;
}

function _findACellContainTextInRange(text, range) {
  var cell = range.createTextFinder(text).findNext();
  return cell;
}

function _getCellValue(sheet, row, col) {
  var dataRange = sheet.getDataRange();
  return dataRange.getCell(row, col).getValue();
}

function _getIndexOfColumnContainText(sheet, text) {
  var lastCol = _getLastColumnOf(sheet);
  var rangeOfFirstRow = sheet.getRange(1, 1, 1, lastCol);

  var cellWithText = rangeOfFirstRow.createTextFinder(text).findNext();
  if (cellWithText) {
    var indexColumnContainsText = cellWithText.getColumn();
    return indexColumnContainsText;
  } else return;
}

function _getLastColumnOf(sheet) {
  var dataRange = sheet.getDataRange();
  var lastCol = dataRange.getLastColumn();
  return lastCol;
}

function _getLastRowOf(sheet) {
  var dataRange = sheet.getDataRange();
  var lastRow = dataRange.getLastRow();
  return lastRow;
}

export {
  _exportReportToSpreadSheetAndGetRows,
  _getRows,
  _normalValToMicros,
  _deleteEntireCol,
  _selectEntireColumnWithHeadline,
  _findAllCellsContainTextInRange,
  _findACellContainTextInRange,
  _getCellValue,
  _getIndexOfColumnContainText,
  _getLastColumnOf,
  _getLastRowOf,
};
