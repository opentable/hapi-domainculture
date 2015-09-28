'use strict';

exports.register = function(plugin, options, next){
  var DEFAULT_HEADER_KEY = 'accept-language' || options.language_header.toString().toLowerCase();
  var fetchDomainCulture = function(lang){
    if (options.white_list.indexOf(lang) !== -1){
      return lang;
    }
    return options.default_domain_culture;
  };

  plugin.ext('onRequest', function(request, reply) {
    if (!options ||
        !options.white_list ||
        !options.default_domain_culture ||
        !options.white_list[options.default_domain_culture]
    ){
      return reply.continue();
    }
    request.pre = request.pre || {};
    request.pre.domainCulture = fetchDomainCulture(request.raw.req.headers['accept-language'] || '');
    reply.continue();
  });

  next();
};
