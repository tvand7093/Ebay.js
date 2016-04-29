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
  return sql.select()
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

function placeBid(request, reply){
  const id = request.params.id;
  const price = request.payload.price;

  const maxQuery = sql
                   .select()
                   .field('MAX(Amount)', 'Amount')
                   .from('bids')
                   .where('ItemId = ?', id)
                   .toString();

  db.open().then(function(ctx){
    ctx.query(maxQuery).then(function(max){
      max = max.length > 0 ? max[0] : null;

      if(max){
        //then verify our price is higher.
        if(price <= max.Amount){
          //same price, must be higher. abort.
          ctx.end();
          reply({error: "Bid price must be higher than current bid."});
          return;
        }
      }

      //we should be ok to update here. If something goes wrong, then it must be the
      //record is closed.
      const object = {
        Amount: price,
        UserEmail: 'tyler@gmail.com',
        TimeStamp: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        ItemId: id
      };

      const insertQuery = sql
                          .insert()
                          .into('bids')
                          .setFields(object)
                          .toParam();

      ctx.query(insertQuery.text, insertQuery.values)
      .then(function(result){
        ctx.end();
        //means we update fine.
        reply();
      }).catch(function(err){
        //most likely a data consistency error.
        //update failed
        console.log(err);
        reply({error: "Auction was closed."});
      });
    });
  });


}

function bidsForItem(request, reply){
  let id = request.params.id;

  //now fetch the bids for a given item.
  const bidsQuery = sql.select()
                    .from('Bids', 'b')
                    .where('ItemId = ?', id)
                    .order('TimeStamp', false) //ascending order
                    .toString();

  db.open().then(function(ctx) {
    ctx.query(bidsQuery).then(function(bids) {
      bids.forEach(function(bid){
        bid.TimeStamp = moment(bid.TimeStamp).format("LLL");
      });
      reply(bids);
    });
  });
}

function auction(request, reply) {
  let id = request.params.id;
  const itemQuery = sql.select()
                    .from('Items', 'i')
                    .field('i.Id')
                    .field('i.Name')
                    .field('i.SellerEmail')
                    .field('i.Category')
                    .field('i.StartPrice')
                    .field('i.MaxBidPrice')
                    .field('i.EndDate')
                    .field('u.FirstName')
                    .field('u.LastName')
                    .field('a.WinnerEmail')
                    .field('a.IsClosed')
                    .where('i.Id = ?', id)
                    .join('Users', 'u', 'u.Email = i.SellerEmail')
                    .join('AuctionResults', 'a', 'a.Id = i.AuctionResultId')
                    .toString();

  db.open().then(function(ctx) {
    ctx.query(itemQuery).then(function(item) {
      if (item.length > 0) {
	item = item[0];
      }

      item.EndDate = moment(item.EndDate).format("LLL");

      reply.view('items/auction', { vm: item });
    });
  });
}

function itemBidsGrid(itemId) {
  let list = ql.select().from('Bids', 'b').where('b.ItemId = ?', itemId);

  db.open().then(function(ctx) {
    ctx.query(list.toString()).then(function(rows) {
      ctx.end();
      reply(rows);
    });
  });
}

function search(request, reply) {
  let query = request.query;
  let name = query.name || null;
  let category = query.category || null;
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
             .field('ar.Id', 'AuctionResultId')
             .from('Items', 'i')
             .join('AuctionResults', 'ar', 'ar.Id = i.AuctionResultId')
//             .where('ar.IsClosed = 0')
             .toString();

  db.open().then(function(ctx) {
    ctx.query(list).then(function(rows) {
      let toAutoClose = [];

      var results = rows.map(function(item){
        if(item.EndDate < new Date()){
          //means this needs to autoclose and be removed from the set.
          toAutoClose.push(item);
          return null;
        }
        else{
          item.EndDate = moment(item.EndDate).format('LLL');
          return item;
        }
      });

      if(toAutoClose.length > 0){
        //we need to close some.
        //the function to run for updating a single record.
        const updateFunc = function(val){
                           //get last bidder if any.
                           const lastBidder = sql.select()
                                              .field("UserEmail")
                                              .from('Bids')
                                              .where("ItemId = ?", val.ItemId)
                                              .order("TimeStamp", false) //desc order
                                              .toString();

                           const update = sql.update()
                                      .table('AuctionResults')
                                      .where('id = ?', val.AuctionResultId)
                                      .set('IsClosed', 1);

                           return ctx.query(lastBidder).then(function(bidders){
                             let updateSql = update;
                             if(bidders.length > 0){
                               //someone bid on it, so use them
                               updateSql = update
                                           .set('WinnerEmail', bidders[0].UserEmail)
                                           .toString();
                             }
                             else{
                               updateSql = update.toString();
                             }
                             return ctx.query(updateSql);
                           });
                         };

        var basePromise = null;

        //daisy chain the promises together
        toAutoClose.forEach(function(val, index, arr){
          if(basePromise){
            basePromise = basePromise.then(updateFunc(val));
          }
          else{
            basePromise = updateFunc(val);
          }
        });

        //append the final one and return the response to the view.
        basePromise.then(function(done){
          ctx.end();
          //remove nulls.
          reply(results.filter(function(val) { val !== null }));
        });
      }
      else {
         ctx.end();
        reply(results);
      }
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
              category: Joi.string().allow(''),
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
        method: 'GET',
        path: '/items/{id}',
        handler: auction,
        config: {
          validate: {
            params: {
              id: Joi.number()
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/items/{id}/bids',
        handler: bidsForItem,
        config: {
          validate: {
            query: {
              id: Joi.number(),
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
        path: '/items/{id}/bids',
        handler: placeBid,
        config: {
          validate: {
            query: {
              id: Joi.number()
            },
            payload: {
              price: Joi.number()
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
