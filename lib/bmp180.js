var five = require("johnny-five");
var phpjs = require('phpjs');


function bmp180(options) {
	options = options || {};
	options.select_pins = options.select_pins || ['GP28', 'GP111', 'GP109'];
	options.sensor_count = options.sensor_count || 0;
	options.default_pressure = options.default_pressure || [];
	options.debug = options.debug || false;
	options.freq = options.freq || 20;
	options.board = options.board || false;
	if (!options.board) {
		console.log("please define board");
		return;
	}
	this.options = options;
	
	this.barometer = five.IMU.Drivers.get(this.options.board, "BMP180", {});
	this.result = [];
	this.__currentId = 0;
	for (var i = 0; i < options.sensor_count; i++) {
		this.result[i] = 0;
		this.options.default_pressure[i] = this.options.default_pressure[i] || 0;
	}
	
	for (var i = 0; i < options.select_pins.length; i++)
		this.options.board.pinMode(options.select_pins[i], five.Pin.OUTPUT);
}

bmp180.prototype = {
	//public
	constructor: bmp180,
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
	
	
	//get result array
	getResult: function() {
		return this.result;
	},
	start: function() {
		this.__nextPin();
		this.__update();
	},
	getId: function() {
		var id = this.__currentId - 1;
		return (id < 0) ? this.options.sensor_count - 1 : id;
	},
	
	//private
	__nextPin: function() {
		if (this.options.sensor_count == 0) {
			if (this.options.debug)
				console.log("please input how many sensors are you plug in?")
			return;
		}
		if (this.options.debug)
			console.log("Select BMP " + this.__currentId);
		for (var i = 0; i < this.options.select_pins.length; i++)
			if ((this.__currentId >> i) & 1)
				this.options.board.digitalWrite(this.options.select_pins[i], 1);
			else 
				this.options.board.digitalWrite(this.options.select_pins[i], 0);
		
		
		if (++this.__currentId >= this.options.sensor_count)
			this.__currentId = 0;
	},
	
	__update: function() {
		this.barometer.emit("start");
		this.barometer.on("data", function(data) {
			this.barometer.emit("pause");
			this.result[this.getId()] = data.pressure - this.options.default_pressure[this.getId()];
			if (this.options.debug)
				console.log(data.pressure);
			
			this.__nextPin();
			setTimeout(function() {
				this.barometer.emit("resume");
			}.bind(this), this.options.freq);
		}.bind(this));
	}
	
}

module.exports = bmp180;