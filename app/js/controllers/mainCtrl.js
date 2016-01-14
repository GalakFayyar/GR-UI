(function() {
    'use strict'

    angular.module('geoRequetesApp').controller('MainCtrl', MainCtrl);
    angular.module('geoRequetesApp').controller('ModalHelpCtrl', ModalHelpCtrl);

    function MainCtrl($scope, $filter, $timeout, $compile, $modal, ngProgress, uiGridConstants, uiGridExporterConstants, elasticService, algoliaFactory, geoRequetesConfig) {
        // Définition des variables AngularJS pour l'outil
        $scope.lang = "fr";
        $scope.version = geoRequetesConfig.version;
        $scope.loading = {value: false};
        $scope.communes = {data: undefined, communes_layer: new L.featureGroup()};
        $scope.regions = {data: undefined, regions_layer: new L.featureGroup()};
        $scope.departements = {data: undefined, departements_layer: new L.featureGroup()};
        ngProgress.height('4px');
        ngProgress.color('#FFF');
        var regions_loaded = false,
            departements_loaded = false,
            basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
            }),
            // Méthode de suppression du calque des communes
            clear_layer_communes = function () {
                if ($scope.communes && $scope.communes.communes_layer) {
                    $scope.communes.communes_layer.clearLayers();
                }
            },
            // Méthode de suppression du calque des regions
            clear_layer_regions = function () {
                if ($scope.regions && $scope.regions.regions_layer) {
                    $scope.regions.regions_layer.clearLayers();
                    regions_loaded = false;
                }
            },
            // Méthode de suppression du calque des departements
            clear_layer_departements = function () {
                if ($scope.departements && $scope.departements.departements_layer) {
                    $scope.departements.departements_layer.clearLayers();
                    departements_loaded = false;
                }
            },
            // Procédures de visualisation du chargement
            start_loading = function () {
                ngProgress.start();
                $scope.loading.value = true;
            },
            finish_loading = function () {
                ngProgress.complete();
                $scope.loading.value = false;
            },
            // Méthode de mise à jour des limites de la carte en fonction de l'écran
            refresh_map_boundaries = function () {
                var map_bounds = map.getBounds();
                $scope.map_bounds.top_right = map_bounds.getNorthWest();
                $scope.map_bounds.bottom_left = map_bounds.getSouthEast();
            },
            // Méthodes de chargement des GeoShapes */
            load_bounded_shapes_communes = function (requetes) {
                elasticService.get_bounded_communes($scope.map_bounds, function (communes) {
                    //TODO : Optimiser!
                    var tab_codes_communes = [];

                    communes.data.forEach(function (commune) {
                        tab_codes_communes.push(commune.properties.code_pj);
                    });

                    elasticService.get_requetes_communes(tab_codes_communes, $scope.quiquoi.selected.libelle, function (requetes) {

                        clear_layer_communes();

                        communes.data.forEach(function (commune) {
                            var opt_polyline = {
                                    color: '#777',
                                    fillColor: 'transparent',
                                    fillOpacity: 0
                                };

                            var geo_commune = L.geoJson(commune, {
                                weight: 1,
                                style: opt_polyline,
                                onEachFeature: function (feature, layer) {
                                    if (requetes) {
                                        var requete_found = $filter('filter')(requetes.aggregations.communes_on_qq.communes.buckets, function (d) {return d.key == feature.properties.code_pj;})[0];
                                        if (requete_found) {
                                            var nb_doc = requete_found.doc_count || "<i>inconnu</i>";
                                            layer.bindLabel("Nombre requêtes: " + nb_doc);
                                        }
                                    }
                                },
                                filter: function(feature, layer) {
                                    return true;
                                }
                            });
                            $scope.communes.communes_layer.addLayer(geo_commune);
                        });

                        map.addLayer($scope.communes.communes_layer);

                        finish_loading();
                    });
                });
            },
            load_shapes_regions = function (requetes) {
                elasticService.get_all_regions(function (regions) {
                    clear_layer_regions();

                    regions.data.forEach(function (region) {
                        var opt_polyline = {
                                color: '#777',
                                fillColor: 'green',
                                fillOpacity: 0.3
                            },
                            geo_region = L.geoJson(region, {
                                weight: 2,
                                style: opt_polyline,
                                onEachFeature: function (feature, layer) {
                                    if (requetes) {
                                        var requete_found = $filter('filter')(requetes.aggregations.regions_on_qq.regions.buckets, function (d) {return d.key == feature.properties.code;})[0];
                                        if (requete_found) {
                                            var nb_doc = requete_found.doc_count || "<i>inconnu</i>";
                                            layer.bindLabel("Nombre requêtes: " + nb_doc);
                                        }
                                    }
                                },
                                filter: function(feature, layer) {
                                    return true;
                                }
                            });

                        $scope.regions.regions_layer.addLayer(geo_region);
                    });

                    map.addLayer($scope.regions.regions_layer);
                   
                    finish_loading();
                    regions_loaded = true;
                });
            },
            load_bounded_shapes_departements = function (requetes) {
                elasticService.get_all_departements(function (departements) {
                    clear_layer_departements();

                    departements.data.forEach(function (departement) {
                        var opt_polyline = {
                                color: '#777',
                                fillColor: 'blue',
                                fillOpacity: 0.3
                            };

                        var geo_departement = L.geoJson(departement, {
                            weight: 2,
                            style: opt_polyline,
                            onEachFeature: function (feature, layer) {
                                if (requetes) {
                                    var requete_found = $filter('filter')(requetes.aggregations.departements_on_qq.departements.buckets, function (d) {return d.key == ('0'+feature.properties.code);})[0];
                                    if (requete_found) {
                                        var nb_doc = requete_found.doc_count || "<i>inconnu</i>";
                                        layer.bindLabel("Nombre requêtes: " + nb_doc);
                                    }
                                }
                            },
                            filter: function(feature, layer) {
                                return true;
                            }
                        });
                        $scope.departements.departements_layer.addLayer(geo_departement);
                    });

                    map.addLayer($scope.departements.departements_layer);
                   
                    departements_loaded = true;
                    finish_loading();
                });
            },
            // Méthode de chargement des points
            refreshCommunes = function () {
                start_loading();
                refresh_map_boundaries();
                clear_layer_regions();
                clear_layer_departements();
                load_bounded_shapes_communes();
            },
            refreshDepartements = function () {
                start_loading();
                clear_layer_communes();
                clear_layer_regions();
                elasticService.get_requetes_departement($scope.quiquoi.selected.libelle, function (requetes) {
                    load_bounded_shapes_departements(requetes);
                });
            },
            refreshRegions = function () {
                start_loading();
                clear_layer_communes();
                clear_layer_departements();
                elasticService.get_requetes_region($scope.quiquoi.selected.libelle, function (requetes) {
                    load_shapes_regions(requetes);
                });
            },
            refreshMap = function () {
                if ($scope.quiquoi.selected) {
                    var current_zoom = map.getZoom();
                    //console.log("zoom:", current_zoom, "departements_loaded:", departements_loaded, "regions_loaded:", regions_loaded);
                    if (current_zoom > 10) {
                        refreshCommunes();
                    }
                    if (current_zoom > 8 && current_zoom < 11 && !departements_loaded) {
                        refreshDepartements();
                    }
                    if (current_zoom < 9 && !regions_loaded) {
                        refreshRegions();
                    }
                }
            },
            // Paramétrage et définition de la map Leaflet
            map = new L.Map('map', {
                layers: [basemap],
                center: [48.853, 2.35],
                zoom: 6,
                minZoom: 6,
                maxZoom: 15,
                zoomControl: false,
                maxBounds: [[51.25, -6.15], [41.20, 10.25]]
            });

        L.control.zoom({position: 'topright'}).addTo(map);

        // Définition des limites cartographiques de l'écran (initialisation)
        $scope.map_bounds = {
            'top_right': map.getBounds().getNorthWest(),
            'bottom_left': map.getBounds().getSouthEast()
        };

        // Function de synchronisation (instanciation sidebar après ngInclude)
        $scope.finishLoadingFiltres = function () {
            $scope.sidebarFiltres = L.control.sidebar("sidebarFiltres", {
                closeButton: true,
                position: "left"
            }).addTo(map);

            $scope.switchStatusParution = {
                value: false
            };
        };

        // Function de synchronisation (instanciation sidebar après ngInclude)
        $scope.finishLoadingPanier = function () {
            $scope.sidebarPanier = L.control.sidebar("sidebarPanier", {
                closeButton: true,
                position: "right"
            }).addTo(map);

            $scope.gridOptions = {
                //enableFiltering: true,
                enableRowSelection: true,
                enableGridMenu: false,
                enableHorizontalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
                enableVerticalScrollbar: uiGridConstants.scrollbars.WHEN_NEEDED,
                showColumnFooter: true,
                // showGridFooter: true,
                paginationPageSizes: [25, 50, 100],
                paginationPageSize: 25,
                columnDefs: [
                    { name: 'colonne1', displayName: 'Colonne 1', sort: { priority: 0, direction: 'asc' }, width: '30%'},
                    { name: 'colonne2', displayName: 'Colonne 2', width: '30%'},
                    { name: 'colonne3', displayName: 'Colonne 3', width: '30%', enableFiltering: false, type: 'number'},
                ],
                onRegisterApi: function( gridApi ) {
                    $scope.gridApi = gridApi;
                }
            };
        };

        // Gestion affichage des Filtres
        $scope.toggleSidebarFiltres = function () {
            $scope.sidebarFiltres.toggle();
            return false;
        };
        
        // Gestion affichage du Panier
        $scope.toggleSidebarPanier = function () {
            $scope.sidebarPanier.toggle();
            return false;
        };

        //load_shapes_regions();

        // Gestion de l'ouverture de la popup Aide Utilisateur
        $scope.openPopupHelp = function () {
            var modalInstance = $modal.open(
                {
                    scope: $scope,
                    templateUrl: 'views/modal_help.html',
                    controller: 'ModalHelpCtrl',
                    backdrop: 'static'
                }
            );
        };

        // Mise à jour de la liste des activités suggérées
        $scope.refreshQuiQuois = function (typed_value) {
            algoliaFactory.getQuiQuois(typed_value, function (err, content) {
                var res = [];
                if (err) {
                    console.log(error);
                    return [];
                }
                if(content) {
                    content.hits.forEach(function (hit) {
                        res.push({
                            'libelle': hit.libelle,
                            'code': hit.objectID
                        });
                    });
                }
                $scope.list_quiquois = res
                $scope.$broadcast('SelectFocusQuiQuoi');
            });
        };

        $scope.clear_field = function ($event, element) {
            $event.stopPropagation(); 
            element.selected = undefined;
        };

        $scope.quiquoi = {selected: undefined};
        $scope.selectQuiQuoi = function () {
            refreshMap();
        };

        // Recalcul des points et layers au mouvement
        map.on('dragend', function () {
            if (map.getZoom() > 10) {
                refreshCommunes();
            }
        });
        map.on('zoomend', refreshMap);
    };

    // Controller pour la popup Aide Utilisateur
    function ModalHelpCtrl($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.close();
        };
    };
})();