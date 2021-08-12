import newApp from './model.js';

function main() {
  /* 1. this code is used to exclude placements with CTR >= 10% at campaign level */

  // newApp.excludeGDNPlacementsAtCampaignLevel();

  /* 2. this code is used to exclude placements with CTR >= 10% to a negative list, 
      and the default list is Master negative placements 2  */
  newApp.excludeGDNPlacementsToNegativeList();
}
