# Aitje Embedding Application

Laravel (Sanctum) backend en Nuxt 3 frontend voor het beheren, embedden en exporteren van kennisbankgegevens.

Er is bewust geen publieke registratieflow. Aitje beheert klantaccounts via `/admin/cms`. Per bedrijf is er één bedrijfsaccount dat door meerdere mensen binnen hetzelfde bedrijf kan worden gebruikt.

## Project structuur

```
project-root/
├── backend/   # Laravel API
└── frontend/  # Nuxt 3 app
```

## Benodigdheden

- PHP 8.2+
- Composer
- Node.js 20+
- npm
- MySQL of een andere ondersteunde database

## Backend setup

```bash
cd backend
composer install
cp .env.example .env   # vul waarden in
php artisan key:generate
php artisan migrate
php artisan serve
```

Belangrijke `.env` variabelen:

```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
DB_* (database instellingen)
MAIL_* (Mailtrap of Mailhog)
ADMIN_EMAIL / ADMIN_PASSWORD_HASH (login voor /admin/cms)
```

Genereer de admin password hash lokaal met:

```bash
php -r "echo password_hash('jouw-wachtwoord', PASSWORD_BCRYPT);"
```

De admin kan via `/admin/cms`:

- klantaccounts aanmaken;
- GitHub repository, branch en access token per klant koppelen;
- klantstatus en laatste sync zien;
- tijdelijk als klant meekijken via "Bekijk als gebruiker".

GitHub access tokens worden versleuteld in de database opgeslagen. Klanten kunnen hun GitHub-koppeling zien en syncen, maar niet zelf aanpassen.

Handige artisan commando's:

- `php artisan migrate:fresh --seed` - reset database
- `php artisan queue:work` - voor email queueing (optioneel)

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env  # indien gewenst
npm run dev
```

`frontend/.env`:

```
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Development workflow

1. Start backend: `cd backend && php artisan serve`
2. Start frontend: `cd frontend && npm run dev`
3. Gebruik Mailtrap/Mailhog voor mails (reset / verify links).

## API endpoints

Alle routes bevinden zich onder `/api/v1`.

| Methode | Endpoint | Authenticatie | Beschrijving |
| ------- | -------- | ------------- | ------------ |
| POST    | `/login` | Nee | Login |
| POST    | `/forgot-password` | Nee | Verstuurt reset email |
| POST    | `/reset-password` | Nee | Stelt nieuw wachtwoord in |
| GET     | `/email/verify/{id}/{hash}` | Gesigneerd | Verifieert email |
| POST    | `/logout` | Sanctum token | Logout en revoke token |
| GET     | `/me` | Sanctum token | Huidige gebruiker |
| POST    | `/email/resend` | Sanctum token | Resend verificatie mail |

## Testing checklist

- Login / logout
- Forgot + reset password
- Resend verificatie vanuit dashboard
- API direct testen met tools zoals Insomnia/Postman

Veel succes!
