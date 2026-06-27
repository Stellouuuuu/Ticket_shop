# Déployer Festichill sur Render + Resend

**Stack :** Render (hébergement Node.js) + MySQL AlwaysData + emails Resend.

> SMTP Gmail est **bloqué** sur Render → Resend obligatoire pour les notifications.

## 1. Prérequis

- Repo GitHub : [Stellouuuuu/Ticket_shop](https://github.com/Stellouuuuu/Ticket_shop)
- Base MySQL AlwaysData `stellouuu_festichill` (tables déjà créées)
- Compte [Resend](https://resend.com) avec une clé API

## 2. Autoriser Render sur MySQL AlwaysData

1. Panneau AlwaysData → **Bases de données → MySQL**
2. Ouvrir la base `stellouuu_festichill`
3. **Accès distant** → autoriser les connexions externes (`0.0.0.0/0` ou IP sortante Render)

Sans ça, Render ne peut pas joindre la base → timeouts.

## 3. Créer le service Render

### Option A — Blueprint (recommandé)

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**
2. Connecter le repo `Ticket_shop`
3. Render lit `render.yaml` et crée le service

### Option B — Manuel

1. **New +** → **Web Service**
2. Repo GitHub → branche `main`
3. **Runtime** : Node
4. **Build command** : `npm install && npm run build`
5. **Start command** : `npm start`
6. **Region** : Frankfurt (proche du Bénin / Europe)

## 4. Variables d'environnement (Render → Environment)

Copier-coller dans le dashboard Render :

```env
NODE_VERSION=22
NODE_ENV=production

# MySQL AlwaysData
DB_HOST=mysql-stellouuu.alwaysdata.net
DB_PORT=3306
DB_USER=stellouuu_stellachrist
DB_PASSWORD=stellaChrist15
DB_NAME=stellouuu_festichill
DB_REMOTE=true

# Admin (bootstrap si base vide)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=festichill2025

# URL publique Render (adapter après le 1er déploiement)
APP_URL=https://festichill-ticket-shop.onrender.com

# Resend (obligatoire sur Render)
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM=Festichill <onboarding@resend.dev>
RESEND_ACCOUNT_EMAIL=stellagbaguidi68@gmail.com
```

### Points importants

| Variable | Détail |
|----------|--------|
| `DB_PASSWORD` | Respecter **exactement** la casse (`stellaChrist15`, pas `stellachrist15`) |
| `APP_URL` | URL Render **sans** slash final |
| `RESEND_FROM` | `onboarding@resend.dev` = mode test uniquement |
| `RESEND_ACCOUNT_EMAIL` | Email du compte Resend — seul destinataire autorisé en mode test |

**Ne pas définir** `SMTP_*` sur Render (inutile, bloqué).

Les destinataires des notifications se gèrent dans **Admin → Paramètres** (table `notification_recipients`).

## 5. Resend — mode test vs production

### Mode test (sans domaine vérifié)

- `RESEND_FROM=Festichill <onboarding@resend.dev>`
- Les emails partent **uniquement** vers `RESEND_ACCOUNT_EMAIL`
- Les autres adresses ajoutées dans Admin → Paramètres sont ignorées (log Render)

### Mode production (recommandé avant l'événement)

1. Resend → **Domains** → ajouter votre domaine
2. Configurer les enregistrements DNS (SPF, DKIM)
3. Changer sur Render :
   ```env
   RESEND_FROM=Festichill <noreply@votredomaine.com>
   ```
4. Retirer `RESEND_ACCOUNT_EMAIL` (plus nécessaire)

## 6. Déployer

1. **Save** les variables d'environnement
2. **Manual Deploy** → Deploy latest commit (ou push sur `main` si auto-deploy activé)
3. Attendre le build (~2–3 min)
4. Tester :
   - `https://festichill-ticket-shop.onrender.com/tickets`
   - `https://festichill-ticket-shop.onrender.com/admin` (`admin` / ton mot de passe)

## 7. Mettre à jour le site

```bash
git add .
git commit -m "..."
git push origin main
```

Render redéploie automatiquement si auto-deploy est activé.

## 8. Dépannage

| Problème | Cause probable | Solution |
|----------|----------------|----------|
| Build OK, page blanche / 502 | Cold start (plan free) | Attendre 30–60 s, recharger |
| Erreur base de données | MySQL distant non autorisé | AlwaysData → Accès distant |
| `ETIMEDOUT` MySQL | Render ↔ AlwaysData lent | Vérifier `DB_REMOTE=true`, mot de passe |
| Email non reçu | Mode test Resend | Vérifier `RESEND_ACCOUNT_EMAIL` |
| Email vers autre adresse ignoré | Pas de domaine Resend | Vérifier un domaine sur resend.com |
| Admin login échoue | Mauvais mot de passe | Variable `ADMIN_PASSWORD` ou compte en base |

Logs Render : **Dashboard → service → Logs**

## 9. Comparaison AlwaysData vs Render

| | Render + Resend | AlwaysData |
|---|-----------------|------------|
| Build | Sur Render (OK) | Impossible en SSH (RAM) |
| MySQL | Distant, parfois lent | Local, rapide |
| Emails | Resend API | Gmail SMTP |
| Cold start | Oui (plan free) | Non |
| Config | Variables Render | Panneau AlwaysData |
