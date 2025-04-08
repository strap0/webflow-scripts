
// === Global Variables ===
let map;
let markers = [];
let autocomplete;
let mapAutocomplete;

// === App Class ===
class RealEstateApp {
  constructor() {
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initMap();
      this.setupButtons();
      this.setupAutocomplete();
      this.loadCMSOptions();
      this.formatPrices();
      this.formatAreas();
    });
  }

  setupButtons() {
    const filterBtn = document.querySelector('.catalog-button-filter');
    const viewMapBtn = document.querySelector('.view-map');
    const mapButton = document.querySelector('.map-button');
    const filterCloseBtn = document.querySelector('.popup-filter .close-button');
    const mapCloseBtn = document.querySelector('.popup-map .close-button');

    if (filterBtn) filterBtn.addEventListener('click', () => this.openFilterPopup());
    if (viewMapBtn) viewMapBtn.addEventListener('click', () => this.openMapPopup());
    if (mapButton) mapButton.addEventListener('click', () => {
      this.closeFilterPopup();
      this.openMapPopup();
    });
    if (filterCloseBtn) filterCloseBtn.addEventListener('click', () => this.closeFilterPopup());
    if (mapCloseBtn) mapCloseBtn.addEventListener('click', () => this.closeMapPopup());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeFilterPopup();
        this.closeMapPopup();
      }
    });
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
      if (map) {
        google.maps.event.trigger(map, 'resize');
      } else {
        this.initMap();
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
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    });

    this.loadMarkers();
  }

  setupAutocomplete() {
    const locationInput = document.getElementById('location');
    const mapSearchInput = document.getElementById('map-search');

    const options = {
      componentRestrictions: { country: 'cz' },
      types: ['address']
    };

    if (locationInput) {
      autocomplete = new google.maps.places.Autocomplete(locationInput, options);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          this.filterByAddress(place.formatted_address);
        }
      });
    }

    if (mapSearchInput) {
      mapAutocomplete = new google.maps.places.Autocomplete(mapSearchInput, options);
      mapAutocomplete.addListener('place_changed', () => {
        const place = mapAutocomplete.getPlace();
        if (place.geometry) {
          map.setCenter(place.geometry.location);
          map.setZoom(15);
        }
      });
    }
  }

  loadCMSOptions() {
    const loadSelectOptions = (selectId, fieldName, defaultText) => {
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
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };

    loadSelectOptions('#type', 'Type', 'Все объекты');
    loadSelectOptions('#category', 'Category', 'Все типы');
    loadSelectOptions('#district', 'zone', 'Все районы');
    loadSelectOptions('#rooms', 'Rooms', 'Все варианты');
  }

  formatPrices() {
    document.querySelectorAll('.catalog-price-rent').forEach(el => {
      const num = parseInt(el.textContent.replace(/\D/g, ''));
      if (!isNaN(num)) {
        el.textContent = num.toLocaleString('ru-RU') + ' CZK';
      }
    });
  }

  formatAreas() {
    document.querySelectorAll('.catalog-area-rent').forEach(el => {
      const num = parseInt(el.textContent.replace(/\D/g, ''));
      if (!isNaN(num)) {
        el.textContent = num + ' м²';
      }
    });
  }

  loadMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];

    const cards = document.querySelectorAll('.catalog-card-rent:not([style*="display: none"])');

    cards.forEach(card => {
      const cardData = {
        title: card.querySelector('.catalog-title-rent')?.textContent || '',
        price: card.querySelector('.catalog-price-rent')?.textContent || '',
        location: card.querySelector('.catalog-location-rent')?.textContent || '',
        image: card.querySelector('.catalog-image-rent')?.src || '',
        type: card.querySelector('.catalog-type')?.textContent || '',
        rooms: card.querySelector('.catalog-rooms-type')?.textContent || ''
      };

      this.createMarker(cardData);
    });
  }

  createMarker(cardData) {
    if (!cardData.location) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${cardData.location}, Prague` }, (results, status) => {
      if (status !== 'OK' || !results[0]) return;

      const position = results[0].geometry.location;
      const overlay = new google.maps.OverlayView();

      overlay.onAdd = function () {
        const div = document.createElement('div');
        div.innerHTML = `
          <div class="map-marker-wrapper">
            <div class="map-marker">
              ${cardData.price.replace(/\D/g, '')}
              <div class="marker-pointer"></div>
            </div>
            <div class="property-popup">
              <div class="popup-content">
                <img src="${cardData.image}" alt="${cardData.title}">
                <div class="popup-info">
                  <div class="property-type">${cardData.type} ${cardData.rooms}</div>
                  <div class="address">${cardData.location}</div>
                  <div class="price">${cardData.price}</div>
                </div>
              </div>
            </div>
          </div>
        `;

        this.div = div;
        const panes = this.getPanes();
        panes.overlayMouseTarget.appendChild(div);

        const marker = div.querySelector('.map-marker');
        const popup = div.querySelector('.property-popup');

        let timer;
        const showPopup = () => {
          clearTimeout(timer);
          popup.classList.add('show');
        };
        const hidePopup = () => {
          timer = setTimeout(() => popup.classList.remove('show'), 300);
        };

        marker.addEventListener('mouseenter', showPopup);
        marker.addEventListener('mouseleave', hidePopup);
        popup.addEventListener('mouseenter', showPopup);
        popup.addEventListener('mouseleave', hidePopup);
      };

      overlay.draw = function () {
        const projection = this.getProjection();
        const pos = projection.fromLatLngToDivPixel(position);
        if (this.div) {
          this.div.style.position = 'absolute';
          this.div.style.left = `${pos.x}px`;
          this.div.style.top = `${pos.y}px`;
          this.div.style.transform = 'translate(-50%, -100%)`;
        }
      };

      overlay.setMap(map);
      markers.push(overlay);
    });
  }

  filterByAddress(address) {
    if (!address) return;

    const query = address.toLowerCase();
    document.querySelectorAll('.catalog-card-rent').forEach(card => {
      const location = card.querySelector('.catalog-location-rent')?.textContent.toLowerCase() || '';
      const show = location.includes(query) || query.includes(location);
      card.style.display = show ? '' : 'none';
    });

    this.loadMarkers();
  }
}

// === Init App ===
new RealEstateApp();
