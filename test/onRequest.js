'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const expect = require('expect.js');
const rewire = require('rewire');
const plugin = rewire('../src/plugin.js');
const pkg = require('../package.json');

const WHITE_LIST = {
  com: {
    cultures: ['en-AU', 'en-GB', 'en-IE', 'en-US', 'es-MX', 'fr-CA'],
    default: 'en-US'
  },
  commx: {
    cultures: ['es-MX', 'en-US'],
    default: 'es-MX'
  }
};

const ROUTE_SETTINGS = {
  settings: {
    plugins: {
      'hapi-domainculture': {
        version: pkg.version
      }
    }
  }
};

const BASE_REQUEST = {
  info: { received: new Date() },
  method: 'get',
  response: { statusCode: 200 },
  route: ROUTE_SETTINGS
};

describe('Plugin Domain Culture', function() {
  describe('with undefined options', function() {
    let pluginOptions = {};
    let req = _.defaultsDeep({headers: {'accept-language': 'en-US'}}, BASE_REQUEST);

    let nextCalled = false;
    let nextError = null;

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function(error) {
        nextCalled = true;
        nextError = error;
        done();
      });
    });

    it('response should be undefined', function() {
      expect(nextCalled).to.be.true;
    });
    it('Should call next with an error', function() {
      expect(nextError).to.be.an.object;
      expect(nextError.message).to.equal('options.white_list param missing');
      expect(nextError).to.not.be.null;
    });
  });

  // options are defined (without default header name or query params)
  describe('headers set, query params are not', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      default: 'com'
    };
    let req = _.defaultsDeep({
      query: {},
      raw: {
        req: {
          headers: {
            'accept-language': 'en-US, en, fr, *',
            'domain': 'com'
          }
        }
      }
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets request.pre.domainCulture', function() {
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
    });

    it('sets the domain from the headers', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'com');
    });

    it('sets the culture from the headers', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'en');
    });

    it('sets the acceptLanguage field from the headers', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'en-US, en, fr, *');
    });
  });

  /*
   * options are defined (without default header name or query params)
   */
  describe('headers set, where accept-language contains a list of languages', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      default: 'com'
    };
    let req = _.defaultsDeep({
      query: {},
      raw: {
        req: {
          headers: {
            'accept-language': 'da, fr-CA;q=0.8, en;q=0.7',
            'domain': 'com'
          }
        }
      }
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets request.pre.domainCulture', function() {
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
    });

    it('sets the domain from the headers', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'com');
    });

    it('sets the culture from the headers', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'fr-CA');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'fr');
    });

    it('sets the acceptLanguage field from the headers', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'da, fr-CA;q=0.8, en;q=0.7');
    });
  });

  /*
   * When only domain is passed in query_params,
   * Should use domain from query_params and with the default culture
   */
  describe('query params with domain set', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      query_params: {
        domain: 'domainquery'
      },
      default: 'com'
    };
    let req = _.defaultsDeep({
      query: {
        domainquery: 'commx'
      },
      raw: {
        req: { headers: {  } }
      }
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets request.pre.domainCulture', function() {
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
    });

    it('sets the domain from the query', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'commx');
    });

    it('sets the culture from the default values for that domain', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'es-MX');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'es');
    });

    it('sets the acceptLanguage field from the culture', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'es-MX, es, *');
    });
  });

  /*
   *
   * options are query_params, headers,
   * Should use query_params over headers
   *
   */
  describe('headers, query params set', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      query_params: {
        culture: 'culturequery',
        domain: 'domainquery'
      },
      default: 'com'
    };

    let req = _.defaultsDeep({
      query: {
        culturequery: 'en-US',
        domainquery: 'commx'
      },
      raw: {
        req: { headers: { 'accept-language': 'en-US', 'domain': 'com' } }
      }
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets request.pre.domainCulture', function() {
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
    });

    it('sets the domain from the query', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'commx');
    });

    it('sets the culture from the query', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'en');
    });

    it('sets the acceptLanguage field from the header', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'en-US');
    });
  });

  /*
   *
   * options are query_params, headers,
   * Should use query_params over headers
   * BUT! query_params.ignore is eql true
   */
  describe('headers, query params set, BUT query_params.ignore is true', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      query_params: {
        culture: 'culturequery',
        domain: 'domainquery',
        ignore: true
      },
      default: 'com'
    };

    let req = _.defaultsDeep({
      query: {
        culturequery: 'en-US',
        domainquery: 'commx'
      },
      raw: {
        req: { headers: { 'accept-language': 'fr-CA', 'domain': 'com' } }
      }
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets request.pre.domainCulture', function() {
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
    });

    it('sets the domain from the headers', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'com');
    });

    it('sets the culture from the headers', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'fr-CA');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'fr');
    });

    it('sets the acceptLanguage field from the header', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'fr-CA');
    });
  });

  /*
   *
   * query_params will be defined but we wont pass them req.query = {}
   * NO headers
   * Should use default domain and default culture
   *
   */
  describe('Neither query params or headers set', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      query_params: {
        culture: 'culturequery',
        domain: 'domainquery',
        ignore: true
      },
      default: 'com'
    };
    let req = _.defaultsDeep({
      query: {},
      raw: {req: {headers: {}}}
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets the domain from the defaults', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'com');
    });

    it('sets the culture from the defaults', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'en');
    });

    it('sets the acceptLanguage field from the culture', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'en-US, en, *');
    });
  });

  /*
   *
   * req.query.culture is invalid
   * Should use default domain culture
   *
   */
  describe('When query params culture is invalid', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      default: 'com'
    };
    let req = _.defaultsDeep({
      query: {
        domain: 'commx',
        culture: 'klingon-MX'
      },
      raw: {req: {headers: {}}}
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets the domain from the query', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'commx');
    });

    it('sets the culture from the defaults for that domain', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'es-MX');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'es');
    });

    it('sets the acceptLanguage field from the culture', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'es-MX, es, *');
    });
  });

  /*
   *
   * req.query.domain is invalid
   * Should use default domain
   *
   */
  describe('When query params domain is invalid', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      default: 'com'
    };
    let req = _.defaultsDeep({
      query: {
        domain: 'foobar',
        culture: 'en-US'
      },
      raw: {req: {headers: {}}}
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets request.pre.domainCulture', function() {
      expect(req).to.be.object;
      expect(req.app).to.not.be.null;
      expect(req.app.domainCulture).to.be.an('object');
    });

    it('sets the domain from the defaults', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'com');
    });

    it('sets the culture from the query', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'en');
    });

    it('sets the acceptLanguage field from the culture', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'en-US, en, *');
    });
  });

  /*
   *
   * req.query.domain is uppercase
   * Should use domain and culture passed in query
   *
   */
  describe('When query params domain is uppercase COMMX', function() {
    let pluginOptions = {
      white_list: WHITE_LIST,
      default: 'com'
    };
    let req = _.defaultsDeep({
      query: {
        domain: 'COMMX',
        culture: 'en-US'
      },
      raw: {req: {headers: {}}}
    }, BASE_REQUEST);

    before(function(done) {
      plugin.register({
        ext: function(x, handler) {
          handler(req, {
            continue: function() {
              done();
            }
          });
        }
      }, pluginOptions, function() {});
    });

    it('sets the domain from the query', () => {
      expect(req.app.domainCulture).to.have.property('domain', 'commx');
    });

    it('sets the culture from the query', () => {
      expect(req.app.domainCulture).to.have.property('culture', 'en-US');
    });

    it('sets the langauge from the culture', () => {
      expect(req.app.domainCulture).to.have.property('language', 'en');
    });

    it('sets the acceptLanguage field from the culture', () => {
      expect(req.app.domainCulture).to.have.property('acceptLanguage', 'en-US, en, *');
    });
  });
});

