const _ = require('lodash');
const request = require('request-promise');

class Dressing {

	constructor(functions) {
		this.functions = functions;
		this.config = functions.config().elasticsearch;
	}

	put(type, properties) {
		if (!type) {
			console.log("[Dressing] *** error: 'type' is not defined.");
			return
		}

		const ignore = properties || [];
		const path = `/{version}/${type}/{id}/`;

		return this.functions.database.ref(path)
		.onWrite(event => {
			const version		= event.params.version;
			const id				= event.params.id;
			var data				= event.data.val();

			if (data._createdAt) {
				data._createdAt = data._createdAt / 1000;
			}

			if (data._updatedAt) {
				data._updatedAt = data._updatedAt / 1000;
			}

			console.log(`${version}/${type}/${id}`, data);

			// Set id to conform to the Client's Decodable protocol
			data.id = id;

			let url = this.config.url + `${version}/${type}/${id}`;
			let method = data ? 'POST' : 'DELETE';

			let elasticsearchRequest = {
				method: method,
				uri: url,
				auth: {
					username: this.config.username,
					password: this.config.password,
				},
				body: _.omit(data, ignore),
				json: true
			};

			return request(elasticsearchRequest).then(response => {
				console.log('Elasticsearch response', response);
			})
		});
	}

	proxy(methods) {
		const _methods = methods || ['GET', 'POST'];
		return this.functions.https.onRequest((req, res) => {
			const method = req.method;
			const type = req.url.slice(1);

			console.log(req.url);
			console.log("Proxy method: ", method, _methods);
			console.log(type);
			// In the case of a prohibited request, an error is returned
			// if (!_methods.includes(method)) {
			// 	return res.status(403).send("This request method is restricted.")
			// }

			const uri = this.config.url + type + '_search';
			console.log(uri);
			let elasticsearchRequest = {
				method: method,
				uri: uri,
				auth: {
					username: this.config.username,
					password: this.config.password,
				},
				body: req.body,
				json: true
			};

			return request(elasticsearchRequest).then(response => {
				return res.status(200).send(response);
			})
		});
	}
}

module.exports = Dressing;
