var five = require("johnny-five");
var phpjs = require('phpjs');
var bmp180_lib = require("./bmp180");

function Controller(options) {
	options = options || {};
	this.options = options;
	this.options.bumps = this.options.bumps || [];
	
	var default_pressure = [];
	for (var i = 0; i < this.options.bumps.length; i++)
		default_pressure[i] = this.options.bumps[i].pressureDelta;
	
	this.board = options.board;
	this.bmp180 = new bmp180_lib({
		select_pins: options.bmp_select_pin,
		//debug: true,
		//freq: 2000, 
		board: options.board,
		default_pressure: default_pressure,
		sensor_count: default_pressure.length
	});
	
	this.pumps = [];
	
	this.board.on("ready", function() {
		for (var i = 0; i < this.options.bumps.length; i++) {
			var bump = this.options.bumps[i];
			console.log(bump);
			this.pumps[i] = {
				bump: new five.Relay(bump.bump),
				lock: new five.Relay(bump.lock),
				vibrate: [],
				max: bump.maxPressure
			}
			this.pumps[i].bump.off();
			this.pumps[i].lock.on();
			for (var j = 0; j < bump.vibrate.length; j++)
				this.pumps[i].vibrate[j] = new five.Relay(bump.vibrate[j]);	
		}
			
		this.bmp180.start();
		setInterval(function() {
			var result = this.bmp180.getResult();
			if (result[0] > this.pumps[0].max || result[0] < 50) {
				this.pumps[0].bump.off();
				console.log("bump off")
			} else if (result[0] < 1000) {
				this.pumps[0].bump.on();
				console.log("bump on")
			}
			console.log(result);
		}.bind(this), 500);
	}.bind(this));
}

Controller.prototype = {
	//public
	constructor: Controller,
	getOptions: function() {
		return this.options;
	},
	setOption: function(key, value) {
		this.options[key] = value;
	},
}

module.exports = Controller;