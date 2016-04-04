'use strict';

var db = require('../sql/manager.js');
var moment = require('moment');

function appendRemaining(items){
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

    for(var i = 0; i < items.length; i++){
	let diff = getDiff(items[i].EndDate);
	items[i].TimeRemaining = `${diff.days}:${diff.hours}:${diff.min}:${diff.seconds/60}`;
    }
}

module.exports.index = function (request, reply){
    const itemQuery = "SELECT i.Id, i.Name, i.Category, i.EndDate FROM Items i";
    const itemQuery2 = "SELECT i.Id, i.Name, i.Category, b.Amount, b.TimeStamp, i.EndDate \
FROM Items i \
JOIN AuctionResults ar ON i.AuctionResultId = ar.Id \
JOIN Bids b ON b.ItemId = i.Id";

    const categoryQuery = "SELECT DISTINCT Category FROM Items";
    
    db.open().then(function(ctx){
	ctx.query(categoryQuery)
	    .then(function(categories){
		ctx.query(itemQuery2)
		    .then(function(rows){
			ctx.end();
			if(rows.length > 0){
			    appendRemaining(rows);
			}
			debugger;
			reply.view('items/index', {categories : categories, results : rows});
		    });	    
	    });
	
    });
};


module.exports.search = function (request, reply){
    let query = request.query;

    let name = query.name || '';
    let category = query.category || '';
    
    const statement =`SELECT i.Id, i.Name, i.Category, b.Amount, b.TimeStamp, i.EndDate \
    FROM Bids b \
    JOIN Items i ON i.Id = b.ItemId \
    WHERE i.Name LIKE \'%${name}%\' AND i.Category = \'${category}\'` ;

    db.open().then(function(ctx){
	ctx.query(statement)
	    .then(function(rows){
		ctx.end();
		if(rows.length > 0){
		    appendRemaining(rows);
		}
		reply(rows);
	    });	    
    });
};
