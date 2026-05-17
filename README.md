# Project Chama App

A React + Firebase savings group (chama) management app.

## Features

- Google sign-in for regular chama members
- Optional direct admin sign-in with a configured password
- Admin-only finance controls for contributions and expenses
- Admin member management with role toggles and member creation
- Firestore-backed member, contribution, expense, and reminder data

## Getting started

1. Copy `.env.example/.env.example` to `.env.local` in `project-chama-app/project-chama-app/`
2. Fill in Firebase config values
3. Optionally add:

```env
VITE_ADMIN_PASSWORD=YourAdminPasswordHere
```

4. Install dependencies:

```bash
cd project-chama-app/project-chama-app
npm install
```

5. Run the app:

```bash
npm run dev
```

## Admin login

- Regular members sign in with Google.
- Admins can sign in directly with the configured password using the `Sign in as admin` button.
- The admin password comes from `VITE_ADMIN_PASSWORD` in `.env.local`.

## Admin capabilities

When signed in as admin, the app enables:

- `Add member` on the Members page
- `Make Admin` / `Make Member` role toggles
- `Remove member`
- Add contributions and expenses on the Finances page
- Schedule reminders on the Reminders page

## Notes

- The admin password path does not require Google authentication.
- If `VITE_ADMIN_PASSWORD` is not configured, admin sign-in will fail.
- Admin sessions are tracked by app state and Firestore profile role when using Google sign-in.

## Folder structure

- `src/` — application source code
- `src/pages/` — page components
- `src/store/` — auth and app state
- `src/utils/` — Firebase and Firestore helpers

## Author
Kelvin Tullo

