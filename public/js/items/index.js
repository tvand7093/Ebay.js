'use strict'

$(function() {
  $("#jqGrid").jqGrid({
    mtype: "GET",
    styleUI : 'Bootstrap',
    datatype: "local",
    colModel: [
      { label: 'Item #', name: 'Id', key: true, width: 100 },
      { label: 'Item Name', name: 'Name', width: 200, editable: true },
      { label: 'Category', name: 'Category', width: 200,  editable: true },
      { label: 'Current Bid', name: 'Amount', width: 200 },
      { label: 'Last Bid Time', name: 'TimeStamp', width: 200 },
      { label: 'Time Remaining', name: 'TimeRemaining', width: 200 }
    ],
    viewrecords: true,
    height: 250,
    width: 1000,
    rowNum: 20,
    pager: "#jqGridPager"
  });

  $('#jqGrid').navGrid("#jqGridPager",
                       {
                         edit: false,
                         add: false,
                         del: false,
                         refresh: false,
                         view: false
                       });


  $('#jqGrid').inlineNav('#jqGridPager',
                         // the buttons to appear on the toolbar of the grid
                         {
                           edit: true,
                           add: true,
                           del: true,
                           cancel: true,
                           editParams: {
                             keys: true,
                           },
                           addParams: {
                             keys: true
                           }
                         });




  $('#search').click(refreshGrid);

  refreshGrid();
});

function refreshGrid() {
  $("#jqGrid")[0].grid.beginReq();

  var name = $('#name').val();
  var category = $('#category').val();

  $.get("/items/search?name=" + name + "&category=" + category, function(results){
    // set the new data
    $("#jqGrid").jqGrid('setGridParam', { data: results });
    // hide the show message
    $("#jqGrid")[0].grid.endReq();
    // refresh the grid
    $("#jqGrid").trigger('reloadGrid');
  });

}
