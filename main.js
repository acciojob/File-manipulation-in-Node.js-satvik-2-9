const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Define the getFileContents function
function getFileContents(filePath, startByte, endByte, callback) {
  const absPath = path.resolve(filePath);
  const stream = fs.createReadStream(absPath, { start: startByte, end: endByte });
  const chunks = [];

  stream.on('data', (chunk) => {
    chunks.push(chunk);
  });

  stream.on('error', (err) => {
    callback(err, null);
  });

  stream.on('end', () => {
    callback(null, Buffer.concat(chunks));
  });
}

// Endpoint to serve file chunks
app.get('/file', (req, res) => {
  const filePath = req.query.filePath;
  const startByte = parseInt(req.query.startByte, 10);
  const endByte = parseInt(req.query.endByte, 10);

  getFileContents(filePath, startByte, endByte, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    const fileSize = fs.statSync(filePath).size;
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Length': data.length,
      'Content-Range': `bytes ${startByte}-${endByte}/${fileSize}`,
      'Accept-Ranges': 'bytes'
    };

    res.writeHead(206, headers);
    res.end(data);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
