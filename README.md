# google-tokens 
Use this service to get access tokens for services connected to google

## Before anything
You need to have a config.js file in the root folder with the following content:

    exports.server = {
        port: 7777      // the port for the oauth site
    };
    
    exports.communication = {
        port: 7776,     // the port for the req service
        pubPort: 7775,  // the port for the pub service
    };
    
    exports.google = {
        key: 'your-google-app-id',
        secret: 'your-google-app-secret',
        callback: 'http://localhost:7777/your-google-auth-url-callback'
    };


## How to register new tokens
1. First visit the service index page and follow the link
2. Login with the your google account
3. Done

## How to use tokens in your services
1. With zonar, listen for google-tokens
2. To request a token, simply send a message to the rep service with the email you want to user as the message and you will recieve a token, if it exists
3. To subscribe to updated tokens, simply connect to the pub service and subscribe to the email. Whenever a new token is available, you will get it



