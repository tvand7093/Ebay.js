//@flow
'use strict';

$(function() {

  $("#jqGrid").jqGrid({
    mtype: "GET",
    url: '/bids/grid',
    styleUI : 'Bootstrap',
    datatype: "json",
    colModel: [
      { label: 'Item #', name: 'ItemId', key: true, width: 100 },
      { label: 'Item Name', name: 'Name', width: 200 },
      { label: 'Category', name: 'Category', width: 200 },
      { label: 'Current Bid', name: 'Amount', width: 200 },
      { label: 'Last Bid Time', name: 'TimeStamp', width: 200 },
      { label: 'Time Remaining', name: 'TimeRemaining', width: 200 }
    ],
    viewrecords: true,
    height: 400,
    width: 1100,
    rowNum: 20,
    pager: "#jqGridPager",
    prmNames: {
      page: null,
      rows: null,
      sort: null,
      nd: null,
      search: getValues()
    }
  });

  $('#jqGrid').navGrid("#jqGridPager",
                       {
                         edit: false,
                         add: false,
                         del: false,
                         view: false
                       });
  $('#search').click(refreshGrid);
});

function refreshGrid() {
  $("#jqGrid").trigger('reloadGrid');
}

function getValues() {
  var name = $('#name').val();
  var category = $('#category').val();
  return { name: name, category: category };
}
