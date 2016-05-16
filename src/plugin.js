'use strict';

const _ = require('lodash');
const acceptLanguage = require('accept-language');

exports.register = function register(plugin, options, next) {
  if (!options) { return next(new Error('options param missing')); }
  if (!options.white_list) { return next(new Error('options.white_list param missing')); }
  if (!options.default) { return next(new Error('options.default param missing')); }

  _.forEach(options.white_list, value => {
    _.pullAll(value.cultures, [value.default]); // mutate array, removing default
    value.cultures.unshift(value.default); // add default to front of array
  });

  const DEFAULT_DOMAIN_SETTINGS = _.get(options, ['white_list', options.default]);
  if (!DEFAULT_DOMAIN_SETTINGS) { return next(new Error('The default for the white list is invalid')); }

  const DEFAULT_CULTURE = DEFAULT_DOMAIN_SETTINGS.default;
  const QUERY_PARAM_DOMAIN = _.get(options, 'query_params.domain', 'domain');
  const QUERY_PARAM_CULTURE = _.get(options, 'query_params.culture', 'culture');
  const IGNORE_QUERY_PARAMS = _.get(options, 'query_params.ignore', false);
  const HEADER_DOMAIN = _.get(options, 'headers.domain', 'domain').toLowerCase();
  const HEADER_CULTURE = _.get(options, 'headers.culture', 'accept-language').toLowerCase();

  function fetchDomainCulture(args) {
    const culture = _.get(args, 'culture', '');
    const domain = _.get(args, 'domain', '').toLowerCase();
    const domainInWhiteList = _.get(options.white_list, domain, false);

    if (domainInWhiteList) {
      const culturesSupportedByDomain = _.get(options.white_list, [domain, 'cultures'], []);

      if (!_.isEmpty(culturesSupportedByDomain)) {
        acceptLanguage.languages(culturesSupportedByDomain);
        const selectedCulture = acceptLanguage.get(culture);
        const defaultCulture = _.get(domainInWhiteList, 'default');

        return {domain, culture: selectedCulture || defaultCulture };
      }
    }

    return {domain: options.default, culture: DEFAULT_CULTURE};
  }

  plugin.ext('onRequest', function onRequest(request, reply) {
    let domainCulture;

    const domainFromQuery = _.get(request, ['query', QUERY_PARAM_DOMAIN], false);
    const cultureFromQuery = _.get(request, ['query', QUERY_PARAM_CULTURE], '');
    const domainFromHeader = _.get(request, ['raw', 'req', 'headers', HEADER_DOMAIN], false);
    const cultureFromHeader = _.get(request, ['raw', 'req', 'headers', HEADER_CULTURE], false);

    if (domainFromQuery && !IGNORE_QUERY_PARAMS) {
      domainCulture = fetchDomainCulture({domain: domainFromQuery, culture: cultureFromQuery });
    } else if (domainFromHeader && cultureFromHeader) {
      domainCulture = fetchDomainCulture({domain: domainFromHeader, culture: cultureFromHeader });
    } else {
      domainCulture = {domain: options.default, culture: DEFAULT_CULTURE};
    }

    _.set(request, 'app.domainCulture', domainCulture);
    reply.continue();
  });

  next();
};
