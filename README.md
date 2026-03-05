# FitTrack — Nutrition Tracking & Meal Planning

A full-stack web application for tracking daily calorie and macro intake, managing a food pantry, and planning meals from custom recipes.

> 🎬 *Demo GIF coming soon*

---

## Features

- **Daily Calorie Dashboard** — Circular progress ring for calories, animated bars for protein / carbs / fat, navigable by date
- **Pantry Management** — Track ingredient stock with ADD / DISPOSE / COOK operations
- **Custom Foods & Meals** — Define ingredients with full macro data, then compose multi-ingredient recipes
- **Meal Recommendations** — Surfaces meals you can cook right now from what's in your pantry
- **Nutrition Goals** — Per-user targets for calories, protein, carbs, and fat
- **JWT Authentication** — Secure login with automatic token refresh

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5.1 · Django REST Framework · SimpleJWT |
| Frontend | React 18 · React Router 7 · Tailwind CSS 3 |
| Database | SQLite (persisted in Docker volume) |
| Server | Gunicorn · Nginx (reverse proxy + SPA routing) |
| Deployment | Docker · Docker Compose |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run with Docker (recommended)

```bash
git clone https://github.com/Drakon4ik-Coder/fitness-app-web.git
cd fitness-app-web
```

Create a `.env` file in the project root:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8080
```

Start the app:

```bash
docker compose up --build
```

Open **http://localhost:8080** in your browser.

### Run Locally (development)

**Backend**

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

## Project Structure

```
fitness-app-web/
├── backend/
│   ├── FitnessApp/          # Models, views, serializers
│   │   ├── models.py        # Item, Recipe, Action, UserSettings
│   │   └── views.py         # REST API views
│   ├── backend/             # Django settings and URL routing
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── CalorieTracker.js   # Daily intake dashboard
│   │   ├── Pantry.js           # Ingredient & meal management
│   │   ├── FoodListManager.js  # Create foods and recipes
│   │   ├── Settings.js         # Nutrition goal configuration
│   │   └── utils/api.js        # API base URL (env-aware)
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/register/` | POST | Create account |
| `/api/token/` | POST | Login — returns JWT pair |
| `/api/token/refresh/` | POST | Refresh access token |
| `/items/` | GET / POST | List or create foods/meals |
| `/recipes/` | GET / POST | List or create meal recipes |
| `/actions/` | GET / POST / DELETE | Log or remove food/pantry actions |
| `/available-ingredients/` | GET | Current pantry stock |
| `/eaten-food/` | GET | Food intake history |
| `/user-settings/` | GET / PUT | Nutrition goals |
| `/meal-recommendations/` | GET | Meals cookable from current pantry |

All data endpoints require a `Bearer` JWT token in the `Authorization` header.

## Deployment

The app is deployable to any Linux host with Docker. Set the following environment variables (via `.env` or your host's secret manager):

| Variable | Description | Default |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key | *(required in production)* |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost` |
| `DJANGO_DEBUG` | Enable debug mode | `False` |

The SQLite database is persisted in a Docker named volume (`sqlite_data`) so it survives container rebuilds.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes with a descriptive message
4. Open a pull request

## Maintainer

**Illia** — [github.com/Drakon4ik-Coder](https://github.com/Drakon4ik-Coder)

## License

This project is unlicensed — all rights reserved by the author.
