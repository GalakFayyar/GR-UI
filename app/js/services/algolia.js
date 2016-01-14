(function() {
	'use strict';

	angular.module('geoRequetesApp').factory('algoliaFactory', algoliaFactory);

	function algoliaFactory($q, geoRequetesConfig) {
		var factory = {
				data: {
					error: "",
					algolia: geoRequetesConfig.algolia,
					nbSuggestionsAffichees: geoRequetesConfig.algolia.nbSuggestionsAffichees
				}
			};

		factory.initIndexQuiQuoi = function () {
			var clientQuiQuoi = algoliasearch(factory.data.algolia.algoliaClientAppId, factory.data.algolia.algoliaClientKey);
			factory.data.indexQuiQuoi = clientQuiQuoi.initIndex(factory.data.algolia.indexQuiQuois);
		};
		factory.initIndexRubriques=function () {
			var clientRubriques = algoliasearch(factory.data.algolia.algoliaClientAppId, factory.data.algolia.algoliaClientKey);
			factory.data.indexRubrique = clientRubriques.initIndex(factory.data.algolia.indexRubriques);
		};
		factory.initIndexOu = function () {
			var clientOu = algoliasearch(factory.data.algolia.algoliaClientAppId, factory.data.algolia.algoliaClientKey);
			factory.data.indexOu = clientOu.initIndex(factory.data.algolia.indexOus);
		};
		factory.setError = function (error) {
			factory.data.error = error;
		};
		factory.getQuiQuois = function (typed_element, callback){
			if(typeof(factory.data.indexQuiQuoi) == "undefined") {
				factory.initIndexQuiQuoi();
			}
			factory.data.indexQuiQuoi.search(typed_element, callback);
		};
		factory.getRubriques = function (typed_element, callback){
			if(typeof(factory.data.indexRubrique) == "undefined") {
				factory.initIndexRubriques();
			}
			factory.data.indexRubrique.search(typed_element, callback);
		};
		factory.getOus = function (ou, callback){
			if(typeof(indexOu) == "undefined") {
				factory.initIndexOu();
			}
			factory.data.indexOu.search(ou, {
				"getRankingInfo": 1,
				"facets": "*",
				"attributesToRetrieve": "*",
				"highlightPreTag": "<em>",
				"highlightPostTag": "</em>",
				"hitsPerPage": 10,
				"facetFilters": [["_geoType:Localite","_geoType:Arrondissement"]],
				"maxValuesPerFacet": 10
			}, callback);
		}
		return factory;
	};
})();