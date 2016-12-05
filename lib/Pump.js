var five = require("johnny-five");
var phpjs = require('phpjs');


function Pump(options) {
	options = options || {};
	options.id = options.id || 0;
	options.id *= 4;// bump, lock, vibrate
	options.shiftout = options.shiftout || {}
	this.options = options;
	this.shiftout = options.shiftout;
}

Pump.prototype = {
	//private:
	//public
	constructor: Pump,
	getOptions: function() {
		return this.options;
	},
	setOption: function(key, value) {
		this.options[key] = value;
	},
	setOptions: function(options) {
		for (var key in options)
			this.setOption(key, options[key]);
	},
	getBumpId: function() {
		return this.options.id;
	},
	getLockId: function() {
		return this.options.id + 1;
	},
	getVibrateId: function(id) { // id: 0, 1
		return this.options.id + 2 + id;
	},
	bump_off: function(no_render) {
		no_render = no_render || false;
		var id = this.getBumpId();
		this.shiftout.turnOff(id)
		if (!no_render)
			this.shiftout.render()
	},
	bump_on: function(no_render) {
		no_render = no_render || false;
		var id = this.getBumpId();
		this.shiftout.turnOn(id)
		if (!no_render)
			this.shiftout.render()
	},
	lock_off: function(no_render) {
		no_render = no_render || false;
		var id = this.getLockId();
		this.shiftout.turnOff(id)
		if (!no_render)
			this.shiftout.render()
	},
	lock_on: function(no_render) {
		no_render = no_render || false;
		var id = this.getLockId();
		this.shiftout.turnOn(id)
		if (!no_render)
			this.shiftout.render()
	},
	vibrate_on: function(id, no_render) {
		no_render = no_render || false;
		var vibrateId = this.getVibrateId(id);
		console.log("vibrate On ")
		console.log(id + " " + vibrateId)
		this.shiftout.turnOn(vibrateId);
		
		if (!no_render)
			this.shiftout.render()
	},
	
	vibrate_off: function(id, no_render) {
		no_render = no_render || false;
		var vibrateId = this.getVibrateId(id);
		
		this.shiftout.turnOff(vibrateId);
		
		if (!no_render)
			this.shiftout.render()
	},
	release: function(no_render) {
		no_render = no_render || false;
		this.bump_off(true);
		this.lock_off(true);
		if (!no_render)
			this.shiftout.render()
	},
	on: function(no_render) {
		no_render = no_render || false;
		this.bump_on(true)
		this.lock_on(true)
		if (!no_render)
			this.shiftout.render()
	},
	off: function(no_render) {
		no_render = no_render || false;
		this.bump_off(true)
		this.lock_off(true)
		if (!no_render)
			this.shiftout.render()
	},
}

module.exports = Pump;