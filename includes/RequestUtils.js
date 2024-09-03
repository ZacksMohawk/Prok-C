let request = require('request');

function sendPostFormRequest(req, res, url, formData, successFunction, failFunction, noResponseFunction){
	request.post(
		url,
		{
			headers: req.headers,
			form: formData
		},
		function (error, response, body) {
			if (response){
				if (response.statusCode == 200 || response.statusCode == 204){
					// execute the provided success function
					successFunction(body);
				}
				else {
					// execute fail function
					failFunction(response.statusCode);
				}
			}
			else {
				// execute no response function
				noResponseFunction();
			}
		}
	);
}

function sendPostBodyRequest(req, res, url, postBody, successFunction, failFunction, noResponseFunction){
	request.post(
		url,
		{
			headers: req.headers,
			json: postBody
		},
		function (error, response, body) {
			if (response){
				if (response.statusCode == 200 || response.statusCode == 204){
					// execute the provided success function
					successFunction(body);
				}
				else {
					// execute fail function
					failFunction(response.statusCode);
				}
			}
			else {
				// execute no response function
				noResponseFunction();
			}
		}
	);
}

module.exports = {
	sendPostFormRequest: sendPostFormRequest,
	sendPostBodyRequest: sendPostBodyRequest
}