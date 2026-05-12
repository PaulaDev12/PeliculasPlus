import React, { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
import Youtube from 'react-youtube'
import ScrollToTop from 'react-scroll-to-top'

const API_URL = 'https://api.themoviedb.org/3'
const API_KEY = '2d24dd88304a923821f2f388b13d5d23'
const IMAGE_PATH = 'https://image.tmdb.org/t/p/original'
const POSTER_PATH = 'https://image.tmdb.org/t/p/w500'

const GENRES = [
  { id: 28, name: 'Acción', icon: '🚀' },
  { id: 12, name: 'Aventura', icon: '🧭' },
  { id: 35, name: 'Comedia', icon: '😄' },
  { id: 18, name: 'Drama', icon: '🎭' },
  { id: 27, name: 'Terror', icon: '👻' },
  { id: 878, name: 'Ciencia Ficción', icon: '🛸' },
  { id: 16, name: 'Animación', icon: '✨' },
  { id: 10749, name: 'Romance', icon: '💜' },
]

function MovieCard({ movie, isNew, onPlay }) {
  return (
    <div
      className="relative group cursor-pointer rounded-xl overflow-hidden"
      style={{ backgroundColor: '#1a1a2e' }}
      onClick={() => onPlay(movie)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
        {movie.poster_path ? (
          <img
            src={`${POSTER_PATH}${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#2a2a3e' }}>
            <span className="text-4xl">🎬</span>
          </div>
        )}

        {isNew && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded"
            style={{ backgroundColor: '#8B5CF6', color: 'white' }}
          >
            NUEVO
          </span>
        )}

        {movie.vote_average > 0 && (
          <span
            className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#FBBF24' }}
          >
            ★ {movie.vote_average.toFixed(1)}
          </span>
        )}

        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{ backgroundColor: 'rgba(0,0,0,0)', opacity: 0 }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = '0' }}
        >
          <span className="text-white text-4xl">▶</span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
        <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
          {movie.release_date?.split('-')[0]}
        </p>
      </div>
    </div>
  )
}

function App() {
  const [popularMovies, setPopularMovies] = useState([])
  const [newMovies, setNewMovies] = useState([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [searchKey, setSearchKey] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [trailer, setTrailer] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [activeNav, setActiveNav] = useState('Inicio')
  const [myList, setMyList] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/movie/popular`, { params: { api_key: API_KEY, language: 'es-ES' } })
      .then(r => setPopularMovies(r.data.results))
    axios.get(`${API_URL}/movie/now_playing`, { params: { api_key: API_KEY, language: 'es-ES' } })
      .then(r => setNewMovies(r.data.results))
  }, [])

  // Auto-rotate hero every 5s
  useEffect(() => {
    if (!popularMovies.length) return
    const t = setInterval(() => setHeroIndex(i => (i + 1) % Math.min(popularMovies.length, 7)), 5000)
    return () => clearInterval(t)
  }, [popularMovies])

  // Search debounce
  useEffect(() => {
    if (!searchKey) { setSuggestions([]); return }
    const t = setTimeout(() => {
      axios.get(`${API_URL}/search/movie`, { params: { api_key: API_KEY, query: searchKey, language: 'es-ES' } })
        .then(r => setSuggestions(r.data.results.slice(0, 6)))
    }, 400)
    return () => clearTimeout(t)
  }, [searchKey])

  const fetchAndPlay = async (movie) => {
    const { data } = await axios.get(`${API_URL}/movie/${movie.id}`, {
      params: { api_key: API_KEY, append_to_response: 'videos' }
    })
    if (data.videos?.results?.length) {
      const t = data.videos.results.find(v => v.name.toLowerCase().includes('trailer')) || data.videos.results[0]
      setTrailer(t)
      setPlaying(true)
    }
  }

  const toggleMyList = (movie) => {
    setMyList(prev =>
      prev.find(m => m.id === movie.id) ? prev.filter(m => m.id !== movie.id) : [...prev, movie]
    )
  }

  const getGenre = (ids) => {
    const g = GENRES.find(g => ids?.includes(g.id))
    return g ? g.name : ''
  }

  const heroMovie = popularMovies[heroIndex]
  const heroCount = Math.min(popularMovies.length, 7)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0d1a', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'rgba(13,13,26,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        className="flex items-center justify-between px-8 py-4">

        <div className="flex items-center gap-2">
          <span style={{ fontSize: '1.4rem' }}>🎬</span>
          <span className="font-bold" style={{ fontSize: '1.1rem', color: 'white' }}>PELICULAS</span>
          <span className="font-bold" style={{ fontSize: '1.1rem', color: '#8B5CF6' }}>START</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Inicio', 'Películas', 'Géneros', 'Estrenos', 'Mi Lista'].map(item => (
            <button key={item} onClick={() => setActiveNav(item)}
              style={{
                fontSize: '0.9rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
                color: activeNav === item ? 'white' : '#9ca3af',
                borderBottom: activeNav === item ? '2px solid #8B5CF6' : '2px solid transparent',
                paddingBottom: '2px', transition: 'color 0.2s'
              }}>
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar películas..."
              value={searchKey}
              onChange={e => setSearchKey(e.target.value)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '9999px', color: 'white', fontSize: '0.875rem',
                padding: '8px 40px 8px 16px', width: '200px', outline: 'none',
              }}
              onFocus={e => { e.target.style.width = '260px'; e.target.style.borderColor = '#8B5CF6' }}
              onBlur={e => { if (!searchKey) { e.target.style.width = '200px'; e.target.style.borderColor = 'rgba(255,255,255,0.15)' } }}
            />
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.9rem' }}>🔍</span>

            {searchKey && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', marginTop: '8px', right: 0, width: '280px', backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100 }}>
                {suggestions.map(m => (
                  <div key={m.id}
                    onClick={() => { setSearchKey(''); setSuggestions([]) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <img src={`${POSTER_PATH}${m.poster_path}`} alt={m.title} style={{ width: '32px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'white', margin: 0 }}>{m.title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{m.release_date?.split('-')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem' }}>
            👤
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      {heroMovie && (
        <div style={{ position: 'relative', height: '600px', marginTop: '0', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${IMAGE_PATH}${heroMovie.backdrop_path})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            transition: 'background-image 0.6s ease'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(13,13,26,0.97) 30%, rgba(13,13,26,0.5) 65%, rgba(13,13,26,0.15) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,26,1) 0%, transparent 45%)' }} />
          </div>

          {/* Arrow left */}
          <button onClick={() => setHeroIndex(i => (i - 1 + heroCount) % heroCount)}
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ‹
          </button>

          {/* Arrow right */}
          <button onClick={() => setHeroIndex(i => (i + 1) % heroCount)}
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ›
          </button>

          {/* Hero content */}
          <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', padding: '0 64px 64px' }}>
            <span style={{ display: 'inline-block', marginBottom: '16px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', border: '1px solid rgba(255,255,255,0.45)', borderRadius: '4px', color: 'rgba(255,255,255,0.85)', width: 'fit-content' }}>
              DESTACADA
            </span>

            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.1, maxWidth: '600px' }}>
              {heroMovie.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>{heroMovie.release_date?.split('-')[0]}</span>
              {getGenre(heroMovie.genre_ids) && (
                <>
                  <span style={{ color: '#6b7280' }}>•</span>
                  <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>{getGenre(heroMovie.genre_ids)}</span>
                </>
              )}
              <span style={{ color: '#6b7280' }}>•</span>
              <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>7+</span>
              <span style={{ padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', color: 'rgba(255,255,255,0.8)' }}>HD</span>
            </div>

            <p style={{ color: '#d1d5db', maxWidth: '440px', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '28px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {heroMovie.overview}
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={() => fetchAndPlay(heroMovie)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#8B5CF6', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                ▶ Ver ahora
              </button>

              <button onClick={() => toggleMyList(heroMovie)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
                {myList.find(m => m.id === heroMovie.id) ? '✓ En Mi Lista' : '+ Mi Lista'}
              </button>
            </div>
          </div>

          {/* Dots */}
          <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
            {Array.from({ length: heroCount }).map((_, i) => (
              <button key={i} onClick={() => setHeroIndex(i)}
                style={{ height: '8px', width: i === heroIndex ? '24px' : '8px', borderRadius: '4px', backgroundColor: i === heroIndex ? '#8B5CF6' : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ padding: '40px 64px 64px', backgroundColor: '#0d0d1a' }}>

        {/* POPULARES */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔥 Populares
            </h2>
            <button style={{ color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ver todas →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {popularMovies.slice(0, 6).map(m => (
              <MovieCard key={m.id} movie={m} onPlay={fetchAndPlay} myList={myList} />
            ))}
          </div>
        </section>

        {/* GÉNEROS */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎭 Géneros
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {GENRES.map(g => (
              <button key={g.id}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '9999px', color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#c4b5fd' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}>
                <span>{g.icon}</span>{g.name}
              </button>
            ))}
          </div>
        </section>

        {/* ESTRENOS */}
        <section style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚡ Estrenos
            </h2>
            <button style={{ color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ver todas →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {newMovies.slice(0, 6).map(m => (
              <MovieCard key={m.id} movie={m} isNew onPlay={fetchAndPlay} myList={myList} />
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{ borderRadius: '20px', padding: '48px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #3b0764 0%, #4C1D95 40%, #7C3AED 100%)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontSize: '3.5rem', flexShrink: 0 }}>🍿</span>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px' }}>
                ¿Listo para ver tu próxima película favorita?
              </h3>
              <p style={{ color: '#c4b5fd', margin: 0, fontSize: '0.9rem' }}>
                Explora miles de películas y disfruta donde quieras, cuando quieras.
              </p>
            </div>
          </div>
          <button style={{ padding: '14px 32px', backgroundColor: '#8B5CF6', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 0 30px rgba(139,92,246,0.4)', transition: 'opacity 0.2s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Explorar catálogo →
          </button>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#07070f', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '56px 64px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '40px', marginBottom: '48px' }}>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.3rem' }}>🎬</span>
              <span style={{ fontWeight: 700, color: 'white' }}>PELICULAS</span>
              <span style={{ fontWeight: 700, color: '#8B5CF6' }}>START</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '24px' }}>
              Tu destino para descubrir, guardar y disfrutar las mejores películas en un solo lugar.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { label: 'f', title: 'Facebook' },
                { label: '𝕏', title: 'Twitter' },
                { label: '📷', title: 'Instagram' },
                { label: '⌥', title: 'GitHub' },
              ].map((s) => (
                <button key={s.title} title={s.title}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7C3AED'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: '20px', fontSize: '0.95rem' }}>Explorar</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Películas', 'Estrenos', 'Géneros', 'Populares'].map(link => (
                <li key={link} style={{ marginBottom: '10px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.875rem', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: '20px', fontSize: '0.95rem' }}>Soporte</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Centro de ayuda', 'Términos de uso', 'Privacidad', 'Contacto'].map(link => (
                <li key={link} style={{ marginBottom: '10px' }}>
                  <button style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.875rem', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}>
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: '8px', fontSize: '0.95rem' }}>Newsletter</h4>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '16px' }}>
              Recibe recomendaciones y novedades cada semana.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="email" placeholder="Tu email"
                style={{ flex: 1, padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.875rem', outline: 'none' }} />
              <button
                style={{ padding: '10px 18px', backgroundColor: '#8B5CF6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Suscribirse
              </button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#4b5563', fontSize: '0.8rem', margin: 0 }}>
            © 2024 Películas Start. Todos los derechos reservados. ❤️ Hecho con pasión por el cine
          </p>
        </div>
      </footer>

      {/* ── TRAILER MODAL ── */}
      {playing && trailer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.88)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '900px', padding: '0 32px' }}>
            <button onClick={() => { setPlaying(false); setTrailer(null) }}
              style={{ position: 'absolute', top: '-44px', right: '32px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✕ Cerrar
            </button>
            <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}>
              <Youtube
                videoId={trailer.key}
                style={{ width: '100%', height: '100%' }}
                opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1, controls: 1, modestbranding: 1, rel: 0 } }}
              />
            </div>
          </div>
        </div>
      )}

      <ScrollToTop smooth color="#fff" style={{
        backgroundColor: '#8B5CF6', borderRadius: '50%', padding: '8px',
        boxShadow: '0 0 20px rgba(139,92,246,0.5)'
      }} />
    </div>
  )
}

export default App
