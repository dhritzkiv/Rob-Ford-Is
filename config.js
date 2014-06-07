//config.js  
//--------------

var env = process.env.NODE_ENV || 'development';

var config = {
	title: "Rob Ford Is",
	host: "localhost",
	port: process.env.PORT || 3003,
	dbHost: "localhost",
	dbCollection: "rob-ford-is",
	//dbUser: "robford",
	//dbPass: "gravytrain"
}

if (env === "production") {//override variables for production server as needed;
	//config.host = "127.0.0.1";//for example;
	
	//probably want authentication for the DB in production
	config.dbUser = "robford";
	config.dbPass = "gravytrain";
}

module.exports = config;