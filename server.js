import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import messagesRouter from './routes/messages.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
  }
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, service: 'enterprise-chat', status: 'ok' });
});

app.use('/api/messages', messagesRouter);

io.on('connection', (socket) => {
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('message:send', (message) => {
    io.to(`conversation:${message.conversationId}`).emit('message:new', message);
  });
});

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`Enterprise Chat API running on http://localhost:${port}`);
});
