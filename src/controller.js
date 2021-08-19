import {
  excludeYoutubePlacementsAtCampaignLevel,
  checkYoutubeExclusionList,
} from './model.js';

import {
  _youtubeGAQL,
  _case1,
  _case2,
  _case3,
  _case4,
  _allConvPlacements,
} from './dataBase.js';
/* 

acpc 1.3, thresthold 1 conv 9, thresthold 2 conv 39, 80% budget spend on less than $1 placements
Case 1: 0 click -- cost >= 1.3, click < 1, all Conv < 1 
Case 2: > 0 click -- average cpc >= 1.3, all Conv < 1
Case 3: cost > 9, conv < 1
Case 4: cost > 39, conv < 2

*/

function main() {
  excludeYoutubePlacementsAtCampaignLevel(_case1);
  excludeYoutubePlacementsAtCampaignLevel(_case2);
  excludeYoutubePlacementsAtCampaignLevel(_case3);
  excludeYoutubePlacementsAtCampaignLevel(_case4);
}
