'use strict';

const Settings = require ('./config/config.js');
const Db = require('promise-mysql');
const Hapi = require ('hapi');
const server = new Hapi.Server();
const Good = require('good');

var ctx;

// First you need to create a connection to the db
const conn = Db.createConnection({
    host: Settings.db.server,
    user: Settings.db.user,
    password: Settings.db.password,
    database: Settings.db.database
}).then(function(connection) {
    ctx = connection;
}).catch(function(err){
    console.log(err);
});

server.connection({ port: 3000 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
	if(ctx){
	    ctx.query('SELECT * FROM Users')
		.then(function(rows){
		    reply.view('index', {data : rows});
		});
	}
	else {
	    reply.view("NoData");
	}	
    }
});

function killServer() {
   server.log('info', 'Server is shuting down now...');
    if(ctx) ctx.end();
    ctx = null;
    
    server.stop({}, function(){
	process.exit(0);
    });
}

process.on('SIGTERM', function(){
    killServer();
});

process.on('SIGINT', function(){
    killServer();
});

server.register(require('vision'), function (err) {
    if (err) {
	throw err;
    }

    server.views({
	engines: {
	    html: require('handlebars')
	},
	relativeTo: __dirname,
	path: './templates',
	layoutPath: './templates/layout',
	helpersPath: './templates/helpers'
    });
   
});

server.register({
    register: Good,
    options: {
	reporters: [{
	    reporter: require('good-console'),
	    events: {
		response: '*',
		log: '*'
	    }
	}]
    }
}, (err) => {

    if (err) {
	throw err; // something bad happened loading the plugin
    }

    server.start(function(err) {

	if (err) {
	    throw err;
	}
	server.log('info', 'Server running at: ' + server.info.uri);
    });
});
