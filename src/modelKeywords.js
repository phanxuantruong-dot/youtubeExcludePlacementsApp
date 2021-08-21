'use strict';
import 'node_modules';
import {
  _exportReportToSpreadSheetAndGetRows,
  _getRows,
  _normalValToMicros,
  _deleteEntireCol,
  _selectColumnValuesWithHeadline,
  _findAllCellsContainTextInRange,
  _findACellContainTextInRange,
  _getCellValue,
  _getIndexOfColumnContainText,
  _getLastColumnOf,
  _getLastRowOf,
  _selectColumnRangeWithHeadline,
  _getRowIndex,
} from './helpers.js';
import { _youtubeGAQLKwds, _spreadSheetID } from './dataBase';

function pauseDisplayKeywords(_case) {
  //1. read report from google database base on GAQL
  const rows = _getRows(_case);
  while (rows.hasNext()) {
    var row = rows.next();
    // 2. get campaign ID to get campaign name
    var campaignID = row['campaign.id'];
    var campaign = AdsApp.videoCampaigns()
      .withIds([Number(campaignID)])
      .get()
      .next();

    // 3. get adgroup ID so we can select keyword
    var adgroupID = row['ad_group.id'];
    var adgroup = AdsApp.videoAdGroups()
      .withIds([Number(adgroupID)])
      .get()
      .next();

    // 4. get the keywords ID so we can select keyword
    var keywordID = row['ad_group_criterion.criterion_id'];

    // 5. select keyword
    var selectedKeyword = _selectDisplayKeyword(adgroupID, keywordID);

    // 6. pause the keyword
    _setCPVKeyword(selectedKeyword, 0.01);

    // if pause successful -> log to the console
    Logger.log(
      'Paused Keyword + (bid = ' +
        selectedKeyword.bidding().getCpv() +
        '): ' +
        selectedKeyword.getText()
    );
    Logger.log('From: ' + campaign.getName() + '||' + adgroup.getName());
  }
}

function _selectDisplayKeyword(adgroupID, keywordID) {
  var adgroup = AdsApp.videoAdGroups()
    .withIds([Number(adgroupID)])
    .get()
    .next();
  var selectedKeyword = adgroup
    .videoTargeting() // for display adgroup this is .display()
    .keywords()
    .withIds([Number(adgroupID), Number(keywordID)])
    .get()
    .next();
  return selectedKeyword;
}

function _getCurrentBidOfKeyword(keyword) {
  var currentBid = keyword.bidding().getCpv();
  return currentBid;
}

function _setCPVKeyword(keyword, newCPV) {
  keyword.bidding().setCpv(newCPV);
  return keyword.bidding().getCpv();
}

function _decreaseCPVKeywordByPercent(keyword, percent) {
  var currentBid = keyword.bidding().getCpv();
  var newBid = (1 - percent / 100) * currentBid;
  keyword.bidding().setCpv(newBid);
  return keyword.bidding().getCpv();
}

function _increaseCPVKeywordByPercent(keyword, percent) {
  var currentBid = keyword.bidding().getCpv();
  var newBid = (1 + percent / 100) * currentBid;
  keyword.bidding().setCpv(newBid);
  return keyword.bidding().getCpv();
}

function checkViralKeywords(hour, value) {
  // we use spreadsheet to track the keywords previous bid
  // get sheet
  var spreadSheet = SpreadsheetApp.openById(_spreadSheetID);
  var sheet = spreadSheet.getSheetByName('Sheet1');

  // prepare database
  var viralKeywordsGAQL =
    _youtubeGAQLKwds +
    ' AND metrics.cost_micros >= ' +
    _normalValToMicros(_valueBasedOnHour(hour, value)) +
    ' AND metrics.all_conversions < 1';

  var rows = _getRows(viralKeywordsGAQL);
  // 1. we check each rows we got to every row inside the sheet
  if (rows.hasNext()) {
    while (rows.hasNext()) {
      var row = rows.next();

      // 2. get adgroup ID so we can select adgroup
      var adgroupID = row['ad_group.id'];

      // 3. get the keywords ID so we can select that keyword
      var keywordID = row['ad_group_criterion.criterion_id'];

      // 3.5 get the keyword
      var selectedKeyword = _selectDisplayKeyword(adgroupID, keywordID);

      // 4. compare with each row inside the sheet
      var adgroupIDs = _selectColumnValuesWithHeadline(sheet, 'ad_group.id');
      var keywordIDs = _selectColumnValuesWithHeadline(
        sheet,
        'ad_group_criterion.criterion_id'
      );
      // check if the sheet is empty, if it's empty => append row, no need to check
      var isSheetEmpty = adgroupIDs.length == 0;

      var isInSheet = false;
      if (!isSheetEmpty) {
        var isMatchAdgroupID = _isArrayContain(adgroupIDs, adgroupID);
        var isMatchKeywordID = _isArrayContain(keywordIDs, keywordID);

        isInSheet = isMatchAdgroupID && isMatchKeywordID;
      }
      // 5. if the sheet is empty or not in the spreadsheet list, append in the spreadsheet
      if (isSheetEmpty || !isInSheet) {
        var rowArr = _mappingObjectArr(row);
        sheet.appendRow(rowArr);
        const oldBid = _getCurrentBidOfKeyword(selectedKeyword);
        const newBid = _decreaseCPVKeywordByPercent(selectedKeyword, 30);
        Logger.log('Viral keywords: ' + row['ad_group_criterion.keyword.text']);
        Logger.log('Old bid: ' + oldBid);
        Logger.log('New bid: ' + newBid);
      } else {
        Logger.log(
          'Keyword already in sheet: ' + row['ad_group_criterion.keyword.text']
        );
      }
    }
  } else {
    Logger.log("There's no viral keyword!");
  }
}

