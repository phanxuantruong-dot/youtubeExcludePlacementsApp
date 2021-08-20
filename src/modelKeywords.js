'use strict';
import 'node_modules';
import {
  _exportReportToSpreadSheetAndGetRows,
  _getRows,
  _normalValToMicros,
  _deleteEntireCol,
  _selectEntireColumnWithHeadline,
  _findAllCellsContainTextInRange,
  _findACellContainTextInRange,
  _getCellValue,
  _getIndexOfColumnContainText,
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

function checkViralKeywords() {
  // we use spreadsheet to track the keywords previous bid
  // get sheet
  var spreadSheet = SpreadsheetApp.openById(_spreadSheetID);
  var sheet = spreadSheet.getSheetByName('Sheet1');

  // prepare database
  var viralKeywordsGAQL =
    _youtubeGAQLKwds +
    ' AND metrics.cost_micros >= ' +
    _normalValToMicros(_valueBasedOnHour(6, 10)) +
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
      var adgroupIDs = _selectEntireColumnWithHeadline(sheet, 'ad_group.id');
      var keywordIDs = _selectEntireColumnWithHeadline(
        sheet,
        'ad_group_criterion.criterion_id'
      );
      var isMatchAdgroupID = adgroupIDs.some(function (id) {
        return id == adgroupID;
      });
      var isMatchKeywordID = keywordIDs.some(function (id) {
        return id == keywordID;
      });
      var isInSheet = isMatchAdgroupID && isMatchKeywordID;

      // 5. if not in the spreadsheet list, append in the spreadsheet
      if (!isInSheet) {
        sheet.appendRow(row);
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

// this function will return a value, before a specific pivot 'hour', the return value will be 'value', after that pivot 'hour', the value is the current realtime hour
function _valueBasedOnHour(hour, value) {
  // get current hour
  var time = new Date().getHours();
  // check if now was over 'hour'
  var isTimeGreaterThan6 = time >= hour;
  // if over 'hour', the value will be current hour
  return isTimeGreaterThan6 ? time : value;
}

export { pauseDisplayKeywords, checkViralKeywords };
