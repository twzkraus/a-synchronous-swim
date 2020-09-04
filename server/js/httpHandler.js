const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const messageQueue = require('./messageQueue.js');
// const server = require('../spec/mockServer.js')

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

// let messageQueue = null;
module.exports.initialize = (queue) => {
  queue.forEach(message => {
    messageQueue.enqueue(message);
  });
};

// This function responds to requests at http://127.0.0.1/
module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);
  res.writeHead(200, headers);
  res.write(messageQueue.dequeue());
  res.end();
  next(); // invoke next() at the end of a request to help with testing!
};