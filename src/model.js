'use strict';
import 'node_modules';
import helpers from './helpers.js';
import config from './config';

export default new (class app {
  // DATABASE
  constructor() {
    this._spreadSheetID = `1CESmvINrFTBAoYo909rJOG3Ee9clgk97QD7vghchN3E`;
    this._youtubeGAQL = `
      SELECT campaign.name, 
      campaign.id, 
      group_placement_view.target_url,  
      segments.ad_network_type,
      metrics.impressions,
      metrics.clicks,
      metrics.all_conversions,
      metrics.ctr
      FROM group_placement_view 
      WHERE 
      campaign.name REGEXP_MATCH "(?i).*truong.*" 
      AND campaign.status = ENABLED
      AND metrics.ctr  > 0.1
      AND metrics.all_conversions < 1
      AND segments.ad_network_type = CONTENT
      AND segments.date DURING TODAY
        `;
  }

  // App logic
  // negative placement to that campaign (campain level negative GDN placement)
  ExcludeGDNPlacementsAtCampaignLevel() {
    const rows = helpers._getRows(this._gdnGAQL);
    // 1. push the campaign id to an array
    while (rows.hasNext()) {
      const row = rows.next();
      // 2. Id and domain has same row  => exclude domain  from campaign ID
      const CampaignIds = row['campaign.id'];
      // select domain url
      const domains = row['group_placement_view.target_url'];
      // select campaign base on id
      const [campaign] = AdsApp.campaigns().withIds([+CampaignIds]);
      // build an exclude placement at campaign level
      var placementBuilder = campaign
        .display()
        .newPlacementBuilder()
        .withUrl(domains)
        .exclude();
      // 3. if exclude successful -> log to the console
      if (placementBuilder.isSuccessful())
        Logger.log(
          `Excluded placement: ${domains} from campaign: ${campaign.getName()}`
        );
    }
  }

  // negative placement to a specific placement negative list (multiple campaigns level negative GDN placement)
  ExcludeGDNPlacementsToNegativeList(
    id = config.MASTER_NEGATIVE_PLACEMENTS_2_ID
  ) {
    // get report rows from data base (GAQL)
    const rows = helpers._getRows(this._gdnGAQL);

    //select the exclude placement list with specific id
    const excludePlacementsList = helpers._getExcludePlacementsList(id);

    //create an array of domain -> add this array as negative placements to the selected exclude placement list
    const domains = [];

    //loop through row by row to push the url to the domains array.
    while (rows.hasNext()) {
      const row = rows.next();
      const domain = row['group_placement_view.target_url'];
      domains.push(domain);
    }
    /* we can using domains directly to exclude, but for large account, it will take more time => using set to remove duplicate domain */
    const notDuplicateDomains = [...new Set(domains)];
    excludePlacementsList.addExcludedPlacements(notDuplicateDomains);
    Logger.log(
      `${notDuplicateDomains} was added as a negative placement to ${excludePlacementsList.getName()} `
    );
  }
})();
