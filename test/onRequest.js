'use strict';
process.env.NODE_ENV = 'test';
var expect = require('expect.js');
var rewire = require('rewire');
var plugin = rewire('../src/plugin.js');
var pkg = require('../package.json');

describe('Plugin Versioning', function() {

  /*
   *
   * pattern is undefined
   * header is { "version": "v2" }
   */
  describe('When {pattern: undefined , pathname: /say/hi, header: { version: v1 } }', function(){
    var pluginOptions = {};
    var res;
    var newUrl;
    before(function(done){
      plugin.register({
        ext: function(_, handler) {
          handler({
            info: {
              received: new Date()
            },
            method: 'get',
            response: {
              statusCode: 200
            },
            headers: {
              version: 'v1'
            },
            setUrl: function(url) {
              newUrl = url;
              return;
            },
            url: { pathname: '/say/hi' },
            route: {
              settings: {
                plugins: {
                  'hapi-versioning': {
                    version: pkg.version
                  }
                }
              }
            }
          }, {
            continue: function(res) {
              res = res;
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });
    it('should return url with v1', function(){
      expect(newUrl).to.be.eql('/v1/say/hi');
    });
  });

  /*
    options.pattern: undefined
    header: { version: v2 }
    url: /v1/say/hi
  */
  describe('When {pattern: undefined , pathname: /v1/say/hi, header: {version : v2 } }', function(){
    var pluginOptions = {};
    var res;
    var newUrl = '/v1/say/hi';
    before(function(done){
      plugin.register({
        ext: function(_, handler) {
          handler({
            info: {
              received: new Date()
            },
            method: 'get',
            response: {
              statusCode: 200
            },
            headers: {
              version: 'v2'
            },
            setUrl: function(url) {
              newUrl = url;
              return;
            },
            url: { pathname: newUrl },
            route: {
              settings: {
                plugins: {
                  'hapi-versioning': {
                    version: pkg.version
                  }
                }
              }
            }
          }, {
            continue: function(res) {
              res = res;
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('should return url with v1, override the header', function(){
      expect(newUrl).to.be.eql('/v1/say/hi');
    });
  });

  describe('When {pattern: undefined , pathname: /v1/say/hi, header: {version : v2 } }', function(){
    var pluginOptions = {};
    var res;
    var newUrl = '/v2/say/hi';
    before(function(done){
      plugin.register({
        ext: function(_, handler) {
          handler({
            info: {
              received: new Date()
            },
            method: 'get',
            response: {
              statusCode: 200
            },
            headers: {
              version: 'v1'
            },
            setUrl: function(url) {
              newUrl = url;
              return;
            },
            url: { pathname: newUrl },
            route: {
              settings: {
                plugins: {
                  'hapi-versioning': {
                    version: pkg.version
                  }
                }
              }
            }
          }, {
            continue: function(res) {
              res = res;
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });
    it('should return url with v2, override the header', function(){
      expect(newUrl).to.be.eql('/v2/say/hi');
    });
  });
  /*
    options = {
      pattern: /^(version-[1-3])$/,
      header: 'v'
    }
    url: /say/hi
    header: { v : version-1}
  */
  describe('When {pattern: /^(version[1-3])$/ , pathname: /say/hi, header: { v : version-2 } }', function(){
    var pluginOptions = {
      header: 'v',
      pattern: /^(version-[1-3])$/
    };
    var res;
    var newUrl = '/say/hi';
    before(function(done){
      plugin.register({
        ext: function(_, handler) {
          handler({
            info: {
              received: new Date()
            },
            method: 'get',
            response: {
              statusCode: 200
            },
            headers: {
              v: 'version-2'
            },
            setUrl: function(url) {
              newUrl = url;
              return;
            },
            url: { pathname: newUrl },
            route: {
              settings: {
                plugins: {
                  'hapi-versioning': {
                    version: pkg.version
                  }
                }
              }
            }
          }, {
            continue: function(res) {
              res = res;
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });
    it('should return url with version-2, override the header', function(){
      expect(newUrl).to.be.eql('/version-2/say/hi');
    });
  });
});

