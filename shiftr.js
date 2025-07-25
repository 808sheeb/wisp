/*
    p5.js MQTT Client
    This program uses p5.js: https://p5js.org/
    and the Eclipse Paho MQTT client library: https://www.eclipse.org/paho/clients/js/
    
    to create an MQTT client that sends and receives MQTT messages and saves them to a JSON file.
    
    The client is set up for use on the shiftr.io test MQTT broker (https://shiftr.io/try),
    but has also been tested on https://test.mosquitto.org
    created 12 June 2020
    modified 20 Aug 2020
    by Tom Igoe
    
    
    https://tigoe.github.io/mqtt-examples/
    
    modified 13 Feb 2021
    by David Rios
    
    modified for JSON saving and reading 22 July 2025
    by Shihab Mian
*/

// MQTT client details:

let broker = {
  hostname: "instance-wisp.cloud.shiftr.io", //my wisp instance for shiftr
  //hostname: 'HOSTNAME.cloud.shiftr.io', is what this should look like
  port: 443, // port 443 because Paho uses websockets not http port
  //port: 1883
};

// MQTT client object:
let client;

// client credentials:
let creds = {
  clientID: "wisp001", // this is like a public display name for the device connecting
  //  userName: 'public', // shiftr example
  // password: 'public' // shiftr example
  userName: "instance-wisp", // name of the shiftr acc
  password: "knSv4qX0SNrP61xN", // unique Secret from token
};

// topic to subscribe to when you connect:
let topic = "Sys.Wisp.exe"; // create a topic name, required
let msgs;

function setup() {
  //Create an MQTT client:
  client = new Paho.MQTT.Client(
    broker.hostname,
    Number(broker.port),
    creds.clientID
  );

  // set callback handlers for the client:
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  // connect to the MQTT broker:
  client.connect({
    onSuccess: onConnect, // callback function for when you connect
    userName: creds.userName, // username
    password: creds.password, // password
    useSSL: true, // use SSL
  });
  msgs = [];
}

function draw() {}

// called when the client connects
function onConnect() {
  // localDiv.html('client is connected');
  client.subscribe(topic);
  console.log("connected");
  // if you wanted to putput to the screen that you are connected:
  //sent = createDiv("connected");
  //sent.position(20, 60);
  //recvd = createDiv("Received the message: ");
  //recvd.position(20, 80);
}

// called when the client loses its connection
// console will respond and tell you
function onConnectionLost(response) {
  if (response.errorCode !== 0) {
    // localDiv.html('onConnectionLost:' + response.errorMessage);
    console.log("onConnectionLost:" + response.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  // remoteDiv.html('I got a message:' + message.payloadString);
  let incoming = split(trim(message.payloadString), "/");
  msgs.push(incoming);
  console.log(msgs);
}

var input = document.getElementById("txtField");

input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    var s = document.getElementById("send");
    s.click();
  }
});

// called when the send button is pressed
function sendMessage() {
  let txtF = document.getElementById("txtField").value;
  // if the client is connected to the MQTT broker
  if (client.isConnected()) {
    let time = "[" + zeroFormat(hour()) + ":" + zeroFormat(minute()) + ":" + zeroFormat(second()) + "] ";
    let msg = String(time + txtF);
    // start an MQTT message:
    message = new Paho.MQTT.Message(msg);
    // choose the destination topic:
    message.destinationName = topic;
    // send it:
    client.send(message);
    document.getElementById("txtField").value = '';
  }
}

function zeroFormat(x) {
  let y;
  if (x < 10) {
    y = "0" + x;
  } else {
    y = str(x);
  }
  return y;
}

