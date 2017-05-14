/* twoRax.js - !Command to cause mental damage when we destroy two barracks
*/

var path = require('path');

var eventbus; // Global event bus that modules can pub/sub to

// Setup an overlay to display a house when someone gets sorted
var	overlay = {
	name: 'tworax',									// The name of your overlay (for internal referral)
  event: 'stream:tworax',  						// The event that shows your overlay (required)
  view: path.join(__dirname, 'views/tworax.pug'),  // The view you want to be rendered (required)
  selector: '.tworax',  						// The selector to select your template (optional: default to a class w/ the  .name of the overlay)
	directory: path.join(__dirname)					// Grab the current directory
};

var start = function start(_eventbus) {
	eventbus = _eventbus;

	// Add event listeners from Twitch chat
	eventbus.on('tworax:start', twoRax);
};

var twoRax = function twoRax() {
	var response = [];

	// Load the items to show on stream
	var payload = assemblePayload();
	eventbus.emit('stream:tworax', payload);
};

var assemblePayload = function() {
	// Put data into the proper format to be read by our stream overlay's template
	var payload = {};

	payload.tworax_video = overlay.name + '/video/tworax.mp4',
	payload.delay = 14000;

	return(payload);
}


module.exports = {
	start: start,
	overlay: overlay
};