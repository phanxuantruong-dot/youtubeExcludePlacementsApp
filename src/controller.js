import {
  excludeYoutubePlacementsAtCampaignLevel,
  checkYoutubeExclusionList,
} from './modelPlacements.js';

import { pauseDisplayKeywords, checkViralKeywords } from './modelKeywords.js';

import { _case1, _case2, _case3, _case4 } from './dataBase.js';
/* 

acpc 1.3, thresthold 1 conv 9, thresthold 2 conv 39, 80% budget spend on less than $1 placements
Case 1: 0 click -- cost >= 1.3, click < 1, all Conv < 1 
Case 2: > 0 click -- average cpc >= 1.3, all Conv < 1
Case 3: cost > 9, conv < 1
Case 4: cost > 39, conv < 2

*/
import { _case1Kwds, _case2Kwds, _case3Kwds, _case4Kwds } from './dataBase.js';
/* 

Case 1: 0 click -- cost >= 2, click < 1, all Conv < 1 
Case 2: > 0 click -- average cpc > 2, all Conv < 1
Case 3: cost > 25, conv < 1
Case 4: cost > 55, conv < 2

*/

function main() {
  pauseDisplayKeywords(_case1Kwds);
  pauseDisplayKeywords(_case2Kwds);
  pauseDisplayKeywords(_case3Kwds);
  pauseDisplayKeywords(_case4Kwds);
  checkViralKeywords();
}
