const functions = require('firebase-functions');
const _ = require('lodash');
const request = require('request-promise');

const dressing = {
	put: (type, properties) => {
		if (!type) {
			console.log("[Dressing] *** error: 'type' is not defined.");
			return
		}

		const ignore = properties || [];
		const path = `/{version}/${type}/{id}/`;

		return functions.database.ref(path)
		.onWrite(event => {
			const version		= event.params.version;
			const id				= event.params.id;
			const data 			= event.data.val();

			console.log(`${version}/${type}/${id}`, data);

			let elasticSearchConfig = functions.config().elasticsearch;
			let elasticSearchUrl = elasticSearchConfig.url + `${version}/${type}/${id}`;
			let elasticSearchMethod = data ? 'POST' : 'DELETE';

			let elasticsearchRequest = {
				method: elasticSearchMethod,
				uri: elasticSearchUrl,
				auth: {
					username: elasticSearchConfig.username,
					password: elasticSearchConfig.password,
				},
				body: _.omit(data, ignore),
				json: true
			};

			return request(elasticsearchRequest).then(response => {
				console.log('Elasticsearch response', response);
			})
		});
	}
}

module.exports = dressing;
