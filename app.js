const TMDB_BASE = "https://api.themoviedb.org/3";
const POSTER_URL = "https://image.tmdb.org/t/p/w342";
const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

const state = {
  genreId: "",
  genreName: "Popular right now",
  movies: [],
  selected: null,
  castCache: {},
  watchlist: JSON.parse(localStorage.getItem("flicker-watchlist") || "[]")
};

const els = {
  genreRail: document.getElementById("genre-rail"),
  shelf: document.getElementById("shelf"),
  shelfHeading: document.getElementById("shelf-heading"),
  screenBackdrop: document.getElementById("screen-backdrop"),
  screenTitle: document.getElementById("screen-title"),
  screenMeta: document.getElementById("screen-meta"),
  screenOverview: document.getElementById("screen-overview"),
  ambient: document.getElementById("ambient"),
  saveBtn: document.getElementById("save-btn"),
  trailerBtn: document.getElementById("trailer-btn"),
  reelBtn: document.getElementById("reel-btn"),
  watchlistToggle: document.getElementById("watchlist-toggle"),
  watchlistCount: document.getElementById("watchlist-count"),
  drawer: document.getElementById("drawer"),
  drawerBody: document.getElementById("drawer-body"),
  drawerClose: document.getElementById("drawer-close"),
  scrim: document.getElementById("scrim"),
  castBtn: document.getElementById("cast-btn"),
  castBackdrop: document.getElementById("cast-backdrop"),
  castClose: document.getElementById("cast-close"),
  castModalTitle: document.getElementById("cast-modal-title"),
  castModalMeta: document.getElementById("cast-modal-meta"),
  castModalOverview: document.getElementById("cast-modal-overview"),
  castModalCast: document.getElementById("cast-modal-cast")
};

async function fetchTmdb(path, params) {
  const url = new URL(`${TMDB_BASE}/${path}`);
  url.searchParams.set("api_key", CONFIG.TMDB_API_KEY);
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== "") {
      url.searchParams.set(key, params[key]);
    }
  }
  const response = await fetch(url.toString());
  return response.json();
}

function saveWatchlist() {
  localStorage.setItem("flicker-watchlist", JSON.stringify(state.watchlist));
  els.watchlistCount.textContent = state.watchlist.length;
}

function isSaved(id) {
  return state.watchlist.some((item) => item.id === id);
}

function toggleWatchlist(movie) {
  if (isSaved(movie.id)) {
    state.watchlist = state.watchlist.filter((item) => item.id !== movie.id);
  } else {
    state.watchlist.push({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      overview: movie.overview
    });
  }
  saveWatchlist();
  renderScreen();
  if (!els.drawer.hidden) renderDrawer();
}

async function loadGenres() {
  const data = await fetchTmdb("genre/movie/list", {});
  const genres = data.genres || [];
  els.genreRail.innerHTML = "";
  els.genreRail.appendChild(makeGenreButton("", "Popular right now"));
  genres.forEach((genre) => {
    els.genreRail.appendChild(makeGenreButton(genre.id, genre.name));
  });
  setActiveGenre("");
}

function makeGenreButton(id, name) {
  const btn = document.createElement("button");
  btn.className = "genre-btn";
  btn.textContent = name;
  btn.dataset.id = id;
  btn.addEventListener("click", () => {
    state.genreId = id;
    state.genreName = name;
    setActiveGenre(id);
    loadMovies();
  });
  return btn;
}

function setActiveGenre(id) {
  [...els.genreRail.children].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === String(id));
  });
}

async function loadMovies() {
  const randomPage = Math.floor(Math.random() * 8) + 1;
  const data = await fetchTmdb("discover/movie", {
    with_genres: state.genreId,
    sort_by: "popularity.desc",
    page: randomPage
  });
  state.movies = (data.results || []).filter((movie) => movie.poster_path);
  els.shelfHeading.textContent = state.genreName;
  renderShelf();
  if (state.movies.length) selectMovie(state.movies[0]);
}

function renderShelf() {
  els.shelf.innerHTML = "";
  state.movies.forEach((movie) => {
    const tile = document.createElement("button");
    tile.className = "tile";
    if (state.selected && state.selected.id === movie.id) tile.classList.add("selected");
    tile.innerHTML = `
      <img src="${POSTER_URL}${movie.poster_path}" alt="${movie.title}" />
      <div class="tile-caption">
        <span class="tile-title">${movie.title}</span>
        <p class="tile-overview">${movie.overview || "No synopsis available."}</p>
        <p class="tile-cast"></p>
      </div>
    `;
    tile.addEventListener("click", () => selectMovie(movie));
    tile.addEventListener("mouseenter", () => {
      const castEl = tile.querySelector(".tile-cast");
      if (!castEl.textContent) loadCast(movie, castEl);
    });
    els.shelf.appendChild(tile);
  });
}

