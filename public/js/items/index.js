//@flow
'use strict';

$(function() {

  $("#jqGrid").jqGrid({
    mtype: "GET",
    url: '/bids/grid',
    styleUI : 'Bootstrap',
    datatype: "json",
    postData: {
      name: '',
      category: ''
    },
    colModel: [
      { label: 'Item #', name: 'ItemId', key: true, width: 100 },
      { label: 'Item Name', name: 'Name', width: 200 },
      { label: 'Category', name: 'Category', width: 200 },
      { label: 'Current Bid', name: 'Amount', width: 200 },
      { label: 'Last Bid Time', name: 'TimeStamp', width: 200 },
      { label: 'Time Remaining', name: 'TimeRemaining', width: 200 }
    ],
    height: 400,
    width: 1100,
    rowNum: 20,
    pager: "#jqGridPager",
    loadonce: true
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
  const name = $('#name').val();
  const category = $('#category').val();
  const query = {
    postData: {
      name: name,
      category: category
    },
    datatype:'json'
  };

  $("#jqGrid").setGridParam(query).trigger('reloadGrid');
}
