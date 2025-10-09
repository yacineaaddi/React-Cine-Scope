import { useState, useEffect } from "react";
const KEY = "eb9e69f";

export default function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, SetError] = useState("");
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          SetError("");
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Something went wrong");

          const data = await res.json();
          if (data.Response === "False") throw new Error("No Movies Found");
          setMovies(data.Search);
          SetError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            SetError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query?.length < 3) {
        setMovies([]);
        SetError("");
        return;
      }
      /*handleCloseMoviedetail();*/
      fetchMovies();
    },
    [query]
  );
  return { movies, isLoading, error };
}
