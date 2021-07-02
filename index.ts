import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import gameHost from './socketAPI/gameHost';
import passport from 'passport';
import mongoose from 'mongoose';
import authenticate from './routes/authentication';

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(passport.initialize());

app.use("/users", authenticate);

const socketServer = new Server(server,
    {
        serveClient: false,
        path: '/socket',
        cors: {
            origin: 'http://localhost:3001'
        }
    });
    
gameHost(socketServer);

try{
    mongoose.connect('mongodb://localhost:27017/CasinoSite', { 
        useNewUrlParser : true,
        useUnifiedTopology : true,
        useCreateIndex : true
    });
}
catch (err) {
    console.log('unable to connect to server');
}

server.listen(process.env.PORT, () => {
    console.log('listening on port : '+process.env.PORT);
});