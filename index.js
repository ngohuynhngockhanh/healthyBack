var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

var bmp180_lib = require("./lib/bmp180");

const SELECT_PIN = ['GP28', 'GP111', 'GP109'];
const BMP180_COUNT = 4;

var bmp180 = new bmp180_lib({
	select_pins: SELECT_PIN,
	sensor_count: BMP180_COUNT,
	debug: true,
	freq: 2000,
	board: board
});






board.on("ready", function() {
	
	bmp180.start();

	
});
