'use strict';

var pkg = require('./package.json');
var plugin = require('./src/plugin');

exports.register = plugin.register;

exports.register.attributes = {
  name: pkg.name,
  version: pkg.version
};
