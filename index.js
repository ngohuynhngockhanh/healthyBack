var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

//lib

var controller_lib = require("./lib/Controller.js");

const SELECT_PIN = ['GP28', 'GP111', 'GP109'];
const BMP180_COUNT = 1;

var controller = new controller_lib({
	board: board,
	bmp_select_pin: ['GP28', 'GP111', 'GP109'],
	bumps: [{
		vibrate: ['GP80', 'GP81'],
		bump: 'GP182',
		lock: 'GP115',
		pressureDelta: 100770
	}]
});





board.on("ready", function() {
	
});
