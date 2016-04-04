var db = require('../sql/manager.js');

module.exports.index = function (request, reply){
    db.open().then(function(ctx){
	ctx.query('SELECT * FROM Users')
	    .then(function(rows){
		ctx.end();
		reply.view('users/index', {data : rows});
	    });	    
	});
};
