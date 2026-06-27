# Festichill — Mini système de réservation de tickets

Outil simple de précommande de tickets pour Festichill (Cotonou).  
Pas de paiement en ligne — confirmation et livraison par l'équipe.

## Pages

| Route | Description |
|-------|-------------|
| `/tickets` | Page publique de réservation |
| `/merci/[reference]` | Confirmation après commande |
| `/admin` | Suivi des commandes (protégé par mot de passe) |

## Prérequis

- Node.js 18+
- MySQL 8+

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres MySQL, mot de passe admin, SMTP...

# 3. Initialiser la base de données
npm run db:init

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000/tickets](http://localhost:3000/tickets)

## Configuration

### Base de données MySQL (locale ou distante)

Le script `npm run db:init` crée la base `festichill_tickets` et la table `orders`.

Dans `.env`, renseignez l'hôte de votre serveur MySQL :

```env
DB_HOST=mysql.votre-hebergeur.com
DB_PORT=3306
DB_USER=festichill_user
DB_PASSWORD=votre_mot_de_passe
DB_NAME=festichill_tickets
DB_SSL=true
```

Services compatibles : Railway, PlanetScale, Aiven, hébergement mutualisé avec MySQL distant, VPS, etc.

**Étapes pour une base distante :**

1. Créer une base MySQL chez votre hébergeur
2. Autoriser les connexions depuis l'IP de votre serveur (ou `0.0.0.0` en dev)
3. Mettre à jour `.env` avec les identifiants distants
4. Lancer `npm run db:init` pour créer la table `orders`
5. Lancer `npm run dev` ou déployer le site

Si la connexion SSL échoue, essayez `DB_SSL_REJECT_UNAUTHORIZED=false`.

### AlwaysData

Ce projet utilise **MySQL** (pas PostgreSQL). Dans le panneau AlwaysData :

1. **Bases de données → MySQL** (pas PostgreSQL)
2. Cliquer sur **Ajouter une base de données** → nom : `festichill`  
   → la base s’appellera `stellouuu_festichill`
3. Créer un utilisateur avec accès à cette base (noter mot de passe)
4. Copier la config :

```bash
cp .env.alwaysdata.example .env
```

```env
DB_HOST=mysql-stellouuu.alwaysdata.net
DB_PORT=3306
DB_USER=stellouuu
DB_PASSWORD=votre_mot_de_passe
DB_NAME=stellouuu_festichill
DB_REMOTE=true
```

5. Créer la table :

```bash
npm run db:init
```

**Développement en local** : AlwaysData autorise surtout les connexions depuis leurs serveurs.  
Pour tester en local, utilisez un **tunnel SSH** :

```bash
ssh -L 3307:mysql-stellouuu.alwaysdata.net:3306 stellouuu@ssh-stellouuu.alwaysdata.net -N
```

Puis dans `.env` : `DB_HOST=127.0.0.1` et `DB_PORT=3307`.

**Production** : hébergez le site sur AlwaysData et utilisez `mysql-stellouuu.alwaysdata.net` directement.

### Admin

Définir `ADMIN_PASSWORD` dans `.env`. L'équipe se connecte sur `/admin`.

### Notifications email

Configurer les variables SMTP dans `.env` pour recevoir un email à chaque nouvelle commande.  
Si SMTP n'est pas configuré, les commandes sont quand même enregistrées (un message apparaît dans les logs).

## Statuts de commande

- `pending` — Reçue, pas encore contactée
- `contacted` — Client contacté
- `confirmed` — Commande confirmée, livraison prévue
- `delivered` — Tickets livrés, paiement reçu
- `cancelled` — Annulée

## Prix

1 ticket = **8 000 FCFA** (calcul automatique du total)

## Production

```bash
npm run build
npm start
```

Définir `APP_URL` avec l'URL publique du site pour les liens dans les emails.

## Déploiement sur Render

Le dépôt inclut un `render.yaml` (Blueprint). Étapes :

1. **GitHub** — le code est sur [Ticket_shop](https://github.com/Stellouuuuu/Ticket_shop)
2. **Render** — [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint** → connecter le repo GitHub
3. **Variables d'environnement** — renseigner dans Render (ne jamais committer `.env`) :

| Variable | Exemple |
|----------|---------|
| `DB_HOST` | `mysql-stellouuu.alwaysdata.net` |
| `DB_USER` | `stellouuu_stellachrist` |
| `DB_PASSWORD` | *(mot de passe MySQL)* |
| `DB_NAME` | `stellouuu_festichill` |
| `DB_REMOTE` | `true` |
| `ADMIN_PASSWORD` | *(mot de passe admin fort)* |
| `APP_URL` | `https://votre-app.onrender.com` |
| `SMTP_*` | *(config Gmail / SMTP)* |

4. **Base de données** — tables déjà créées via `npm run db:migrate-admin` sur AlwaysData.  
   Si besoin : `npm run db:init && npm run db:migrate-admin` en local.
5. **AlwaysData** — autoriser les connexions MySQL distantes depuis Render :  
   Panneau AlwaysData → Bases de données → MySQL → **Accès distant** → ajouter `0.0.0.0/0` (ou l'IP sortante Render si plan payant).
6. Après le déploiement, ouvrir `/admin` et changer le mot de passe admin.

## Admin (comptes en base)

Les administrateurs sont stockés en MySQL (table `admins`).  
Connexion : identifiant + mot de passe sur `/admin`.  
Gestion des comptes et emails de notification : onglet **Paramètres**.
