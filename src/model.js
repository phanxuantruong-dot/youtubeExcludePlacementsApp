'use strict';
import 'node_modules';
import { _exportReportToSpreadSheetAndGetRows, _getRows } from './helpers.js';

var _spreadSheetID = '1CESmvINrFTBAoYo909rJOG3Ee9clgk97QD7vghchN3E';
var _youtubeGAQL =
  'SELECT campaign.name,' +
  'campaign.id,' +
  'detail_placement_view.target_url,' +
  'segments.ad_network_type,' +
  'metrics.impressions,' +
  'metrics.clicks,' +
  'metrics.all_conversions,' +
  'metrics.ctr' +
  ' FROM detail_placement_view ' +
  ' WHERE ' +
  'campaign.status = ENABLED' +
  ' AND segments.ad_network_type = YOUTUBE_WATCH' +
  ' AND segments.date DURING TODAY';

function excludeYoutubePlacementsAtCampaignLevel() {
  //1. read report from google database base on GAQL
  var rows = _getRows(_youtubeGAQL);
  while (rows.hasNext()) {
    var row = rows.next();

    // 2. Id and domain has same row  => exclude domain  from campaign ID => get campaign ID
    var campaignId = row['campaign.id'];

    // 3. select domain url, but the exclude video operator need video id => using split function to take ID
    var domain = row['detail_placement_view.target_url'];
    var videoId = domain.split('/')[2];

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
    if (excludeYoutubePlacementsOperation.isSuccessful())
      Logger.log(
        'Excluded placement: ' +
          videoId +
          ' from campaign: ' +
          campaign.getName()
      );
  }
}

export { excludeYoutubePlacementsAtCampaignLevel };
