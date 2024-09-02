const fs = require('fs');
const Utils = require('./Utils');

let logFilePath;

function log(message){
	if (!message){
		message = "";
	}
	console.log(appType + " " + version + " " + Utils.getTimestamp() + " [" + port + "] " + message);
	
	if (!logFilePath && appType && port){
		logFilePath = appType + '_' + port + '.log';
	}
	
	if (logFilePath){
		fs.appendFile(logFilePath, new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') + "  " + message + '\n', function (err) {
			if (err) throw err;
		});
	}
}

module.exports = {
	log: log
}