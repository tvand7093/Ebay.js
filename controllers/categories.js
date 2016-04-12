//@flow

'use strict'

function searchByName(name){
  //<param name='name' type='string'>the name to search for.</param>
  let sql = require('squel');
  let db = require('../sql/manager.js');
  let Promise = require('promise');

  let search = sql
               .select()
               .field('Category')
               .from('Items')
               .where('Category LIKE ?', '%' + name + '%')
               .distinct()
               .toParam();

  return new Promise(function(succeed, fail) {
                       db.open().then(function(ctx){
                         ctx.query(search.text, search.values).then(function(results){
                           ctx.end();
                           succeed(results);
                         });
                       });
                     });
}


function query(request, reply){
  let name = request.query.name || '';

  searchByName(name).then(function(results){
    var asArray = results.map(function(item) { return item.Category; });
    reply(asArray);
  });
}

module.exports.route = function(server){
  let Joi = require('joi');

  server.route([
    {
      method: 'GET',
      path: '/categories/query',
      handler: query,
      config: {
        validate: {
          query: {
            name: Joi.string().allow('')
          }
        }
      }
    }
  ]);
}