
// Глобальные переменные
let map;
let markers = [];
let autocomplete;
let mapAutocomplete;

class RealEstateApp {
  constructor() {
    this.initEventListeners();
    this.initFilters?.();
  }

  initEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupButtons();
      this.setupNoResultsMessage?.();
      this.loadCMSOptions?.();
      this.initMap();
    });
  }

  setupButtons() {
    const filterBtn = document.querySelector('.catalog-button-filter');
    const viewMapBtn = document.querySelector('.view-map');
    const mapButton = document.querySelector('.map-button');
    const mapCloseBtn = document.querySelector('.popup-map .close-button');

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

  openFilterPopup() {
    const popup = document.querySelector('.popup-filter');
    if (popup) {
      popup.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  closeFilterPopup() {
    const popup = document.querySelector('.popup-filter');
    if (popup) {
      popup.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  openMapPopup() {
    const popup = document.querySelector('.popup-map');
    if (popup) {
      popup.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (!map) {
        this.initMap();
      } else {
        google.maps.event.trigger(map, 'resize');
      }
    }
  }

  closeMapPopup() {
    const popup = document.querySelector('.popup-map');
    if (popup) {
      popup.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement || typeof google === 'undefined') return;

    const prague = { lat: 50.0755, lng: 14.4378 };
    map = new google.maps.Map(mapElement, {
      zoom: 12,
      center: prague,
      styles: [{
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
      }],
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    });

    this.setupAutocomplete();
    this.loadMarkers();
  }

  setupAutocomplete() {
    const mapSearchInput = document.getElementById('map-search');
    const locationInput = document.getElementById('location');

    const autocompleteOptions = {
      componentRestrictions: { country: 'cz' },
      types: ['address']
    };

    if (mapSearchInput) {
      mapAutocomplete = new google.maps.places.Autocomplete(mapSearchInput, autocompleteOptions);
      mapAutocomplete.addListener('place_changed', () => {
        const place = mapAutocomplete.getPlace();
        if (place.geometry) {
          map.setCenter(place.geometry.location);
          map.setZoom(15);
        }
      });
    }

    if (locationInput) {
      autocomplete = new google.maps.places.Autocomplete(locationInput, autocompleteOptions);
    }
  }

  loadMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const cards = document.querySelectorAll('.catalog-card-rent:not([style*="display: none"])');
    
    cards.forEach(card => {
      const cardData = {
        title: card.querySelector('.catalog-title-rent')?.textContent || '',
        price: card.querySelector('.catalog-price-rent')?.textContent || '',
        location: card.querySelector('.catalog-location-rent')?.textContent || '',
        image: card.querySelector('.catalog-image-rent')?.src || '',
        link: card.querySelector('a')?.href || '',
        type: card.querySelector('.catalog-type')?.textContent || '',
        rooms: card.querySelector('.catalog-rooms-type')?.textContent || ''
      };

      if (cardData.location) {
        this.createMarkerForCard(cardData);
      }
    });
  }

  formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  // createMarkerForCard — опущен ради краткости
}


// Вспомогательные функции — эти нужно вынести за пределы класса

function loadSelectOptions(selectId, fieldName, defaultText) {
  const select = document.querySelector(selectId);
  if (!select) return;

  const options = Array.from(document.querySelectorAll(`[fs-cmsfilter-field="${fieldName}"]`))
    .map(item => item.textContent.trim())
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .sort((a, b) => a.localeCompare(b, 'ru'));

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = defaultText;

  select.innerHTML = '';
  select.appendChild(defaultOption);

  options.forEach(value => {
    if (value !== defaultText) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    }
  });
}

function loadCMSOptions() {
  loadSelectOptions('#type', 'Type', 'Все объекты');
  loadSelectOptions('#category', 'Category', 'Все типы');
  loadSelectOptions('#district', 'zone', 'Все районы');
  loadSelectOptions('#rooms', 'Rooms', 'Все варианты');
}

// Создаём приложение
const app = new RealEstateApp();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    app.closeFilterPopup();
    app.closeMapPopup();
  }
});
