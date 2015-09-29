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
    white_list: {
      'com': {
        'en-US': { domain: 'com', culture: 'en-US' },
         'fr-CA': { domain: 'com', culture: 'fr-CA' },
         'default': 'en-US'
      },
      'commx': {
        'en-US': { domain: 'commx', culture: 'en-US' },
        'es-MX': { domain: 'commx', culture: 'es-MX' },
        default: 'es-MX'
       }
    }, // white_list is required
    query_params: {
      culture: 'culturequery', // defaults to "culture"
      domain: 'domainquery', // defaults to "domain"
      ignore: true // If ignore is true, no queryparams will be checked
    },
    headers: {
      domain: 'domain', // optional, defaults to "domain"
      culture: 'culture' // optional, defaults to "Accept-Language"
    },
    default: 'com' // Default domain to use
  }
}

```


Checkout the test for more examples
