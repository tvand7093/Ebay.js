'use strict';

var db = require('../sql/manager.js');
let io = null; //to be the socket.io socket.

function index(request, reply){
    db.open().then(function(ctx){
	ctx.query('SELECT * FROM Users')
	    .then(function(rows){
		ctx.end();
		reply.view('users/index', {data : rows});
	    });	    
	});
};

module.exports.route = function (server){
    server.route([
	{
	    method: 'GET',
	    path: '/users',
	    handler: index
	}
    ]);
    return this;
};

module.exports.io = function(socket){ io = socket; };
