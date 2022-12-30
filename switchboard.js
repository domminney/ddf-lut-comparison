var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var httpServer = http.createServer(app);
var port = 4015;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//set up routes
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})

//start server
httpServer.listen(port, function() {
    console.log('Server listening on port ' + port);
})