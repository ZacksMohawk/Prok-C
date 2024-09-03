const fs = require('fs');
const express = require('express');
const PropertiesReader = require('properties-reader');
const https = require('https');
const bodyParser = require('body-parser');
const app = express();
const Logger = require('./includes/Logger');
const RequestUtils = require('./includes/RequestUtils');


/**
 * Objects and Variables
 */

global.appType = "PRKC";
global.version = "0.0.3";
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
if (properties.get('main.port')){
	global.port = properties.get('main.port');
}
if (process.argv.indexOf("-port") != -1){
    global.port = process.argv[process.argv.indexOf("-port") + 1];
}
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

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());


/**
 * API Endpoints
 */

app.get('/*', function (req, res) {

	let target = req.header('target');
	if (!target){
		res.status(200).send(homepageText);
		return;
	}

	if (!checkAuth(req, res)){
		return;
	}

	let fullURL = target + req.url;

	delete req.headers['key'];
	delete req.headers['target'];
	delete req.headers['host'];

	RequestUtils.sendGetRequest(fullURL, req.headers,
		// successFunction
		function(body){
			if (debugMode) {
				Logger.log("[Debug] Successful GET proxy attempt for: " + fullURL);
			}
			res.status(200).send(body);
		},
		// failFunction
		function(statusCode){
			if (debugMode) {
				Logger.log("[Debug] Failed GET proxy attempt (" + statusCode + ") for: " + fullURL);
			}
			res.status(statusCode).send("ERROR");
		},
		// noResponseFunction
		function(){
			if (debugMode) {
				Logger.log("[Debug] Failed GET proxy attempt (521) for: " + fullURL);
			}
			res.status(521).send("ERROR");
		}
	);
});

app.post('/*', function (req, res) {

	let target = req.header('target');
	if (!target){
		res.status(400).send("BAD REQUEST");
		return;
	}
	
	if (!checkAuth(req, res)){
		return;
	}

	let fullURL = target + req.url;

	delete req.headers['key'];
	delete req.headers['target'];
	delete req.headers['host'];
	delete req.headers['content-length'];

	RequestUtils.sendPostBodyRequest(req, res, fullURL,
		// postBody
		req.body, 
		// successFunction
		function(body){
			if (debugMode) {
				Logger.log("[Debug] Successful POST proxy attempt for: " + fullURL);
			}
			res.status(200).send(body);
		},
		// failFunction
		function(statusCode){
			if (debugMode) {
				Logger.log("[Debug] Failed POST proxy attempt (" + statusCode + ") for: " + fullURL);
			}
			res.status(statusCode).send("ERROR");
		},
		// noResponseFunction
		function(){
			if (debugMode) {
				Logger.log("[Debug] Failed POST proxy attempt (521) for: " + fullURL);
			}
			res.status(521).send("ERROR");
		}
	);
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
