const weatherApiKey = "db245abe36cd9a2219ae9b42041bf218";
const yandexApiKey = "37a75e60-4461-4c83-8d72-f3d43d3d737a";
let symbol = 'C';  

//start
document.addEventListener("DOMContentLoaded", () => {
    getWeather("Almaty");
    setupAutoSuggest();
});


//auto suggest feature
function setupAutoSuggest() {
    const input = document.querySelector('.search input');
    input.addEventListener('input', async () => {
        const query = input.value.trim();
        if (query.length < 1) return;

        try {
            const cities = await getCitySuggestions(query);
            showSuggestions(cities);
        } catch (error) {
            console.error("Ошибка при получении подсказок:", error);
        }
    });
}

//send name of city and get auto suggestions
async function getCitySuggestions(query) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=10&appid=${weatherApiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ошибка запроса к API: ${response.status}`);
    }

    const data = await response.json();
    return data.map(city => ({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        country: city.country,
        state: city.state || ""
    }));
}

//just show them
function showSuggestions(cities) {
    const suggestionBox = document.querySelector('.suggestions');
    suggestionBox.innerHTML = '';
    cities.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = `${city.name}, ${city.state ? city.state + ", " : ""}${city.country}`;
        suggestionItem.addEventListener('click', () => {
            document.querySelector('.search input').value = city.name;
            suggestionBox.innerHTML = '';
            getWeatherByCoordinates(city.lat, city.lon);
        });
        suggestionBox.appendChild(suggestionItem);
    });
}


//get weather
async function getWeather(city) {
    let url;
    let units;
    if(symbol === 'C'){
        units ='metric'    
    } else if(symbol === 'F'){ 
        units ='imperial'    
    }
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=${units}&lang=eng`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ohh no error: ${response.status}`);
        }
        const data = await response.json();
        displayWeather(data);
        getWeeklyWeather(data.id);  

        const lat = data.coord.lat;
        const lon = data.coord.lon;

        try {
            updateMap(lon, lat);
        } catch (error) {
        }

    } catch (error) {
        console.error("ERROR(:", error);
    }
}


//get weather for five day
async function getWeeklyWeather(id) {
    let units;
    if (symbol === 'C') {
        units = 'metric';
    } else if (symbol === 'F') {
        units = 'imperial';
    }

    const url = `http://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=${weatherApiKey}&units=${units}&cnt=40`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const data = await response.json();

        if (!data.list) {
            throw new Error("Прогноз пустой.");
        }

        const dailyForecast = data.list.filter(item => item.dt_txt.includes("12:00:00")); //we show weather for 12:00 for each day

        displayWeeklyWeather(dailyForecast);

    } catch (error) {
        console.error("Ошибка получения прогноза на неделю:", error);
    }
}

//show weather
function displayWeather(data) {
    const { name, main, weather, wind, clouds } = data;
    const temp = main.temp;
    const temp_max = main.temp_max;
    const temp_min = main.temp_min;
    const description = weather[0].description;
    const pressure = main.pressure;
    const humidity = main.humidity;
    const seaLevel = main.sea_level || "N/A";
    const windSpeed = wind.speed;
    const cloudiness = clouds.all;

    document.querySelector('.card__title').textContent = name;
    document.querySelector('.card__degree').textContent = `${Math.round(temp)}°${symbol}`;
    document.querySelector('.card__description').innerHTML = `${description}`;
    document.querySelector('.card__range').innerHTML = `Started by ${Math.round(temp_min)}°${symbol} to ${Math.round(temp_max)}°${symbol}`;
    document.querySelector('.optional_left .option:nth-child(1)').textContent = `Pressure: ${pressure} hPa`;
    document.querySelector('.optional_left .option:nth-child(2)').textContent = `Humidity: ${humidity}%`;
    document.querySelector('.optional_left .option:nth-child(3)').textContent = `Sea Level: ${seaLevel}`;
    document.querySelector('.optional_right .option:nth-child(1)').textContent = `Wind: ${windSpeed} m/s`;
    document.querySelector('.optional_right .option:nth-child(2)').textContent = `Cloudiness: ${cloudiness}%`;

    const iconCode = data.weather[0].icon;
    document.querySelector('.card__image img').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    const cardElement = document.querySelector('.card');

    if (iconCode.endsWith('n')) {
        cardElement.style.backgroundImage = "url('https://static.vecteezy.com/system/resources/previews/007/710/509/non_2x/starry-night-sky-with-stars-and-moon-in-cloudscape-background-free-photo.jpg')";
    } else {
        cardElement.style.backgroundImage = "url('https://images.pond5.com/fluffy-curly-rolling-cloud-windy-footage-205191439_iconl.jpeg')";
    }
}

function displayWeeklyWeather(data) {
    const slider = document.querySelector('.slider');
    slider.innerHTML = ''; 
    data.forEach(day => {
        const date = new Date(day.dt * 1000);
        
        const dayElement = document.createElement('div');
        dayElement.classList.add('weather-day');

        dayElement.innerHTML = `
            <div class="date">${date.toLocaleDateString()}</div>
            <div class="image">
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png" alt="weather icon">
            </div>
            <div class="temp">${Math.round(day.main.temp)}°${symbol}</div>
            <div class="temp__range">Min: ${Math.round(day.main.temp_min)}°${symbol}, Max: ${Math.round(day.main.temp_max)}°${symbol}</div>
            <div class="description">${day.weather[0].description}</div>
        `;

        slider.appendChild(dayElement);
    });
}


//update yandex map when we change the city
function updateMap(longitude, latitude) {
    const mapIframe = document.querySelector('.location iframe');
    mapIframe.src = `https://yandex.ru/map-widget/v1/?ll=${longitude},${latitude}&z=10&pt=${longitude},${latitude},pm2rdm`;
}

document.querySelector('.button button').addEventListener('click', () => {
    const city = document.querySelector('.search input').value.trim();
    if (city) {
        getWeather(city);
        getWeeklyWeather(city); 
    } else {
        alert("Enter the name of city to search");
    }
});

//we can change for faranheit ir celsie
document.querySelector('.card__symbol').addEventListener('click', () => {
    if (symbol === 'C') {
        symbol = 'F';  
        document.querySelector('.card__symbol').textContent = '°F';
    } else if (symbol === 'F') {
        symbol = 'C'; 
        document.querySelector('.card__symbol').textContent = '°C';
    }
    const city = document.querySelector('.card__title').textContent;
    getWeather(city);
    getWeeklyWeather(city);
});

//get user location
document.querySelector('.card__location img').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                console.error("Ошибка при получении местоположения:", error.message);
                alert(`Не удалось получить текущее местоположение: ${error.message}`);
            }
            
        );
    }
});


//it is for when user use user location 
async function getWeatherByCoordinates(lat, lon) {
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric&lang=ru`;
    if (symbol === 'F') {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=imperial&lang=ru`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        const data = await response.json();
        displayWeather(data);
        try {
            updateMap(lon, lat);
        } catch (error) {
        }

    } catch (error) {
        console.error("Ошибка получения данных:", error);
    }
}
