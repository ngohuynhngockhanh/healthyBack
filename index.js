var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

//lib
var bmp180_lib = require("./lib/bmp180");
var controller_lib = require("./lib/Controller.js");

const SELECT_PIN = ['GP28', 'GP111', 'GP109'];
const BMP180_COUNT = 1;

var bmp180 = new bmp180_lib({
	select_pins: SELECT_PIN,
	sensor_count: BMP180_COUNT,
	//debug: true,
	//freq: 2000, 
	board: board,
	default_pressure: [45734+54536+500, 90069, 86889, 91889-480, 97966 ]
});






board.on("ready", function() {
	/*this.pinMode('GP115', five.Pin.OUTPUT);
	this.digitalWrite('GP115', 1);*/
	bmp180.start();

	setInterval(function() {
		console.log(bmp180.getResult());
	}.bind(this), 1000);
});
