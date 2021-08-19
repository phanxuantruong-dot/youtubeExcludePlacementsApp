'use strict';
import 'node_modules';
import { _exportReportToSpreadSheetAndGetRows, _getRows } from './helpers.js';

function _pauseDisplayKeywords(_case) {
  //1. read report from google database base on GAQL
  const rows = _exportReportToSpreadSheetAndGetRows(_case);
  //   while (rows.hasNext()) {
  //     var row = rows.next();

  //     // 2. Id and domain has same row  => exclude domain  from campaign ID => get campaign ID
  //     var campaignId = row['campaign.id'];

  //     // 3. select domain url, but the exclude video operator need video id => using split function to take ID
  //     var domain = row['detail_placement_view.target_url'];
  //     var videoId = domain.split('/')[2];
  //     var videoName = row['detail_placement_view.display_name'];

  //     // 4. select campaign base on id
  //     var campaign = AdsApp.videoCampaigns()
  //       .withIds([Number(campaignId)])
  //       .get()
  //       .next();

  //     // 5. build an exclude placement at campaign level

  //     var excludeYoutubePlacementsOperation = campaign
  //       .videoTargeting() // for display campaign this is .display()
  //       .newYouTubeVideoBuilder()
  //       .withVideoId(videoId)
  //       .exclude();
  //     // 3. if exclude successful -> log to the console
  //     if (excludeYoutubePlacementsOperation.isSuccessful()) {
  //       Logger.log(
  //         'Excluded placement from campaign: ' +
  //           campaign.getName() +
  //           ' video name: ' +
  //           videoName
  //       );
  //     } else {
  //       Logger.log('Exclude video: ' + videoName + ' FAIL!!!');
  //     }
  //   }
}

export { _pauseDisplayKeywords };
