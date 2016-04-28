'use strict';

require('moment-countdown');

const Joi = require('joi');

const db = require('../sql/manager.js');
const moment = require('moment');
const sql = require('squel');

function index(request, reply){
	debugger
    db.open().then(function(ctx){
	ctx.query('SELECT * FROM Users')
	    .then(function(rows){
		ctx.end();
		debugger
		reply.view('users/index', {data : rows});
	    });
	});
};

function grid(request, reply){
  let list = sql
             .select()
             .field('u.Email', 'Email')
             .field('u.FirstName')
             .field('u.LastName')
             .from('Users', 'u');

	let first = request.query.firstname;
	let last = request.query.lastname;

	if (first) {
		list = list.where('u.FirstName LIKE ?', `%${first}%`)
	}

	if (last) {
		list = list.where('u.LastName LIKE ?', `%${last}%`)
	}

  db.open().then(function(ctx) {
    ctx.query(list.toString()).then(function(rows) {
      ctx.end();
      reply(rows);
    });
  });
}

function emails(request, reply) {
	db.open().then(function(ctx) {
		ctx.query('SELECT email FROM Users')
							.then(function(rows) {
								ctx.end();
								reply(rows);
							});
	});
	return sql.select().field('u.Email').from('Users', 'u');
}


module.exports.route = function (server){
    server.route([
	{
        method: 'GET',
        path: '/users',
        handler: index
      },
	{
	    method: 'GET',
	    path: '/users/grid',
	    handler: grid,
	}
    ]);
    return this;
};
