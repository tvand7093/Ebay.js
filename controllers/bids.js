'use strict';

var db = require('../sql/manager.js');
var moment = require('moment');

module.exports.index = function (request, reply){
    const statement = "SELECT i.Id, i.Name, i.Category, b.Amount, b.TimeStamp, i.EndDate \
FROM Bids b \
JOIN Items i ON i.Id = b.ItemId";

    db.open().then(function(ctx){
	ctx.query(statement)
	    .then(function(rows){
		ctx.end();
		if(rows.length > 0){
		    let getDiff = function(endDate) {
			var end = moment(endDate);
			var today = moment(new Date());

			return {
			    days: end.diff(today, 'days'),
			    hours: end.diff(today, 'hours'),
			    min: end.diff(today, 'minutes'),
			    seconds: end.diff(today, 'seconds')
			};
		    };
		    
		    for(var i = 0; i < rows.length; i++){
			debugger;
			rows[i].TimeRemaining = getDiff(rows[i].EndDate);
		    }
		}
		
		reply.view('bids/index', {data : rows});
	    });	    
    });
};
