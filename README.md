# B3_Back-end_Exercice_2_HUANG_Edric

---

### Présentation

Mini API ToDoList en Node.js organisée selon le modèle MVC.  
Fonctionnalités : ajout, affichage et suppression de tâches via une API REST simple construite avec **Express**, **CORS**, **dotenv**, **PostgreSQL**, **MongoDB** et un front minimaliste en **Pug**.

La base de données utilisée est choisie via la variable d’environnement **`DB_CLIENT`** (`postgres` ou `mongo`).
- Avec **PostgreSQL**, les tâches sont stockées dans une table SQL.
- Avec **MongoDB**, les tâches sont stockées dans une collection.

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
- dotenv : gestion des variables d’environnement
- pg : client officiel PostgreSQL pour Node.js
- mongoose : ODM pour MongoDB
- pug : moteur de templates pour le front
- method-override : permet de simuler DELETE/PUT dans les formulaires HTML
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

# Choix du client : "postgres" ou "mongo"
DB_CLIENT=postgres
```
- **PORT** : port d’écoute du serveur Express (API).
- **PGHOST** : hôte PostgreSQL (127.0.0.1 en local).
- **PGPORT** : port PostgreSQL (5432 par défaut).
- **PGDATABASE** : nom de la base de données PostgreSQL.
- **PGUSER** : utilisateur PostgreSQL.
- **PGPASSWORD** : mot de passe de l’utilisateur PostgreSQL.
- **MONGO_URI** : URI de connexion MongoDB.
- **DB_CLIENT** : permet de choisir la base de données utilisée (`postgres` ou `mongo`).

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

3. Vérifier que la table est bien créée dans la base.

---

### Configuration MongoDB

1. Installer et lancer MongoDB Community Server.  
2. Ouvrir **MongoDB Compass** et se connecter à l’URI (par défaut : `mongodb://127.0.0.1:27017`).  
3. Créer la base `B3_Back-end_Exercice_2` (elle sera créée automatiquement à la première insertion si elle n’existe pas).  
4. La collection `tasks` est créée automatiquement lors de l’ajout d’une tâche.  

---

### Exécution

#### Développement

1. Vérifier que `.env` est en place et que `DB_CLIENT` correspond à la base souhaitée.  
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
  - Paramètre : `id` en URL, doit être un entier.  
  - Réponse : **200 OK** si supprimée avec message de confirmation  
  - Erreur : **404 Not Found** si l'ID n'existe pas ; **400 Bad Request** si `id` invalide  
  - ⚠️ **Attention** :  
    - En PostgreSQL, `id` est un entier.  
    - En MongoDB, `id` est un ObjectId (24 caractères hexadécimaux).  
  - Exemple PostgreSQL :
    ```bash
    curl -X DELETE http://localhost:3000/tasks/1
    ```
  - Exemple MongoDB :
    ```bash
    curl -X DELETE http://localhost:3000/tasks/6530b1f6c0a9a5a5f4c3d2e1
    ```

---

### Interface Pug

En plus de l’API JSON, une interface web simple est disponible à la racine `/`.
- **Affiche la liste des tâches**.
- **Formulaire d’ajout** : envoie un POST `/tasks`.
- **Bouton de suppression** : utilise `method-override` pour simuler un DELETE.

---

### Structure du projet

```
.
├── server.js
├── package.json
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── taskController.js
│   ├── models/
│   │   └── task.js
│   └── routes/
│       └── tasks.js
├── views/
│   ├── layout.pug
│   └── index.pug
└── README.md
```

- **server.js** : point d'entrée, configuration Express, Pug, middleware, montage des route et démarrage conditionné à la connexion DB.
- **src/config/db.js** : configuration et connexion PostgreSQL/MongoDB.
- **src/controllers/taskController.js** : logique métier et gestion des réponses HTTP/HTML.
- **src/models/task.js** : classe `Task` (implémentation PostgreSQL ou MongoDB selon `DB_CLIENT`).
- **src/routes/tasks.js** : routage HTTP pour `/tasks`.
- **views/layout.pug** : layout de base (HTML, head, footer).
- **views/index.pug** : page principale avec formulaire et liste des tâches.
- **package.json** : dépendances et scripts.