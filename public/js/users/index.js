//@flow
'use strict';

$(function() {

  $("#jqGrid").jqGrid({
    mtype: "GET",
    url: '/users/grid',
    styleUI : 'Bootstrap',
    datatype: "json",
    postData: {
      firstname: '',
      lastname: '',
	  email: '',
    },
    colModel: [
	  { label: 'Email', name: 'Email', key: true, width: 200 },
      { label: 'First Name', name: 'FirstName', width: 100 },
      { label: 'Last Name', name: 'LastName', width: 200 }
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
  const firstname = $('#firstnamesearch').val();
  const lastname = $('#lastnamesearch').val();
  const query = {
    postData: {
      firstname: firstname,
	  lastname: lastname,
    },
    datatype:'json'
  };

  $("#jqGrid").setGridParam(query).trigger('reloadGrid');
}
