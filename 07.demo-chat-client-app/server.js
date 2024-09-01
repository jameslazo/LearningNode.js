var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
const { resolveSoa } = require('dns');
require('dotenv').config();
const uri = process.env.MONGODB_URI;

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.get('/messages', (req, res) => {
    Message.find({})
        .then((messages)   => {
            res.send(messages);
        })
        .catch((err) => {
            res.status(500).send(err);
        })
});

app.post('/messages', (req, res) => {
    var message = new Message(req.body);
    message.save()
        .then(() => {
            io.emit('message', req.body);
            res.sendStatus(200);
        })

        .catch((err) => {res.sendStatus(500)});
});

io.on('connection', (socket) => {
    console.log('a user connected')
});

mongoose.connect(uri, {
    authSource: "admin",
    ssl: true,
});

var server = http.listen(3000, () => {
    console.log('Server is listening on port:', server.address().port)
});