// TO DO : Add pictures background for each city;

// API KEY Dark sky : 5c92273c4b1ad5fc0c902baac07c386d
// Google API : AIzaSyD0g9_DjMkpTHiefGAw5PUYIq7TXWvdKwc
// Weather App // Clé :
// 5b8dac7a2f3f6cb347904503bcb21c58
// Secret :
// d8691b2298e53239

const DARKSKY_API_URL = 'https://api.darksky.net/forecast/';
const DARKSKY_API_KEY = '5c92273c4b1ad5fc0c902baac07c386d';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

const GOOGLE_MAPS_API_KEY = 'AIzaSyD0g9_DjMkpTHiefGAw5PUYIq7TXWvdKwc';
const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const FLICKR_API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';
const FLICKR_API_KEY = '5b8dac7a2f3f6cb347904503bcb21c58';

// This function returns a promise that will resolve with an object of lat/lng coordinates
function getCoordinatesForCity(cityName) {
  // This is an ES6 template string, much better than verbose string concatenation...
  const url = `${GOOGLE_MAPS_API_URL}?address=${cityName}&key=${GOOGLE_MAPS_API_KEY}`;
  console.log('cityName');

  return fetch(url) // Returns a promise for a Response
    .then(response => response.json()) // Returns a promise for the parsed JSON
    .then(data => data.results[0].geometry.location); // Transform the response to only take what we need
}

function getCurrentWeather(coords) {
  // Template string again! I hope you can see how nicer this is :)
  const url = `${CORS_PROXY}${DARKSKY_API_URL}${DARKSKY_API_KEY}/${coords.lat},${coords.lng}?units=si&exclude=minutely,hourly,alerts,flags`;
  console.log(url);
  console.log('Got CurrentWeather');
  return fetch(url)
    .then(response => response.json())
    .then(data => data);
}

// https://idratherbewriting.com/learnapidoc/docapis_flickr_example.html#3-construct-the-request

// function getPicturesBasedOnUserInput(coords) {
//   const url = `${FLICKR_API_URL}&api_key=${FLICKR_API_KEY}&lat=${coords.lat}&lon=${coords.lng}&format=rest`;
//   return fetch(url)
//   .then(response => response.json())
//   .then(data => data.currently);
// }

const app = document.querySelector('#app');
const cityForm = app.querySelector('.city-form');
const cityInput = cityForm.querySelector('.city-input');

const cityTemperature = app.querySelector('.city-temperature');
const cityTime = app.querySelector('.city-time');
const loader = cityForm.querySelector('.loader');
const iconWeatherToday = app.querySelector('.weather-icon');
const cityName = app.querySelector('.city-name');

// global Variables neede for time
let nd;
const weekday = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
];

cityForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loader.classList.toggle('hidden');
  console.log('clicked the button');
  const city = cityInput.value; // Grab the current value of the input

  // ChangeTime format to match local timezone

  function calcTime(time, offset) {
    // create Date object for current location
    const d = new Date(time * 1000);

    // convert to msec
    // add local time zone offset
    // get UTC time in msec
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;

    // create new Date object for different city
    // using supplied offset
    nd = new Date(utc + 3600000 * offset);
    const hours = nd.getHours();
    const minutes = nd.getMinutes();
    // return time as a string
    cityTime.innerText = `${hours} h ${minutes}`;
  }

  // add upcoming days name to table

  const addDays = () => {
    // add daysname
    const days = app.querySelectorAll('th');
    let counter = 1;
    days.forEach((day) => {
      counter += 1;
      const futureDay = weekday[nd.getDay() + counter];
      day.innerText = futureDay;
    });
  };
  // add Forecast
  const addWeatherForecast = (data) => {
    const forecastDays = app.querySelectorAll('.weather-icon-small');
    let counter2 = 0;
    let dataSet;

    forecastDays.forEach((day) => {
      dataSet = data[counter2].icon.toUpperCase().replace(/-/g, '_');
      const skycon = new Skycons({ color: 'white' });
      skycon.add(`icon${counter2}`, Skycons[dataSet]);
      skycon.play();
      counter2 += 1;
    });
  };

  // add minTemp

  const addMinTemp = (data) => {
    const forecastDays = app.querySelectorAll('.min-temp');
    let counter = 0;
    let tempMin;
    let tempMax;

    forecastDays.forEach((day) => {
      tempMin = data[counter].temperatureMin;
      tempMax = data[counter].temperatureMax;
      counter += 1;
      day.innerText = `min : ${tempMin} C˚\nmax : ${tempMax} C˚`;
    });
  };

  getCoordinatesForCity(city) // get the coordinates for the input city
    .then(getCurrentWeather) // get the weather for those coordinates
    .then((data) => {
      // Set const to use on currently or offset
      const weather = data.currently;
      const offset = data.offset;
      const dailyForeCastIcons = data.daily.data;

      // set temperature
      cityTemperature.innerText = `${weather.temperature} C˚`;

      // set local time
      calcTime(weather.time, offset);

      // set icon icons
      const skycons = new Skycons({ color: 'white' });
      skycons.set(iconWeatherToday, weather.icon);
      skycons.play();

      // set cityname
      cityName.innerText = city.toUpperCase();
      cityInput.value = '';

      // set Adddays
      addDays();

      // Set new icons for forecast
      addWeatherForecast(dailyForeCastIcons);

      // addMinTemp
      addMinTemp(dailyForeCastIcons);
    })
    .then(() => loader.classList.toggle('hidden'));
});
