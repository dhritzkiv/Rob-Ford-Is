var moment = require('moment');
var dust = require('dustjs-linkedin');

dust.filters.preventWidows = function(value) {
	if (!value || !/\s/.test(value)) {
		return value;
	}
	var matcher = value.match(/\s([\w]+[.,!\:;\\"-?]{0,1})$/); //yields [" word.", "word."]
	return value.replace(matcher[0], '\xA0' + matcher[1]);
}

dust.helpers.iterate = function(chunk, context, bodies, params) {
	params = params || {};
	var obj = params['on'] || context.current();
	for (var k in obj) {
		chunk = chunk.render(bodies.block, context.push({key: k, value: obj[k]}));
	}
	return chunk;
}
	
dust.helpers.fromNow = function(chunk, context, bodies, params) {
	var date = dust.helpers.tap(params.date, chunk, context);
	var value = moment(date).fromNow();

	return chunk.write(value);
};

dust.helpers.date = function(chunk, context, bodies, params) {
	var key = dust.helpers.tap(params.key, chunk, context);
	var format = dust.helpers.tap(params.format, chunk, context);
	
	format = format? format : "YYYY-MM-DD";
	var formatted = moment(key).format(format);

	return chunk.write(formatted);
};
  
//dust.helpers = dustHelpers.helpers;
//dust.filters = dustHelpers.filters;

module.exports = dust;
