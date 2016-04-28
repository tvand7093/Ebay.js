//@flow
'use strict';

$(function() {

  $("#jqGrid").jqGrid({
    mtype: "GET",
    url: '/items/search',
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
      { label: 'Start Price', name: 'StartPrice', width: 200 },
      { label: 'Max Price', name: 'MaxBidPrice', width: 200 },
    ],
    height: 400,
    width: 1100,
    rowNum: 20,
    pager: "#jqGridPager",
    loadonce: true,
    onSelectRow: function(ids){
      window.location.href = `/items/${ids[0]}`;
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
