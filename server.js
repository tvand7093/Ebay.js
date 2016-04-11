'use strict';

const Hapi = require ('hapi');
const Path = require('path');
const server = new Hapi.Server();
const Good = require('good');
const Inert = require('inert');

server.connection({port : 3000});

server.register(Inert, () => {});

//route users
const users = require('./controllers/users.js').route(server);

//route bids
const bids = require('./controllers/bids.js').route(server);

//route items
const items = require('./controllers/items.js').route(server);

//global routing
server.route([
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
	const io = require('socket.io')(server.listener);

	io.on('connection', function(socket){
	    users.io(socket);
	    items.io(socket);
	    bids.io(socket);
	});

	if (err) {
	    throw err;
	}
	server.log('info', 'Server running at: ' + server.info.uri);
    });
});