async function getCastNames(movie) {
  if (state.castCache[movie.id]) return state.castCache[movie.id];
  const data = await fetchTmdb(`movie/${movie.id}/credits`, {});
  const names = (data.cast || []).slice(0, 3).map((c) => c.name).join(", ");
  state.castCache[movie.id] = names || "Cast not listed";
  return state.castCache[movie.id];
}

async function loadCast(movie, castEl) {
  castEl.textContent = state.castCache[movie.id] || "Loading cast…";
  castEl.textContent = await getCastNames(movie);
}

function selectMovie(movie) {
  state.selected = movie;
  renderScreen();
  loadTrailer(movie);
  [...els.shelf.children].forEach((tile, i) => {
    tile.classList.toggle("selected", state.movies[i] && state.movies[i].id === movie.id);
  });
}

async function loadTrailer(movie) {
  els.trailerBtn.hidden = true;
  const data = await fetchTmdb(`movie/${movie.id}/videos`, {});
  const trailer = (data.results || []).find((v) => v.site === "YouTube" && v.type === "Trailer");
  if (trailer && state.selected && state.selected.id === movie.id) {
    els.trailerBtn.hidden = false;
    els.trailerBtn.onclick = () => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
  }
}

function renderScreen() {
  const movie = state.selected;
  if (!movie) return;
  const image = movie.backdrop_path || movie.poster_path;
  const imageUrl = image ? `${BACKDROP_URL}${image}` : "";
  els.screenBackdrop.style.backgroundImage = imageUrl ? `url(${imageUrl})` : "none";
  els.ambient.style.backgroundImage = imageUrl ? `url(${imageUrl})` : "none";
  els.screenTitle.textContent = movie.title;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
  els.screenMeta.textContent = `${year} • ${rating} / 10`;
  els.screenOverview.textContent = movie.overview || "No synopsis available yet.";
  els.saveBtn.textContent = isSaved(movie.id) ? "Saved" : "Add to list";
  els.saveBtn.classList.toggle("saved", isSaved(movie.id));
}

function renderDrawer() {
  if (state.watchlist.length === 0) {
    els.drawerBody.innerHTML = `<p class="drawer-empty">Nothing saved yet. Add something from the screen.</p>`;
    return;
  }
  els.drawerBody.innerHTML = "";
  state.watchlist.forEach((movie) => {
    const row = document.createElement("div");
    row.className = "watch-row";
    row.innerHTML = `
      <img src="${POSTER_URL}${movie.poster_path}" alt="${movie.title}" />
      <button class="watch-row-title">${movie.title}</button>
      <button class="watch-remove">&times;</button>
    `;
    row.querySelector(".watch-row-title").addEventListener("click", () => {
      selectMovie(movie);
      closeDrawer();
    });
    row.querySelector(".watch-remove").addEventListener("click", () => toggleWatchlist(movie));
    els.drawerBody.appendChild(row);
  });
}

function openDrawer() {
  renderDrawer();
  els.drawer.hidden = false;
  els.scrim.hidden = false;
}

function closeDrawer() {
  els.drawer.hidden = true;
  els.scrim.hidden = true;
}

els.saveBtn.addEventListener("click", () => {
  if (state.selected) toggleWatchlist(state.selected);
});
els.reelBtn.addEventListener("click", loadMovies);
els.watchlistToggle.addEventListener("click", openDrawer);
els.drawerClose.addEventListener("click", closeDrawer);
els.scrim.addEventListener("click", closeDrawer);

els.castBtn.addEventListener("click", openCastModal);
els.castClose.addEventListener("click", closeCastModal);
els.castBackdrop.addEventListener("click", (event) => {
  if (event.target === els.castBackdrop) closeCastModal();
});

async function openCastModal() {
  const movie = state.selected;
  if (!movie) return;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";
  els.castModalTitle.textContent = movie.title;
  els.castModalMeta.textContent = `${year} • ${rating} / 10`;
  els.castModalOverview.textContent = movie.overview || "No synopsis available yet.";
  els.castModalCast.textContent = "Loading cast…";
  els.castBackdrop.hidden = false;
  els.castModalCast.textContent = "Starring: " + (await getCastNames(movie));
}

function closeCastModal() {
  els.castBackdrop.hidden = true;
}

saveWatchlist();
loadGenres().then(loadMovies);
