'use strict';
import 'node_modules';
import { _exportReportToSpreadSheetAndGetRows, _getRows } from './helpers.js';
import { _allConvPlacements } from './dataBase.js';

function excludeYoutubePlacementsAtCampaignLevel(_case) {
  //1. read report from google database base on GAQL
  var rows = _getRows(_case);
  while (rows.hasNext()) {
    var row = rows.next();

    // 2. Id and domain has same row  => exclude domain  from campaign ID => get campaign ID
    var campaignId = row['campaign.id'];

    // 3. select domain url, but the exclude video operator need video id => using split function to take ID
    var domain = row['detail_placement_view.target_url'];
    var videoId = domain.split('/')[2];
    var videoName = row['detail_placement_view.display_name'];

    // 4. select campaign base on id
    var campaign = AdsApp.videoCampaigns()
      .withIds([Number(campaignId)])
      .get()
      .next();

    // 5. build an exclude placement at campaign level

    var excludeYoutubePlacementsOperation = campaign
      .videoTargeting() // for display campaign this is .display()
      .newYouTubeVideoBuilder()
      .withVideoId(videoId)
      .exclude();
    // 3. if exclude successful -> log to the console
    if (excludeYoutubePlacementsOperation.isSuccessful()) {
      Logger.log(
        'Excluded placement from campaign: ' +
          campaign.getName() +
          ' video name: ' +
          videoName
      );
    } else {
      Logger.log('Exclude video: ' + videoName + ' FAIL!!!');
    }
  }
}

function checkYoutubeExclusionList() {
  // list all the placements that have conversion inside detail placements report last 30 days
  var rows = _getRows(_allConvPlacements);
  while (rows.hasNext()) {
    var row = rows.next();
    // setting up things
    var campaignId = Number(row['campaign.id']);
    var domain = row['detail_placement_view.target_url'];
    var videoId = domain.split('/')[2];
    var videoName = row['detail_placement_view.display_name'];
    var campaign = AdsApp.videoCampaigns().withIds([campaignId]).get().next();

    // put all exclude placements ID of that campaign inside an array
    var excludedVideoIds = _getExcludedPlacmentsFromCampaign(campaignId);
    // check if these placement urls match any ID in the campaign exclusion list?
    var isPathExclude = excludedVideoIds.some(function (id) {
      return videoId === id;
    });
    // if have => remove from that exclusion list.
    if (isPathExclude) {
      Logger.log('This video have conv and was excluded: ' + videoName);
      Logger.log('From campaign: ' + campaign.getName());
    }
  }
}

// checkYoutubeExclusionList helper function, return an array of exclusion list
function _getExcludedPlacmentsFromCampaign(id) {
  var campaign = AdsApp.videoCampaigns().withIds([id]).get().next();
  var excludedVideos = campaign.videoTargeting().excludedYouTubeVideos().get();
  var excludedVideoIds = [];
  while (excludedVideos.hasNext()) {
    var excludedVideo = excludedVideos.next();
    excludedVideoIds.push(excludedVideo.getVideoId());
  }
  return excludedVideoIds;
}

//

export { excludeYoutubePlacementsAtCampaignLevel, checkYoutubeExclusionList };
