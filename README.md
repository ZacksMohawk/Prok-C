# Zack's Mohawk Limited
## Prok-C

## Overview

This application is a very basic generic proxy service.

## How To Install

	npm install

## How To Run

In the Prok-C folder, run the following:

	node Prok-C

This will run on default port 8888 with default API key 'my_api_key', unless environment, config or command line param says otherwise.

## How To Configure

Please set the values in the config.ini file, or create a brand new config file and pass in its path as -configPath value. If you do not set SSL values, the server will default to HTTP.

To use a different config file:

	node Prok-C -configPath /path/to/config/file

To set port value as an Environment Variable:

	PROKC_PORT=8888

This can be overruled by an entry in the config.ini file:

	[main]
	port=8888

And this can be overruled by a command line param:

	node Prok-C -port 8888

To set API key value as an Environment Variable:

	PROKC_API_KEY=my_api_key

This can be overruled by an entry in the config.ini file:

	[auth]
	api.key=my_api_key

And this can be overruled by a command line param:

	node Prok-C -key my_api_key

## How To Use

To proxy a GET request, to https://test-site.com/pages/1 for example, send a request to https://localhost:8888/pages/1 and include the following values as headers:

	target: https://test-site.com
	key: {your api.key as set in config.ini}

You will then the receive the response as though it originated via the Prok-C application.

Proxying POST requests also requires the target and key to be set, and this will effectively forward the JSON body of your POST request, before returning the response.