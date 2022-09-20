# ECF-back
Projet d'ECF partie back

## CLoner le repo
Faire un git clone

## Vérifier que node est bien installé
la commande node -v affichera la version de node si installé. Sinon, veuillez installer Node, la version LTS.

## Installer les dépendances
npm install pour installer les dépendances du projet.

## Modifications nécessaires
- Le back n'accepte que les requêtes provenant du front. Il vous faudra donc adapter dans app.js les paramètres CORS (origin) avec l'url du front local (localhost:3000 par exemple).
- Veuillez également créer à la racine un fichier .env et y écrire les constantes d'environnement nécessaires au bon fonctionnement de l'app. Les constantes nécessaires sont :
  PORT
  PG_DB
  PG_PASSWORD
  PG_USER
  PG_HOST
  PG_PORT

  DEFAULT_ADMIN_EMAIL=admin_ecf@gmail.com
  DEFAULT_ADMIN_MDP=SuperPassword123$

  ACCESS_TOKEN_SECRET=jhgl794gqgg342z987zgfpkrowazepafzrnj87
  REFRESH_TOKEN_SECRET=8s5d4f3qdg496r5er4dgf3rhttf5g49nrqESEF

  EMAIL_PASSWORD=SuperPassword123$
  EMAIL_ADDRESS=api_salle_sport@zohomail.eu

  APP_DOMAIN=https://ecf.herokuapp.com
  
  A noter que je ne renseigne pas les ids de la db (PG_***) qui dépendant de votre environnement.
  
 
