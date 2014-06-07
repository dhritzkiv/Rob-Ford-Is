var path = require('path');

var moment = require('moment');
var models = require(path.join(process.cwd(), 'models'));

var limit = 1;

function updateLimit() {
	var Quote = models.quotes;
	
	Quote.find({'state': 1}).count(function(err, count) {
		if (err) {
			console.log(err);
		} else {
			limit = count;
		}
	});
}

function quoteOptions(options) {
	var quote = {};
	quote.text = options.text;
	quote.altText = options.altText;
	quote.who = options.who;
	quote.link = options.link;
	quote.date = options.date ? moment(options.date, "YYYY-MM-DD").zone("-05:00").toDate() : null;
	quote.slug = options.slug;
	quote.state = options.state === "on" ? 1 : 0;
	
	return quote;
};

var selectFields = '_id text altText link date slug who';


module.exports = function(app) {

	var Quote = models.quotes;
	updateLimit(models);
	
	function randomQuote(notIds, callback) {
		Quote.findOne({
			'_id': {$nin: notIds},
			state: {$gt: 0},
			random: {$near: [Math.random(), Math.random()]}
		}).select(selectFields).exec(callback);
	}
	
	app.get('/quotes/post', function(req, res) {
		res.locals.writeMode = "create";
		res.render('post', {
			message: unescape(req.query.message || ""),
			error: unescape(req.query.error || "")
		});
	});
	
	app.get('/quotes/:id', function(req, res) {
		var id = req.params.id;
		res.locals.writeMode = "edit";
		Quote.findById(id).exec(function(err, quote) {
			if (err) {
				console.log(err);
				res.send(500);
			} else if (quote) {
				res.render('post', {
					quote: quote,
					message: unescape(req.query.message || ""),
					error: unescape(req.query.error || "")
				});
			} else {
				res.send(404);
			}
		});		
	});
	
	app.post('/quotes', function(req, res) {
		var body = req.body;
		var quote = new Quote(quoteOptions(body));
		
		quote.date = body.date? moment(body.date, "YYYY-MM-DD").toDate(): undefined;
		
		quote.save(function(err, quote) {
			if (err) {
				console.log(err)
				res.redirect('/quotes/post?error=' + escape(err.message))
			} else {
				res.redirect('/quotes/post?message=' + escape("Your quote has been submitted for approval"));
			}
		});
		
		updateLimit(models);
	});
	
	app.put('/quotes/:id', function(req, res) {
		var body = req.body;
		var id = req.params.id;
		
		if (!body.secret || body.secret !== "mosthonestpolitician") {
			return res.send(403);
		}
		
		Quote.findById(id).exec(function(err, quote) {
			if (err) {
				console.log(err);
				res.send(500);
			} else if (quote) {
			
				var values = quoteOptions(body);
				for (var attrname in values) { 
					if (values.hasOwnProperty(attrname)) {
			            quote[attrname] = values[attrname];
			        }
				}
				
				quote.save(function(err, quote) {
					if (err) {
						console.log(err);
					} else {
						res.redirect('/quotes/' + quote._id + "?message=" + escape("quote has been saved"));
					}
				});
				
				updateLimit(models);
			} else {
				res.send(404);
			}
		});		
	});
  
	app.get('/', function(req, res, next) {
		if (req.is('json')) {
			return; //redirect without sending a 304, somehow?
		}
		res.locals.limit = limit;
		res.render('index');
	});
	
	app.get('/random', function(req, res) {
		var not = req.query.not;
		var notIds = not && not.split(",") || [];
		
		if (!req.is('json')) {
			return res.redirect('/');
		}
		
		randomQuote(notIds, function(err, quote) {
			if (err) {
				if (req.is('json')) {
					res.json(500, err);
				}
			} else if (quote) {
				res.json(200, quote);
				quote.update({$inc: {views: 1}}, function(err) {
					if (err) {
						console.log(err);
					}
				});
			} else {
				res.json(204);
			}
		});
	});
	
	app.get('/:id', function(req, res) {
		var id = req.params.id;
	
		if (req.xhr) {
			var mongoQuery;
			
			if (id.length === 24) {//if ObjectId();
				mongoQuery = Quote.findById(id).where('state', 1);
			} else {//if text slug;
				mongoQuery = Quote.findOne({slug: id, state: 1});
			}
			mongoQuery.select(selectFields).exec(function(err, quote) {
				if (err) {
					console.log(err);
					res.send(500);
				} else if (quote) {
					res.json(200, quote);
					quote.update({$inc: {views: 1}}, function(err) {
						if (err) {
							console.log(err);
						}
					});
				} else {
					res.send(404);
				}
			});
		} else {
			res.render('index', {
				id: id,
				limit: limit
			})
		}
	});
	
	//make sure this is last as a catch-all for 404;
	app.get('*', function(req, res) {
		res.send(404, "Page not found");
	});
	
	return this;
};