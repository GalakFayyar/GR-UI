(function() {
	'use strict'

	angular.module('geoRequetesApp',[
		"ngSanitize",
		"ui.select",
		"ngProgress",
		"ngResource",
		"ui.bootstrap",
		"ui.grid",
		"ui.grid.resizeColumns",
		"ui.grid.autoResize",
		"ui.grid.pagination",
		"ui.grid.selection",
		"ui.grid.exporter",
		"elasticsearch",
		"toggle-switch"
		]).constant('geoRequetesConfig', {
			"version": "0.0.1",
			"elasticsearch": {
				"host": "http://exalead1t.bbo1t.local:10200/",
				"index": "georequetes_dev"
			},
			"algolia": {
				"algoliaClientAppId": "7TM6BC4HX4",
				"algoliaClientKey": "2b8d141963b0b2d12b7a67b79853900b",
				"indexRubriques": "INT_Rubriques",
				"indexQuiQuois": "INT_QuiQuoiPub",
				"indexOus": "INT_OuPub",
				"nbSuggestionsAffichees": 50
			}
		}
	);
})();