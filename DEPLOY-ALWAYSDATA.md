# Déployer Festichill sur AlwaysData

Tout est au même endroit : **site + MySQL + emails SMTP**. Pas besoin de Render ni Resend.

## 1. Prérequis (déjà faits)

- Base MySQL `stellouuu_festichill` sur AlwaysData
- Tables créées (`npm run db:migrate-admin` déjà lancé une fois)
- Repo GitHub : `Stellouuuuu/Ticket_shop`

## 2. Créer le site Node.js

1. Panneau AlwaysData → **Web** → **Sites** → **Ajouter un site**
2. Type : **Node.js**
3. Nom : ex. `festichill` → URL : `https://festichill.stellouuu.alwaysdata.net`
4. Version Node : **20** ou **22**

## 3. Déployer le code

> **Important :** `npm install` en SSH sur AlwaysData est **toujours tué** (limite RAM/CPU).
> Le projet utilise le mode **standalone** de Next.js : tout est compilé sur ton PC,
> **aucun `npm install` sur le serveur**.

**Sur ton PC**

```bash
cd ~/my_own_app/ticket_shop
npm install
npm run build
rsync -avz --delete -e ssh \
  --exclude '/node_modules' --exclude '.git' --exclude '.env' \
  ./ stellouuu@ssh-stellouuu.alwaysdata.net:~/festichill/
```

**En SSH — test rapide (pas de npm install !)**

```bash
cd ~/festichill
npm start
# Ctrl+C pour arrêter, puis redémarrer le site dans le panneau AlwaysData
```

Le dossier `.next/standalone/` contient déjà Node + les dépendances nécessaires (~64 Mo).

## 4. Commandes AlwaysData

Dans la fiche du site → **Configuration** :

| Champ | Valeur |
|-------|--------|
| Commande de build | *(vide)* |
| Commande de démarrage | `npm start` (ou `HOSTNAME=$IP node .next/standalone/server.js`) |

AlwaysData injecte `IP` et `PORT`. L'app doit écouter sur cette IP (pas seulement `0.0.0.0`).

AlwaysData définit `PORT` automatiquement — le script `npm start` l'utilise.

## 5. Variables d'environnement

AlwaysData → site → **Environnement** (ou fichier `.env` à la racine du site) :

```env
DB_HOST=mysql-stellouuu.alwaysdata.net
DB_PORT=3306
DB_USER=stellouuu_stellachrist
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=stellouuu_festichill
DB_REMOTE=true

ADMIN_USERNAME=admin
ADMIN_PASSWORD=festichill2025

APP_URL=https://festichill.stellouuu.alwaysdata.net

# Gmail SMTP — fonctionne sur AlwaysData (pas besoin de Resend)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=startetbrille2@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=startetbrille2@gmail.com
```

**Ne pas définir `RESEND_API_KEY`** → les emails passent par SMTP Gmail.

Les destinataires des notifications se gèrent dans **Admin → Paramètres** (pas dans `.env`).

## 6. Redémarrer le site

AlwaysData → **Redémarrer** le site Node.js.

## 7. Vérifier

- Billeterie : `https://votre-site.alwaysdata.net/tickets`
- Admin : `https://votre-site.alwaysdata.net/admin` (`admin` / ton mot de passe)
- Passe une commande test → vérifie l'email et l'admin

## 8. Mettre à jour le site plus tard

Sur ton PC :

```bash
cd ~/my_own_app/ticket_shop
git pull
npm install
npm run build
rsync -avz --delete -e ssh \
  --exclude '/node_modules' --exclude '.git' --exclude '.env' \
  ./ stellouuu@ssh-stellouuu.alwaysdata.net:~/festichill/
```

En SSH (optionnel, pour tester) :

```bash
cd ~/festichill && npm start
```

Puis redémarrer le site dans le panneau.

## Avantages vs Render

| | AlwaysData | Render |
|---|------------|--------|
| MySQL | Même réseau, rapide | Distant, timeouts |
| Emails Gmail | SMTP OK | Bloqué → Resend obligatoire |
| Config | `.env` simple | 15+ variables |
