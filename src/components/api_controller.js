const apiController = (() => {
  const url =
    'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
  const urlOptions =
    '/today?unitGroup=us&elements=datetime%2Cname%2Ctempmax%2Ctempmin%2Ctemp%2Chumidity%2Cprecipprob%2Cpreciptype%2Cwindspeed%2Cconditions&key=ETL6X5BD763HMZBZ3LCB5U7R8&contentType=json';

  const getLocation = (location) => {
    let locationStr = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const input in location) {
      if (Object.prototype.hasOwnProperty.call(location, input)) {
        locationStr += location[input] !== '' ? ` ${location[input]}` : '';
      }
    }
    return locationStr;
  };

  const getWeather = async (location) => {
    try {
      const response = await fetch(url + getLocation(location) + urlOptions);
      if (response.status === 200) {
        const responseJson = await response.json();
        return responseJson.days[0];
      }
      throw new Error();
    } catch (err) {
      throw new Error(err);
    }
  };

  return { getWeather };
})();

export default apiController;
