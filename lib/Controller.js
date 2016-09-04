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
			this.pumps[i] = {
				bump: new five.Relay(bump.bump),
				lock: new five.Relay(bump.lock),
				vibrate: []
			}
			for (var j = 0; j < bump.vibrate.length; j++)
				this.pumps[i].vibrate[j] = new five.Relay(bump.vibrate[j]);	
		}
			
		this.bmp180.start();
		
		
		setInterval(function() {
			console.log(this.bmp180.getResult());
		}.bind(this), 1000);
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