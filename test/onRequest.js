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
    var nextError = null;
    before(function(done){
      plugin.register({
        ext: function(_, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function(error){
        nextCalled = true;
        nextError = error;
        done();
      });
    });

    it('response should be undefined', function(){
      expect(nextCalled).to.be.true;
    });
    it('Should call next with an error', function() {
      expect(nextError).to.be.an.object;
      expect(nextError).to.match(/Missing options/);
      expect(nextError).to.not.be.null;
    });
  });


  /*
   *
   * options are defined (without default header name)
   *
   */
  describe('When options are defined with headerand without query params', function(){
    var pluginOptions = {
      white_list: {
        'com': {
          'en-US': { domain: 'com', culture: 'en-US' }, // User can specify any object for this.
          'fr-CA': { domain: 'com', culture: 'fr-CA' }, // User can specify any object for this.
          'default': 'en-US'
        },
        'commx': {
          'en-US': { domain: 'commx', culture: 'en-US' }, // User can specify any object for this.
          'es-MX': { domain: 'commx', culture: 'es-MX' }, // User can specify any object for this.
          default: 'es-MX'
        }
      },
      default: 'com'
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
      expect(req.pre.domainCulture).to.be.eql('en-US');
      console.log(req.pre);
    });
  });
});

