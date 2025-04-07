// Глобальные переменные
let map;
let markers = [];
let autocomplete;
let mapAutocomplete;
let isGoogleMapsLoaded = false;

// Основной класс приложения
class RealEstateApp {
  constructor() {
    this.initEventListeners();
    this.initFilters();
  }

  // Инициализация слушателей событий
  initEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupButtons();
      this.setupPopups();
      this.setupNoResultsMessage();
      loadCMSOptions();
    });
  }

  // Настройка кнопок
  setupButtons() {
    const filterBtn = document.querySelector('.catalog-button-filter');
    const viewMapBtn = document.querySelector('.view-map');
    const mapButton = document.querySelector('.map-button');

    if (filterBtn) {
      filterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openFilterPopup();
      });
    }

    if (viewMapBtn) {
      viewMapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openMapPopup();
      });
    }

    if (mapButton) {
      mapButton.addEventListener('click', (e) => {
        e.preventDefault();
        closeFilterPopup();
        openMapPopup();
      });
    }
  }

  // Инициализация фильтров
  initFilters() {
    loadSelectOptions('#type', 'Type', 'Все объекты');
    loadSelectOptions('#category', 'Category', 'Все типы');
    loadSelectOptions('#district', 'zone', 'Все районы');
    loadSelectOptions('#rooms', 'Rooms', 'Все варианты');
  }

  // Настройка попапов
  setupPopups() {
    const popup = document.querySelector('.popup-filter');
    const closeButton = popup?.querySelector('.close-button');

    if (closeButton && popup) {
      closeButton.addEventListener('click', () => {
        popup.style.display = 'none';
        document.body.style.overflow = '';
      });

      popup.addEventListener('click', (e) => {
        if (e.target === popup) {
          popup.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // Обработчик Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeFilterPopup();
        closeMapPopup();
      }
    });
  }

  // Настройка сообщения об отсутствии результатов
  setupNoResultsMessage() {
    const catalogList = document.querySelector('.catalog-list-rent');
    if (!catalogList) return;

    let noResultsMsg = document.querySelector('.no-results-message');
    if (!noResultsMsg) {
      noResultsMsg = document.createElement('div');
      noResultsMsg.className = 'no-results-message';
      catalogList.parentNode.insertBefore(noResultsMsg, catalogList.nextSibling);
    }

    const checkVisibleItems = () => {
      const hasVisibleItems = Array.from(catalogList.children).some(child => 
        !child.hasAttribute('hidden') && 
        !child.classList.contains('w-dyn-empty') &&
        getComputedStyle(child).display !== 'none'
      );

      noResultsMsg.textContent = 'Объекты с такими параметрами не найдены. Попробуйте изменить параметры поиска.';
      noResultsMsg.style.display = hasVisibleItems ? 'none' : 'block';
    };

    const observer = new MutationObserver(checkVisibleItems);
    observer.observe(catalogList, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['hidden', 'style', 'class']
    });

    checkVisibleItems();
  }
}

// Функции для работы с селектами
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

// Функция для загрузки опций из CMS
function loadCMSOptions() {
  loadSelectOptions('#type', 'Type', 'Все объекты');
  loadSelectOptions('#category', 'Category', 'Все типы');
  loadSelectOptions('#district', 'zone', 'Все районы');
  loadSelectOptions('#rooms', 'Rooms', 'Все варианты');
}

