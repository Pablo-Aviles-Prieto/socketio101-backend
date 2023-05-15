import 'dotenv/config';

import http from 'http';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { Server } from 'socket.io';
import { LinesI } from './interfaces';

const { PORT } = process.env;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

let usersAmount = 0;
const users = {};

io.on('connection', (socket) => {
  socket.on('register', (username) => {
    usersAmount++;
    users[socket.id] = username;
    console.log(`${username} connected // Total users => ${usersAmount}`);
  });

  socket.on('disconnect', () => {
    usersAmount--;
    const username = users[socket.id];
    console.log(`${username} disconnected // Total users => ${usersAmount}`);
    delete users[socket.id];
  });

  socket.on('chat msg', (msg: string) => {
    // This will send the event to all connected clients, including the one that initiated the event.
    io.emit('chat msg', msg);
  });

  socket.on('new segment', (lineLength: number, lineSegment: LinesI) => {
    // This will send the event to all clients except for the one that initiated the event
    socket.broadcast.emit('new segment', lineLength, lineSegment);
  });

  socket.on('clear board', () => {
    socket.broadcast.emit('clear board');
  });
});

httpServer.listen(PORT, () => console.info(`Server running and listening at http://localhost:${PORT}`));
