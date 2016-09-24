var phpjs = require('phpjs');
var util = require('util');
var events = require('events');

function Scheduler(options) {
	var self = this
	options = options | {}
	options.func = options.func | []
	this.options = options	

	this.repeat = options.repeat
	this.func = this.options.func
	
	this.__currentFuncIndex = -1
	
	this.timeout = undefined
	
}

module.exports = Scheduler;

util.inherits(module.exports, events.EventEmitter);

Scheduler.prototype.getOptions = function() {
	return this.options;
};
Scheduler.prototype.setOption = function(key, value) {
	this.options[key] = value;
};

Scheduler.prototype.getCurrentFuncIndex = function() {
	return this.__currentFuncIndex;
}

Scheduler.prototype.pause = function() {
	if (this.timeout) {
		clearTimeout(this.timeout)
		var func = this.func[getCurrentFuncIndex()]
		this.__finish()
	}
}

Scheduler.prototype.resume = function() {
	if (!this.timeout) {
		Scheduler.prototype.callNextFunc()
	}
}

Scheduler.prototype.callNextFunc = function() {
	if (this.getCurrentFuncIndex() == this.func.length)
		if (this.repeat) {
			this.__currentFuncIndex = 0;
		} else 
			return false
	
	var self = this
	var func = this.func[getCurrentFuncIndex()]
	func.run()
	
	if (this.timeout)
		clearTimeout(this.timeout)
	this.timeout = setTimeout(function() {
		this.__finish(true)
	}, func.timeout)
	return true
}

//private
Scheduler.prototype.__finish = function(callNextFunc) {
	this.__currentFuncIndex++;
	this.timeout = undefined
	if (callNextFunc)
		this.callNextFunc()
}

