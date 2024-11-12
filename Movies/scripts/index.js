//Ссылки

const API_KEY = '39a63f914f6579c45ebb12633322d305';
const BASE_URL = 'https://api.themoviedb.org/3';
const FAMOUS_API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
const OTHER_API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US`;
const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=`;

const searchInput = document.getElementById('movie-search');
const suggestionsList = document.getElementById('suggestions-list');


//Карусели и их ссылки 
const carouselsData = [
    {
        title: "Famous Movies",
        icon: "images/direct.svg",
        apiUrl: FAMOUS_API_URL, 
        className: "famous__carousel"
    },
    {
        title: "Horror Movies",
        icon: "images/direct.svg",
        apiUrl: `${OTHER_API_URL}&with_genres=27&page=1`,
        className: "comedy__carousel"
    },
    {
        title: "Fantazy Movies",
        icon: "images/direct.svg",
        apiUrl: `${OTHER_API_URL}&with_genres=14&page=1`,
        className: "fantazy__carousel"
    },
    {
        title: "Comedy Movies",
        icon: "images/direct.svg",
        apiUrl: `${OTHER_API_URL}&with_genres=35&page=1`,
        className: "comedy__carousel"
    },
    {
        title: "Animation Movies",
        icon: "images/direct.svg",
        apiUrl: `${OTHER_API_URL}&with_genres=16&page=1`,
        className: "animation__carousel"
    },
    {
        title: "TV Movies",
        icon: "images/direct.svg",
        apiUrl: `${OTHER_API_URL}&with_genres=10770&page=1`,
        className: "tv__carousel"
    }
];


//Create Carousel
async function createCarousel({ title, icon, apiUrl, className }) {
    const section = document.createElement("section");
    section.className = className;

    section.innerHTML = `
        <div class="container">
            <div class="carousel__wrapper">
                <div class="carousel__title">
                    <img src="${icon}" alt="${title} Icon">
                    <div class="title">${title}</div>
                </div>
                <div class="carousel"></div>
            </div>
        </div>
    `;

    document.getElementById("carousel-container").appendChild(section);

    const carouselElement = section.querySelector(".carousel");
    await fetchMovies(apiUrl, carouselElement);
}

//Get Movies
async function fetchMovies(apiUrl, carouselElement) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const movies = data.results;

        carouselElement.innerHTML = '';

        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("card");
            movieCard.dataset.movieId = movie.id;  

            const movieLink = document.createElement("a");
            movieLink.href = `/movie-details.html?id=${movie.id}`; 

            movieLink.innerHTML = `
                <div class="card__image">
                    <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                </div>
                <div class="card__title">${movie.title}</div>
                <div class="card__addition">
                    <div class="card__year">${movie.release_date.split('-')[0]}</div>
                    <div class="card__genre">${Math.round(movie.vote_average)}/10</div>
                </div>
            `;

            movieCard.appendChild(movieLink);
            carouselElement.appendChild(movieCard);
        });

    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}


carouselsData.forEach(createCarousel);

//Searching Button
document.querySelector('.button button').addEventListener('click', async () => {
    const query = document.querySelector('.search input').value;
    if (query) {
        await searchMovies(query);
    }
});


//searching with search
async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        console.log(data.results); 
        displaySearchResults(data.results);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

function displaySearchResults(movies) {
    let carouselContainer = document.querySelector('#carousel-container');
    if (carouselContainer) {
        carouselContainer.style.display = 'none';
    }

    let previousResults = document.querySelector('.search-results');
    if (previousResults) {
        previousResults.remove();
    }

    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('search-results');

    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("card");
        movieCard.dataset.movieId = movie.id;  

        const movieLink = document.createElement("a");
        const movieUrl = `/movie-details.html?id=${movie.id}`; 
        movieLink.href = movieUrl;

        console.log('Movie link:', movieLink.href);

        movieLink.innerHTML = `
            <div class="card__image">
                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
            </div>
            <div class="card__title">${movie.title}</div>
            <div class="card__addition">
                <div class="card__year">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</div>
                <div class="card__genre">${Math.round(movie.vote_average)}/10</div>
            </div>
        `;

        movieCard.appendChild(movieLink);
        
        resultsContainer.appendChild(movieCard);
    });

    document.body.appendChild(resultsContainer);
}


//display main page
function resetSearch() {
    let carouselContainer = document.querySelector('#carousel-container');
    if (carouselContainer) {
        carouselContainer.style.display = 'block';
    }

    let previousResults = document.querySelector('.search-results');
    if (previousResults) {
        previousResults.remove();
    }
}

document.querySelector('.button button').addEventListener('click', async () => {
    const query = document.querySelector('.search input').value;
    if (query) {
        await searchMovies(query);
    }
});

//logo with link
document.querySelector('.header__wrapper .image').addEventListener('click', async () => {
    resetSearch();
});


searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query.length < 3) {  
        suggestionsList.style.display = 'none';
        return;
    }
    await fetchMovieSuggestions(query);
});

//auto suggest feature
async function fetchMovieSuggestions(query) {
    try {
        const response = await fetch(`${searchUrl}${encodeURIComponent(query)}`);
        const data = await response.json();
        displaySuggestions(data.results);
    } catch (error) {
        console.error('Error fetching movie suggestions:', error);
    }
}

function displaySuggestions(movies) {
    suggestionsList.innerHTML = ''; 

    if (movies.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    movies.slice(0, 5).forEach(movie => {  
        const suggestionItem = document.createElement('li');
        suggestionItem.textContent = movie.title;
        suggestionItem.addEventListener('click', () => {
            searchInput.value = movie.title;
            suggestionsList.style.display = 'none';
            searchMovies(movie.title);
        });
        suggestionsList.appendChild(suggestionItem);
    });

    suggestionsList.style.display = 'block';
}

async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
}

function displaySearchResults(movies) {
    let carouselContainer = document.querySelector('#carousel-container');
    if (carouselContainer) {
        carouselContainer.style.display = 'none';
    }

    let previousResults = document.querySelector('.search-results');
    if (previousResults) {
        previousResults.remove();
    }

    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('search-results');
    resultsContainer.innerHTML = movies.map(movie => `
        <div class="card">
            <div class="card__image">
                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
            </div>
            <div class="card__title">${movie.title}</div>
            <div class="card__addition">
                <div class="card__year">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</div>
                <div class="card__genre">${Math.round(movie.vote_average)}/10</div>
            </div>
        </div>
    `).join('');

    document.body.appendChild(resultsContainer);
}

document.querySelector('.button button').addEventListener('click', async () => {
    const query = searchInput.value;
    if (query) {
        await searchMovies(query);
    }
});
