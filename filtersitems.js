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

  // Создаем Set для хранения уникальных значений
  const uniqueValues = new Set();
  
  // Добавляем значение по умолчанию
  uniqueValues.add(defaultText);
  
  // Получаем все элементы с атрибутом fs-cmsfilter-field
  document.querySelectorAll(`[fs-cmsfilter-field="${fieldName}"]`).forEach(item => {
    const value = item.textContent.trim();
    if (value && value !== defaultText) {
      // Для поля Type преобразуем английские значения в русские
      if (fieldName === 'Type') {
        if (value === 'House') uniqueValues.add('Дом');
        else if (value === 'Apartment') uniqueValues.add('Апартаменты');
        else uniqueValues.add(value);
      } 
      // Для поля zone (районы) форматируем значения
      else if (fieldName === 'zone') {
        if (value.includes('Prague')) {
          uniqueValues.add(value.trim());
        }
      }
      else {
        uniqueValues.add(value);
      }
    }
  });

  // Преобразуем Set в массив и сортируем
  const sortedValues = Array.from(uniqueValues)
    .filter(value => value !== defaultText) // Удаляем значение по умолчанию из сортировки
    .sort((a, b) => a.localeCompare(b, 'ru')); // Сортируем с учетом русского языка

  // Очищаем select
  select.innerHTML = '';
  
  // Добавляем опцию по умолчанию первой
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = defaultText;
  select.appendChild(defaultOption);

  // Добавляем остальные отсортированные значения
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
  // Очищаем существующие маркеры
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  // Получаем все видимые карточки
  const cards = document.querySelectorAll('.catalog-card-rent:not([style*="display: none"])');
  
  cards.forEach(card => {
    const cardData = {
      title: card.querySelector('.catalog-title-rent')?.textContent || '',
      price: card.querySelector('.catalog-price-rent')?.textContent || '',
      location: card.querySelector('.catalog-location-rent')?.textContent || '',
      image: card.querySelector('img')?.src || '',
      type: card.querySelector('[fs-cmsfilter-field="Type"]')?.textContent || '',
      rooms: card.querySelector('[fs-cmsfilter-field="Rooms"]')?.textContent || ''
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
      // Создаем кастомный маркер как SVG
      const markerSvg = {
        path: 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
        fillColor: '#090909',
        fillOpacity: 1,
        strokeWeight: 0,
        rotation: 0,
        scale: 1,
        labelOrigin: new google.maps.Point(0, -30)
      };

      // Создаем маркер
      const marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: map,
        icon: markerSvg,
        label: {
          text: `${cardData.price.replace(/[^0-9]/g, '')} CZK`,
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: '500'
        }
      });

      // Создаем InfoWindow с кастомным стилем
      const infowindow = new google.maps.InfoWindow({
        content: `
          <div style="
            width: 300px;
            padding: 16px;
            border-radius: 12px;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          ">
            <div style="
              display: flex;
              gap: 12px;
            ">
              <img src="${cardData.image || 'https://assets.website-files.com/67c42e66e687338b49c89be5/67c42e66e687338b49c89c0c_Rectangle%2012.jpg'}" 
                style="
                  width: 120px;
                  height: 80px;
                  object-fit: cover;
                  border-radius: 8px;
                "
              >
              <div style="
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              ">
                <div style="
                  font-size: 14px;
                  color: #666;
                  margin-bottom: 4px;
                ">${cardData.type} • ${cardData.rooms || ''}</div>
                <div style="
                  font-size: 13px;
                  color: #888;
                  margin-bottom: 8px;
                ">${cardData.location}</div>
                <div style="
                  font-size: 16px;
                  color: #090909;
                  font-weight: bold;
                ">${cardData.price}</div>
              </div>
            </div>
          </div>
        `,
        pixelOffset: new google.maps.Size(0, -20)
      });

      // Добавляем обработчики событий
      marker.addListener('mouseover', () => {
        infowindow.open(map, marker);
      });

      marker.addListener('mouseout', () => {
        setTimeout(() => {
          if (!isMouseOverInfoWindow) {
            infowindow.close();
          }
        }, 300);
      });

      // Переменная для отслеживания положения мыши над InfoWindow
      let isMouseOverInfoWindow = false;

      // Добавляем обработчики для InfoWindow
      google.maps.event.addListener(infowindow, 'domready', () => {
        const iwContainer = document.querySelector('.gm-style-iw');
        if (iwContainer) {
          iwContainer.addEventListener('mouseenter', () => {
            isMouseOverInfoWindow = true;
          });
          iwContainer.addEventListener('mouseleave', () => {
            isMouseOverInfoWindow = false;
            infowindow.close();
          });
        }
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
