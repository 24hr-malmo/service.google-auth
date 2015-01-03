var levelup = require('level');
var mkdirp = require('mkdirp');
var path = require('path');

var dataPath = path.join(__dirname, '../data');
mkdirp.sync(dataPath);

var db = levelup(dataPath + '/db');

module.exports = db;
