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
Scheduler.prototype.updateFunc = function(func) {
	this.__clear();
	this.func = func
	this.stop()
}

Scheduler.prototype.start = function() {
	this.__clear();
	this.__currentFuncIndex = 0;
	this.callNextFunc();
}

Scheduler.prototype.stop = function() {
	this.__clear();
	this.__currentFuncIndex = -1;
}

Scheduler.prototype.pause = function() {
	this.__clear(function() {
		var func = this.func[this.getCurrentFuncIndex()]
		func.run();
		this.__finish()
	}.bind(this));
}

Scheduler.prototype.resume = function() {
	if (!this.timeout)
		this.callNextFunc()
}

Scheduler.prototype.callNextFunc = function() {
	if (this.getCurrentFuncIndex() == -1)
		return;
	if (!this.func || this.func.length == 0)
		return
	if (this.getCurrentFuncIndex() == this.func.length)
		if (this.repeat) {
			this.__currentFuncIndex = 0;
		} else {
			this.stop()
			return false
		}
	
	var self = this
	var func = this.func[this.getCurrentFuncIndex()]
	func.run()
	
	this.__clear();
	this.timeout = setTimeout(function() {
		self.__finish(true)
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


Scheduler.prototype.__clear = function(callback) {
	if (this.timeout) {
		clearTimeout(this.timeout);
		this.timeout = undefined
		if (callback)
			callback()
	}
}

