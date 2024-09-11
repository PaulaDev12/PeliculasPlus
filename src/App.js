import React, { useEffect, useState } from 'react'
import './App.css';
import axios from 'axios'
import Youtube from 'react-youtube'
import image from './assets/pngwing.com (4).png';
import ScrollToTop from "react-scroll-to-top";


function App() {
  const API_URL = 'https://api.themoviedb.org/3'
  const API_KEY = '2d24dd88304a923821f2f388b13d5d23'
  const IMAGE_PATH = 'https://image.tmdb.org/t/p/original'
  const URL_IMAGE = 'https://image.tmdb.org/t/p/original'


  //variables de estado
  const [movies, setMovies] = useState([])
  const [searchKey, setSearchKey] = useState("")
  const [trailer, setTrailer] = useState(null);
  const [movie, setMovie] = useState({ title: "Loading Movies" });
  const [playing, setPlaying] = useState(false);
  const [suggestions, setSuggestions] = useState([])
  const [debouncedSearchKey, setDebouncedSearchKey] = useState(searchKey)
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const moviesPerPage = 6;


  //Constante para realizar a peticion por API
  const fetchMovies = async (searchKey) => {

    //esta constante sive para saber si estamos buscando una pelicula o no la estamos buscando
    const type = searchKey ? "search" : "discover"
    const { data: { results },
    } = await axios.get(`${API_URL}/${type}/movie`, {
      params: {
        api_key: API_KEY,
        query: searchKey,
      },
    });

    setMovies(results)
    setMovie(results[0])
    setSuggestions(results);

    if (results.length) {
      await fetchMovie(results[0].id)
    }
  }

  //Constante para buscar peliculas
  const searchMovies = (e) => {
    e.preventDefault();
    setSuggestions([]);
    fetchMovies(searchKey)
  }

  useEffect(() => {
    fetchMovies();
  }, [])


  //Constante para la peticion de un solo objeto y mostrar
  //en reproductor de video  
  const fetchMovie = async (id) => {
    const { data } = await axios.get(`${API_URL}/movie/${id}`, {
      params: {
        api_key: API_KEY,
        append_to_response: "videos"
      }
    })

    if (data.videos && data.videos.results) {
      const trailer = data.videos.results.find(
        (vid) => vid.name === "oficial trailer"
      );
      setTrailer(trailer ? trailer : data.videos.results[0])
    }
    setMovie(data)
  }

  useEffect(() => {
    if (debouncedSearchKey) {
      fetchMovies(debouncedSearchKey);
    }
  }, [debouncedSearchKey]);

  // Constante para seleccionar una película de las sugerencias
  const handleSuggestionClick = (title) => {
    setSearchKey(title);
    setSuggestions([]);
    fetchMovies(title);
    setSelectedMovie(null);
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchKey(searchKey);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchKey]);

  // Constante para llamar a la función de búsqueda cuando se actualiza el debouncedSearchKey
  useEffect(() => {
    if (debouncedSearchKey) {
      fetchMovies(debouncedSearchKey);
    }
  }, [debouncedSearchKey]);

  //Funciones para paginación
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);


  const nextPage = () => {
    if (currentPage < Math.ceil(movies.length / moviesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };



  return (
    <div className="bg-violet-100 ">
      <div className="container mx-auto py-4">

        {/* Titulo de la pagina y logo*/}
        <div className="flex ">
          <img src={image} className="w-20" />

          <p className="text-center text-6xl font-bold ml-10 font-mono
           mt-5 mb-5">PELICULAS START</p>
        </div>

        {/* Formulario de busqueda de peliculas */}
        <form className="flex flex-col items-center justify-center h-90 my-14 " onSubmit={searchMovies}>
          <div className="flex items-center space-x-12">
            <input
              className="border border-gray-300 rounded-full transition duration-300 ease-in-out hover:scale-110 justify-start items-start px-4 w-[800px] py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              type="text"
              placeholder="Buscar pelicula"
              onChange={(e) => setSearchKey(e.target.value)}

            />
            <button className="bg-purple-500 mx-8 transition duration-300 ease-in-out hover:scale-110 text-white px-4 py-2 mb-2 rounded hover:bg-blue-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50">
              Buscar
            </button>
          </div>
          

         {/* Lista de sugerencias de búsquedas */}
          <div className="flex flex-col items-center">
            {searchKey && suggestions.length > 0 && (
              <ul className="absolute z-50 border border-gray-300 w-1/3 bg-white rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {suggestions.map((movie) => (
                  <li
                    key={movie.id}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSuggestionClick(movie.title)}
                  >
                    {movie.title}
                  </li>
                ))}
              </ul>
            )}
          </div>


        </form>

        {/* Banner */}
        <div>
          <main>
            {movie ? (
              <div className="relative my-90 p-10 border-4 border-indigo-600">
                <div
                  className="relative h-[700px] w-full my-90 bg-cover bg-center mx-auto"
                  style={{
                    backgroundImage: `url("${IMAGE_PATH}${movie.backdrop_path}")`,
                  }}
                >
                  {/* Contenido sobre la imagen */}
                  <div className="absolute bottom-0 left-0 flex flex-col justify-end items-start text-left space-y-4 p-8 bg-gradient-to-t from-black via-transparent to-transparent w-full h-full">
                    {/* Título de la película */}
                    <h1 className="text-white text-4xl font-bold bg-black bg-opacity-50 p-4 rounded-lg">
                      {movie.title}
                    </h1>

                    {/* Descripción de la película */}
                    <p className="text-white bg-black bg-opacity-50 p-4 rounded-lg max-w-lg">
                      {movie.overview}
                    </p>

                    <p className="text-white bg-black bg-opacity-50 p-4 rounded-lg">
                      <strong>Puntuación:</strong> {movie.vote_average} / 10
                    </p>

                    {/* Fecha de lanzamiento */}
                    <p className="text-white bg-black bg-opacity-50 p-4 rounded-lg">
                      <strong>Fecha de lanzamiento:</strong> {movie.release_date}
                    </p>

                    {/* Botón de reproducir */}
                    {trailer ? (
                      <button
                        class="bg-transparent hover:bg-indigo-700 text-white font-semibold hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded"
                        onClick={() => setPlaying(true)}
                        type="button"
                      >
                        Reproducir video
                      </button>
                    ) : (
                      <p className="text-white font-semibold">No hay infromación de este trailer</p>
                    )}
                  </div>
                </div>

                {/* YouTube Video */}
                {playing && trailer && (
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 z-50">
                    <Youtube
                      videoId={trailer.key}
                      className="h-[500px] w-[60%]"
                      containerClassName={"youtube-container"}
                      opts={{
                        width: "100%",
                        height: "100%",
                        playerVars: {
                          autoplay: 1,
                          controls: 1,
                          cc_load_policy: 0,
                          modestbranding: 1,
                          rel: 0,
                          showinfo: 0,
                        },
                      }}
                    />
                    <button
                      onClick={() => setPlaying(false)}
                      className="absolute top-4 right-4 bg-transparent hover:bg-indigo-700 text-white font-bold py-2 px-4 border border-black-500 hover:border-transparent rounded"
                    >
                      Cerrar video
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </main>
        </div>


        {/* Resultado de peliculas buscadas */}
        <div className="grid grid-cols-1 my-10 md:grid-cols-3 border-4 border-indigo-600 p-14 gap-8">
          {currentMovies.map((movie) => (
            <div
              key={movie.id}
              className="relative text-center transition duration-300 ease-in-out hover:scale-110 cursor-pointer"
              onClick={() => setSelectedMovie(movie)}
            >
              <img
                src={`${URL_IMAGE + movie.poster_path}`}
                alt={movie.title}
                className="mx-auto rounded-lg"
                height={400}
                width="90%"
              />
              <h1 className="text-lg font-bold mt-2">{movie.title}</h1>

              {/* Detalles de la película que fue seleccionada */}
              {selectedMovie && selectedMovie.id === movie.id && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-75 flex flex-col justify-center items-center text-white p-5 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">{selectedMovie.title}</h2>
                  <p className="mb-2"><strong>Descripción:</strong> {selectedMovie.overview}</p>
                  <p className="mb-2"><strong>Fecha de lanzamiento:</strong> {selectedMovie.release_date}</p>
                  <p><strong>Puntuación:</strong> {selectedMovie.vote_average} / 10</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-6 py-4 mx-4 rounded text-lg ${currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'}`}
          >
            <span className="sr-only"></span>
            <svg className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>

          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {[...Array(Math.ceil(movies.length / moviesPerPage)).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => setCurrentPage(number + 1)}
                className={`relative inline-flex items-center px-6 py-4 text-lg font-semibold ${currentPage === number + 1 ? 'bg-indigo-600 text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'}`}
              >
                {number + 1}
              </button>
            ))}
          </nav>

          <button
            onClick={nextPage}
            disabled={currentPage === Math.ceil(movies.length / moviesPerPage)}
            className={`px-6 py-4 mx-4 rounded text-lg ${currentPage === Math.ceil(movies.length / moviesPerPage) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'}`}
          >
            <span className="sr-only"></span>
            <svg className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Boton de scroll para subir al comienzo de la pagina */}
        <div className="App bg-indigo-200  hover:shadow-[0_0_10px_rgba(75,0,130,0.8)] transition duration-300 ease-in-out">
          <ScrollToTop smooth color="#000" style={{
                backgroundColor: "#9F7AEA", borderRadius: "50%", padding: "7px",
            boxShadow: "0 0 10px rgba(75, 0, 130, 0.4)",
            transition: "box-shadow 0.3s ease-in-out"
          }}
              className="hover:scale-110 hover:shadow-[0_0_10px_rgba(75,0,130,0.8)]" 

          />
          
          <p style={{ marginTop: "9vh" }}></p>
        </div>

        {/* Creditos */}
        <div className="flex flex-col items-center justify-centern mt-14 mb-4">
          <p className="text-2xl font-bold font-mono">Dearrollado por Paula Arias</p>
          <a className="text-2xl mt-2 font-mono hover:text-indigo-800 hover:shadow-[0_0_10px_rgba(75,0,130,0.8)] transition duration-300 ease-in-out"

            href="https://github.com/PaulaDev12">GitHub: PaulaDev12</a>

        </div>

      </div>
    </div>

  );
}

export default App;
