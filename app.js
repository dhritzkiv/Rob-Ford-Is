var express = require('express');
var app = express();

var mongoose = require('mongoose');
//app.bcrypt = require('bcrypt');
var moment = require('moment');

var appInfo = require('./package.json');
var config = require('./config.js');

var Db = require('mongodb').Db;
var flash = require('connect-flash');
var expressError = require('express-error');

var dust = require('dustjs-linkedin')
var dust = require('./extras/dust-helpers-custom.js');
var cons = require('consolidate');

var models = require('./models/');
var routes = require('./routes/');

//generic config
app.configure(function(){
	//app.engine('dust', dust);
	app.set('view engine', 'dust');
	app.engine('dust', cons.dust);
	app.set('views', __dirname + '/views');
	app.enable('trust proxy');
	app.disable('x-powered-by');
	app.use(express.static(__dirname + '/public', {maxAge: 86400000 * 7}));//maxage of one week
	app.use(express.bodyParser({
		keepExtensions: true, 
		uploadDir:__dirname + '/public/upload'
	}));
	app.use(function(req, res, next){
		app.locals.title = app.get('title');
		app.locals.version = app.get('version');
		next();
	});
	app.use(function(req, res, next) {
		if (req.xhr) {
			res.locals.xhr = true;
		} else {
			res.locals.xhr = false;
		}
		next();
	});
	app.use(express.methodOverride());
	app.use(app.router);
	routes(app);
});

var dbAddress = "mongodb://";
if (config.dbUser) {
	dbAddress += [config.dbUser, ":", config.dbPass, "@"].join('');
}
dbAddress += [config.dbHost, '/', config.dbCollection].join('');

//env specific config	
app.configure('development', function(){
	app.use(expressError.express3({contextLinesCount: 5, handleUncaughtException: true}));
	app.use(express.logger('development'));
	mongoose.connect(dbAddress);
});

app.configure('production', function(){
	app.use(express.errorHandler());
	mongoose.connect(dbAddress);
});
	
mongoose.connection.on('error', function(err){
	console.error('connection error:', err);
});

mongoose.connection.on("open", function(){
	var connection = mongoose.connections[0];
	console.log("MongoDB is connected to " + connection.name + " at port " + connection.port);
});

app.listen(config.port, function (){
	console.log(new Date())
	console.log('Server for ' + 
		config.title + 
		' v.' + appInfo.version + " " + app.settings.env +
		' running and listening at port ' + config.port
	);
});