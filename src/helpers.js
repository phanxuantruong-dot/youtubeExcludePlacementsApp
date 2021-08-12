import 'node_modules';

export default new (class helpersApp {
  _exportReportToSpreadSheetAndGetRows(spreadSheetID, querry) {
    const spreadSheetNew = SpreadsheetApp.openById(spreadSheetID);
    const report = AdsApp.report(querry);
    report.exportToSheet(spreadSheetNew.getActiveSheet());
    Logger.log(`Report is available at: ${spreadSheetNew.getUrl()}`);
    return report.rows();
  }

  _getRows(querry) {
    const report = AdsApp.report(querry);
    return report.rows();
  }

  _getExcludePlacementsListsNameIDPair() {
    const excludePlacementLists = AdsApp.excludedPlacementLists().get();
    while (excludePlacementLists.hasNext()) {
      const excludePlacementList = excludePlacementLists.next();
      Logger.log(
        `List Name: ${excludePlacementList.getName()} --- with id: ${excludePlacementList.getId()} `
      );
    }
  }

  _getExcludePlacementsList(id) {
    let excludePlacementsList;
    const excludedPlacementSelectorIterator = AdsApp.excludedPlacementLists()
      .withIds([id])
      .get();

    while (excludedPlacementSelectorIterator.hasNext()) {
      excludePlacementsList = excludedPlacementSelectorIterator.next();
      Logger.log(
        `Negative Placements List Name: ${excludePlacementsList.getName()} with id: ${excludePlacementsList.getId()}`
      );
    }
    return excludePlacementsList;
  }
})();
