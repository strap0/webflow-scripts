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

  // Получаем все уникальные значения
  const values = new Set();
  document.querySelectorAll(`[fs-cmsfilter-field="${fieldName}"]`).forEach(item => {
    const value = item.textContent.trim();
    if (value && value !== defaultText) {
      // Конвертируем английские значения в русские для Type
      if (fieldName === 'Type') {
        if (value === 'House') values.add('Дом');
        else if (value === 'Apartment') values.add('Апартаменты');
        else values.add(value);
      } else {
        values.add(value);
      }
    }
  });

  // Создаем массив из уникальных значений и сортируем
  const sortedValues = Array.from(values).sort((a, b) => 
    a.localeCompare(b, 'ru')
  );

  // Очищаем select и добавляем опцию по умолчанию
  select.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = defaultText;
  select.appendChild(defaultOption);

  // Добавляем отсортированные значения
  sortedValues.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
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
      const marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: map,
        label: {
          text: cardData.price,
          color: '#2196F3',
          fontSize: '13px',
          fontWeight: 'bold'
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 16px; max-width: 300px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; color: #2196F3;">${cardData.title}</h3>
            <p style="margin: 0 0 8px; color: #666;">${cardData.location}</p>
            <p style="margin: 0 0 16px; font-size: 18px; font-weight: bold; color: #2196F3;">${cardData.price}</p>
            <a href="${cardData.link}" style="
              display: inline-block;
              padding: 8px 16px;
              background: #2196F3;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 500;
              transition: background-color 0.3s;
            ">Подробнее</a>
          </div>
        `
      });

      marker.addListener('click', () => {
        markers.forEach(m => m.infoWindow?.close());
        infoWindow.open(map, marker);
        marker.infoWindow = infoWindow;
      });

      markers.push(marker);
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
