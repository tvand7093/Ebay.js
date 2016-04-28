//@flow
'use strict';

$(function() {
  const itemId = $("#Id").val();
  $("#jqGrid").jqGrid({
    mtype: "GET",
    url: `/items/${itemId}/bids`,
    datatype: "json",
    colModel: [
      { label: 'Id', name: 'Id', key: true, width: 200, hidden: true },
      { label: 'Email', name: 'UserEmail', width: 100 },
      { label: 'Amount', name: 'Amount', width: 200 },
      { label: 'Date Placed', name: 'TimeStamp', width: 200 }

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

  const min = Number($("#minPrice").val());
  const max = Number($("#maxPrice").val());

  $("#price").keyup(function(){
    const newVal = Number($(this).val());

    if(newVal >= max){
      $("#placeBid").removeClass('disabled');
      $(this).val(max);
      return;
    }

    if(newVal <= min){
      $("#placeBid").addClass('disabled');
    }
    else if(newVal) {
      $("#placeBid").removeClass('disabled');
    }
    else{
      //NaN gaurd
      $("#placeBid").addClass('disabled');
    }

  });

  $("#placeBid").click(function(ev){
    const val = { price: $("#price").val() };
    //on submit, refresh the grid after the bid placement
    $.post(`/items/${itemId}/bids`, val)
                            .then(function(result){
                              if(result.error){
                                toastr.error(result.error);
                              }
                              else{
                                toastr.success("Bid placed!");
                                if(val.price == max){
                                  //max value, so bid closed auction
                                  //so refresh page.
                                  window.location.reload();
                                  return;
                                }
                                //now refresh the grid.
                                refreshGrid();
                              }
                            });
          });

});



function refreshGrid() {
  const query = {
    datatype:'json'
  };

  $("#jqGrid").setGridParam(query).trigger('reloadGrid');
}
