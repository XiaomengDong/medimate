// server.js
module.exports = (req, res) => {
  // Example: if you only care about the root path
  if (req.method === 'GET' && req.url === '/') {
    res.status(200).send('Hello from Vercel!');
  } else {
    // For any other path, you can still return something, or 404:
    res.status(404).send('Not Found');
  }
};