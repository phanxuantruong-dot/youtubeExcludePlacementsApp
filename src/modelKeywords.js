'use strict';
import 'node_modules';
import { _exportReportToSpreadSheetAndGetRows, _getRows } from './helpers.js';
import { _youtubeGAQLKwds, _spreadSheetID } from './dataBase';

function _pauseDisplayKeywords(_case) {
  //1. read report from google database base on GAQL
  const rows = _getRows(_case);
  while (rows.hasNext()) {
    var row = rows.next();

    // 2. get adgroup ID so we can select adgroup
    var adgroupID = row['ad_group.id'];
    // 2.5 get campaign ID so we can get the name of the campaign
    var campaignID = row[`campaign.id`];

    // 3. get the keywords ID so we can change on that keywords
    var keywordID = row['ad_group_criterion.criterion_id'];

    // 4. select adgroup base on id
    var adgroup = AdsApp.videoAdGroups()
      .withIds([Number(adgroupID)])
      .get()
      .next();
    var campaign = AdsApp.videoCampaigns()
      .withIds([Number(campaignID)])
      .get()
      .next();

    // 5. select the keyword base on keyword id from that adgroup

    var selectedKeyword = adgroup
      .videoTargeting() // for display adgroup this is .display()
      .keywords()
      .withIds([Number(adgroupID), Number(keywordID)])
      .get()
      .next();

    // pause the keywords
    selectedKeyword.bidding().setCpv(0);

    // if pause successful -> log to the console
    Logger.log('Paused Keyword (bid = 0.01): ' + selectedKeyword.getText());
    Logger.log('From: ' + campaign.getName() + '||' + adgroup.getName());
  }
}

function _checkViralKeywords() {
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
  while (rows.hasNext()) {
    var row = rows.next();

    // 2. get adgroup ID so we can select adgroup
    var adgroupID = row['ad_group.id'];

    // 3. get the keywords ID so we can change on that keywords
    var keywordID = row['ad_group_criterion.criterion_id'];
    // 4. compare with each row inside the sheet
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

export { _pauseDisplayKeywords };
