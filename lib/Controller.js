var five = require("johnny-five");
var phpjs = require('phpjs');
var bmp180_lib = require("./bmp180");
var util = require('util');
var events = require('events');

function Controller(options) {
	var self = this
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
		for (var i = 0; i < self.options.bumps.length; i++) {
			var bump = self.options.bumps[i];
			console.log(bump);
			self.pumps[i] = {
				bump: new five.Led(bump.bump),
				lock: new five.Led(bump.lock),
				vibrate: [],
				max: bump.maxPressure
			}
			self.pumps[i].bump.off();
			self.pumps[i].lock.on();
			//self.pumps[i].lock.off();
			for (var j = 0; j < bump.vibrate.length; j++) {
				self.pumps[i].vibrate[j] = new five.Relay(bump.vibrate[j]);	
				
				self.pumps[i].vibrate[j].off();
			}
				
		}
			
		self.bmp180.start();
		setInterval(function() {
			var result = self.bmp180.getResult();
			for (var i = 0; i < 2; i++) {
				if (result[i] > self.pumps[i].max || result[i] < 20) {
					self.pumps[i].bump.off();
					console.log("bump off " + i)
				} else if (result[i] < 1000) {
					self.pumps[i].bump.on();
					console.log("bump on" + i)
				}
			}
			console.log(result);
		}, 500);
	});
}

module.exports = Controller;

util.inherits(module.exports, events.EventEmitter);

Controller.prototype.getOptions = function() {
	return this.options;
};
Controller.prototype.setOption = function(key, value) {
	this.options[key] = value;
};