// Функции для работы с попапами
function openFilterPopup() {
  const popup = document.querySelector('.popup-filter');
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeFilterPopup() {
  const popup = document.querySelector('.popup-filter');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function openMapPopup() {
  const popup = document.querySelector('.popup-map');
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (!map) {
      setTimeout(initMap, 100);
    } else {
      google.maps.event.trigger(map, 'resize');
    }
  }
}

function closeMapPopup() {
  const popup = document.querySelector('.popup-map');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Функции для работы с картой
function initMap() {
  isGoogleMapsLoaded = true;
  updateButtonsState(false);
  
  const prague = { lat: 50.0755, lng: 14.4378 };
  
  map = new google.maps.Map(document.getElementById('map'), {
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

  const input = document.getElementById('map-search');
  if (input) {
    input.style.display = 'block';
    const searchBox = new google.maps.places.SearchBox(input);

    map.addListener('bounds_changed', () => {
      searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      markers.forEach(marker => marker.setMap(null));
      
      const bounds = new google.maps.LatLngBounds();
      places.forEach(place => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      
      map.fitBounds(bounds);
    });
  }

  setupAutocomplete();
  loadMarkers();
}

function setupAutocomplete() {
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
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        filterByAddress(place.formatted_address);
      }
    });
  }
}

function loadMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  const cards = document.querySelectorAll('.catalog-card-rent:not([style*="display: none"])');
  
  cards.forEach(card => {
    const cardData = {
      title: card.querySelector('.catalog-title-rent')?.textContent,
      price: card.querySelector('.catalog-price-rent')?.textContent,
      location: card.querySelector('.catalog-location-rent')?.textContent,
      link: card.getAttribute('href')
    };

    if (cardData.location) {
      createMarkerForCard(cardData);
    }
  });
}

function createMarkerForCard(cardData) {
  const geocoder = new google.maps.Geocoder();
  
  geocoder.geocode({ address: `${cardData.location}, Prague` }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const CustomMarker = class extends google.maps.OverlayView {
        constructor(position, map, cardData) {
          super();
          this.position = position;
          this.cardData = cardData;
          this.setMap(map);
        }

        onAdd() {
          this.div = document.createElement('div');
          const markerId = `marker-${Math.random().toString(36).substr(2, 9)}`;
          const popupId = `popup-${markerId}`;
          
          this.div.innerHTML = `
            <a href="${this.cardData.link}" class="map-link" target="_blank">
              <div class="map-marker-wrapper">
                <div class="map-marker" id="${markerId}">
                  ${this.cardData.price}
                  <div class="marker-pointer"></div>
                </div>
                <div class="property-popup" id="${popupId}">
                  <div class="popup-content">
                    <img src="${this.cardData.image || ''}" alt="Property photo">
                    <div class="popup-info">
                      <div class="property-type">${this.cardData.type || ''}</div>
                      <div class="address">${this.cardData.location}</div>
                      <div class="price">${this.cardData.price}</div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          `;

          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(this.div);

          // Setup hover events
          const marker = this.div.querySelector('.map-marker');
          const popup = this.div.querySelector('.property-popup');
          let hideTimer;

          const showPopup = () => {
            clearTimeout(hideTimer);
            popup.classList.add('show');
          };

          const hidePopupDelayed = () => {
            hideTimer = setTimeout(() => {
              popup.classList.remove('show');
            }, 2000);
          };

          marker.addEventListener('mouseenter', showPopup);
          marker.addEventListener('mouseleave', hidePopupDelayed);
          popup.addEventListener('mouseenter', showPopup);
          popup.addEventListener('mouseleave', hidePopupDelayed);
        }

        draw() {
          const overlayProjection = this.getProjection();
          const position = overlayProjection.fromLatLngToDivPixel(this.position);
          
          if (this.div) {
            this.div.style.position = 'absolute';
            this.div.style.left = position.x + 'px';
            this.div.style.top = position.y + 'px';
          }
        }

        onRemove() {
          if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
          }
        }
      };

      // Получаем дополнительные данные из карточки
      const type = cardData.title?.split('•')[0].trim() || '';
      const image = document.querySelector(`a[href="${cardData.link}"] img`)?.src || '';

      const customMarker = new CustomMarker(
        results[0].geometry.location, 
        map, 
        {
          ...cardData,
          type: type,
          image: image
        }
      );
      markers.push(customMarker);
    }
  });
}

