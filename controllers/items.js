//@flow

'use strict';

require('moment-countdown');

const Joi = require('joi');

const db = require('../sql/manager.js');
const moment = require('moment');
const sql = require('squel');

//this is to be a socket for socket.io
let io = null;

function allItemsForSale() {
  return sql.select().from('Bids', 'b').field('i.Id').field('i.Name')
         .field('i.Category').field('i.EndDate').field('b.Amount').field('b.TimeStamp')
         .right_join(
           'Items',
           'i',
           'b.ItemId = i.Id'
         ).join('AuctionResults', 'ar', 'ar.Id = i.AuctionResultId')
         .where(
           'i.EndDate > NOW()'
         );
}

function appendRemaining(items) {
  let getDiff = function(endDate) {
                  var end = moment(endDate);
                  var today = moment(new Date());
                  return moment(end.diff(today)).countdown();
                };

  for (var i = 0; i < items.length; i++) {
    let diff = getDiff(items[i].EndDate);
    items[i].TimeRemaining = diff;
  }
}

function index(request, reply) {
  const itemQuery = allItemsForSale().toString();
  const categoryQuery = sql.select().from('Items').field(
    'Category'
  ).distinct().toString();
  db.open().then(function(ctx) {
    ctx.query(categoryQuery).then(function(categories) {
      ctx.query(itemQuery).then(function(rows) {
        ctx.end();

        if (rows.length > 0) {
          appendRemaining(rows);
        }

        reply.view('items/index', {categories: categories, results: rows});
      });
    });
  });
}

function auction(request, reply) {
	let itemId = request.itemid;
	const itemQuery = sql.select().from('Items', 'i').where('i.Id = ?',  itemId);
	
	db.open().then(function(ctx) {
		ctx.query(itemQuery).then(function(rows) {
			ctx.end();
			
			if (rows.length > 1) {
				rows = rows[0];
			}
			
			reply(rows);
		});
	});
	
}


function search(request, reply) {
  let query = request.query;
  let name = query.name || '';
  let category = query.category || '';
  var statement = allItemsForSale();

  if (name) {
    statement = statement.where('i.Name LIKE ?', `%${name}%`);
  }

  if (category) {
    statement = statement.where('i.Category = ?', category);
  }

  statement = statement.toString();
  db.open().then(function(ctx) {
    ctx.query(statement).then(function(rows) {
      ctx.end();

      if (rows.length > 0) {
        appendRemaining(rows);
      }

      reply(rows);
    });
  });
}

function grid(request, reply){
  let list = sql
             .select()
             .field('i.Id', 'ItemId')
             .field('i.Name')
             .field('i.MaxBidPrice')
             .field('i.EndDate')
             .field('i.Category')
             .field('i.StartPrice')
             .field('ar.IsClosed')
             .field('ar.WasSold')
             .from('Items', 'i')
             .join('AuctionResults', 'ar', 'ar.Id = i.AuctionResultId')
             .toString();

  db.open().then(function(ctx) {
    ctx.query(list).then(function(rows) {
      ctx.end();
      rows.forEach(function(item){
        item.EndDate = moment(item.EndDate).format('LLL');
      });

      reply(rows);
    });
  });
}

function list(request, reply) {
  //maybe pull in categories? Should categories be it's own table?
  reply.view('items/list');
}

