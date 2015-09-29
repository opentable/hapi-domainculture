'use strict';
exports.register = function(plugin, options, next){

  var DEFAULT_QUERY_PARAM_DOMAIN = options.query_params.domain.toString().toLowerCase() || 'domain';
  var DEFAULT_QUERY_PARAM_CULTURE = options.query_params.culture.toString().toLowerCase() || 'culture';

  var DEFAULT_HEADER_DOMAIN = options.headers.domain.toString().toLowerCase() ||  'domain';
  var DEFAULT_HEADER_CULTURE = options.headers.culture.toString().toLowerCase() || 'accept-langauge';

  var fetchDomainCulture = function(args){
    if (options.white_list[args.domain]) {
      if (options.white_list[args.domain][args.culture]) {
        return options.white_list[args.domain][args.culture];
      }
      return options.white_list[args.domain][options.white_list[args.domain].default];
    }

    return options.white_list[options.default.domain];
  };

  plugin.ext('onRequest', function(request, reply) {
    if (!options ||
        !options.white_list ||
        !options.default ||
        !options.default.domain ||
        !options.white_list[options.default.domain]
    ){
      return reply.continue();
    }
    var domainCulture;
    if (request.query[DEFAULT_QUERY_PARAM_DOMAIN] &&
        request.query[DEFAULT_QUERY_PARAM_CULTURE])
    {
      domainCulture = fetchDomainCulture({
        domain : request.query[DEFAULT_QUERY_PARAM_DOMAIN],
        culture: request.query[DEFAULT_QUERY_PARAM_CULTURE]
      });
    }
    else if (request.raw.req.headers[DEFAULT_HEADER_CULTURE] &&
             request.raw.req.headers[DEFAULT_HEADER_DOMAIN]){
      domainCulture = fetchDomainCulture({
        domain: request.raw.req.headers[DEFAULT_HEADER_DOMAIN],
        culture: request.raw.req.headers[DEFAULT_HEADER_CULTURE]
      });
    } else {
      domainCulture = {
        domain: 'com',
        culture: 'en-US'
      };
    }

    request.app = request.app || {};
    request.app.domainCulture = domainCulture;
    reply.continue();
  });

  next();
};
