'use strict';
process.env.NODE_ENV = 'test';
var expect = require('expect.js');
var rewire = require('rewire');
var plugin = rewire('../src/plugin.js');
var pkg = require('../package.json');

describe('Plugin Domain Culture', function() {

  /*
   *
   * options are undefined
   *
   */
  describe('When options are undefined', function(){
    var pluginOptions = {};
    var req = {
      info: {
        received: new Date()
      },
      method: 'get',
      response: {
        statusCode: 200
      },
      headers: {
        'accept-language': 'en-US'
      },
      route: {
        settings: {
          plugins: {
            'hapi-domainculture': {
              version: pkg.version
            }
          }
        }
      }
    };

    var nextCalled = false;

    before(function(done){
      plugin.register({
        ext: function(_, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function(){});
    });

    it('response should be undefined', function(){
      expect(nextCalled).to.be.true;
    });
  });


  /*
   *
   * options are defined (without default header name)
   *
   */
  describe('When options are defined', function(){
    var pluginOptions = {
      white_list: {
        'en-US': {
          langauge: 'en',
          domain: 'com',
          country: 'US'
        },
        'en-MX': {
          language: 'en',
          domain: 'commx',
          country: 'mexico'
        }
      },
      default_domain_culture: 'en-US'
    };
    var req = {
      info: {
        received: new Date()
      },
      method: 'get',
      response: {
        statusCode: 200
      },
      headers: {
        'accept-language': 'en-US'
      },
      route: {
        settings: {
          plugins: {
            'hapi-domainculture': {
              version: pkg.version
            }
          }
        }
      },
      raw: {
        req: { headers: { 'accept-language': 'en-US' } }
      }
    };

    before(function(done){
      plugin.register({
        ext: function(_, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function(){});
    });

    it('should set request.pre.domainCulture', function(){
      expect(req).to.be.object;
      expect(req.pre).to.not.be.null;
      expect(req.pre.domainCulture).to.be.equal('en-US');
      console.log(req.pre);
    });
  });
});

