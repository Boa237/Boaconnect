# Déploiement de Mboa Connect sur un serveur Ubuntu

Guide pour déployer le backend en production sur un serveur Ubuntu 22.04 LTS (ou 24.04), avec PostgreSQL, HTTPS, et démarrage automatique au boot.

---

## 1. Préparer le serveur

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw
```

### Pare-feu

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Installer Docker + Docker Compose

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker   # ou reconnectez-vous en SSH
docker --version
docker compose version
```

---

## 2. Récupérer le projet sur le serveur

```bash
git clone <url-de-votre-dépôt-git> mboa-connect
cd mboa-connect
```

(Si vous n'utilisez pas Git, transférez l'archive avec `scp mboa-connect.zip user@serveur:~/` puis `unzip mboa-connect.zip`.)

---

## 3. Configurer les variables d'environnement de production

```bash
cp .env.example .env
cp backend/.env.example backend/.env
nano backend/.env
```

Dans `backend/.env`, changez impérativement :
- `NODE_ENV=production`
- `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` → générez des valeurs aléatoires longues : `openssl rand -hex 32`
- `DB_PASSWORD` → un mot de passe fort (répercutez-le aussi dans `.env` à la racine)
- `APP_URL` → l'URL publique finale (ex: `https://api.mboaconnect.cm`)
- `SMS_PROVIDER=twilio` (ou votre agrégateur) + les identifiants correspondants
- `ORANGE_MONEY_MERCHANT_KEY` / `MTN_MOMO_SUBSCRIPTION_KEY` si les paiements sont activés

Dans `.env` (racine, utilisé par docker-compose) : alignez `DB_NAME`, `DB_USER`, `DB_PASSWORD` avec `backend/.env`.

---

## 4. Lancer les conteneurs de production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Ceci démarre PostgreSQL (non exposé publiquement) et le backend (construit via `backend/Dockerfile.prod`, image de production optimisée sans dépendances de développement).

### Exécuter les migrations

```bash
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

### Créer le premier compte admin

Après avoir créé un compte via OTP depuis l'app mobile :

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U $DB_USER -d $DB_NAME -c "UPDATE users SET role='admin' WHERE \"phoneNumber\"='+237690000001';"
```

### Vérifier que ça tourne

```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost:3000/api/v1/categories
```

---

## 5. Mettre en place HTTPS avec Nginx + Let's Encrypt

### Installer Nginx et Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Configurer Nginx comme reverse proxy

Créez `/etc/nginx/sites-available/mboa-connect` :

```nginx
server {
    listen 80;
    server_name api.mboaconnect.cm;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20M;   # important : upload de photos
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mboa-connect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Activer HTTPS automatiquement

```bash
sudo certbot --nginx -d api.mboaconnect.cm
```

Certbot configure le certificat et le renouvellement automatique. Vérifiez :

```bash
sudo certbot renew --dry-run
```

Après cette étape, mettez à jour `APP_URL=https://api.mboaconnect.cm` dans `backend/.env` puis redémarrez : `docker compose -f docker-compose.prod.yml restart backend`.

---

## 6. Démarrage automatique au redémarrage du serveur

Docker Compose avec `restart: always` (déjà configuré dans `docker-compose.prod.yml`) redémarre automatiquement les conteneurs après un reboot, **à condition que le service Docker démarre au boot** :

```bash
sudo systemctl enable docker
```

C'est suffisant : aucun service systemd supplémentaire n'est nécessaire.

---

## 7. Sauvegardes de la base de données

```bash
# Sauvegarde
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $DB_USER $DB_NAME > backup-$(date +%Y%m%d).sql

# Restauration
cat backup-20260706.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U $DB_USER -d $DB_NAME
```

Automatisez avec une tâche cron :

```bash
crontab -e
# Ajoutez :
0 3 * * * cd /home/ubuntu/mboa-connect && docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U mboa_user mboa_connect > /home/ubuntu/backups/mboa-$(date +\%Y\%m\%d).sql
```

---

## 8. Mise à jour de l'application (nouveau déploiement)

```bash
cd mboa-connect
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend npm run migration:run
```

---

## 9. Surveillance et logs

```bash
docker compose -f docker-compose.prod.yml logs -f backend    # logs en direct
docker compose -f docker-compose.prod.yml ps                 # état des conteneurs
docker stats                                                   # utilisation CPU/RAM
```

Pour une surveillance plus poussée en production, envisagez d'ajouter Sentry (erreurs applicatives) ou Uptime Kuma / UptimeRobot (disponibilité de l'API).

---

## 10. Checklist finale avant mise en production

- [ ] `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` changés (valeurs aléatoires, jamais celles du `.env.example`)
- [ ] `NODE_ENV=production`
- [ ] HTTPS actif (certificat Let's Encrypt valide)
- [ ] Fournisseur SMS réel configuré (plus de mode "console")
- [ ] Sauvegardes automatiques de la base de données planifiées
- [ ] Pare-feu configuré (ports 80/443/22 uniquement)
- [ ] Premier compte admin créé
- [ ] `docker compose -f docker-compose.prod.yml ps` montre tous les conteneurs `healthy`/`running`
- [ ] Voir aussi `docs/bugs-and-todo.md` pour les points restants avant une mise en production à grande échelle
