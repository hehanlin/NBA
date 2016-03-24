'use strict';

var http = require('http'),
	url = require('url'),
	querystring = require('querystring'),
	nbaUtil = require('./nbaUtil.js');

(function(obj) {
	var onReq = function(req,res) {
		var URI_OBJ = url.parse(req.url);
		if(URI_OBJ.pathname === '/favicon.ico')return;
		var _GET = querystring.parse(URI_OBJ.query);
		(new obj()).index(_GET,res);
	};
	http.createServer(onReq).listen(3000,function() {
		console.log('server started');
	});
}(nbaUtil));
