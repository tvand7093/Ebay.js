var socket = io();

socket.on('bid over', function(payload){
    //happens when a bid finishes. Can be because the time went to the end or someone paid full price.
    //so payload will contain info about said bid result.
});

socket.on('higher bid placed', function(bidInfo){
    //happens when another user places a bid. this will update the badge icon to show what bids are stale.
    console.log("Bid updated");
    console.log(bidInfo);
});
