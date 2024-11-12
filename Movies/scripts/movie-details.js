document.addEventListener('DOMContentLoaded', () => {
    //Getting id from index.html
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        console.error('Movie ID is missing in the URL');
        return;
    }

    //links
    const API_KEY = '39a63f914f6579c45ebb12633322d305';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const movieDetailsUrl = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`;
    const movieCreditsUrl = `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`;

    async function fetchApiData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch data');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    }
    //getting movie details
    async function getMovieDetails() {
        const movieData = await fetchApiData(movieDetailsUrl);
        if (movieData) {
            displayMovieDetails(movieData);
            getMovieCredits();  
        }
    }

    async function getMovieCredits() {
        const creditsData = await fetchApiData(movieCreditsUrl);
        if (creditsData) {
            displayActors(creditsData.cast);
        }
    }

    //getting actors
    function displayMovieDetails(movie) {
        const movieWrapper = document.querySelector('.movie__wrapper');
        if (movieWrapper && movie.backdrop_path) {
            movieWrapper.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`;
        }

        document.querySelector('.details .title').textContent = movie.title;
        document.querySelector('.release-date').textContent = `Release Date: ${movie.release_date}`;
        document.querySelector('.genres').textContent = `Genres: ${movie.genres.map(genre => genre.name).join(', ')}`;
        document.querySelector('.grade').textContent = `${movie.vote_average}/10`;
        document.querySelector('.description').textContent = movie.overview;

        const trailerBtn = document.querySelector('.trailer-btn');
        trailerBtn.addEventListener('click', () => openTrailer(movie.id));
    }

    async function openTrailer(movieId) {
        const trailerUrl = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`;
        const trailerData = await fetchApiData(trailerUrl);
        if (trailerData) {
            const trailer = trailerData.results.find(video => video.type === "Trailer" && video.site === "YouTube");
            if (trailer) {
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
            } else {
                alert('Trailer not available');
            }
        }
    }

    //displaying actors
    function displayActors(actors) {
        const actorsContainer = document.querySelector('.actors');
        actorsContainer.innerHTML = '';  

        actors.slice(0, 10).forEach(actor => { 
            const actorElement = document.createElement('div');
            actorElement.classList.add('actor');

            const imageUrl = actor.profile_path 
                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                : 'path/to/placeholder-image.jpg';

            actorElement.innerHTML = `
                <div class="actor__image">
                    <img src="${imageUrl}" alt="${actor.name}">
                </div>
                <div class="actor__name">${actor.name}</div>
                <div class="actor__character">as ${actor.character}</div>
            `;

            actorsContainer.appendChild(actorElement);
        });
    }

    getMovieDetails();
});