function create(request, reply) {

  request.payload.SellerEmail = 'tyler@gmail.com';
  request.payload.EndDate = moment(request.payload.EndDate).format('YYYY-MM-DD HH:mm:ss');

  delete request.payload.id;
  delete request.payload.oper;

  const insertItem = sql
                     .insert()
                     .into('Items')
                     .setFields(request.payload);

  const insertResult = sql
                       .insert()
                       .into('AuctionResults')
                       .setFields({
                         WinnerEmail: null,
                         WasSold: false,
                         IsClosed: false,
                       })
                       .toParam();

  db.open().then(
    function(ctx) {
      ctx.query('START TRANSACTION').then(function(trans){
        ctx.query(insertResult.text, insertResult.values).then(
          function(result) {
            //insert worked, so lets add the item now.
            //set the auction result id
            let finalInsert = insertItem
                              .set('AuctionResultId', result.insertId)
                              .toParam();
            //now do the actual insert.
            ctx.query(finalInsert.text, finalInsert.values).then(
              function(err, result) {
                ctx.query('COMMIT').then(function(end){
                  ctx.end();

                  //save worked!
                  reply(result);
                });
              }
            );
          }
        )
        .catch(function(err) {
                 //insert result!
                 ctx.query('ROLLBACK').then(function(end){
                   ctx.end();
                   reply(err);
                 });
               });
      });
    });
}

function update(request, reply){

  let data = request.payload;
  data.Id = data.id;
  data.EndDate = moment(data.EndDate).format('YYYY-MM-DD HH:mm:ss');
  delete data.id;
  delete data.oper;


  let updateSql = sql.update()
                  .table('Items')
                  .where('Id = ?', data.Id)
                  .setFields(data)
                  .toParam();
  db.open().then(
    function(ctx) {
      ctx.query('START TRANSACTION').then(function(trans){
        ctx.query(updateSql.text, updateSql.values).then(
          function(result) {
            //update complete, so commit and call it a day.
            ctx.query('COMMIT').then(function(end){
              ctx.end();
              debugger;
              //save worked!
              reply(result);
            });
          }
        )
        .catch(function(err) {
                 //update failed!
                 ctx.query('ROLLBACK').then(function(end){
                   ctx.end();
                   reply({
                     error: err
                   });
                 });
               });
      });
    });

}

function remove(request, reply){
  db.open().then(function(ctx){
    ctx.query('START TRANSACTION').then(function(trans){
      const query = sql.remove().from('Items').where('Id = ?', request.payload.id).toParam();
      ctx.query(query.text, query.values).then(function(result){
        //commit change
        ctx.query('COMMIT').then(function(end){
          reply(true);
        });
      });
    }).fail(function(err){
      ctx.query('ROLLBACK').then(function(end){
        reply({error: err});
      });
    });
  });
}

//BEGIN CONTROLLER CONFIG
module.exports.route = function(server) {
  server.route(
    [
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
        path: '/items/list',
        handler: list
      },
      {
        method: 'GET',
        path: '/items/grid',
        handler: grid,
        config: {
          validate: {
            query: {
              _search: Joi.boolean(),
              nd: Joi.number(),
              sidx: Joi.string().allow(''),
              sord: Joi.string().allow(''),
              page: Joi.number(),
              rows: Joi.number()
            }
          }
        }
      },
      {
        method: 'POST',
        path: '/items',
        handler: create,
        config: {
          validate: {
            payload: {
              id: Joi.any(),
              Name: Joi.string(),
              Category: Joi.string(),
              MaxBidPrice: Joi.number().min(0.01),
              StartPrice: Joi.number().min(0.01),
              EndDate: Joi.date(),
              oper: Joi.string()
            }
          }
        }
      },
      {
        method: 'PUT',
        path: '/items',
        handler: update,
        config: {
          validate: {
            payload: {
              id: Joi.number(),
              Name: Joi.string(),
              Category: Joi.string(),
              MaxBidPrice: Joi.number().min(0.01),
              StartPrice: Joi.number().min(0.01),
              EndDate: Joi.date(),
              oper: Joi.string()
            }
          }
        }
      },
      {
        method: 'DELETE',
        path: '/items',
        handler: remove,
        config: {
          validate: {
            payload: {
              id: Joi.number(),
              oper: Joi.string()
            }
          }
        }
      }
    ]
  );

  //return the routed server controller.
  return this;
};
module.exports.io = function(socket) {
  io = socket || {};
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
};
