// Import des modules
const express = require('express');
const mqtt = require('mqtt');
const socketIO = require('socket.io');
const http = require('http');

// Créer l'application grace à express
const app = express();

// Définie le dossier ou se trouve tous les documents du site
app.use(express.static('public'));

// Définie le port auquelle le serveur va s'ouvrir
const port = 3000;

// Créer la connexion MQTT
const client = mqtt.connect('mqtt://localhost:1884');

// Function qui va s'éxécuter automatiquement lors du démarrage du serveur
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

// Function qui va s'éxécuter automatiquement lors du démarrage du serveur si il y a une erreur
client.on('error', (err) => {
        console.error('Error;', err);
        client.end();
});

// Définie quelle document va être ouvert en premier
app.get('/', (req, res) => {
        res.redirect('/index.html');
});

// Appelle quelle port et quelle adresse IP le serveur va s'ouvrir
app.listen(port, '0.0.0.0', () => {
	console.log('Server is running on port 3000');
});
