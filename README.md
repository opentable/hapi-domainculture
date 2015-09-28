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

Checkout the test for more examples
