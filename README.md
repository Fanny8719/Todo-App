# Todo App (React + Supabase learning project)

**Stack:** React (Vite + TypeScript) · Supabase Auth (Google + email/password) · Supabase Postgres · Cloudflare hosting

## Run it

If you just cloned this repo, first copy the settings file and fill in your Supabase details:

```bash
cp .env.example .env.local
```

Then:

```bash
cd ~/Downloads/todo-app
npm install      # first time only, downloads React, Vite, TypeScript
npm run dev      # starts the dev server
```

Open the URL it prints (usually http://localhost:5173).

To try it on your phone, run `npm run dev -- --host` and open the "Network" URL on a phone that's on the same Wi-Fi.

## Roadmap

- [x] Stage 1. Project setup and UI with in-memory tasks
- [x] Stage 2. Supabase database, email/password sign-in, row-level security
- [x] Stage 2b. Mockup design ported to React (filters, progress, undo delete, account menu, password reset)
- [x] Stage 3. Google sign-in
- [ ] Stage 3b. Code on GitHub
- [ ] Stage 4. Mobile polish (optional PWA)
- [ ] Stage 5. Deploy to Cloudflare

## How the code fits together

```
index.html          the single HTML page, with an empty <div id="root">
src/main.tsx        starts React and renders <App /> into #root
src/App.tsx         watches the login session and picks which screen to show
src/lib/supabase.ts the shared Supabase client
src/types.ts        the Task type (matches the todo_tasks table)
src/components/
  AuthForm.tsx      sign in / create account
  TodoPage.tsx      loads tasks and does add/toggle/rename/delete/undo in the database
  UserMenu.tsx      avatar button and sign-out menu
  NewPasswordForm.tsx  shown after clicking a password-reset email link
  Icons.tsx         small SVG icons
  TaskForm.tsx      input box and Add button
  TaskList.tsx      loops over tasks
  TaskItem.tsx      one row with checkbox, edit and delete
src/index.css       mobile-first styles
supabase/migrations SQL that created the table and its security rules
.env.local          Supabase URL and publishable key (not committed to git)
```

## Stage 1 concepts

- **Components** are functions that return UI. App is built from TaskForm, TaskList and TaskItem.
- **State** (`useState`) is data that redraws the screen when it changes.
- **Props** pass data and functions from parent to child. Children never change the parent's state directly. They call the function they were handed.
- **Immutability.** We never edit the tasks array in place. `map`, `filter` and spreading (`...`) build a new array, which is how React notices the change.

Right now tasks live only in memory, so refreshing the page resets them. Stage 2 fixes that.

## Stage 2 concepts

- **Supabase client.** `supabase.from('todo_tasks').select()` reads like SQL, but it's an HTTPS request to Supabase's API.
- **async/await.** Talking to a server takes time. `await` pauses the function until the answer comes back, then we update the screen.
- **Sessions.** After sign-in, Supabase stores a token in the browser. Every database request sends it, so the database knows who's asking.
- **Row-level security (RLS).** The real lock. The browser code never filters by user. The database itself only returns, changes or deletes rows where `user_id = auth.uid()`. Even if someone copies the publishable key, they can't see anyone else's tasks.

## Deploy to Cloudflare

First time only:

```bash
npm install            # picks up wrangler, Cloudflare's command-line tool
npx wrangler login     # opens the browser so you can approve access
```

Every deploy after that:

```bash
npm run deploy         # builds the app, then uploads ./dist to Cloudflare
```

The app is live at **https://todo.fannycynthia.com** (custom domain, set in `wrangler.jsonc`) and also at `https://todo-app.fanny-cynthia.workers.dev`. Pushing to GitHub also redeploys automatically.

Then, in Supabase under Authentication → URL Configuration, set **Site URL** to that live address and add `https://todo-app.<your-subdomain>.workers.dev/**` to **Redirect URLs**. Keep the localhost entry so local development still works.

### How it works

- `npm run build` turns the React code into plain HTML, CSS and JS in `dist/`. The Supabase URL and key from `.env.local` are baked in at this point.
- `wrangler deploy` reads `wrangler.jsonc` and uploads `dist/` to Cloudflare's network.
- There's no server of our own. The browser talks straight to Supabase, and row-level security keeps each user's data private.
