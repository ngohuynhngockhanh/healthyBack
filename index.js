var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	console.log("socket connected!")
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});

//lib

var controller_lib = require("./lib/Controller.js");

const SELECT_PIN = ['GP115', 'GP109', 'GP111'];

var controller = new controller_lib({
	board: board,
	bmp_select_pin: SELECT_PIN,
	bumps: [{
		vibrate: ['GP81', 'GP80'],
		bump: 'GP15',
		lock: 'GP83',
		pressureDelta: 100740 - 210,
		maxPressure: 8100
	},{
		vibrate: ['GP79', 'GP78'],
		bump: 'GP49',
		lock: 'GP82',
		pressureDelta: 108770 + 500 - 14634 - 220,
		maxPressure: 8100
	},{
		vibrate: ['GP41', 'GP42'],
		bump: 'GP47',
		lock: 'GP43',
		pressureDelta: 100770 - 8248,
		maxPressure: 8100
	},{
		vibrate: ['GP84', 'GP128'],
		bump: 'GP45',
		lock: 'GP40',
		pressureDelta: 108770 + 500 -10936,
		maxPressure: 8100
	}]
});



board.on("ready", function() {
	
});
