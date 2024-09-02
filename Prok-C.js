const fs = require('fs');
const express = require('express');
const PropertiesReader = require('properties-reader');
const https = require('https');
const request = require('request');
const app = express();
const Logger = require('./includes/Logger');


/**
 * Objects and Variables
 */

global.appType = "PRKC";
global.version = "0.0.1";
global.port = 999;

Logger.log();
Logger.log(fs.readFileSync('AppLogo.txt', 'utf8'));
Logger.log();
Logger.log('Prok-C v' + version);
Logger.log();

// command line params
let configPath;
if (process.argv.indexOf("-configPath") != -1){
    configPath = process.argv[process.argv.indexOf("-configPath") + 1];
}
else {
    Logger.log("No config path, defaulting to local config");
    configPath = 'config.ini';
}

// properties
let properties = PropertiesReader(configPath);
global.debugMode = properties.get('main.debug.mode');
let apiKey = properties.get('auth.api.key');
let privateKey, certificate, credentials = null;
let selfSignedAllowed = false;
if (properties.get('ssl.private.key') && properties.get('ssl.certificate')){
	privateKey = fs.readFileSync(properties.get('ssl.private.key'), 'utf8');
	certificate = fs.readFileSync(properties.get('ssl.certificate'), 'utf8');
	credentials = {
		key: privateKey,
		cert: certificate
	};
	if (properties.get('ssl.allow.self.signed')){
		selfSignedAllowed = true;
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	}
}
let homepageText = properties.get('page.home.text') + version;


/**
 * API Endpoints
 */

// homepage
app.get('/', function (req, res) {
	if (debugMode) {
		Logger.log("[Debug] Homepage request");
	}
	res.send(homepageText);
});

// get
app.get('/*', function (req, res) {
	if (!checkAuth(req, res)){
		return;
	}

	let target = req.header('target');
	if (!target){
		res.status(400).send("BAD REQUEST");
		return;
	}

	let fullURL = target + req.url;

	delete req.headers['key'];
	delete req.headers['target'];
	delete req.headers['host'];

	let options = {
		'uri': fullURL,
		'headers': req.headers,
		'method': req.method
	}

	request(options, function(error, response, body){
		if (error){
			if (debugMode) {
				Logger.log("GET proxy request unable to connect to: " + fullURL);
			}
			res.status(521).send("SERVER DOWN");
			return;
		}
	}).pipe(res);
});

function checkAuth(req, res){
	let key = req.header('key');
	if (!key || key != apiKey){
		res.status(401).send("UNAUTHORIZED");
		return false;
	}
	return true;
}


/**
 * Start server
 */

if (credentials != null){
	let httpsServer = https.createServer(credentials, app);
	module.exports = httpsServer.listen(port);
	Logger.log('HTTPS Listening on port ' + port + '...');
	if (selfSignedAllowed){
		Logger.log("WARNING: Self-signed certificates allowed");
	}
}
else {
	module.exports = app.listen(port);
	Logger.log('HTTP Listening on port ' + port + '...');
}
Logger.log();