// Функции для фильтрации
function filterByAddress(address) {
  if (!address) return;

  const normalizedAddress = address.toLowerCase();
  const cards = document.querySelectorAll('.catalog-card-rent');

  cards.forEach(card => {
    const cardLocation = card.querySelector('.catalog-location-rent')?.textContent.toLowerCase() || '';
    const shouldShow = cardLocation.includes(normalizedAddress) || 
                      normalizedAddress.includes(cardLocation);
    
    card.style.display = shouldShow ? '' : 'none';
  });

  if (map) {
    setTimeout(loadMarkers, 100);
  }
}

function applyFilters() {
  const filters = {
    zone: document.querySelector('#district').value,
    rooms: document.querySelector('#rooms').value,
    type: document.querySelector('#type').value,
    category: document.querySelector('#category').value,
    priceRange: document.querySelector('#price-range').value,
    location: document.querySelector('#location').value
  };

  const cards = document.querySelectorAll('.catalog-card-rent');

  cards.forEach(card => {
    let showCard = true;

    if (filters.zone) {
      const cardZone = card.querySelector('[fs-cmsfilter-field="zone"]')?.textContent.trim();
      if (cardZone !== filters.zone) showCard = false;
    }

    if (filters.rooms && showCard) {
      const cardRooms = card.querySelector('[fs-cmsfilter-field="Rooms"]')?.textContent.trim();
      if (cardRooms !== filters.rooms) showCard = false;
    }

    if (filters.type && showCard) {
      const cardType = card.querySelector('[fs-cmsfilter-field="Type"]')?.textContent.trim();
      if (cardType !== filters.type) showCard = false;
    }

    if (filters.category && showCard) {
      const cardCategory = card.querySelector('[fs-cmsfilter-field="Category"]')?.textContent.trim();
      if (cardCategory !== filters.category) showCard = false;
    }

    if (filters.location && showCard) {
      const cardLocation = card.querySelector('.catalog-location-rent')?.textContent.toLowerCase();
      const searchLocation = filters.location.toLowerCase();
      if (!cardLocation?.includes(searchLocation)) showCard = false;
    }

    if (filters.priceRange && showCard) {
      const priceElement = card.querySelector('.catalog-price-rent');
      if (priceElement) {
        const price = parseInt(priceElement.textContent.replace(/\D/g, ''));
        
        let showByPrice = false;
        switch(filters.priceRange) {
          case '0-25000':
            showByPrice = price <= 25000;
            break;
          case '25000-50000':
            showByPrice = price > 25000 && price <= 50000;
            break;
          case '50000-75000':
            showByPrice = price > 50000 && price <= 75000;
            break;
          case '75000-100000':
            showByPrice = price > 75000 && price <= 100000;
            break;
          case '100000+':
            showByPrice = price > 100000;
            break;
          default:
            showByPrice = true;
        }

        if (!showByPrice) showCard = false;
      }
    }

    card.style.display = showCard ? '' : 'none';
  });

  closeFilterPopup();
  if (map) {
    setTimeout(loadMarkers, 100);
  }
}

function resetFilters() {
  document.querySelectorAll('select').forEach(select => select.value = '');
  document.querySelector('#location').value = '';
  document.querySelectorAll('.catalog-card-rent').forEach(card => {
    card.style.display = '';
  });
  if (map) {
    loadMarkers();
  }
}

// Функция для обновления состояния кнопок
function updateButtonsState(isLoading) {
  const buttons = [
    document.querySelector('.catalog-button-filter'),
    document.querySelector('.view-map'),
    document.querySelector('.map-button')
  ];
  
  buttons.forEach(btn => {
    if (btn) {
      if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Идет загрузка...';
        btn.style.opacity = '0.7';
        btn.style.cursor = 'wait';
      } else {
        if (btn.dataset.originalText) {
          btn.textContent = btn.dataset.originalText;
        }
        btn.style.opacity = '';
        btn.style.cursor = '';
      }
    }
  });
}

// Создаем экземпляр приложения
const app = new RealEstateApp();
