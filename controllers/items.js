'use strict';
require('moment-countdown');

const Joi = require('joi');
const sql = require('squel');
const db = require('../sql/manager.js');
const moment = require('moment');
let io = null; //this is to be a socket for socket.io

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
	.join('AuctionResults', 'ar', 'ar.Id = i.AuctionResultId')
	.where('i.EndDate > NOW()');
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

function index(request, reply){
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


function search(request, reply){
    let query = request.query;

    let name = query.name || '';
    let category = query.category || '';

    var statement = allItems();
    
    if(name){
	statement = statement.where('i.Name LIKE ?', `%${name}%`);
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

function create(request, reply){
    //maybe pull in categories? Should categories be it's own table?
    reply('items/create');
};

function createNew(request, reply){
    const insertItem = sql
	  .insert()
	  .into('Items')
	  .setField('Name', request.body.name)
	  .setField('Category', request.body.category)
    	  .setField('MaxBidPrice', request.body.max_price)
    	  .setField('SellerEmail', request.body.seller_email)
    	  .setField('StartPrice', request.body.start_price)
          .setField('EndDate', request.body.end_date)
          .setField('AuctionResultId', auctionResultId);

    const insertResult = sql
	  .insert()
	  .into('AuctionResults')
	  .setFields({WinnerEmail: null, WasSold: false, IsClosed: false})
	  .toParam();
    
    db.open().then(function(ctx){
	ctx.query(insertResult.text, insertResult.values)
	    .then(function(result){
		//insert worked, so lets add the item now.
		//set the auction result id
		let finalInsert = insertItem.setField('AuctionResultId', result.insertId).toParam();

		//now do the actual insert.
		ctx.query(finalInsert.text, finalInsert.values)
		    .then(function(err, result){
			ctx.end();
			if(err) reply(err);
			//save worked!
			reply(result);
		    });
	    })
	    .catch(function(err){
		//insert result!
		ctx.end();
		reply(err);
	    });
    });
    
    //create new item!
    return null;
};


//BEGIN CONTROLLER CONFIG
module.exports.route = function(server){
    server.route([
	{
	    method: 'GET',
	    path: '/',
	    handler: index
	},
	{
	    method: 'GET',
	    path: '/items/search',
	    handler: search,
	    config: {
		validate: {
		    query: {
			name: Joi.string().allow(''),
			category: Joi.string().allow('')
		    }
		}
	    }
	},
	{
	    method: 'GET',
	    path: '/items/create',
	    handler: create
	},
	{
	    method: 'POST',
	    path: '/items/create',
	    handler: createNew,
	    config: {
		validate: {
		    param: {
			name: Joi.string(),
			category: Joi.string(),
			max_price: Joi.number(),
			start_price: Joi.number(),
			end_date: Joi.date(),
			start_date: Joi.date()
		    }
		}
	    }
	}
    ]);
    //return the routed server controller.
    return this;
};

module.exports.io = function(socket){
    io = socket;
    socket.on('chat message', function(msg){
	io.emit('chat message', msg);
    });
}
