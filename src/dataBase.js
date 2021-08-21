import 'node_modules';
import { _exportReportToSpreadSheetAndGetRows, _getRows } from './helpers.js';
import { dateRangePlacement, dateRangeYTB } from './controller.js';

var _spreadSheetID = '1CESmvINrFTBAoYo909rJOG3Ee9clgk97QD7vghchN3E';
// placements dataBase
var _youtubeGAQL =
  'SELECT campaign.id,' +
  'detail_placement_view.target_url,' +
  'detail_placement_view.display_name,' +
  'segments.ad_network_type,' +
  'metrics.clicks,' +
  'metrics.average_cpc,' +
  'metrics.cost_micros,' +
  'metrics.all_conversions' +
  ' FROM detail_placement_view ' +
  ' WHERE campaign.status = ENABLED' +
  ' AND segments.ad_network_type = YOUTUBE_WATCH' +
  ' AND segments.date DURING ' +
  dateRangePlacement;

/* 

acpc 1.3, thresthold 1 conv 9, thresthold 2 conv 39, 80% budget spend on less than $1 placements
Case 1: 0 click -- cost >= 1.3, click < 1, all Conv < 1 
Case 2: > 0 click -- average cpc >= 1.3, all Conv < 1
Case 3: cost > 9, conv < 1
Case 4: cost > 39, conv < 2

*/

var _case1 =
  _youtubeGAQL +
  ' AND metrics.cost_micros >= ' +
  _normalValToMicros(1.3) +
  ' AND metrics.clicks < 1' +
  ' AND metrics.all_conversions < 1';

var _case2 =
  _youtubeGAQL +
  ' AND metrics.average_cpc > ' +
  _normalValToMicros(1.3) +
  ' AND metrics.all_conversions < 1';

var _case3 =
  _youtubeGAQL +
  ' AND metrics.cost_micros >= ' +
  _normalValToMicros(9) +
  ' AND metrics.all_conversions < 1';

var _case4 =
  _youtubeGAQL +
  ' AND metrics.cost_micros >= ' +
  _normalValToMicros(39) +
  ' AND metrics.all_conversions < 2';

// all conv placements spend less than 39 and have at least 1 conv
var _allConvPlacements =
  _youtubeGAQL +
  ' AND metrics.all_conversions > 0' +
  ' AND metrics.cost_micros < ' +
  _normalValToMicros(39);

// keywords dataBase

var _youtubeGAQLKwds =
  'SELECT campaign.id,' +
  'ad_group.id,' +
  'segments.ad_network_type,' +
  'metrics.clicks,' +
  'metrics.average_cpc,' +
  'metrics.cost_micros,' +
  'metrics.all_conversions,' +
  'ad_group_criterion.effective_cpv_bid_micros, ' +
  'ad_group_criterion.criterion_id, ' +
  'ad_group_criterion.keyword.text ' +
  ' FROM display_keyword_view ' +
  ' WHERE campaign.status = ENABLED' +
  ' AND ad_group.status = ENABLED' +
  ' AND ad_group_criterion.status = ENABLED' +
  ' AND segments.ad_network_type = YOUTUBE_WATCH' +
  ' AND segments.date DURING ' +
  dateRangeYTB;

/* 

Case 1: 0 click -- cost >= 2, click < 1, all Conv < 1 
Case 2: > 0 click -- average cpc > 2, all Conv < 1
Case 3: cost > 25, conv < 1
Case 4: cost > 55, conv < 2

*/

var _case1Kwds =
  _youtubeGAQLKwds +
  ' AND metrics.cost_micros >= ' +
  _normalValToMicros(2) +
  ' AND metrics.clicks < 1' +
  ' AND metrics.all_conversions < 1';

var _case2Kwds =
  _youtubeGAQLKwds +
  ' AND metrics.average_cpc > ' +
  _normalValToMicros(2) +
  ' AND metrics.all_conversions < 1';

var _case3Kwds =
  _youtubeGAQLKwds +
  ' AND metrics.cost_micros >= ' +
  _normalValToMicros(25) +
  ' AND metrics.all_conversions < 1';

var _case4Kwds =
  _youtubeGAQLKwds +
  ' AND metrics.cost_micros >= ' +
  _normalValToMicros(55) +
  ' AND metrics.all_conversions < 2';

// all conv placements spend less than 39 and have at least 1 conv
var _allConvKwds = _youtubeGAQLKwds + ' AND metrics.all_conversions > 0';

export {
  __spreadSheetID,
  _youtubeGAQL,
  _case1,
  _case2,
  _case3,
  _case4,
  _allConvPlacements,
  _youtubeGAQLKwds,
  _case1Kwds,
  _case2Kwds,
  _case3Kwds,
  _case4Kwds,
  _allConvKwds,
};
