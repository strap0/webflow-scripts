
// Глобальные переменные
let map;
let markers = [];
let autocomplete;
let mapAutocomplete;

// Класс приложения
class RealEstateApp {
  constructor() {
    this.initEventListeners();
    this.initFilters?.();
  }

  initEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupButtons();
      this.setupPopups?.();
      this.setupNoResultsMessage?.();
      this.loadCMSOptions?.();
      this.initMap();
    });
  }

  setupButtons() {
    const filterBtn = document.querySelector('.catalog-button-filter');
    const viewMapBtn = document.querySelector('.view-map');
    const mapButton = document.querySelector('.map-button');
    const mapCloseBtn = document.querySelector('.popup-map .close-button'); // 🔧 добавлен крестик

    if (filterBtn) {
      filterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openFilterPopup();
      });
    }

    if (viewMapBtn) {
      viewMapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openMapPopup();
      });
    }

    if (mapButton) {
      mapButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeFilterPopup();
        this.openMapPopup();
      });
    }

    if (mapCloseBtn) {
      mapCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMapPopup();
      });
    }
  }

  // Остальной код остаётся нетронутым — логика попапов, карты, фильтров, меток и т.д.
  // Функции вне класса работают как есть, если они не были поломаны — оставляем их как есть.
}

// Создаем экземпляр приложения
const app = new RealEstateApp();

// Обработчик Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    app.closeFilterPopup();
    app.closeMapPopup();
  }
});
