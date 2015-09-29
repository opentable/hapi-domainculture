# hapi-domainculture
-----------------

##Domain Culture for Hapi.js

###WHY?
We need to be able to support multi domain and languages

###How?
```javascript
{
    register: require('hapi-domainculture'),
    options: {
      default_domain_culture: 'en-US', // String
      white_list: ['en-US','es-MX','es-US'], // Array
      language_header: '' //String(Optinal) default will use accept-language
    }
},

```
options.white_list = {
  'com': {
    'en-US': { domain: 'com', culture: 'en-US' } // User can specify any object for this.
    'fr-CA': { domain: 'com', culture: 'fr-CA' } // User can specify any object for this.

  },
  'commx': {
    'en-US': { domain: 'commx', culture: 'en-US' } // User can specify any object for this.
    'es-MX': { domain: 'commx', culture: 'es-MX' } // User can specify any object for this.
    default: 'es-MX';
  }
}
options.default = { domain: 'com' };
options.query_params =  { domain: 'domain', culture: 'culture' };
options.headers = { domain: 'domain', culture: 'culture' };


Checkout the test for more examples
