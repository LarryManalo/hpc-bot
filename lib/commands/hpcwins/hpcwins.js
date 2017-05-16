/* hpcwins.js - !Command to cause mental damage when we win or make a big play
*/

var path = require('path');

var eventbus; // Global event bus that modules can pub/sub to

// Setup an overlay to display a house when someone gets sorted

var options = {
	command: 'hpcwins',
	video: '/video/hpcwins.mp4',
	delay: 10000
};

var	overlay = {
	name: options.command,									// The name of your overlay (for internal referral)
  event: 'stream:' + options.command,  						// The event that shows your overlay (required)
  view: path.join(__dirname, 'views/' + options.command + '.pug'),  // The view you want to be rendered (required)
  selector: '.' + options.command,  						// The selector to select your template (optional: default to a class w/ the  .name of the overlay)
	directory: path.join(__dirname)					// Grab the current directory
};

var start = function start(_eventbus) {
	eventbus = _eventbus;

	// Add event listeners from Twitch chat
	eventbus.on(options.command + ':start', hpcwins);
};

var hpcwins = function hpcwins() {
	var response = [];

	// Load the items to show on stream
	var payload = assemblePayload();
	eventbus.emit('stream:' + options.command, payload);
};

var assemblePayload = function() {
	// Put data into the proper format to be read by our stream overlay's template
	var payload = {};
	payload.hpcwins_video = overlay.name + options.video,
	payload.delay = options.delay;

	return(payload);
}


module.exports = {
	start: start,
	overlay: overlay
};
