var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the BMP180 Barometer module
  // into an I2C jack
  var options = {
    controller: "BMP180",
	freq: 1000
  }
  var barometer = five.IMU.Drivers.get(this, options.controller, options);

  barometer.emit("start");
  barometer.on("data", function(data) {
	  this.emit("pause");
    console.log("barometer");
    console.log("  pressure     : ", data.pressure);
    console.log("--------------------------------------");
	 setTimeout(function() {
		 this.emit("resume");
	 }.bind(this), 1000);
  });
});
