'use strict';
import 'node_modules';
import { _exportReportToSpreadSheetAndGetRows, _getRows } from './helpers.js';

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

export { _pauseDisplayKeywords };
