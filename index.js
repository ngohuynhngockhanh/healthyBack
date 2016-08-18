var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

var bmp180_lib = require("./lib/bmp180");

const SELECT_PIN = ['GP28', 'GP111', 'GP109'];
const BMP180_COUNT = 5;

var bmp180 = new bmp180_lib({
	select_pins: SELECT_PIN,
	sensor_count: BMP180_COUNT,
	//debug: true,
	//freq: 2000,
	board: board,
	default_pressure: [45734, 90039, 86889, 91889, 97966 ]
});






board.on("ready", function() {
	
	bmp180.start();

	setInterval(function() {
		console.log(bmp180.getResult());
	}.bind(this), 1000);
});
