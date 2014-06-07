var models = {};

models.quotes = require('./quotes')();
	
models.quotes.ensureIndexes(function(err) {
	if (err) {
		console.log(err);
	}
});

module.exports = models;