var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

const SELECT_PIN = ['GP28', 'GP111', 'GP109'];
const BMP180_COUNT = 4;


board.on("ready", function() {
	//pinMode bmp180 select
	for (var i = 0; i < SELECT_PIN.length; i++)
		this.pinMode(SELECT_PIN[i], five.Pin.OUTPUT);
	
	
	//define function
	var id = 0;
	var toogleBMP = function() {
		console.log("Select BMP " + id);
		for (var i = 0; i < SELECT_PIN.length; i++)
			if ((id >> i) & 1)
				this.digitalWrite(SELECT_PIN[i], 1);
			else 
				this.digitalWrite(SELECT_PIN[i], 0);
		
		
		if (++id >= BMP180_COUNT)
			id = 0;
	}.bind(this);

	toogleBMP();
	var barometer = five.IMU.Drivers.get(this, "BMP180", {});

	barometer.emit("start");
	barometer.on("data", function(data) {
	    this.emit("pause");
		console.log(data.pressure);
		toogleBMP();
		setTimeout(function() {
			this.emit("resume");
		}.bind(this), 20);
	});
});
