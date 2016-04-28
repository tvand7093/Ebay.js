//@flow
'use strict';

$(function() {
	$("#jqGrid").jqGrid({
    mtype: "GET",
    url: '/items/bidsgrid',
    styleUI : 'Bootstrap',
    datatype: "json",
    postData: {
      itemid: ''
    },
    colModel: [
	  { label: 'Id', name: 'Id', key: true, width: 200 },
      { label: 'Email', name: 'UserEmail', width: 100 },
      { label: 'Amount', name: 'Amount', width: 200 }
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
});

function refreshGrid() {
  const itemid = $('#itemId').val();
  const query = {
    postData: {
      itemid: itemid
    },
    datatype:'json'
  };

  $("#jqGrid").setGridParam(query).trigger('reloadGrid');
}