# Projet GeoPro
Projet de géolocalisation à destination des commerciaux permettant de géolocaliser
les professionnels affiliés à Pages Jaunes (cliens et prospects). Les informations
de chaque établissement affiché sont liées aux activités et communes.


## Présentation
Ce projet est la version IHM de l'outil GeoPro. Il s'appuie sur les données Elasticsearch chargées préalablement au moyen des scripts fournis par le projet d'initialisation : https://git.test.services.local/dt_ct_ioda/geopro-init

Ce projet s'appuie sur la librairie LeafletJS (http://leafletjs.com/) pour le rendu des éléments cartographiés, et sur le projet OpenStreetMap (https://www.openstreetmap.org/) pour les fonds de carte. Aucune clé n'est requise pour l'utilisation.


## Pré-requis
Il est recommandé d'utiliser NodeJS pour simplifier les procédures d'installation et de mises à jour des sources. Bower est l'outil de gestion de dépendances utilisé pour ce projet.


## Installation
- Déployer les sources sur l'environnement cible avec Git
- Récupérer les dernières dépendences :
	- si NodeJS : ```npm install```
	- si bower uniquement : ```bower install```
- Lancer le server web :
    - si NodeJS : ```npm start```
    - sinon, ajouter le dossier ```app/``` en tant que point d'écoute sur le serveur