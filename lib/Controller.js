var five = require("johnny-five")
var phpjs = require('phpjs')
var bmp180_lib = require("./bmp180")
var util = require('util')
var events = require('events')
var Scheduler = require('./Scheduler.js')
var Shiftout = require('./Shiftout.js')
var Pump = require('./Pump.js')

function Controller(options) {
	var self = this
	options = options || {}
	this.options = options
	
	//status
	this.isRunning = false
	this.isPause = false
	
	//scheduler
	this.scheduler = new Scheduler();
	
	//shiftout
	this.shiftout = new Shiftout({
		pins: this.options.shiftoutPins,
		board: this.options.board,
		//bitcount:  8,
		bitcount: this.options.bumps_count * 4,
		//debug: true
	})
	
	//set default profile
	this.profile = {}
	this.__setDefaultProfile()
	
	console.log("vibrate count " + this.options.vibrate_count)
	
	//standardized the pressureDelta
	var default_pressure = []
	for (var i = 0; i < this.options.bumps_count; i++)
		default_pressure[i] = this.options.pressureDelta[i]
	
	this.board = options.board
	this.bmp180 = new bmp180_lib({
		select_pins: options.bmp_select_pin,
		//debug: true,
		//freq: 2000, 
		board: options.board,
		default_pressure: default_pressure,
		sensor_count: default_pressure.length
	})
	
	this.pumps = []
	
	this.board.on("ready", function() {
		for (var i = 0; i < self.options.bumps_count; i++) {
			console.log(default_pressure[i])
			self.pumps[i] = new Pump({
				id: i,
				shiftout: self.shiftout
			})
			self.pumpRelease(i)
		}
		if (self.options.bumps_count > 0)	
			self.bmp180.start();
		var startFirstTime = []
		setInterval(function() {
			var result = self.bmp180.getResult()
			//if (result[4])
				//result[4] *= 0.1
			if (self.isStart()) {
				for (var i = 0; i < self.pumps.length; i++) {
					if (result[i] > self.profile.outOfPressure) {
						self.pumpRelease(i)
						console.log("out of bump")
					} else if (result[i] > self.profile.maxPressure) {
						self.pumpOff(i)
						console.log("bump off " + i)
					} else if (result[i] < self.profile.minPressure || startFirstTime[i] == undefined || startFirstTime[i] == false) {
						self.pumpOn(i)
						console.log("bump on" + i)
						startFirstTime[i] = true
					}
				}
				console.log(result)
			}				
		}, 500);
		//self.pumpOn(4)
	});
	
	this.on('start', function() {
		console.log("trigger start")
		var indexPump = 0;
		self.scheduler.updateFunc([{
			run: function() {
				if (self.profile.howVibrating == 0) {
					for (var i = 0; i < self.pumps.length; i++) {
						self.vibrateAllOn(i)
						console.log("vibrate All on " + i)
					}
				} else if (self.profile.howVibrating == 2) {
					for (var i = 0; i < self.pumps.length; i++)
						self.vibrateAllOff(i)
					var random = phpjs.rand(0, (1 << self.pumps.length) - 1)
					for (var i = 0; i < self.pumps.length; i++) {
						if (!((random >> i) & 1))
							continue;
						var bump = self.pumps[i]
						var random2 = phpjs.rand(0, (1 << self.options.vibrate_count) - 1);
						for (var j = 0; j < self.options.vibrate_count; j++)
							if ((random2 >> j) & 1)
								self.vibrateOn(i, j)
					}	
				} else if (self.profile.howVibrating == 1) {
					for (var i = 0; i < self.pumps.length; i++)
						self.vibrateAllOff(i)
					self.vibrateAllOn(indexPump)
					indexPump = (indexPump + 1) % self.pumps.length
				}
				console.log("vibrate default")
			},
			timeout: ((self.profile.timeoutVibrating == -1) ? phpjs.rand(500, 5000) : self.profile.timeoutVibrating)
		}]);
		self.scheduler.start()
	});
	this.on('stop', function() {
		console.log("trigger stop")
		self.pumpReleaseAll()
		self.scheduler.stop()
		for (var i = 0; i < self.pumps.length; i++)
			self.vibrateAllOff(i)
	});
	this.on('resume', function() {
		console.log("trigger resume")
		self.scheduler.resume()
		
	});
	this.on('pause', function() {
		console.log("trigger pause")
		for (var i = 0; i < self.pumps.length; i++)
			self.pumpOff(i) 
		self.scheduler.pause()
	});
	
}

