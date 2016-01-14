# Projet GeoRequetes
Projet de géolocalisation des requêtes effectuées sur le site Pages Jaunes


## Présentation
Ce projet est la version IHM de l'outil GeoRequetes. Il s'appuie sur les données Elasticsearch chargées préalablement au moyen des scripts fournis par le projet d'initialisation : https://github.com/GalakFayyar/p4

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
