var forecastApi = config.key;

// gets weather in Westwood on page load #GoBruins #FoursUp
window.onload = function() {
    westWoodFetch();
}

// get coordinates of current location
function getLocation(){
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(localFetch)
    } else {
        alert("This browswer does not support Geolocation")
    }
}

// uses current position to fetch weather
function localFetch(position){
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    
    Promise.all([
        fetch("https://api.openweathermap.org/data/2.5/onecall?lat="
        + lat + "&lon="
        + lon + "&units=imperial&exclude=minutely,hourly&appid="
        + forecastApi),
        fetch("http://api.openweathermap.org/data/2.5/air_pollution?lat="
        + lat + "&lon="
        + lon + "&appid="
        + forecastApi),
        fetch("http://api.openweathermap.org/data/2.5/weather?lat="
        + lat + "&lon="
        + lon + "&appid="
        + forecastApi)
    ])
    .then(function (responses){
        return Promise.all(responses.map(function (responses){
            return responses.json();
        }));
    }).then(function (data){
        displayWeather(data);
    });
}

// uses city name to fetch weather
function cityFetch(){
    let city = document.querySelector(".search-bar").value;

    // use this api request to get longitue and latitude
    fetch("https://api.openweathermap.org/data/2.5/weather?q="
    + city 
    + "&appid="
    + forecastApi)
    .then(function(response) {
        return response.json();
    }).then(function (data) {
        // use previous api to get forecast
        let lat = data.coord.lat;
        let lon = data.coord.lon;
        return Promise.all([
            fetch("https://api.openweathermap.org/data/2.5/onecall?lat="
            + lat + "&lon="
            + lon + "&units=imperial&exclude=minutely,hourly&appid="
            + forecastApi),
            fetch("http://api.openweathermap.org/data/2.5/air_pollution?lat="
            + lat + "&lon="
            + lon + "&appid="
            + forecastApi),
            fetch("http://api.openweathermap.org/data/2.5/weather?lat="
            + lat + "&lon="
            + lon + "&appid="
            + forecastApi)
        ])
        .then(function (responses){
            return Promise.all(responses.map(function (responses){
                return responses.json();
            }));
        }).then(function (data){
            displayWeather(data);
        });
    });
}

// takes weather .json to change values on page
function displayWeather(data){

    // changing current weather icon
    document.querySelector(".icon").src = 
    "https://openweathermap.org/img/wn/" 
    + cleanIcon(data[0].current.weather[0].icon) 
    + "d@2x.png";

    // changing current temperature
    document.querySelector(".temp").innerText =
    Math.round(data[0].current.temp);

    // changing humidity, wind, and air quality
    document.querySelector(".humidity").innerText = 
    "Humidity: " 
    + data[0].current.humidity
    + "%";

    document.querySelector(".wind").innerText =
    "Wind: "
    + Math.round(data[0].current.wind_speed)
    + " mph";

    document.querySelector(".air-quality").innerText =
    "AQI: "
    + aqiConvert(data[1].list[0].main.aqi);

    // changing location
    document.querySelector(".city").innerText = data[2].name;

    // changing description
    document.querySelector(".description").innerText = data[0].current.weather[0].description;

    // changing forecast days of the week
    let docuDays = document.querySelectorAll(".day");
    let daysOfWeek = getDaysOfWeek();
    for (let i = 0; i < 8; i++) docuDays[i].innerText = daysOfWeek[i];

    // changing current day
    document.querySelector(".today").innerText = daysOfWeek[0] + "day";

    // changing forecast icons
    let docuIcons = document.querySelectorAll(".day-icon");
    for (let i = 0; i < 8; i++) docuIcons[i].src = 
    "https://openweathermap.org/img/wn/" 
    + cleanIcon(data[0].daily[i].weather[0].icon) 
    + "d.png";

    // changing high temperatures
    let docuHighs = document.querySelectorAll(".high");
    for (let i = 0; i < 8; i++) docuHighs[i].innerText = Math.round(data[0].daily[i].temp.max) + "°";

    // changing low temperatures
    let docuLows = document.querySelectorAll(".low");
    for (let i = 0; i < 8; i++) docuLows[i].innerText = Math.round(data[0].daily[i].temp.min) + "°";
}

// enter button + search functionality
var input = document.querySelector(".search-bar");
input.addEventListener("keyup", function(event){
    if (event.keyCode === 13){
        event.preventDefault();
        document.querySelector(".search-btn").click();
    }
});

// default weather (Westwood)
function westWoodFetch(){
    let lat = 34.0672;
    let lon = -118.4515;
    Promise.all([
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat="
    + lat + "&lon="
    + lon + "&units=imperial&exclude=minutely,hourly&appid="
    + forecastApi),
    fetch("http://api.openweathermap.org/data/2.5/air_pollution?lat="
    + lat + "&lon="
    + lon + "&appid="
    + forecastApi),
    fetch("http://api.openweathermap.org/data/2.5/weather?lat="
    + lat + "&lon="
    + lon + "&appid="
    + forecastApi)
    ])
    .then(function (responses){
        return Promise.all(responses.map(function (responses){
            return responses.json();
        }));
    }).then(function (data){
        displayWeather(data);
    });
}


// helper functions
function getDaysOfWeek(){
    const daysOfWeek = [];
    const today = (new Date()).getDay();
    for (let i = 0; i < 8; i++) daysOfWeek.push(dayOfWeek(today + i));
    return daysOfWeek;
}

function dayOfWeek(day){
    if (day > 6) day = day - 7;
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[day];
}

function cleanIcon(icon){
    return icon.slice(0, -1);
}

function aqiConvert(aqi){
    switch(aqi){
        case 1: return "Good";
        case 2: return "Fair";
        case 3: return "Moderate";
        case 4: return "Poor";
        case 5: return "Very Poor";
    }
}
// end of helper functions