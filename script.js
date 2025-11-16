// script.js (complete) — works with the HTML & CSS above
// You can keep your key here (you provided it earlier). If you prefer to replace it, change below.
const weatherApi = {
    key: '4eb3703790b356562054106543b748b2',
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather'
}

// --- helpers & elements ---
let searchInputBox = document.getElementById('input-box');
let searchBtn = document.getElementById('search-btn');

searchInputBox.addEventListener('keypress', (event) => {
    if (event.keyCode == 13) {
        getWeatherReport(searchInputBox.value);
    }
});

// wire search button click too
searchBtn.addEventListener('click', () => {
    getWeatherReport(searchInputBox.value);
});

// get weather report by city name
function getWeatherReport(city) {
    if (!city || city.trim() === '') {
        swal("Empty Input", "Please enter any city", "error");
        reset();
        return;
    }

    fetch(`${weatherApi.baseUrl}?q=${encodeURIComponent(city)}&appid=${weatherApi.key}&units=metric`)
        .then(weather => {
            return weather.json();
        })
        .then(showWeaterReport)
        .catch(err => {
            console.error('Fetch error:', err);
            swal("Error", "Failed to fetch weather data", "error");
        });
}

// show weather report
function showWeaterReport(weather) {
    // API returns numeric codes sometimes as numbers, sometimes as strings — handle both
    let city_code = weather.cod;

    // convert numeric-like strings to number for safe checking
    const codeNum = typeof city_code === 'string' && !isNaN(Number(city_code)) ? Number(city_code) : city_code;

    if (codeNum === 400 || codeNum === '400') {
        swal("Empty Input", "Please enter any city", "error");
        reset();
        return;
    } else if (codeNum === 404 || codeNum === '404') {
        swal("Bad Input", "Entered city didn't match", "warning");
        reset();
        return;
    } else if (codeNum && codeNum !== 200) {
        // other errors
        swal("Error", `Server returned code ${city_code}`, "error");
        reset();
        return;
    }

    // Normal flow: display weather
    let op = document.getElementById('weather-body');
    op.style.display = 'block';
    let todayDate = new Date();
    let parent = document.getElementById('parent');
    let weather_body = document.getElementById('weather-body');

    // Populate main weather body (keeps your layout)
    weather_body.innerHTML =
        `
    <div class="location-deatils">
        <div class="city" id="city">${weather.name}, ${weather.sys.country}</div>
        <div class="date" id="date"> ${dateManage(todayDate)}</div>
    </div>
    <div class="weather-status">
        <div class="temp" id="temp">${Math.round(weather.main.temp)}&deg;C </div>
        <div class="weather" id="weather"> ${weather.weather[0].main} <i class="${getIconClass(weather.weather[0].main)}"></i>  </div>
        <div class="min-max" id="min-max">${Math.floor(weather.main.temp_min)}&deg;C (min) / ${Math.ceil(weather.main.temp_max)}&deg;C (max) </div>
        <div id="updated_on">Updated as of ${getTime(todayDate)}</div>
    </div>
    <hr>
    <div class="day-details">
        <div class="basic">Feels like ${weather.main.feels_like}&deg;C | Humidity ${weather.main.humidity}%  <br> Pressure ${weather.main.pressure} mb | Wind ${weather.wind.speed} KMPH</div>
    </div>
    `;
    // Append/replace in parent (ensures structure remains)
    parent.append(weather_body);

    // --- NEW: compute and display sunrise & sunset in local time for the city
    try {
        const tz = typeof weather.timezone === 'number' ? weather.timezone : (weather.timezone ? Number(weather.timezone) : 0); // seconds offset
        if (weather.sys && weather.sys.sunrise) {
            const sunriseStr = formatLocalTime(weather.sys.sunrise, tz);
            const sunriseEl = document.getElementById('sunrise');
            if (sunriseEl) sunriseEl.textContent = sunriseStr;
        }
        if (weather.sys && weather.sys.sunset) {
            const sunsetStr = formatLocalTime(weather.sys.sunset, tz);
            const sunsetEl = document.getElementById('sunset');
            if (sunsetEl) sunsetEl.textContent = sunsetStr;
        }
    } catch (e) {
        console.warn('Could not set sunrise/sunset:', e);
    }

    // change page background image according to weather
    changeBg(weather.weather[0].main);
    reset();
}

// --- helper: format unix UTC seconds into city's local time using timezone offset (in seconds) ---
function formatLocalTime(unixUtcSeconds, timezoneOffsetSeconds) {
    // Shift timestamp by timezone offset (in seconds) then use UTC getters
    // Example: (unixUtcSeconds + timezoneOffsetSeconds) * 1000 -> epoch ms representing city's local time
    const shifted = new Date((unixUtcSeconds + (timezoneOffsetSeconds || 0)) * 1000);
    // Use UTC-based getters because we've already applied the timezone shift
    const hh = addZero(shifted.getUTCHours());
    const mm = addZero(shifted.getUTCMinutes());
    return `${hh}:${mm}`;
}

// --- existing helpers (unchanged) ---

// making a function for the classname of icon
function getIconClass(classarg) {
    if (classarg === 'Rain') {
        return 'fas fa-cloud-showers-heavy';
    } else if (classarg === 'Clouds') {
        return 'fas fa-cloud';
    } else if (classarg === 'Clear') {
        return 'fas fa-cloud-sun';
    } else if (classarg === 'Snow') {
        return 'fas fa-snowman';
    } else if (classarg === 'Sunny') {
        return 'fas fa-sun';
    } else if (classarg === 'Mist') {
        return 'fas fa-smog';
    } else if (classarg === 'Thunderstorm' || classarg === 'Drizzle') {
        return 'fas fa-thunderstorm';
    } else {
        return 'fas fa-cloud-sun';
    }
}

function changeBg(status) {
    // set background image based on status — ensure files exist in /img/
    if (status === 'Clouds') {
        document.body.style.backgroundImage = 'url(img/clouds.jpg)';
    } else if (status === 'Rain') {
        document.body.style.backgroundImage = 'url(img/rainy.jpg)';
    } else if (status === 'Clear') {
        document.body.style.backgroundImage = 'url(img/clear.jpg)';
    }
    else if (status === 'Snow') {
        document.body.style.backgroundImage = 'url(img/snow.jpg)';
    }
    else if (status === 'Sunny') {
        document.body.style.backgroundImage = 'url(img/sunny.jpg)';
    } else if (status === 'Thunderstorm') {
        document.body.style.backgroundImage = 'url(img/thunderstrom.jpg)';
    } else if (status === 'Drizzle') {
        document.body.style.backgroundImage = 'url(img/drizzle.jpg)';
    } else if (status === 'Mist' || status === 'Haze' || status === 'Fog') {
        document.body.style.backgroundImage = 'url(img/mist.jpg)';
    } else {
        document.body.style.backgroundImage = 'url(img/bg.jpg)';
    }
}

function getTime(todayDate) {
    let hour = addZero(todayDate.getHours());
    let minute = addZero(todayDate.getMinutes());
    return `${hour}:${minute}`;
}

function dateManage(dateArg) {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let year = dateArg.getFullYear();
    let month = months[dateArg.getMonth()];
    let date = dateArg.getDate();
    let day = days[dateArg.getDay()];
    return `${date} ${month} (${day}) , ${year}`
}

function reset() {
    let input = document.getElementById('input-box');
    input.value = "";
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