function getViralKeywordsToNormal() {
  // get sheet
  var spreadSheet = SpreadsheetApp.openById(_spreadSheetID);
  var sheet = spreadSheet.getSheetByName('Sheet1');

  Logger.log(sheet.getName());

  // get last row vs last col
  var lastRow = _getLastRowOf(sheet);

  Logger.log('Last row = ' + lastRow);

  // setting up the sheet, get index of all the columns
  var colAdgroupID = _getIndexOfColumnContainText(sheet, 'ad_group.id');
  var colKeywordID = _getIndexOfColumnContainText(
    sheet,
    'ad_group_criterion.criterion_id'
  );
  var colMaxCPV = _getIndexOfColumnContainText(
    sheet,
    'ad_group_criterion.effective_cpv_bid_micros'
  );

  // get all the cost micro (unique value of the row) to loop through row by row
  var costMicroValues = _selectColumnValuesWithHeadline(
    sheet,
    'metrics.cost_micros'
  );

  Logger.log('Cost Micros Length: ' + costMicroValues.length);

  if (costMicroValues.length == 0) {
    Logger.log("There's no viral keyword adjustment happened!");
    return;
  }

  Logger.log('Start the loop!');

  // MAIN PART: loop through row by row, selected the keyword, restore to the normal value, log to the console
  for (var i = 0; i < costMicroValues.length; i++) {
    // get the row index base on unique value of that row, we choose cost micro, we use floor method because we wanna include 1.333333333333333 case
    var uniqueValue = Math.floor(+costMicroValues[i]);
    var rowIndex = _getRowIndex(sheet, uniqueValue);

    // find adgroup id and keyword id to find display keyword
    var adgroupIDValue = _getCellValue(sheet, rowIndex, colAdgroupID);
    var keywordIDValue = _getCellValue(sheet, rowIndex, colKeywordID);
    var selectedKeyword = _selectDisplayKeyword(adgroupIDValue, keywordIDValue);

    // get the normal bid
    var maxCPVMicrosValue = +_getCellValue(sheet, rowIndex, colMaxCPV);
    var normalBid = maxCPVMicrosValue / 1000000;

    // get the current bid, also the reduced 30% bid from normal
    var reducedBid = selectedKeyword.bidding().getCpv();

    Logger.log('Before set new CPV[' + i + ']');

    // return to the previous bid before reduce 30% by viral keyword check
    _setCPVKeyword(selectedKeyword, normalBid);
    Logger.log('Viral Keyword: ' + selectedKeyword.getText());
    Logger.log('Bid change from ' + reducedBid + ' to normal: ' + normalBid);
  }

  Logger.log('End loop!');

  // after restore all the viral display keyword to normal, we delete all the data inside the sheet except the 1st row
  // sheet.deleteRows(2, lastRow - 1);
}

function _mappingObjectArr(object) {
  if (JSON.stringify(object) == '{}') return;
  var arr = [];
  arr.push(object['campaign.id']);
  arr.push(object['ad_group.id']);
  arr.push(object['segments.ad_network_type']);
  arr.push(object['metrics.clicks']);
  arr.push(object['metrics.average_cpc']);
  arr.push(object['metrics.cost_micros']);
  arr.push(object['metrics.all_conversions']);
  arr.push(object['ad_group_criterion.effective_cpv_bid_micros']);
  arr.push(object['ad_group_criterion.criterion_id']);
  arr.push(object['ad_group_criterion.keyword.text']);
  return arr;
}

function _isArrayContain(array, value) {
  var isContain = false;
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) isContain = true;
  }
  return isContain;
}

// this function will return a value, before a specific pivot 'hour', the return value will be 'value', after that pivot 'hour', the value is the current realtime hour
function _valueBasedOnHour(hour, value) {
  // get current hour
  var time = new Date().getHours();
  // check if now was over 'hour'
  var isTimeGreaterThan6 = time >= hour;
  // if over 'hour', the value will be current hour
  return isTimeGreaterThan6 ? time : value;
}

export { pauseDisplayKeywords, checkViralKeywords, getViralKeywordsToNormal };
