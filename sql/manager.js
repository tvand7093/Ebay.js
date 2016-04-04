const Settings = require('../config/config.js');
const Db = require('promise-mysql');

module.exports.open = function(){
    // First you need to create a connection to the db
    return new Promise(function(resolve, fail) {
	Db.createConnection({
	    host: Settings.db.server,
	    user: Settings.db.user,
	    password: Settings.db.password,
	    database: Settings.db.database
	}).then(function(connection) {
	    resolve(connection);
	}).catch(function(err){
	    fail(err);
	});
    });    
}
