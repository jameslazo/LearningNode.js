var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGODB_URI;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var Message = mongoose.model('Message', {
    name: String,
    message: String
});

var messages = [
    {name: 'Alice', message: 'Hi'},
    {name: 'Bob', message: 'Hello'}
];

app.get('/messages', (req, res) => {
    res.send(messages);
});

app.post('/messages', (req, res) => {
    messages.push(req.body);
    io.emit('message', req.body);
    res.sendStatus(200);
});

io.on('connection', (socket) => {
    console.log('a user connected')
});

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

var server = http.listen(3000, () => {
    console.log('Server is listening on port:', server.address().port)
});