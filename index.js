var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison(),
  repl: false,
  debug: false,
});

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

//lib

var controller_lib = require("./lib/Controller.js");

const SELECT_PINS = ['GP182', 'GP13', 'GP165'];// all are 1v8
const SHIFTOUT_PINS = {
	data: 'GP44',
	clock: 'GP46',
	latch: 'GP48',
};
const MPU6050_ENABLE_PIN =['GP27'] ;

var controller = new controller_lib({
	board: board,
	bmp_select_pin: SELECT_PINS,
	shiftoutPins: SHIFTOUT_PINS,
	MPU6050_enablePin: MPU6050_ENABLE_PIN,
	bumps_count: 5,
	vibrate_count: 2,
	pressureDelta: [101010, 101010, 101010, 101010, 101010]
});



board.on("ready", function() {
	this.pinMode(MPU6050_ENABLE_PIN, five.Pin.OUTPUT);
	this.digitalWrite(MPU6050_ENABLE_PIN 1);
	/*
	var imu = new five.IMU({
		controller: "MPU6050",
		freq: 1000
	 });
	 imu.on("data", function() {
		//console.log(this.gyro.pitch); 
		console.log(this.gyro.pitch);
		io.sockets.emit("pitch", this.gyro.pitch);
	});*/ 
});



io.on('connection', function (socket) {
	console.log("socket connected!")
	socket.emit('news', { hello: 'world' })
	socket.emit('current profile', controller.getCurrentProfile())
	socket.emit('machine status', controller.isRunning, controller.isPause)
	

	
	//events
	socket.on("update profile", function(profile) {
		controller.updateProfile(profile)
	})
	
	socket.on('machine status', function(isRunning, isPause) {
		var key = false
		if (controller.isResume(isRunning, isPause)) {
			key = true
			controller.emit('resume')
		}
		controller.updateMachineStatus(isRunning, isPause)
		if (!key)
			if (controller.isStart())
				controller.emit('start')
			else if (controller.isStop())
				controller.emit('stop')
			else if (controller.isMachinePause())
				controller.emit('pause')
		io.sockets.emit('machine status', controller.isRunning, controller.isPause)
	});
	
	
	
	
});
