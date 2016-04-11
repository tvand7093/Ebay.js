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

function grid(request){
  let list = sql
             .select()
             .from('Items', 'i')
             .join('AuctionResults', 'ar', 'ar.ItemId = i.Id')
             .toString();

  db.open().then(function(ctx) {
    ctx.query(list).then(function(rows) {
      ctx.end();
      reply(rows);
    });
  });
}

function list(request, reply) {
  //maybe pull in categories? Should categories be it's own table?
  reply.view('items/list');
}

function createNew(request, reply) {

  debugger;
  const insertItem = sql
                     .insert()
                     .into('Items')
                     .setFields({
                       Name: request.payload.name,
                       Category: request.payload.category,
                       MaxBidPrice: request.payload.max_price,
                       SellerEmail: request.payload.seller_email,
                       StartPrice: request.payload.start_price,
                       EndDate: moment(request.payload.end_date).format('YYYY-MM-DD HH:mm:ss')
                     });

  const insertResult = sql
                       .insert()
                       .into('AuctionResults')
                       .setFields({
                         WinnerEmail: null,
                         WasSold: false,
                         IsClosed: false,
                       }).toParam();

  db.open().then(
    function(ctx) {
      ctx.query('START TRANSACTION').then(function(trans){
        ctx.query(insertResult.text, insertResult.values).then(
          function(result) {
            debugger;
            //insert worked, so lets add the item now.
            //set the auction result id
            let finalInsert = insertItem
                              .set('AuctionResultId', result.insertId)
                              .toParam();
            debugger;
            //now do the actual insert.
            ctx.query(finalInsert.text, finalInsert.values).then(
              function(err, result) {
                ctx.query('COMMIT').then(function(end){
                  debugger;
                  ctx.end();

                  //save worked!
                  reply(result);
                });
              }
            );
          }
        )
        .catch(function(err) {
                 debugger;
                 //insert result!
                 ctx.query('ROLLBACK').then(function(end){
                   ctx.end();
                   reply(err);
                 });
               });
      });
    });
}

//BEGIN CONTROLLER CONFIG
module.exports.route = function(server) {
  server.route(
    [
      {method: 'GET', path: '/', handler: index},
      {
        method: 'GET',
        path: '/items/search',
        handler: search,
        config: {validate: {query: {
          name: Joi.string().allow(''),
          category: Joi.string().allow('')
        }}}
      },
      {
        method: 'GET',
        path: '/items/list',
        handler: list
      },
      {
        method: 'GET',
        path: '/items/grid',
        handler: grid
      },
      {
        method: 'POST',
        path: '/items/create',
        handler: createNew,
        config: {validate: {payload: {
          name: Joi.string(),
          category: Joi.string(),
          max_price: Joi.number(),
          start_price: Joi.number(),
          end_date: Joi.date(),
          seller_email: Joi.string()
        }}}
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
