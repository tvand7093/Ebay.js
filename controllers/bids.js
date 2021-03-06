'use strict';

var db = require('../sql/manager.js');
var sql = require('squel');
var moment = require('moment');
let io = null; //to be socket.io object

function index(request, reply){
  const statement = sql.select()
    	            .field('Category')
	            .from('Items')
	            .toString();

  db.open().then(function(ctx){
    ctx.query(statement)
    .then(function(rows){
      ctx.end();
      const data = rows.map(function(item){ return item.Category; });
      reply.view('bids/index', {data:rows});
    });
  });
};


function grid(request, reply){
  const statement = sql.select()
                    .from('Items', 'i')
                    .field('i.Id', 'ItemId')
                    .field('i.Name')
                    .field('i.Category')
                    .field('i.EndDate')
                    .field('i.MaxBidPrice')
                    .field('i.StartPrice')
                    .join('AuctionResults', 'ar', 'ar.Id = i.AuctionResultId')
                    .where('ar.IsClosed = 0')
                    .where('i.EndDate > NOW()');

  db.open().then(function(ctx){
    ctx.query(statement.toString())
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
	  rows[i].TimeRemaining = getDiff(rows[i].EndDate);
	}
      }
      reply(rows);
    });
  });
}


module.exports.route = function(server){
    server.route([
	{
	    method: 'GET',
	    path: '/bids',
	    handler: index
	},
      	{
	    method: 'GET',
	    path: '/bids/grid',
	    handler: grid
	}
    ]);
    return this;
};

module.exports.io = function(socket){
    io = socket;
};
