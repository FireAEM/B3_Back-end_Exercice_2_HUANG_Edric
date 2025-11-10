# B3_Back-end_Exercice_2_HUANG_Edric

---

### Présentation

Mini API ToDoList en Node.js organisée selon le modèle MVC.  
Fonctionnalités : ajout, affichage et suppression de tâches **et gestion des utilisateurs (inscription, connexion, suppression)** via une API REST simple construite avec **Express**, **CORS**, **dotenv**, **PostgreSQL**, **MongoDB** et un front minimaliste en **Pug**.

La base de données utilisée est choisie via les variables d'environnement DB_TASK et DB_USER (postgres ou mongo).
- Avec **PostgreSQL**, les tâches et utilisateurs sont stockés dans des tables SQL.
- Avec **MongoDB**, les tâches et utilisateurs sont stockés dans des collections.
- Il est possible d’utiliser PostgreSQL pour les tâches et MongoDB pour les utilisateurs (ou inversement) simultanément.

---

### Table des matières

- [Prérequis](#prérequis)
- [Dépendances principales](#dépendances-principales)
- [Installation et configuration](#installation-et-configuration)
- [Configuration PostgreSQL](#configuration-postgresql)
- [Configuration MongoDB](#configuration-mongodb)
- [Exécution](#exécution)
  - [Développement](#développement)
  - [Production simple](#production-simple)
- [API Endpoints](#api-endpoints)
- [Interface Pug](#interface-pug)
- [Documentation Swagger API](#documentation-swagger-api)
- [Structure du projet](#structure-du-projet)

---

### Prérequis

- Node.js installé (version 16+ recommandée).
- npm fourni avec Node.js.
- PostgreSQL installé (version 14+ recommandée).
- MongoDB Community Server.
- pgAdmin 4 pour PostgreSQL et MongoDB Compass pour MongoDB.
- Ligne de commande (Terminal, PowerShell, Bash).
- (Optionnel) Un client HTTP pour tester : curl, httpie ou Postman.

---

### Dépendances principales

- express : framework web minimaliste
- cors : gestion des politiques CORS
- dotenv : gestion des variables d'environnement
- pg : client officiel PostgreSQL pour Node.js
- mongoose : ODM pour MongoDB
- pug : moteur de templates pour le front
- method-override : permet de simuler DELETE/PUT dans les formulaires HTML
- swagger-ui-express : interface interactive pour documenter et tester l'API avec Swagger
- jsonwebtoken : génération et validation de tokens JWT
- bcrypt : hashage sécurisé des mots de passe
- express-rate-limit : middleware de sécurité pour limiter le nombre de requêtes
- nodemon (dev) : rechargement automatique en développement

---

### Installation et configuration

1. Cloner ou créer le dossier du projet et accéder à son répertoire :
```bash
git clone https://github.com/FireAEM/B3_Back-end_Exercice_2_HUANG_Edric.git todo-express
cd todo-express
```

2. Initialiser les dépendances :
```bash
npm install
```

3. Fichier d'environnement `.env` (exemple) :
```
PORT=3000
NODE_ENV=development

# PostgreSQL
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=b3_back-end_exercice_2
PGUSER=postgres
PGPASSWORD={motdepasse}

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/B3_Back-end_Exercice_2

# Clé JWT
JWT_SECRET={clé}

# Choix du client pour chaque entité : "postgres" ou "mongo"
DB_TASK=postgres
DB_USER=mongo
```
- **PORT** : port d'écoute du serveur Express (API).
- **PGHOST** : hôte PostgreSQL (127.0.0.1 en local).
- **PGPORT** : port PostgreSQL (5432 par défaut).
- **PGDATABASE** : nom de la base de données PostgreSQL.
- **PGUSER** : utilisateur PostgreSQL.
- **PGPASSWORD** : mot de passe de l'utilisateur PostgreSQL.
- **MONGO_URI** : URI de connexion MongoDB.
- **JWT_SECRET** : clé secrète utilisée pour signer les tokens JWT. Doit être une chaîne longue et aléatoire (minimum 32 caractères).
- **DB_TASK** : permet de choisir la base de données utilisée pour les tâches (`postgres` ou `mongo`).
- **DB_USER** : permet de choisir la base de données utilisée pour les utilisateurs (`postgres` ou `mongo`).

4. Scripts utiles dans package.json (exemple) :
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```
- `npm run dev` lance le serveur avec nodemon pour rechargement automatique en développement.
- `npm start` lance la version simple sans nodemon.

---

### Configuration PostgreSQL

1. **Créer la base de données** avec pgAdmin 4 :
   - Nom : `b3_back-end_exercice_2`
   - Owner : `postgres` (ou un utilisateur dédié).

2. **Créer la table `tasks`** (via Query Tool dans pgAdmin) :
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

3. **Créer la table `users`** :
```sql
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	nom VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL
);
```

4. Vérifier que la table est bien créée dans la base.

---

### Configuration MongoDB

1. Installer et lancer MongoDB Community Server.
2. Ouvrir **MongoDB Compass** et se connecter à l'URI (par défaut : `mongodb://127.0.0.1:27017`).
3. Créer la base `B3_Back-end_Exercice_2` (elle sera créée automatiquement à la première insertion si elle n'existe pas).
4. La collection `tasks` est créée automatiquement lors de l'ajout d'une tâche.

---

### Exécution

#### Développement

1. Vérifier que `.env` est en place et que `DB_TASK` et `DB_USER` correspondent aux bases souhaitées.
2. Lancer le serveur en mode développement :
```bash
npm run dev
```
3. Le serveur écoute sur `http://localhost:3000` par défaut.

#### Production simple

1. Construire l'environnement de production (installer seulement les dépendances de production si nécessaire).
2. Lancer :
```bash
npm start
```

---

### API Endpoints

Base : http://localhost:3000

#### Tasks

- GET /tasks
  - Description : retourne la liste des tâches au format JSON.
  - Réponse : **200 OK** avec un tableau d'objets `{ "id": int, "title": string }`
  - Exemple :
    ```bash
    curl http://localhost:3000/tasks
    ```

- POST /tasks
  - Description : crée une nouvelle tâche.
  - Requête : header `Content-Type: application/json`, corps JSON `{ "title": "..." }`
  - Validation : **title** requis et de type `string`
  - Réponse : **201 Created** avec l'objet tâche créé en JSON
  - Erreur : **400 Bad Request** si payload absent ou invalide
  - Exemple :
    ```bash
    curl -X POST http://localhost:3000/tasks \
      -H "Content-Type: application/json" \
      -d '{"title":"Acheter du pain"}'
    ```

- DELETE /tasks/:id
  - Description : supprime la tâche identifiée par `id`.
  - Paramètre : `id` en URL, doit être un entier (PostgreSQL) ou un ObjectId (MongoDB).
  - Réponse : **200 OK** si supprimée avec message de confirmation
  - Erreur : **404 Not Found** si l'ID n'existe pas ; **400 Bad Request** si `id` invalide
  - Exemple PostgreSQL :
    ```bash
    curl -X DELETE http://localhost:3000/tasks/1
    ```
  - Exemple MongoDB :
    ```bash
    curl -X DELETE http://localhost:3000/tasks/6530b1f6c0a9a5a5f4c3d2e1
    ```

#### Users

- **POST /users/signup**
  - Description : inscription d'un nouvel utilisateur.
  - Requête : header `Content-Type: application/json`, corps JSON `{ "nom": "...", "email": "...", "password": "..." }`
  - Validation :
    - **nom** requis et de type `string`
    - **email** requis, unique et de type `string`
    - **password** requis, de type `string`, longueur minimale recommandée : 6 caractères
  - Réponse : **201 Created** avec l'objet utilisateur créé en JSON
  - Erreur : **400 Bad Request** si payload invalide; **409 Conflict** si l'email existe déjà
  - Exemple :
    ```bash
    curl -X POST http://localhost:3000/users/signup \
      -H "Content-Type: application/json" \
      -d '{"nom":"Jean Dupont","email":"jean@example.com", "password":"motdepasse123"}'
    ```

- **POST /users/login**
  - Description : connexion d'un utilisateur existant.
  - Requête : header `Content-Type: application/json`, corps JSON `{ "email": "...", "password": "..." }`
  - Validation :
    - **email** requis et de type `string`
    - **password** requis et de type `string`
  - Réponse : **200 OK** avec l'objet utilisateur et un token JWT
  - Erreur : **400 Bad Request** si payload invalide; **401 Unauthorized** si mot de passe incorrect; **404 Not Found** si l'utilisateur n'existe pas
  - Exemple :
    ```bash
    curl -X POST http://localhost:3000/users/login \
      -H "Content-Type: application/json" \
      -d '{"email":"jean@example.com","password":"motdepasse123"}'
    ```

- **DELETE /users/:id**
  - Description : supprime l'utilisateur identifié par `id`.
  - Paramètre : `id` en URL, doit être un entier (PostgreSQL) ou un ObjectId (MongoDB).
  - Réponse : **200 OK** si supprimé avec message de confirmation
  - Erreur : **400 Bad Request** si `id` invalide; **404 Not Found** si l'utilisateur n'existe pas
  - Exemple PostgreSQL :
    ```bash
    curl -X DELETE http://localhost:3000/users/1
    ```
  - Exemple MongoDB :
    ```bash
    curl -X DELETE http://localhost:3000/users/6530b1f6c0a9a5a5f4c3d2e1
    ```

---

### Interface Pug

En plus de l'API JSON, une interface web simple est disponible à la racine `/`.
- **Affiche la liste des tâches**.
- **Formulaire d'ajout** : envoie un POST `/tasks`.
- **Bouton de suppression** : utilise `method-override` pour simuler un DELETE.

---

### Documentation Swagger API

La documentation interactive de l'API est disponible grâce à **Swagger UI**.
Accès à la documentation : http://localhost:3000/api-docs

---

### Structure du projet

```
.
├── server.js
├── swagger.json
├── package.json
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── models/
│   │   ├── task.js
│   │   └── user.js
│   └── routes/
│       ├── tasks.js
│       └── users.js
├── views/
│   ├── layout.pug
│   └── index.pug
└── README.md
```

- **server.js** : point d'entrée, configuration Express, Pug, middleware, montage des route et démarrage conditionné à la connexion DB.
- **swagger.json** : description de l'API au format OpenAPI 3.0 (endpoints `/tasks` et `/users`, schéma `Task` et `User`, etc.).
- **src/config/db.js** : configuration et connexion PostgreSQL/MongoDB.
- **src/controllers/taskController.js** : logique métier et gestion des réponses HTTP/HTML.
- **src/controllers/userController.js** : logique métier pour inscription, connexion et suppression d'utilisateurs.
- **src/models/task.js** : modèle `Task` (implémentation PostgreSQL ou MongoDB selon `DB_TASK`).
- **src/models/user.js** : modèle `User` (implémentation PostgreSQL ou MongoDB selon `DB_USER`, JWT, hashage bcrypt).
- **src/routes/tasks.js** : routage HTTP pour `/tasks`.
- **src/routes/users.js** : routage HTTP pour `/users`.
- **views/layout.pug** : layout de base (HTML, head, footer).
- **views/index.pug** : page principale avec formulaire et liste des tâches.
- **package.json** : dépendances et scripts.