module.exports = Controller
util.inherits(module.exports, events.EventEmitter)

Controller.prototype.getOptions = function() {
	return this.options
};
Controller.prototype.setOption = function(key, value) {
	this.options[key] = value
};

//function
////pump
Controller.prototype.pumpOn = function(index) {
	this.pumps[index].on();
}

Controller.prototype.pumpOff = function(index) {
	this.pumps[index].off();
}

Controller.prototype.pumpRelease = function(index) {
	this.pumps[index].release();
}

Controller.prototype.pumpReleaseAll = function() {
	for (var index = 0; index < this.pumps.length; index++)
		this.pumps[index].release(true);
	this.shiftout.render();
}

Controller.prototype.pumpLength = function() {
	return this.pumps.length
}

////vibrate
Controller.prototype.vibrateOn = function(pumpIndex, motorIndex) {
	this.pumps[pumpIndex].vibrate_on(motorIndex)
}

Controller.prototype.vibrateOff = function(pumpIndex, motorIndex) {
	this.pumps[pumpIndex].vibrate_off(motorIndex)
}


Controller.prototype.vibrateAllOff = function(pumpIndex) {
	for (var i = 0; i < this.options.vibrate_count; i++)
		this.pumps[pumpIndex].vibrate_off(i, true)
	this.shiftout.render();
}

Controller.prototype.vibrateAllOn = function(pumpIndex) {
	for (var i = 0; i < this.options.vibrate_count; i++)
		this.pumps[pumpIndex].vibrate_on(i, true)
	this.shiftout.render();
}

Controller.prototype.vibrateByCode = function(pumpIndex, code) {
	for (var i = 0; i < this.options.vibrate_count; i++)
		if ((code >> i) & 1)
			this.pumps[pumpIndex].vibrate_on(i, true)
		else 
			this.pumps[pumpIndex].vibrate_off(i, true)
	this.render();
}


////lock
Controller.prototype.lockOn = function(index) {
	this.pumps[index].lock_on()
}

Controller.prototype.lockOff = function(index) {
	this.pumps[index].lock_off()
}

Controller.prototype.lockRelease = function() {
	for (var i = 0; i < this.pumps.length; i++)
		this.lockOff(i)
}
//checker
Controller.prototype.isStart = function() {
	return this.isRunning && !this.isPause
}

Controller.prototype.isMachinePause = function() {
	return this.isRunning && this.isPause
}

Controller.prototype.isStop = function() {
	return !this.isRunning
}

Controller.prototype.isResume = function(isRunning, isPause) {
	return this.isMachinePause() && isRunning && !isPause
}

//events
Controller.prototype.updateProfile = function(profile) {
	//standardized
	profile = profile || {}
	profile.name	= profile.name 		|| 'unknown'
	if (profile.name == 'unknown')
		return false
	profile.fullname = profile.fullname || 'Default'
	profile.maxPressure = profile.maxPressure	|| 7000
	profile.minPressure = profile.minPressure	|| 1000
	profile.outOfPressure = profile.outOfPressure || 12000
	profile.howVibrating= profile.howVibrating	|| 0 // 0 - all, 1 - one by one, 2 - randomize
	profile.timeoutVibrating = profile.timeoutVibrating || 2000 // -1 means randomize 
	
	profile.content = profile.content || []
	profile.duration = profile.duration	|| 0// 0 means last to 5% battery
	this.profile = profile
	
	this.scheduler.repeat = this.profile.duration == 0
		
	
	return true
}

Controller.prototype.getCurrentProfile = function() {
	return this.profile
}

Controller.prototype.updateMachineStatus = function(isRunning, isPause) {
	this.isRunning 	= isRunning
	this.isPause	= isPause
}


//private function
Controller.prototype.__setDefaultProfile = function() {
	return this.updateProfile({name: 'default'})
}

