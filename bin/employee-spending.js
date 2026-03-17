#!/usr/bin/env node

/**
 * Module dependencies.
 */
import dotenv from "dotenv";
dotenv.config();

import app from "../app.js";
import debugLib from "debug";
import http from "http";

const debug = debugLib("event-kut:server");

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.APP_PORT);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

//socket.io
import { Server } from "socket.io";

// assume `server` is already created from http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*", // change this to your frontend URL for security
    methods: ["GET", "POST"]
  }
});

const userSockets = {};

io.on("connection", (socket) => {
  // console.log("New client connected:", socket.id);

  // Handle user registration
  socket.on("register", (username) => {
    userSockets[username] = socket.id;
    console.log("User registered:", username, socket.id);
  });

  // Handle sending message to a specific user
  socket.on("sendMessage", (user, msg) => {
    const recipientSocketId = userSockets[user];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message", user, msg);
      console.log(`Message sent to ${user}: ${msg}`);
    } else {
      console.log(`User ${user} not found.`);
    }
  });

  // Broadcast custom event
  socket.on("Hii Rupinoz!!", (user, msg) => {
    io.emit("Hii Rupinoz!!", user, msg);
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);

    // Optionally remove user from userSockets
    for (const username in userSockets) {
      if (userSockets[username] === socket.id) {
        delete userSockets[username];
        console.log(`User ${username} removed`);
        break;
      }
    }
  });
});


/**
 * Listen on provided port, on all network interfaces.
 */

// server.listen(port);
server.listen(port, process.env.APP_ADDRESS);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
