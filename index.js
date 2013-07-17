var express = require("express");
var app = express();
app.use(express.logger());

var port = process.env.PORT || 5000;

app.use(express.static(__dirname));

app.listen(port, function() {
    console.log("Listening on " + port);
});
