import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating";
import useMovies from "./useMovies";
import useLocalStorageState from "./useLocalStorageState";
/*
const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];*/
const KEY = "eb9e69f";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [watched, setWatched] = useLocalStorageState([], "watched"); /*
  const [watched, setWatched] = useState(function () {
    const watchedMovie = localStorage.getItem("Watched");
    return JSON.parse(watchedMovie);
  });*/
  /* const [watched, setWatched] = useState(tempWatchedData);*/

  const [query, setQuery] = useState("");
  const [selectedMovie, SetselectedMovie] = useState("");
  const { movies, isLoading, error } = useMovies(query);

  function handleSetselectedMovie(id) {
    SetselectedMovie((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMoviedetail() {
    SetselectedMovie(null);
  }
  function handleAddWached(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleDeleteWatchedMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main movies={movies}>
        <Box>
          {/*isLoading ? <Loader /> : <MovieList movies={movies} />*/}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} OnSelectMovie={handleSetselectedMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedMovie ? (
            <MovieDetails
              selectedMovie={selectedMovie}
              onCloseMovie={handleCloseMoviedetail}
              onAddWatched={handleAddWached}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                OnDeleteMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="Loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <div className="error">
      <span>🛑 </span>
      {message}
    </div>
  );
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🎞️</span>
      <h1>Cine Scope</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keydown", callback);
      return () => document.removeEventListener("keydown", callback);
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieDetails({ selectedMovie, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const countRef = useRef(0);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  const isWatched = watched
    .map((watched) => watched.imdbID)
    .includes(selectedMovie);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedMovie
  )?.userRating;

  //Add feature of counting user rates
  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );
  // Add feature to add movies to watched list

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedMovie,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: parseInt(runtime),
      userRating,
      CountRatingDesicions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // Use useEffect cleanup function to reset title

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "Cine Scope";
      };
    },
    [title]
  );

  // Enable closing movie details with ESC keypress

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedMovie}`
        );
        const data = await res.json();
        setMovie(data);
        console.log(data);
        setIsLoading(false);
      }

      getMovieDetails();
    },
    [selectedMovie]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released}&nbsp; &bull; &nbsp;
                {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    OnSetRating={setUserRating}
                    size={24}
                  />
                  {userRating && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  Already added to watched list and rated {watchedUserRating}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <div className="movie-desc">
              <p>
                <em>{plot}</em>
              </p>
              <p>Starring {actors}</p>
              <p>Directed by {director}</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
/*
function WatchedBox() {
  const [isOpen2, setIsOpen2] = useState(true);
  const [watched, setWatched] = useState(tempWatchedData);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMovieList watched={watched} />
        </>
      )}
    </div>
  );
}
function ListBox({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}
*/
function MovieList({ movies, OnSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} OnSelectMovie={OnSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, OnSelectMovie }) {
  return (
    <li onClick={() => OnSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(0)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, OnDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          OnDeleteMovie={OnDeleteMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, OnDeleteMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => OnDeleteMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
