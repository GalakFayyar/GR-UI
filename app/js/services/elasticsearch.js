(function() {
	'use strict';

	/* Elasticsearch Service */
	angular.module('geoRequetesApp').service('es', es);
	angular.module('geoRequetesApp').factory('elasticService', elasticService);

	function es(esFactory, geoRequetesConfig) {
		return esFactory({ 
			host: geoRequetesConfig.elasticsearch.host
			//index: geoRequetesConfig.elasticsearch.index
		});
	};

	function elasticService(es, geoRequetesConfig) {
		// Données Elasticsearch
		var size_limit = 50,
			request_limit = 1000,
			communes_type_doc = "communes",
			regions_doc_type = "regions",
			departements_doc_type = "departements",
			data_requetes_doc_type = "syn_es_data_geo";

		var format_es_hits = function (response) {
				var data_item_list = {
					data: []
				};
				if (response.hits) {
					response.hits.hits.forEach(function (res) {
						res._source._id = res._id;
						data_item_list.data.push(res._source);
					});
				}

				return data_item_list;
			},
			format_es_mget = function (response) {
				var data_item_list = [];
				response.docs.forEach(function (doc) {
					var data_item = {};
					if (doc.found) {
						data_item = doc._source;
					}
					data_item_list.push(data_item);
				});

				return {'data': data_item_list};
			};

		return {
			/* Communes */
			get_bounded_communes : function (map_bounds, callback) {
				var body_query = {
					"filter": {
						"geo_shape": {
							"geometry": {
								"shape": {
									"type": "envelope",
									"coordinates": [
										[map_bounds.top_right.lng, map_bounds.top_right.lat], 
										[map_bounds.bottom_left.lng, map_bounds.bottom_left.lat]
									]
								}
							}
						}
					}
				};
				es.search({
					index: geoRequetesConfig.elasticsearch.index,
					size: 5000,
					type: communes_type_doc,
					body: body_query
				}).then(function (response) {
					var data = format_es_hits(response);
					callback(data);
				});
			},
			get_infos_commune : function (code, callback) {
				es.get({
					index: geoRequetesConfig.elasticsearch.index,
					id: code,
					type: communes_type_doc
				}).then(function (response) {
					var data = response._source
					callback(data);
				});
			},
			/* Infos Requete */
			get_requetes_region : function (libelle, callback) {
				var body_query = {
					"aggs": {
						"regions_on_qq": {
							"filter": {
								"term": { "quiquoiSimple": libelle }
							},
							"aggs": {
								"regions": {
									"terms": { "field": "idregion", "size": 500 }
								}
							}
						}
					}
				};
				es.search({
					index: 'syn_es_data_geo',
					size: 10,
					//type: data_requetes_doc_type,
					body: body_query
				},function (error, response) {
					if (error) {
						console.log('error:', error);
					} else {
						callback(response);
					}
				});
			},
			get_requetes_departement : function (libelle, callback) {
				var body_query = {
					"aggs": {
						"departements_on_qq": {
							"filter": {
								"term": { "quiquoiSimple": libelle }
							},
							"aggs": {
								"departements": {
									"terms": { "field": "iddept", "size": 500 }
								}
							}
						}
					}
				};
				es.search({
					index: 'syn_es_data_geo',
					size: 10,
					//type: data_requetes_doc_type,
					body: body_query
				},function (error, response) {
					if (error) {
						console.log('error:', error);
					} else {
						console.log('response:', response);
						callback(response);
					}
				});
			},
			get_requetes_communes : function (communes_tab, libelle, callback) {
				var body_query = {
						"aggs": {
							"communes_on_qq": {
								"filter": {
									"bool": {
										"must": [
											{"term": { "quiquoiSimple": libelle }},
											{"terms": { "idlocalite": communes_tab }}
										]
									}
								},
								"aggs": {
									"communes": {
										"terms": { "field": "idlocalite", "size": 5000 }
									}
								}
							}
						}
					};
				es.search({
					index: 'syn_es_data_geo',
					size: 10,
					//type: data_requetes_doc_type,
					body: body_query
				},function (error, response) {
					if (error) {
						console.log('error:', error);
					} else {
						console.log('response:', response);
						callback(response);
					}
				});
			},
			get_bounded_data_requete : function (libelle, boundaries, callback) {
				var body_query = {
					"query": {
						"filtered": {
							"query": {
								"query_string": {
									"query": "*" + libelle.replace(" ", "\\ ") + "*",
									"fields": ["quiquoiSimple", "quiquois.key"]
								}
							},
							"filter": {
								"and" : {
									"filters": [
										{"terms": { "idregion": boundaries.regions }}
									]
								}
							}
						}
					}
				};
				if (boundaries.departement) {
					body_query.query.filtered.filter.and.filters.push(
						{"terms": { "iddept": boundaries.departements }}
					);
				}
				if (boundaries.localites) {
					body_query.query.filtered.filter.and.filters.push(
						{"terms": { "idlocalite": boundaries.localites }}
					);
				}
				es.search({
					index: geoRequetesConfig.elasticsearch.index,
					size: 5000,
					type: data_requetes_doc_type,
					body: body_query
				}).then(function (response) {
					var data = format_es_hits(response);
					callback(data);
				});
			},
			/* Regions */
			get_all_regions : function (callback) {
				es.search({
					index: geoRequetesConfig.elasticsearch.index,
					size: 5000,
					type: regions_doc_type
				}).then(function (response) {
					var data = format_es_hits(response);
					callback(data);
				});
			},
			/* Départements */
			get_all_departements : function (callback) {
				es.search({
					index: geoRequetesConfig.elasticsearch.index,
					size: 5000,
					type: departements_doc_type
				}).then(function (response) {
					var data = format_es_hits(response);
					callback(data);
				});
			}
		};
	};
})();