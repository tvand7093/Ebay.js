//@flow

// 'use strict';

// $(function() {
//   $('form').submit(function(e) {
//     if(!validate().valid()){
//       e.preventDefault();
//     }
//   });
// });

// function validate() {
//   var result = {
//     name: $('#name').val() || false,
//     category: $('#category').val() || false,
//     start_price: $('#start_price').val() || false,
//     max_price: $('#max_price').val() || false,
//     end_date: $('#end_date').val() || false,
//     seller_email: $("#seller_email").val()
//   };

//   result.valid = function() {
//     return result.name && result.category && result.start_price &&
//       result.max_price && result.end_date;
//   };

//   return result;
// }'use strict'

$(function() {
  $("#jqGrid").jqGrid({
    mtype: "GET",
    url: '/items/grid',
    styleUI : 'Bootstrap',
    datatype: "json",
    colModel: [
      { label: 'Item #', name: 'Id', key: true, width: 100 },
      { label: 'Item Name', name: 'Name', width: 200, editable: true },
      { label: 'Category', name: 'Category', width: 200,  editable: true },
      { label: 'Start Price', name: 'StartPrice', width: 200, editable: true },
      { label: 'MaxPrice', name: 'MaxBidPrice', width: 200, editable: true },
      { label: 'Auction End Date', name: 'EndDate', width: 200, editable: true },
      { label: 'Is Over', name: 'IsClosed', width: 100 },
      { label: 'Was Sold', name: 'WasSold', width: 100 }
    ],
    viewrecords: true,
    height: 250,
    width: 1100,
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
});