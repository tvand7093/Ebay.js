'use strict';
require('moment-countdown');
const sql = require('squel');
const db = require('../sql/manager.js');
const moment = require('moment');

function allItems() {
    return sql
      .select()
      .from('Bids', 'b')
      .field("i.Id")
      .field("i.Name")
      .field("i.Category")
      .field("i.EndDate")
      .field("b.Amount")
      .field("b.TimeStamp")
      .right_join('Items', 'i', 'b.ItemId = i.Id')    
      .join('AuctionResults', 'ar', 'ar.Id = i.AuctionResultId');
}

function appendRemaining(items){
    let getDiff = function(endDate) {
	var end = moment(endDate);
	var today = moment(new Date());
	debugger;
	return moment(end.diff(today)).countdown();
    };

    for(var i = 0; i < items.length; i++){
	let diff = getDiff(items[i].EndDate);
	items[i].TimeRemaining = diff;
    }
}

module.exports.index = function (request, reply){
    const itemQuery = allItems().toString();

    const categoryQuery = sql.select().from('Items').field('Category').distinct().toString();

    db.open().then(function(ctx){
	ctx.query(categoryQuery)
	    .then(function(categories){
		ctx.query(itemQuery)
		    .then(function(rows){
			ctx.end();
			if(rows.length > 0){
			    appendRemaining(rows);
			}

			reply.view('items/index', {categories : categories, results : rows});
		    });	    
	    });
	
    });
};


module.exports.search = function (request, reply){
    let query = request.query;

    let name = query.name || '';
    let category = query.category || '';

    var statement = allItems();
    
    if(name){
	statement = statement.where('i.Name LIKE ?', name);
    }

    if(category){
	statement = statement.where('i.Category = ?', category);
    }

    statement = statement.toString();
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
