//models/quotes.js  
//--------------

var mongoose = require("mongoose");

module.exports = function() {
	'use strict';

	var Schema = mongoose.Schema;
	var quotesCollection = 'quotes';
	var ObjectId = Schema.Types.ObjectId;
		
	var quote = new Schema({
		random: {//hack using geo coords to retrieve random documents from DB
			type: Array,
			default: [Math.random(), Math.random()],
			index: '2d'
		},
		text: {
			type: String,
			required: true
		},
		altText: {
			type: String
		},
		link: {
			type: String,
			required: true
		},
		who: {
			type: String
		},
		slug: {
			type: String
		},
		date: {
			type: Date, 
			'default': Date.now
		},
		created: {
			type: Date,
			'default': Date.now
		},
		modified: {
			type: Date
		},
		state: {
			type: Number,
			default: 0//draft: 0; live: 1;
		},
		keywords: [
			{
				type: String
			}
		],
		views: {
			type: Number,
			default: 0
		}
	});
	
	//indexes for finding
	quote.set('autoIndex', false);
	quote.index({keywords: 1});
	quote.index({date: 1});
	quote.path('slug').index({unique: true});
	
	quote.virtual('wasDateModified', function() {
		return this.date === this.created;
	});
	
	quote.virtual('wasDocumentEdited', function() {
		return typeof this.modified;//check for date;
	});
	
	function createSlug(next) {
		var self = this;
		var slug;
		if (this.slug) {
			self.slug = self.slug.toLowerCase().replace(/[^A-Za-z0-9-]+/g, '-');
			return next();
		}
		
		if (this.slug) {
			slug = self.slug;
		} else {
			slug = self.text;
		}
		
		slug = slug.toLowerCase().replace(/[^A-Za-z0-9-]+/g, '-');
		 
		self.slug = slug.substring(0, 23);
		
		next();
	}
	
	quote.method('createKeywords', function() {
		var self = this;
		var body = self.text;
		
		body = body.toLowerCase();
		body = body.replace(/[ ]{2,}/, ' ');
		
		//push words into an array
		var keywords = body.match(/\w+|"[^"]*"/g) || [];
		keywords.map(function(s) {
			return s.replace(/^"+|"+$/g, "");
		});
		//find better regex (i.e. to prevent single character words)
		
		//remove duplicates
		keywords = keywords.filter(function(elem, pos) {
			return keywords.indexOf(elem) == pos;
		});
		
		this.keywords = keywords;
	});
	
	quote.pre('validate', function(next) {
		var self = this;
		
		/*if (!this._body) {
			next(new Error("You didn't write down a quote!"));
			return false;
		}*/
		
		next();
	}).pre('validate', createSlug);
	
	quote.pre('save', function(next) {
		var self = this;
		
		self.createKeywords();
		
		self.modified = Date.now();
	
		next();
	});
	
	return mongoose.model(quotesCollection, quote);
};