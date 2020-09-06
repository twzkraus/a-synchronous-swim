const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const messageQueue = require('./messageQueue.js');

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

  if (req.method === 'GET') {
    if (req.url.slice(req.url.length - 4) === '.jpg') {
      // var s = fs.createReadStream(module.exports.backgroundImageFile);
      fs.readFile(module.exports.backgroundImageFile, (err, fileData) => {
        if (err) {
          res.writeHead(404);
        } else {
          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': fileData.length
          });
          res.write(fileData, 'binary')
        }
        res.end();
        next()
      })
      // if (fs.existsSync(module.exports.backgroundImageFile)) {
      //   // Synchronous:
      //   data = fs.readFileSync(module.exports.backgroundImageFile);
      //   res.write(data);
      //   res.end();
      //   next();
      //   // Asynchronous:
      //   // fs.readFile(module.exports.backgroundImageFile, (err, data) => {
      //   //   res.writeHead(200, {'content-type': 'image/jpeg'});
      //   //   if (err) throw err;
      //   //   res.write(data);
      //   //   res.end();
      //   // });
      //   // PIPE WORKS, BUT IT DOESN'T PLAY WELL WITH RES.END()--FAILING TEST.
      //   // We are working with fs.readFile instead to see if we can make sure the end() is sent
      //   // s.on('open', () => {
      //   //   s.pipe(res);
      //   //   // res.end();
      //   // });
      //   // res.end();
      //   // s.on('close', () => res.end());
      // } else {
      //   console.log('404 error');
      //   res.writeHead(404, headers);
      //   res.end();
      // }
    } else {
      res.writeHead(200, headers);
      res.write(messageQueue.dequeue() || 'left');
      res.end();
    }

  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.write();
    res.end();

  } else if (req.method === 'POST' && req.url === '/background.jpg') {
    var imageData = Buffer.alloc(0);

    req.on('data', (chunk) => {
      imageData = Buffer.concat([imageData, chunk]);
    });

    req.on('end', () => {
      const fileData = multipart.getFile(imageData);
      // module.exports.backgroundImageFile = path.join('.', fileData.filename);
      // console.log('----------> fileData: ', fileData);

      fs.writeFile(module.exports.backgroundImageFile, fileData.data, () => {
        res.writeHead(201, headers);
        res.end();
        next();
      });
    });
  }
  /*
    const ajaxFileUplaod = (file) => {
    var formData = new FormData();
    formData.append('file', file);
    $.ajax({
      type: 'POST',
      data: formData,
      url: serverUrl,
      cache: false,
      contentType: false,
      processData: false,
      success: () => {
        // reload the page
        window.location = window.location.href;
      }
    });
  };
  */
  // next(); // invoke next() at the end of a request to help with testing!
};