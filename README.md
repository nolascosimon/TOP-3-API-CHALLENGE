# Flicker 🎬

A movie discovery app for the Third Party API Top 3 Challenge — Team Movies and TV Shows, built on TMDB.

**Live App:** [nolascolabtop3apichallenge.vercel.app](https://nolascolabtop3apichallenge.vercel.app/)
**Author:** Simon Nolasco

## What it is

Pick a genre from the rail on the left, and a shelf of posters fills in. Click a poster and it takes over the "Now Screening" panel — its backdrop image, title, rating, and synopsis — while a soft, blurred version of the same image tints the rest of the page. Add whatever you like to your list, and it's still there next time you open the app.

## Files

File,What's in it
index.html,Page structure
style.css,All styling
app.js,Everything the app does
config.sample.js,Template for your TMDB API key configuration
config.js (local only),Created locally from config.sample.js to store your API key

## Running it

1. Get a free key at themoviedb.org/settings/api.
2. Copy `config.sample.js` to a new file named `config.js`.
3. Open `config.js` and paste your key in place of the placeholder text.
4. Double-click `index.html` to open it in your browser. No server, no install, no build step.

`config.js` is listed in `.gitignore` so your real key never gets committed to this repo. `config.sample.js` is the template everyone else should copy.

## Deploying it

Drag the folder into Netlify, Vercel, or GitHub Pages — any static host works, since it's plain HTML/CSS/JS with no backend.

`config.js` isn't tracked by git, so when you deploy, make sure your actual `config.js` (with your real key) exists in the folder you're deploying from — it just won't show up on GitHub. Because there's no backend, the key still ships in plain view once the site is live and someone views the page source. That's the accepted trade-off named in the assignment brief for a read-only public movie database — TMDB keys are free and easy to regenerate if that ever matters to you. Keeping it out of the GitHub repo just avoids it sitting in your commit history in plain text.

## TMDB endpoints used

- `genre/movie/list` — fills the genre rail
- `discover/movie` — pulls a fresh, randomly-paged batch of movies for the selected genre
- Poster and backdrop images come straight from TMDB's image CDN, no extra endpoint needed

This product uses the TMDB API but is not endorsed or certified by TMDB.
