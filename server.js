var path = require('path');
var express = require('express');

const PORT = process.env.PORT || 8080

var app = express();

var staticPath = path.join(__dirname, '/dist');
app.use(express.static(staticPath));

app.listen(PORT, function () {
  console.log('listening on http://localhost:' + PORT);
});