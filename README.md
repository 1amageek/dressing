# Dressing
Dressing provides the functionality of CloudFunctions to connect Firebase and ElasticSearch. You need to use Salada for clients.

# Installation

`$ npm install dressing`

# Usage

To set the needed firebase config variables we use the Firebase CLI functions:config:set command:

`$ firebase functions:config:set elasticsearch.username="user" elasticsearch.password="your_password" elasticsearch.url="http://0.0.0.0/elasticsearch/"`


``` index.js
const functions = require('firebase-functions');
const Dressing = require('dressing');
const dressing = new Dressing(functions);

/**
 Elasticsearch
*/

// PUT a user class to ElasticSearch 
exports.indexUserToElastic = dressing.put('user')
```

# Reference

- [Salada](https://github.com/1amageek/Salada) Firebase model framework.
- [Tong](https://github.com/1amageek/Tong) Tong is library for using ElasticSearch with Swift.
- [dressing](https://github.com/1amageek/dressing) Dressing provides the functionality of CloudFunctions to connect Firebase and ElasticSearch.
