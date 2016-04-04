var socket = io();

socket.on('bid over', function(payload){
    //happens when a bid finishes. Can be because the time went to the end or someone paid full price.
    //so payload will contain info about said bid result.
});

socket.on('bid updated', function(bidInfo){
    //happens when a bid gets updated, i.e. price updated by a user placing a bid.
    console.log("Bid updated");
    console.log(bidInfo);
});
