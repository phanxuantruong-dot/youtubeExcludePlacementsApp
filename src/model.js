import 'node_modules';
import helpers from './helpers.js';
import config from './config';

export default new (class app {
  // DATABASE
  constructor() {
    this._spreadSheetID = `1CESmvINrFTBAoYo909rJOG3Ee9clgk97QD7vghchN3E`;
    this._ytbCtrAndAllConvGAQL = `
      SELECT campaign.name, 
      campaign.id, 
      group_placement_view.target_url,  
      segments.ad_network_type,
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
  excludeGDNPlacementsAtCampaignLevel() {
    const rows = helpers._getRows(this._gdnCtrAndAllConvGAQL);
    // 1. push the campaign id to an array
    while (rows.hasNext()) {
      const row = rows.next();
      // 2. Id and domain has same row  => exclude domain  from campaign ID
      const campaignId = row['campaign.id'];
      // select domain url
      const domain = row['group_placement_view.target_url'];
      // select campaign base on id
      const [campaign] = AdsApp.campaigns().withIds([+campaignId]);
      // build an exclude placement at campaign level
      var placementBuilder = campaign
        .display()
        .newPlacementBuilder()
        .withUrl(domain)
        .exclude();
      // 3. if exclude successful -> log to the console
      if (placementBuilder.isSuccessful())
        Logger.log(
          `Excluded placement: ${domain} from campaign: ${campaign.getName()}`
        );
    }
  }
  // negative placement to a specific placement negative list (multiple campaigns level negative GDN placement)
  excludeGDNPlacementsToNegativeList(
    id = config.MASTER_NEGATIVE_PLACEMENTS_2_ID
  ) {
    //select the exclude placement list with specific id
    const excludePlacementsList = helpers._getExcludePlacementsList(id);
    const domainsHaveSpecificBadWordsArr =
      this._arrGDNPlacementsHaveSpecificBadWords();
    const domainsHaveBadMetricArr = this._arrGDNPlacementsHaveBadMetric();
    //create an array of domain -> add this array as negative placements to the selected exclude placement list
    const excludeDomains = [
      ...domainsHaveSpecificBadWordsArr,
      ...domainsHaveBadMetricArr,
    ];
    //loop through row by row to push the url to the domains array.
    /* we can using domains directly to exclude, but for large account, it will take more time => using set to remove duplicate domain */
    const notDuplicateExcludeDomains = [...new Set(excludeDomains)];
    const totalUniqueDomainsWithNoConversionToday =
      this._arrGDNAllUniquePlacementsWithNoConversion();

    // Log to the logger for more information ------------------------------------------
    Logger.log(
      `All exclude domains with bad word is: ${domainsHaveSpecificBadWordsArr.length}`
    );
    Logger.log(
      `All exclude domains with bad metric is: ${domainsHaveBadMetricArr.length}`
    );
    Logger.log(`All exclude domains total length: ${excludeDomains.length}`);
    Logger.log(
      `All exclude domains and not duplicate is: ${notDuplicateExcludeDomains.length}`
    );
    Logger.log(
      `All unique domains with no conversion today is: ${totalUniqueDomainsWithNoConversionToday.length}`
    );
    // end log ----------------------------------------------------------------------
    excludePlacementsList.addExcludedPlacements(notDuplicateExcludeDomains);
    Logger.log(`Added successfully!!!`);
  }

  _arrGDNPlacementsHaveSpecificBadWords() {
    //get rows based on selected data
    const rows = helpers._getRows(this._gdnSitesUrlsGAQL);
    const excludeDomains = [];
    //loop over row by row to determine if a url is needed to exclude or not
    while (rows.hasNext()) {
      let isThisDomainOk;
      //get row
      const row = rows.next();
      //read the url
      const domain = row['group_placement_view.target_url'];
      // if the domain ok return true, if not ok return false
      isThisDomainOk =
        this._domainMustHave.some(word => domain.includes(word)) &&
        this._domainMustNotHave.every(word => !domain.includes(word));
      // if the domain is not ok => exclude it
      if (!isThisDomainOk) {
        excludeDomains.push(domain);
      }
    }
    return excludeDomains;
  }

  _arrGDNPlacementsHaveBadMetric() {
    // get report rows from data base (GAQL)
    const rows = helpers._getRows(this._gdnCtrAndAllConvGAQL);
    //create an array of domain -> add this array as negative placements to the selected exclude placement list
    const excludeDomains = [];
    //loop through row by row to push the url to the excludeDomains array.
    while (rows.hasNext()) {
      const row = rows.next();
      const domain = row['group_placement_view.target_url'];
      excludeDomains.push(domain);
    }
    return excludeDomains;
  }

  _arrGDNAllUniquePlacementsWithNoConversion() {
    const rows = helpers._getRows(this._gdnSitesUrlsGAQL);
    const domains = [];

    while (rows.hasNext()) {
      //get row
      const row = rows.next();
      //read the url
      const domain = row['group_placement_view.target_url'];
      domains.push(domain);
    }
    const uniqueDomains = [...new Set(domains)];
    Logger.log(`All domains with no conversion today is: ${domains.length}`);
    return uniqueDomains;
  }
})();
