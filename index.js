const express = require('express');
const mqtt = require('mqtt');
const socketIO = require('socket.io');
const http = require('http');

const app = express();

app.use(express.static('public'));

const port = 3000;

const client = mqtt.connect('mqtt://localhost:1884');

client.on('connect', () => {
	console.log("Connection established succesfully");
	const topic = 'topic';
	const message = 'MQTT WORKS';

	client.publish(topic, message, (err) => {
		if (!err) {
			console.log(`Published message "${message}" to topic "${topic}"`);
			client.end();
		} else {
			console.error('Error publishing message:', err);
			client.end();
		}
	});
});

client.on('error', (err) => {
        console.error('Error;', err);
        client.end();
});

app.get('/', (req, res) => {
        res.redirect('/index.html');
});

app.listen(port, '0.0.0.0', () => {
	console.log('Server is running on port 3000');
});
