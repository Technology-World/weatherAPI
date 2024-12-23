const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");


const date = new Date().toLocaleDateString();
document.getElementById("date").textContent = date;

const API_KEY = "0f9675dfcd820379b0a158da28eb0faa"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index, country) => {
    if (index === 0) { // HTML for the main weather card
        return `
          <div class="details">
            <div class="temp">${(weatherItem.main.temp - 273.15).toFixed(2)}°</div>
            <div class="cityname">
              <h2>${cityName}, ${country}</h2>
              <h2 id="date">(${weatherItem.dt_txt.split(" ")[0]})</h2>
            </div>
            <div class="cloudy">
              <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon" style="width=20px"/>
              <span>${weatherItem.weather[0].description}</span>
            </div>
          </div>
          <div class="current-weather-text">Current Weather</div>
          <div class="current-weather-details">
            <div class="weather temp_min">
              <h3>Temp min</h3>
              <p>${(weatherItem.main.temp_min - 273.15).toFixed(2)}°c</p>
              <i class="bi bi-thermometer-half"></i>
            </div>
            <div class="weather temp_max">
              <h3>Temp max</h3>
              <p>${(weatherItem.main.temp_max - 273.15).toFixed(2)}°c</p>
              <i class="bi bi-thermometer-half"></i>
            </div>
            <div class="weather wind">
              <h3>Wind</h3>
              <p>${weatherItem.wind.speed}km/h <span></span></p>
              <i class="bi bi-wind"></i>
            </div>
            <div class="weather humidity">
              <h3>Humidity</h3>
              <p>${weatherItem.main.humidity}%</p>
              <i class="bi bi-moisture"></i>
            </div>
          </div>
        </div>`;
    } else { // HTML for the other five day forecast card
        return `
        <li class="card">
                    <p>Date: (${weatherItem.dt_txt.split(" ")[0]})</p>
                    <figure class="cloudy">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}.png" alt="weather-icon"/>
                    <figcaption>${weatherItem.weather[0].description}</figcaption>
                    </figure>
                    <p>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
                    <p>Wind: ${weatherItem.wind.speed} km/h</p>
                    <p>Humidity: ${weatherItem.main.humidity}%</p>
                </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude, country) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });
        console.log(data);

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index, country);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name, country } = data[0];
        getWeatherDetails(name, lat, lon, country);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!, please check your connection");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const { name, country } = data[0];
                getWeatherDetails(name, latitude, longitude, country);
            }).catch(() => {
                alert("An error occurred while fetching the city name!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());