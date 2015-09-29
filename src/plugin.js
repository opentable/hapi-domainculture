'use strict';
exports.register = function(plugin, options, next){
  if (!options ||
      !options.white_list ||
      !options.default ||
      !options.white_list[options.default]
     ){
    return next(new Error('Missing options'));
  }
  var DEFAULT_QUERY_PARAM_DOMAIN = (options.query_params && options.query_params.domain) ?
    options.query_params.domain.toString().toLowerCase() :
    'domain';
  var DEFAULT_QUERY_PARAM_CULTURE = (options.query_params && options.query_params.culture) ?
    options.query_params.culture.toString().toLowerCase() :
    'culture';
  var IGNORE_QUERY_PARAMS = !!(options.query_params && options.query_params.ignore);
  var DEFAULT_HEADER_DOMAIN = (options.headers && options.headers.domain)
    ? options.headers.domain.toString().toLowerCase() :
      'domain';
  var DEFAULT_HEADER_CULTURE = (options.headers && options.headers.culture) ?
    options.headers.culture.toString().toLowerCase() :
    'accept-language';

  var fetchDomainCulture = function(args){
    if (options.white_list[args.domain]) {
      if (options.white_list[args.domain][args.culture]) {
        return options.white_list[args.domain][args.culture];
      }
      return options.white_list[args.domain][options.white_list[args.domain].default];
    }

    return options.white_list[options.default];
  };

  plugin.ext('onRequest', function(request, reply) {
    var domainCulture;
    if (request.query[DEFAULT_QUERY_PARAM_DOMAIN] &&
        request.query[DEFAULT_QUERY_PARAM_CULTURE] &&
        !IGNORE_QUERY_PARAMS)
    {
      domainCulture = fetchDomainCulture({
        domain : request.query[DEFAULT_QUERY_PARAM_DOMAIN],
        culture: request.query[DEFAULT_QUERY_PARAM_CULTURE]
      });
    } else if (request.raw.req.headers[DEFAULT_HEADER_CULTURE] &&
             request.raw.req.headers[DEFAULT_HEADER_DOMAIN]){
      domainCulture = fetchDomainCulture({
        domain: request.raw.req.headers[DEFAULT_HEADER_DOMAIN],
        culture: request.raw.req.headers[DEFAULT_HEADER_CULTURE]
      });
    } else {
      var defaultDomain = options.white_list[options.default];
      domainCulture = defaultDomain[defaultDomain.default];
    }

    request.app = request.app || {};
    request.app.domainCulture = domainCulture;
    reply.continue();
  });

  next();
};
