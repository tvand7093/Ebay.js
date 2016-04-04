'use strict';

const Hapi = require ('hapi');
const Path = require('path');
const server = new Hapi.Server();
const Good = require('good');
const Inert = require('inert');



const usersController = require('./controllers/users.js');
const bidsController = require('./controllers/bids.js');

server.connection({port : 3000});

server.register(Inert, () => {});

server.route([
    {
	method: 'GET',
	path: '/users',
	handler: usersController.index
    },
    {
	method: 'GET',
	path: '/bids',
	handler: bidsController.index
    },
    {
	method: 'GET',
	path: '/public/{param*}',
	handler: {
	    directory: {
		path: Path.normalize(__dirname + '/public')
	    }
	}
    }
]);

function killServer() {
    server.log('info', 'Server is shuting down now...');    
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
	path: './views',
	layoutPath: './views/layout',
	helpersPath: './views/helpers',
	layout: true
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
	const Io = require('socket.io')(server.listener);
	if (err) {
	    throw err;
	}
	server.log('info', 'Server running at: ' + server.info.uri);
    });
});
