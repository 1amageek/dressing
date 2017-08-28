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
		const _methods = methods || ['GET'];
		return this.functions.https.onRequest((req, res)) => {
			const method = req.method;

			// In the case of a prohibited request, an error is returned
			if (_methods.indexOf(method) == -1) {
				return res.status(403).send("This request method is restricted.")
			}

			let elasticsearchRequest = {
				method: method,
				uri: this.config.url,
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
