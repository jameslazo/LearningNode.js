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

app.post('/messages', async (req, res) => {
    try {
        var message = new Message(req.body);
    
        var savedMessage = await message.save()
            
            console.log('saved');
        
        var censored = await Message.findOne({message: 'bad word'});

            if(censored) {
                console.log('censored words found', censored);
                await Message.deleteOne({_id: censored.id});
            }
            else
                io.emit('message', req.body);
            
            res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500)
        return console.error(error);
    }
    finally {
        console.log('Message Posted')
    }
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