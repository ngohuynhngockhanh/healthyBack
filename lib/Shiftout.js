var five = require("johnny-five");
var phpjs = require('phpjs');

//implement ShiftRegister send method
five.ShiftRegister.prototype.send = function( value ) {
  this.board.digitalWrite( this.pins.latch, 0 );
  if (Array.isArray(value))
	  for (var i = 0; i < value.length; i++)
		  this.board.shiftOut( this.pins.data, this.pins.clock, true, value[i] );
  else 
	this.board.shiftOut( this.pins.data, this.pins.clock, true, value);
  console.log("send to 595 :" )
  console.log(value)
  this.board.digitalWrite( this.pins.latch, 1 );

  return this;
};

function Shiftout(options) {
	options = options || {};
	options.board = options.board || false;
	options.debug = options.debug || false;
	options.pins = options.pins || {};
	options.pins.data = options.pins.data || 'GP44'
	options.pins.clock = options.pins.clock || 'GP46'
	options.pins.latch = options.pins.latch || 'GP48'
	options.bitcount = options.bitcount || 8;
	options.bitcount = this.__formatBitcount(options.bitcount)
	this.options = options;
	
	console.log("shiftout pins: ")
	console.log(options.pins)
	if (options.debug) {
		this.options.board.pinMode(options.pins.data, five.Pin.OUTPUT);
		this.options.board.pinMode(options.pins.clock, five.Pin.OUTPUT);
		this.options.board.pinMode(options.pins.latch, five.Pin.OUTPUT);
		this.options.board.digitalWrite(options.pins.data, 1);
		this.options.board.digitalWrite(options.pins.clock, 1);
		this.options.board.digitalWrite(options.pins.latch, 1);
		return;	
	}
	
	this.shiftRegister = new five.ShiftRegister({
		pins: options.pins
	  });
	this.options = options;
	var state = [];
	for (var i = 0; i < this.options.bitcount / 8; i++)
		state[i] = 0
	console.log("set new state")
	console.log(state)
	this.state = state
	if (options.debug)
		this.send (128)
}

Shiftout.prototype = {
	//private:
	__formatBitcount: function(bitcount) {
		if (bitcount <= 8)
			return 8
		else if (bitcount % 8 == 0)
			return bitcount
		else
			return (bitcount - (bitcount % 8) + 8);
	},
	//public
	constructor: Shiftout,
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
	send: function(value) {
		this.shiftRegister.send(value)
	},
	
	getId: function(key) {
		return (key - this.getIndex(key)) / 8;
	},
	getIndex: function(key) {
		return key % 8;
	},
	turnOn: function(key) {
		var i = this.getId(key)
		var j = this.getIndex(key)
		this.state[i] |= 1 << j;
	},
	turnOff: function(key) {
		var i = this.getId(key)
		var j = this.getIndex(key)
		this.state[i] &= ~(1 << j);
	},
	set: function(key, state) {
		if (state == 1)
			this.turnOn(key)
		else
			this.turnOff(key)
	},
	render: function() {
		this.send(this.state)
	}
}

module.exports = Shiftout;