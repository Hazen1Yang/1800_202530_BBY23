# PathFinder

## Overview

PathFinder is a client-side web application (HTML/CSS/JavaScript) created for the COMP 1800 course. It helps users explore career paths, set and track personal career goals, and take short quizzes to assist with career decisions. The app uses Firebase for authentication and Firestore for per-user data persistence.

---

## Features

- Browse career-related content and informational pages
- Per-user goals (create / edit / delete) stored in Firestore
- Small quizzes and progress tracking
- Responsive layout suitable for desktop and mobile

---

## Technologies

- **Frontend**: HTML, CSS, JavaScript (ES modules)
- **Styling**: plain CSS (styles under `src/styles/`)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting and authentication, Firestore
- **Dependencies**: bootstrap (CSS framework), firebase (Auth + Firestore)

---

## Usage

1. Install dependencies:

```powershell
npm install
```

2. Set up Firebase configuration:

   - Copy `.env.example` to `.env`:
     ```powershell
     cp .env.example .env
     ```
   - Edit `.env` and add your Firebase project credentials
   - Get these values from your Firebase project settings at https://console.firebase.google.com/

3. Start the dev server:

```powershell
npm run dev
```

4. Open the app in your browser at `http://localhost:3000` or `http://localhost:5173`

Notes:

- Firebase configuration values are read from environment variables prefixed with `VITE_` (see `src/firebaseConfig.js` and any `.env` present). Do NOT commit secret keys to version control.

---

## Project Structure (current)

This can vary, and may change in the future, this is merely in its current state.

```
1800_202530_BBY23/
├── public
│   └── images/            #  Contains many images
├── src/
│	├── components/
│	│	├── footer.js
│	│	└── navbar.js
│	├── styles/
│	│   ├── auth.css
│	│   ├── quiz.css
│	│   └── style.css
│	├── app.js
│	├── authentication.js
│	├── firebaseConfig.js
│	├── goals.js
│	├── goalsPage.js
│	├── index.js
│	├── loginSignup.js
│	└── quiz.js
├── .firebaserc
├── .gitignore
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── goals.html
├── index.html
├── login.html
├── main.html
├── package-lock.json
├── package.json
├── quiz.html
├── README.md
├── signup.html
├── template.html
└── vite.config.js
```

---

## Important Files

- `src/firebaseConfig.js` — Firebase initialization; expects `VITE_` env variables.
- `src/authentication.js` — helper functions for auth state and login/signup handling.
- `src/goalsPage.js` / `src/app_goals.js` — UI logic for the Goals page (create/list/edit/delete goals).
- `src/goals.js` — smaller utilities related to a single goal and progress entries.
- `src/components/navbar.js` and `src/components/footer.js` — web components used across pages.
- `src/styles/style.css` — main site styles; page-specific CSS lives in `src/styles/`.

---

## Recommended Local Workflow

- Use `npm run dev` while developing (automatic reload).
- Keep Firebase environment values in a local `.env` with keys like `VITE_FIREBASE_API_KEY` (already ignored in `.gitignore`).
- If you rename or move components, update the HTML script tags that reference them (e.g., `/src/components/navbar.js`).

---

## Troubleshooting

- If components fail to load, check the browser console for 404s and adjust the script `src` paths in the HTML files.
- If Firestore operations fail, verify your `VITE_` env variables and Firebase project rules.
- If all else fails its a syntax error, for example:

### Example 1

**Wrong**:

```
This is an <br example         # Misisng ">"
```

**Correct**:

```
This is an <br> example
```

### Example 2

**Wrong**:

```
<span>Another example</span>
</span>                        # Duplicate closing tag
```

**Correct**:

```
<span>Another example</span>
```

### Example 3

**Wrong**:

```
<b>Last example                # Missing closing tag
```

**Correct**:

```
<b>Last example</b>
```

---

## Contributors

- **Hazen1Yang** _(Hazen Y.)_ - BCIT CST Student
- **Gamecoder3D** _(Matthew V.)_ - BCIT CST Student who loves videogames. Fun fact: my favorite color is orange.
- **wei-hao-chu** _(Vincent C.)_ - BCIT CST Student with a passion for outdoor adventures and user-friendly applications. Fun fact: Loves solving Rubik's Cubes in under a minute.
- **melinabcit OR mln-eia** _(Melina B.)_ - BCIT CST Student with a passion for outdoor adventures and user-friendly applications. Fun fact: Loves solving Rubik's Cubes in under a minute.

---

## Acknowledgments

- Images are free to use.
- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [FlatIcon](https://www.flaticon.com/).

---

## Limitations and Future Work

### Limitations

- No getting employers requirements

### Future Work

- Complete surveys.
- Set diferetn carrer path
- News

---

## License

This project is distributed under the CC BY-NC-SA License. See the LICENSE file for details.
