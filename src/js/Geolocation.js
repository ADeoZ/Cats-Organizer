import DOM from './DOM';

export default class Geolocation {
  constructor(element) {
    this.parentElement = element;
    this.formElement = this.parentElement.querySelector('.chaos_form');
    this.coords = '';
    this.geoElement = '';

    this.attachGeo = this.attachGeo.bind(this);
    this.removeCoords = this.removeCoords.bind(this);
  }

  // Определяем координаты
  attachGeo() {
    this.promiseThroughAPI().then((coords) => {
      this.addCoords(coords);
    }).catch(() => {
      this.addCoords();
    });
  }

  // Обращение к API
  // eslint-disable-next-line class-methods-use-this
  promiseThroughAPI() {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
          resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        }, (error) => {
          reject(error);
        });
      });
    }

    return new Promise((resolve, reject) => reject(new Error('No Geolocation API')));
  }

  // Добавляем DOM-элемент координат и запоминаем их
  addCoords(coords) {
    let value = 'Координаты не определены';
    if (this.geoElement) {
      this.removeCoords();
    }
    if (coords) {
      const { latitude, longitude } = coords;
      value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      this.coords = value;
    }

    this.geoElement = DOM.createGeoElement(value);
    this.formElement.append(this.geoElement);

    const closeElement = this.geoElement.querySelector('.chaos_geo_close');
    closeElement.addEventListener('click', this.removeCoords);
  }

  // Удаляем координаты
  removeCoords() {
    this.coords = '';
    if (this.geoElement) {
      this.geoElement.remove();
    }
  }
}
