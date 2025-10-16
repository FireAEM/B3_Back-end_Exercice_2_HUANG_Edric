# B3_Back-end_Exercice_2_HUANG_Edric

---

### Présentation

Mini API ToDoList en Node.js organisée selon le modèle MVC.  
Fonctionnalités : ajout, affichage et suppression de tâches via une API REST simple construite avec **Express**, **CORS**, **dotenv** et **PostgreSQL**.  

La base de données PostgreSQL est utilisée pour stocker les tâches de manière persistante.

---

### Table des matières

- [Prérequis](#prérequis)
- [Dépendances principales](#dépendances-principales)
- [Installation et configuration](#installation-et-configuration)
- [Configuration PostgreSQL](#configuration-postgresql)
- [Exécution](#exécution)
  - [Développement](#développement)
  - [Production simple](#production-simple)
- [API Endpoints](#api-endpoints)
- [Structure du projet](#structure-du-projet)

---

### Prérequis

- Node.js installé (version 16+ recommandée).  
- npm fourni avec Node.js.  
- PostgreSQL installé (version 14+ recommandée).  
- pgAdmin 4 pour gérer la base de données.  
- Ligne de commande (Terminal, PowerShell, Bash).  
- (Optionnel) Un client HTTP pour tester : curl, httpie ou Postman.

---

### Dépendances principales

- express : framework web minimaliste
- cors : gestion des politiques CORS
- dotenv : gestion des variables d’environnement
- pg : client officiel PostgreSQL pour Node.js
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
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=b3_back-end_exercice_2
PGUSER=postgres
PGPASSWORD={motdepasse}
```
- **PORT** : port d'écoute du serveur.
- **PGHOST** : hôte PostgreSQL (127.0.0.1 en local).
- **PGPORT** : port PostgreSQL (5432 par défaut).
- **PGDATABASE** : nom de la base de données.
- **PGUSER** : utilisateur PostgreSQL.
- **PGPASSWORD** : mot de passe de l’utilisateur.

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

### Exécution

#### Développement

1. Vérifier que `.env` est en place.  
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
  - Exemple :
    ```bash
    curl -X DELETE http://localhost:3000/tasks/1
    ```

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
└── README.md
```

- **server.js** : point d'entrée, configuration Express, middleware, montage des route et démarrage conditionné à la connexion DB.
- **src/config/db.js** : configuration et connexion PostgreSQL.
- **src/controllers/taskController.js** : logique métier et gestion des réponses HTTP.
- **src/models/task.js** : classe `Task` (requêtes SQL create, list, delete).
- **src/routes/tasks.js** : routage HTTP pour `/tasks`.  
- **package.json** : dépendances et scripts.