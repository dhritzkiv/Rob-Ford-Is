"use strict";

var mainElm;
var internalReq;
var internalReqFailures = 0;
var currentLocation = parseLocation();
var initialLoad = false;
var viewedIds = [];
var moreTextUsed = [];
var quotesLimit = 0;

function pushId(id) {
	keepArrayFresh.apply(viewedIds, [id, quotesLimit * 0.9]);
};

function keepArrayFresh(id, limit) {
	limit = limit || 2;
	if (this.indexOf(id) === -1) {
		this.push(id);
	}
	
	if (this.length > limit) {
		this.splice(0, 1);
	}
}

function parseLocation() {
	return {
		href: window.location.href,
		pathname: window.location.pathname
	};
}

window.onpopstate = function(event) {
	event.preventDefault();
	
	if ('state' in window.history && event.state !== null &&event.state.quote !== null && initialLoad) {
		populateQuote(event.state.quote);
	}
	
	if (!initialLoad) {
		initialLoad = true
	}
	
}

function randomBoolean() {
	return Math.random() >= 0.5 ? true : false;
}

function randomInt(min, max) {
	min ? min : min = 0;
	max ? max : max = 1;
	return (Math.random() * (max - min + 1) + min)|0;
}

function randomFloat(min, max) {
	min ? min : min = 0;
	max ? max : max = 1;
	return Math.random() * (max - min + 1) + min;
}


function getNewRandom(min, max, current) {
	var newRandom = randomInt(min, max);
	return newRandom !== current ? newRandom : getNewRandom(min, max, current);
}

(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
									|| window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());

function recursiveCheckForElement(element, tag) {
	if (!element || !element.tagName) {
		return false;
	}
	
	if (element.tagName.toLowerCase() === tag) {
		return element;
	}
	
	return recursiveCheckForElement(element.parentNode, tag)
}

function createQuoteElm(quote) {	
	pushId(quote._id);
	
	var quoteElm = document.createElement('article');
	var text = document.createElement('h1');
	var link = document.createElement('a');
	var footer = document.createElement('footer');
	var cite = document.createElement('cite');
	var time = document.createElement('time');
	var moreLink = document.createElement('a');
	//var permLink = document.createElement('a');
	var paragraph = document.createElement('p');
	
	quote.date && time.setAttribute('datetime', quote.date);
	time.textContent = quote.date ? " on " + moment(quote.date).zone("05:00").format('LL').toString() : "";
	cite.innerHTML = quote.who? "&mdash;" + quote.who : "";
	quote.date && cite.appendChild(time);
	
	/*permLink.href = "/"+ quote._id;
	permLink.textContent = "Permalink"
	permLink.addEventListener('click', function(event) {
		event.preventDefault();
		loadQuote("/"+ quote._id);
		return false;
	});*/
		
	moreLink.href = "/random";
	moreLink.addEventListener('click', function(event) {
		event.preventDefault();
		loadQuote(null);
		return false;
	});
	
	var moreTextOptions = [
		"Who else is he?", 
		"He's who?", 
		"Crazy. What else?",
		"Is that all?", 
		"More, more!",
		"That can't be right.",
		"That's just stupid",
		"You're kidding",
		"Is that really him?",
		"What else ya got?",
		"Rob Ford is who now?",
		"Uhhh who?",
		"Who is he, again?",
		"Any more?",
		"Gimme another"
	];
	
	var moreText = moreTextOptions.filter(function(string){
		return moreTextUsed.indexOf(string) === -1;
	}).sort(function() {
		return 0.5 - Math.random();
	})[0];
	
	keepArrayFresh.apply(moreTextUsed, [moreText, moreTextOptions.length-1]);
	
	moreLink.textContent = moreText;
	
	var citation = paragraph.cloneNode(false);
	citation.appendChild(cite)
	footer.appendChild(citation);
	
	/*var perma = paragraph.cloneNode(false);
	perma.appendChild(permLink);
	perma.classList.add('small-text');
	footer.appendChild(perma);*/
	
	moreLink.classList.add('button');
	moreLink.classList.add('more');
	var more = document.createElement('div');
	more.appendChild(moreLink);
	footer.appendChild(more);
	
	link.href = quote.link;
	link.target = "_blank";
	link.textContent = quote.text;
	
	text.appendChild(link);
	text.title = quote.altText;
	quoteElm.appendChild(text);
	quoteElm.appendChild(footer);
	quoteElm.classList.add('quote');
	quoteElm.classList.add('container');
	
	return quoteElm;
}

function populateQuote(quote) {
	var contentElm = document.getElementById('content');
	var oldQuoteElm = contentElm.querySelector('article.quote');
	var quoteElm = createQuoteElm(quote);
	quoteElm.classList.add('new');
	contentElm.appendChild(quoteElm);
	quoteElm.clientHeight;
	quoteElm.classList.remove('new');
	
	oldQuoteElm.parentNode.removeChild(oldQuoteElm);
}

function loadQuote(url) {
	var cacheBreaker = new Date();
	cacheBreaker = cacheBreaker.getTime();
	url = url ? url + "?r=" + cacheBreaker : "/random?not=" + viewedIds.join(",");
	
	internalReq = new XMLHttpRequest();
	internalReq.open("GET", url);
	internalReq.timeout = 10000;
	internalReq.setRequestHeader('Content-Type', 'application/json');
	internalReq.setRequestHeader('accept', 'application/json');
	internalReq.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	var thisReq = internalReq;
	
	var mainElm = document.getElementById('main');
	var contentElm = document.getElementById('content');
	var oldQuoteElm = contentElm.querySelector('article.quote');
	
	mainElm.classList.add('loading')
	
	internalReq.onload = function() {
		var quote;
		switch(internalReq.status) {
			case 200:
				quote = JSON.parse(internalReq.responseText);
				populateQuote(quote);
				history.pushState && history.pushState({quote: quote}, "Rob Ford is: " + quote.text, "/" + quote.slug);
				document.title = "Rob Ford is: " + quote.text;
				
				if (window.ga) {//if google analytics;
					ga('send', 'pageview', {
					'page': '/' + quote.slug,
					'title': document.title
					});
				}
				
				internalReqFailures = 0;
				break;
			default:
				console.log('Could not load quote ' + url + ' . Status:' + internalReq.status);
				if (internalReqFailures < 2) {
					loadQuote('/random');
				}
				internalReqFailures++;
		}
		
		mainElm.classList.remove('loading')
	}
	
	internalReq.onerror = function(event) {
		event.preventDefault();
		console.log(internalReq);
	}
	
	internalReq.onabort = function() {
	
	}
	
	internalReq.ontimeout = function() {
	
	}
	
	internalReq.onprogress = function(event) {
	
	}
	
	internalReq.send(null);
}

document.addEventListener("DOMContentLoaded", function(event) {
	mainElm = document.querySelector('main');
	mainElm.classList.add('loading-initial');
})

window.onload = function() {
	
	setTimeout(function() {
		mainElm.classList.remove('loading-initial');
	}, 500);
	
	var loadQuoteElm = document.getElementById('load-quote');
	if (loadQuoteElm) {
		var toLoadId = loadQuoteElm.getAttribute('data-quote-id');
		loadQuote(toLoadId ? '/' + toLoadId : null);
	}
	
	quotesLimit = typeof limit !== "undefined" ? limit : 0;
	var overlayTrigger = document.getElementById('overlay-trigger');
	if (overlayTrigger) {
		overlayTrigger.onclick = function(event) {
			event.preventDefault();
			document.body.classList.toggle('show-overlay');
		};
	}
}