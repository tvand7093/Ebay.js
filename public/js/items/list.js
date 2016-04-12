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
    height: 250,
    width: 1100,
    rowNum: 20,
    onSelectRow: editRow,
    pager: "#jqGridPager"
  });

  var lastSelection;

  function editRow(id) {
    if (id && id !== lastSelection) {
      var grid = $("#jqGrid");
      grid.restoreRow(lastSelection);


      let maxId = id;
      if(typeof maxId !== 'number'){
        maxId = 0;
        $('#jqGrid tr').each(function(index, item){
          if(index > 1){
            if(Number(item.id) > maxId){
              maxId = Number(item.id);
            }
          }
        });
      }

      if(typeof maxId === 'number') ++maxId;

      var editParameters = {
        keys: true,
        initdata: { Id: maxId },
        successfunc: editSuccessful,
        errorfunc: editFailed,
        restoreAfterError: false,
        useDefValues : true
      };

      grid.jqGrid('editRow', id, editParameters);
      lastSelection = maxId;
    }
  }

  function editSuccessful( data, stat) {
    var response = data.responseJSON;
    if (response.hasOwnProperty("error")) {
      if(response.error.length) {
        return [false,response.error ];
      }
    }
    return [true,"",""];
  }

  function editFailed(rowID, response) {
    let message = "An error has occurred";
    if(response.responseJSON.validation){
      let splitUp = response.responseJSON.message.split("[");
      message = splitUp[1].substr(0, splitUp[1].length - 1);
    }

    $.jgrid.info_dialog(
      $.jgrid.regional["en"].errors.errcap,
      '<div class="ui-state-error">' +  message + '</div>',
      $.jgrid.regional["en"].edit.bClose,
      {buttonalign:'right', styleUI : 'Bootstrap'}
    );
  }

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

});