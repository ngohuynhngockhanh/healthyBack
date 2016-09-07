var fs = require('fs')
var input = fs.createReadStream('./123.mp3');
var out = fs.createWriteStream('./test.wav');
var lame = require('lame');
var wav = require('wav');
var pcm = require('pcm-util');

var decoder = new lame.Decoder();

// we have to wait for the "format" event before we can start encoding
decoder.on('format', onFormat);

// and start transferring the data
input.pipe(decoder);

function onFormat (format) {
    console.error('MP3 format: %j', format);
    // write the decoded MP3 data into a WAV file
    var writer = new wav.Writer(format);
    decoder.pipe(writer);//.pipe(out);
	pcm.toBuffer(writer, format);
	
}