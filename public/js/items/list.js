//@flow
'use strict';

$(function() {

  $("#jqGrid").jqGrid({
    mtype: "GET",
    url: '/items/grid',
    editurl: '/items',
    styleUI : 'Bootstrap',
    datatype: "json",
    colModel: [
      { label: 'Item #', name: 'ItemId', key: true, width: 100 },
      {
        label: 'Item Name',
        name: 'Name',
        editable: true,
        editrules: {
          Name: true,
          required: true
        }
      },
      {
        label: 'Category',
        name: 'Category',
        editable: true,
        editRules: {
          Category: true,
          required: true
        },
        editoptions: {
          // dataInit is the client-side event that fires upon initializing the toolbar search field for a column
          // use it to place a third party control to customize the toolbar
          dataInit: function (element) {
            $(element).attr("autocomplete","off").typeahead({
              source: function(query, proxy) {
                //do async call here...
                $.get('/categories/query', { name: query }, proxy);
              }
            });
          }
        }
      },
      {
        label: 'Start Price',
        name: 'StartPrice',
        editable: true,
        editRules: {
          StartPrice: true,
          minimum: 0.01,
          required: true
        }
      },
      {
        label: 'Max Price',
        name: 'MaxBidPrice',
        editable: true,
        editRules: {
          MaxPrice: true,
          minimum: 0.01,
          required: true
        }
      },
      {
        label: 'Auction End Date',
        name: 'EndDate',
        width: 250,
        editable: true,
        editRules: {
          EndDate: true,
          required: true
        },
        edittype:"text",
        editoptions: {
          // dataInit is the client-side event that fires upon initializing the toolbar search field for a column
          // use it to place a third party control to customize the toolbar
          dataInit: function (element) {
            $(element).datetimepicker({
              autoclose: true,
              format: 'yyyy-mm-dd hh:ii',
              orientation : 'auto bottom',
              startDate: new Date()
            });
          }
        }
      },
      { label: 'Is Over', name: 'IsClosed', width: 100 },
      { label: 'Was Sold', name: 'WasSold', width: 100 }
    ],
    viewrecords: true,
    height: 400,
    width: 1100,
    rowNum: 20,
    pager: "#jqGridPager"
  });

  $('#jqGrid').navGrid("#jqGridPager",
                       {
                         edit: true,
                         add: true,
                         del: true,
                         view: false
                       },
                       { //update options
                         closeAfterEdit: true,
                         url: '/items',
                         mtype: 'PUT'
                       },
                       { //add options
                         closeAfterAdd: true,
                         url: '/items',
                         mtype: 'POST'
                       },
                       { //delete options
                         closeAfterEdit: true,
                         url: '/items',
                         mtype: 'DELETE'
                       });
});