# Zack's Mohawk Limited
## Prok-C

## Overview

This application is a very basic generic proxy service.

## How To Install

	npm install

## How To Configure

Please set the values in the config.ini file, or create a brand new config file and pass in its path as -configPath value. If you do not set SSL values, the server will default to HTTP.

## How To Run

In the Prok-C folder, run the following:

	node Prok-C

This will run on default port 999, unless config or command line param says otherwise.

To use a different config file:

	node Prok-C -configPath /path/to/config/file

To use a different port (eg. 777):

	node Prok-C -port 777

## How To Use

To proxy a GET request, to https://test-site.com/pages/1 for example, send a request to https://localhost:999/pages/1 and include the following values as headers:

	target: https://test-site.com
	key: {your api.key as set in config.ini}

You will then the receive the response as though it originated via the Prok-C application.

Proxying POST requests also requires the target and key to be set, and this will effectively forward the JSON body of your POST request, before returning the response.