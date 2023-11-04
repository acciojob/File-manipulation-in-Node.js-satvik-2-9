Implement the getFileContents function in app.js:

const express = require('express');
const app = express();
const fs = require('fs');

function getFileContents(filePath, startByte, endByte) {
  // Implement this function
}

app.get('/file', (req, res) => {
  const filePath = req.query.filePath;
  const startByte = parseInt(req.query.startByte);
  const endByte = parseInt(req.query.endByte);

  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;
  const chunkSize = 1024 * 1024;

  if (startByte >= fileSize || endByte < 0) {
    res.status(416).end();
    return;
  }

  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Length': endByte - startByte + 1,
    'Content-Range': `bytes ${startByte}-${endByte}/${fileSize}`,
    'Accept-Ranges': 'bytes'
  };

  res.writeHead(206, headers);

  const fileStream = fs.createReadStream(filePath, { start: startByte, end: endByte });

  fileStream.on('error', (err) => {
    res.status(500).end();
    console.error(err);
  });

  fileStream.on('open', () => {
    fileStream.pipe(res);
  });

  fileStream.on('end', () => {
    res.end();
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
