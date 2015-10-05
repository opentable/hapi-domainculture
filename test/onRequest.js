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
   * options are defined (without default header name or query params)
   *
   */
  describe('When options are defined with header and without query params, { domain: com, accept-language: en-US }', function(){
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
      query: {},
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
        req: { headers: { 'accept-language': 'en-US', 'domain': 'com' } }
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
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
      expect(req.app.domainCulture).to.have.property('domain', 'com');
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });
  });

  /*
   *
   * When only domain is passed in query_params,
   * Should use domain from query_params and with the default culture
   *
   */
  describe('When only domain is being passed in the query params', function(){
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
      query_params: {
        domain: 'domainquery'
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
      query: {
        domainquery: 'commx'
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
        req: { headers: {  } }
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

    it('should set request.pre.domainCulture according to query params', function(){
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
      expect(req.app.domainCulture).to.have.property('domain', 'commx');
      expect(req.app.domainCulture).to.have.property('culture', 'es-MX');
    });
    it('Shoud NOT use the header', function() {
      expect(req.app.domainCulture).to.not.have.property('domain', 'com');
    });
  });


  /*
   *
   * options are query_params, headers,
   * Should use query_params over headers
   *
   */
  describe('When all options are defined headers and query params', function(){
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
      query_params: {
        culture: 'culturequery',
        domain: 'domainquery'
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
      query: {
        culturequery: 'en-US',
        domainquery: 'commx'
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
        req: { headers: { 'accept-language': 'en-US', 'domain': 'com' } }
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

    it('should set request.pre.domainCulture according to query params', function(){
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
      expect(req.app.domainCulture).to.have.property('domain', 'commx');
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });
    it('Shoud NOT use the header', function() {
      expect(req.app.domainCulture).to.not.have.property('domain', 'com');
    });
  });

  /*
   *
   * options are query_params, headers,
   * Should use query_params over headers
   * BUT! query_params.ignore is eql true
   */
  describe('When all options are defined headers and query params, BUT query_params.ignore is true', function(){
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
      query_params: {
        culture: 'culturequery',
        domain: 'domainquery',
        ignore: true
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
      query: {
        culturequery: 'en-US',
        domainquery: 'commx'
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
        req: { headers: { 'accept-language': 'fr-CA', 'domain': 'com' } }
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

    it('should set request.pre.domainCulture according to query params', function(){
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
      expect(req.app.domainCulture).to.have.property('domain', 'com');
      expect(req.app.domainCulture).to.have.property('culture', 'fr-CA');
    });
    it('Shoud NOT use the query params', function() {
      expect(req.app.domainCulture).to.not.have.property('domain', 'commx');
    });
  });

  /*
   *
   * query_params will be defined but we wont pass them req.query = {}
   * NO headers
   * Should use default domain and default culture
   *
   */
  describe('When NO query params and headers are being passed should use default', function(){
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
      query_params: {
        culture: 'culturequery',
        domain: 'domainquery',
        ignore: true
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
      query: {},
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
        req: {
          headers: {}
        }
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

    it('should set request.pre.domainCulture to default', function(){
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
      expect(req.app.domainCulture).to.have.property('domain', 'com');
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });
  });

  /*
   *
   * req.query.culture is invalid
   * Should use default domain culture
   *
   */
  describe('When query params culture is invalid', function(){
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
      query: {
        domain: 'commx',
        culture: 'klingon-MX'
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
        req: {
          headers: {}
        }
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

    it('should set request.pre.domainCulture commx/es-MX', function(){
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
      expect(req.app.domainCulture).to.have.property('domain', 'commx');
      expect(req.app.domainCulture).to.have.property('culture', 'es-MX');
    });
  });

  /*
   *
   * req.query.domain is invalid
   * Should use default domain
   *
   */
  describe('When query params domain is invalid', function(){
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
      query: {
        domain: 'foobar',
        culture: 'en-US'
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
        req: {
          headers: {}
        }
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

    it('should set request.pre.domainCulture com', function(){
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
      expect(req.app.domainCulture).to.have.property('domain', 'com');
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });
  });

  /*
   *
   * req.query.domain is uppercase
   * Should use domain and culture passed in query
   *
   */
  describe('When query params domain is uppercase COMMX', function(){
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
      query: {
        domain: 'COMMX',
        culture: 'en-US'
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
        req: {
          headers: {}
        }
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

    it('should set request.pre.domainCulture commx', function(){
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
      expect(req.app.domainCulture).to.have.property('domain', 'commx');
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });
  });
});

