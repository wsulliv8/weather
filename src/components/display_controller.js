import { format } from 'date-fns';
import apiController from './api_controller';

const displayController = (() => {
  const weatherSection = document.querySelectorAll('.weather-update');
  const weatherIcon = document.querySelector('.precip img');
  const weatherConditions = {};

  const updateDisplay = (weather) => {
    weatherSection.forEach((section) => {
      section.textContent = weather[section.getAttribute('id')];
    });

    const conditions = weather.conditions.toLowerCase();
    // eslint-disable-next-line no-restricted-syntax
    for (const regex of weatherConditions.regex) {
      const match = conditions.match(regex);
      if (match) {
        weatherIcon.setAttribute('src', weatherConditions[match[0]]);
      }
    }
  };

  const updateWeather = async (e) => {
    const formData = new FormData(document.querySelector('.map form'));
    const location = Object.fromEntries(formData.entries());
    const weather = await apiController.getWeather(location);
    weather.datetime = format(
      weather.datetime.replace(/-/g, '/'),
      'EEEE, d MMMM yyyy'
    );
    updateDisplay(weather);
  };

  const domReady = (cb) => {
    if (
      document.readyState === 'interactive' ||
      document.readyState === 'complete'
    )
      cb();
    else document.addEventListener('DOMContentLoaded', cb);
  };

  const importAll = (r) => {
    r.keys().forEach(
      // eslint-disable-next-line no-return-assign
      (key) => (weatherConditions[key.slice(2, -4)] = r(key))
    );
  };

  const init = () => {
    document.querySelector('button').addEventListener('click', updateWeather);
    // import all images
    importAll(require.context('../assets/images', true, /\.(png|jpe?g|svg)$/));
    // create weather conditions regex
    weatherConditions.regex = Object.keys(weatherConditions).map(
      (condition) => new RegExp(`${condition}`)
    );
  };

  init();

  return { domReady };
})();

export default displayController;
