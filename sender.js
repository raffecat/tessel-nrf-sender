/* tessel to tessel
 * requires 2 nrf24 modules (and ideally two tessels)
 *
 * Transmits light level to receiver device.
 * For receiver, see:
 * https://github.com/SomeoneWeird/tessel-nrf-receiver
 */

var tessel = require('tessel');
var NRF24 = require('rf-nrf24');
var ambientlib = require('ambient-attx4');

var pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2];

var nrf = NRF24.channel(0x4c) // set the RF channel to 76. Frequency = 2400 + RF_CH [MHz] = 2476MHz
    .transmitPower('PA_MAX') // set the transmit power to max
    .dataRate('1Mbps')
    .crcBytes(2) // 2 byte CRC
    //.autoRetransmit({count:1, delay:100})
    .use(tessel.port['C']);

var txPipe = null;
var isOn = true;

function sendByte(val) {
  if (val < 0) val = 0;
  if (val > 255) val = 255;
  if (txPipe) {
    var b = new Buffer(4);
    b.fill(0);
    b.writeUInt32BE(val,0);
    console.log("Sending", b.readUInt32BE(0));
    txPipe.write(b);
  }
}


// AMBIENT

var ambient = ambientlib.use(tessel.port['D']);

ambient.on('ready', function () {

  console.log("AMBIENT READY");

  // Get points of light and sound data.
  setInterval( function () {
    ambient.getLightLevel( function(err, ldata) {
      ambient.getLightLevel( function(err, sdata) {
        console.log("Light level:", (ldata||0).toFixed(8), " ", "Sound Level:", (sdata||0).toFixed(8));
        
        var light = ((ldata||0) * 16) * 255;
        if (light > 255) light = 255;

        sendByte( isOn ? light : 0 );
    });
  })}, 2000); // The readings will happen every .5 seconds unless the trigger is hit

  // Set a sound level trigger
  // The trigger is a float between 0 and 1
  ambient.setSoundTrigger(0.2);

  ambient.on('sound-trigger', function(data) {
    console.log("Something happened with sound: ", data);

    isOn = !isOn;
    console.log( isOn ? "Light is now ON" : "Light is now OFF" );

    // Clear it
    ambient.clearSoundTrigger();

    //After 1.5 seconds reset sound trigger
    setTimeout(function () { 

        ambient.setSoundTrigger(0.1);

    },500);

  });
});

ambient.on('error', function (err) {
  console.log("ambient:", err)
});



// NRF comms

nrf._debug = false;

nrf.on('ready', function () {

    console.log("NRF READY");

    var tx = nrf.openPipe('tx', pipes[0], {autoAck: false}), // transmit address F0F0F0F0D2
        rx = nrf.openPipe('rx', pipes[1], {size: 4}); // receive address F0F0F0F0D2
    tx.on('ready', function () {
        txPipe = tx;
    });
    rx.on('data', function (d) {
        console.log("Got response back:", d);
    });
  
});

nrf.on('error', function (err) {
  console.log("nrf:", err)
});



// hold this process open
process.ref();
