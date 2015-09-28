# hapi-versioning
-----------------

##Version handling for Hapi.js

###WHY?
We want to keep our API clean being able to call /users or /users/2/follow/1 without adding version number
/api/v1/users and api/v2/users

with this Hapi.plugin you can just pass the pattern and header 
```javascript
{
    register: require('hapi-versioning'),
    options: {
        pattern: /^(v[1-9])$/,
        header: 'ourversion'
    }
},

```
That will check the header (only if its not set in the url) on evevry request and will redirect to thr right path.

for ex'
```javascript 
{
    register: require('hapi-versioning'),
    options: {} //set to default header.version = v1
},


header: { version: v1 }
url: /hello/world
//Will redirect to: url: /v1/hello/world

```

** url will override the header all the time

Checkout the test for more examples
