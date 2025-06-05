

// в2Глобальные переменные
let map;
let markers = [];
let autocomplete;
let mapAutocomplete;
let isGoogleMapsLoaded = false;
  let activeMarkerBox = null;

// Добавляем переводы для значений CMS
const cmsTranslations = {
  // Тип недвижимости
  'Apartment': { en: 'Apartment', cs: 'Byt', ru: 'Квартира' },
  'House': { en: 'House', cs: 'Dům', ru: 'Дом' },
  'Commercial space': { en: 'Commercial space', cs: 'Komerční prostor', ru: 'Коммерческая недвижимость' },
  
  // Тип сделки
  'Rent': { en: 'Rent', cs: 'Pronájem', ru: 'Аренда' },
  'Sale': { en: 'Sale', cs: 'Prodej', ru: 'Продажа' },
  
  // Районы
  'Suburbs': { en: 'Suburbs', cs: 'Okolí', ru: 'Пригород' },
  
  // Количество комнат
  '1+kk': { en: '1+kk', cs: '1+kk', ru: '1+кк' },
  '1+1': { en: '1+1', cs: '1+1', ru: '1+1' },
  '2+kk': { en: '2+kk', cs: '2+kk', ru: '2+кк' },
  '2+1': { en: '2+1', cs: '2+1', ru: '2+1' },
  '3+kk': { en: '3+kk', cs: '3+kk', ru: '3+кк' },
  '3+1': { en: '3+1', cs: '3+1', ru: '3+1' },
  '4+kk': { en: '4+kk', cs: '4+kk', ru: '4+кк' },
  '4+1': { en: '4+1', cs: '4+1', ru: '4+1' },
  '5+kk': { en: '5+kk', cs: '5+kk', ru: '5+кк' },
  '5+1': { en: '5+1', cs: '5+1', ru: '5+1' },
  '6 and more': { en: '6 and more', cs: '6 a více', ru: '6 и более' }
};

// Добавляем переводы для системных сообщений
const systemMessages = {
  noResults: {
    en: "We couldn't find any listings matching your filters. Try changing your search settings.",
    cs: "Nenašli jsme žádné nabídky odpovídající vašim filtrům. Zkuste změnit nastavení vyhledávání.",
    ru: "Мы не нашли объявлений, соответствующих вашим фильтрам. Попробуйте изменить параметры поиска."
  }
};

// Добавляем переводы для ценовых диапазонов
const priceRangeTranslations = {
  rent: [
    {
      value: '0-25000',
      text: {
        en: 'Up to 25 000 CZK/mo',
        cs: 'Do 25 000 Kč/měs',
        ru: 'До 25 000 крон/мес'
      }
    },
    {
      value: '25000-50000',
      text: {
        en: '25 000 – 50 000 CZK/mo',
        cs: '25 000 – 50 000 Kč/měs',
        ru: '25 000 – 50 000 крон/мес'
      }
    },
    {
      value: '50000-75000',
      text: {
        en: '50 000 – 75 000 CZK/mo',
        cs: '50 000 – 75 000 Kč/měs',
        ru: '50 000 – 75 000 крон/мес'
      }
    },
    {
      value: '75000-100000',
      text: {
        en: '75 000 – 100 000 CZK/mo',
        cs: '75 000 – 100 000 Kč/měs',
        ru: '75 000 – 100 000 крон/мес'
      }
    },
    {
      value: '100000+',
      text: {
        en: 'Over 100 000 CZK/mo',
        cs: 'Nad 100 000 Kč/měs',
        ru: 'Более 100 000 крон/мес'
      }
    }
  ],
  sale: [
    {
      value: '0-5000000',
      text: {
        en: 'Up to 5 000 000 CZK',
        cs: 'Do 5 000 000 Kč',
        ru: 'До 5 000 000 крон'
      }
    },
    {
      value: '5000000-8000000',
      text: {
        en: '5 000 000 – 8 000 000 CZK',
        cs: '5 000 000 – 8 000 000 Kč',
        ru: '5 000 000 – 8 000 000 крон'
      }
    },
    {
      value: '8000000-12000000',
      text: {
        en: '8 000 000 – 12 000 000 CZK',
        cs: '8 000 000 – 12 000 000 Kč',
        ru: '8 000 000 – 12 000 000 крон'
      }
    },
    {
      value: '12000000-16000000',
      text: {
        en: '12 000 000 – 16 000 000 CZK',
        cs: '12 000 000 – 16 000 000 Kč',
        ru: '12 000 000 – 16 000 000 крон'
      }
    },
    {
      value: '16000000-20000000',
      text: {
        en: '16 000 000 – 20 000 000 CZK',
        cs: '16 000 000 – 20 000 000 Kč',
        ru: '16 000 000 – 20 000 000 крон'
      }
    },
    {
      value: '20000000-25000000',
      text: {
        en: '20 000 000 – 25 000 000 CZK',
        cs: '20 000 000 – 25 000 000 Kč',
        ru: '20 000 000 – 25 000 000 крон'
      }
    },
    {
      value: '25000000+',
      text: {
        en: 'Over 25 000 000 CZK',
        cs: 'Nad 25 000 000 Kč',
        ru: 'Более 25 000 000 крон'
      }
    }
  ]
};

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
      loadCMSOptions(); // Загружаем опции для чекбоксов
    });
  }

  // Настройка кнопок
  setupButtons() {
    // Кнопка открытия фильтров
    const filterButtons = document.querySelectorAll('.catalog-button-filter, .catalog-button-title');
    filterButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          openFilterPopup();
        });
      }
    });

    // Кнопка просмотра на карте
    const viewMapBtn = document.querySelector('.view-map');
    if (viewMapBtn) {
      viewMapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        requestAnimationFrame(() => {
          const visibleCards = Array.from(document.querySelectorAll('.catalog-card-rent'))
            .filter(card => !card.classList.contains('is-hidden'));
          openMapPopup(visibleCards);
        });
      });
    }
  }

  // Настройка попапов
  setupPopups() {
    // Настройка попапа фильтров
    const filterPopup = document.querySelector('.popup-filter');
    const filterCloseBtn = filterPopup?.querySelector('.close-button');
    
    if (filterCloseBtn && filterPopup) {
      filterCloseBtn.addEventListener('click', () => {
        closeFilterPopup();
      });

      filterPopup.addEventListener('click', (e) => {
        if (e.target === filterPopup) {
          closeFilterPopup();
        }
      });
    }

    // Настройка попапа карты
    const mapPopup = document.querySelector('.popup-map');
    const mapCloseBtn = mapPopup?.querySelector('.close-button');
    
    if (mapCloseBtn && mapPopup) {
      mapCloseBtn.addEventListener('click', () => {
        closeMapPopup();
      });

      mapPopup.addEventListener('click', (e) => {
        if (e.target === mapPopup) {
          closeMapPopup();
        }
      });
    }

    // Обработчик клавиши Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeFilterPopup();
        closeMapPopup();
      }
    });
  }

  // Инициализация фильтров
  initFilters() {
      this.setupCategorySelect();
      this.cleanSelectOnce('#type', 'Type', 'All types');
      this.cleanSelectOnce('#district', 'zone', 'All areas');
      this.cleanSelectOnce('#rooms', 'Rooms', 'Any');
  }

  // Настройка сообщения об отсутствии результатов
  setupNoResultsMessage() {
    const catalogList = document.querySelector('.catalog-items-rent');
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

      const lang = getCurrentLanguage();
      noResultsMsg.textContent = systemMessages.noResults[lang] || systemMessages.noResults.en;
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
  
    // === КАТЕГОРИИ: только Rent и Sale, без 'Все' ===
    setupCategorySelect() {
      const select = document.querySelector('#category');
      if (!select) return;
      select.innerHTML = '';
      const options = [
        { value: 'Rent', text: 'Rent' },
        { value: 'Sale', text: 'Sale' }
      ];
      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        select.appendChild(option);
      });
      select.value = 'Rent';
      console.log('[setupCategorySelect] Селект категорий инициализирован, выбрано:', select.value);
    }
  
    // === Остальные селекты (без "Все") ===
    cleanSelectOnce(selectId, fieldName, defaultText) {
      const select = document.querySelector(selectId);
      if (!select) return;
      const validValues = new Set();
      document.querySelectorAll(`[fs-cmsfilter-field="${fieldName}"]`).forEach(item => {
        const value = item.textContent.trim();
        if (value && !value.includes('Все') && value !== defaultText) {
          validValues.add(value);
        }
      });
      const sortedValues = Array.from(validValues)
        .sort((a, b) => {
          const aMatch = a.match(/Prague\s*(\d+)/);
          const bMatch = b.match(/Prague\s*(\d+)/);
          if (aMatch && bMatch) {
            return parseInt(aMatch[1]) - parseInt(bMatch[1]);
          }
          return a.localeCompare(b, 'ru');
        });
      select.innerHTML = '';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = defaultText;
      select.appendChild(defaultOption);
      sortedValues.forEach(value => {
        if (value.length < 30) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        }
      });
      console.log(`[cleanSelectOnce] ${selectId} заполнен, значений:`, sortedValues.length);
  }
}

// Получение видимых карточек (для маркеров на карте)
function getVisibleCards() {
  return Array.from(document.querySelectorAll('.catalog-card-rent:not(.is-hidden)'));
}

// Функции для работы с селектами
function loadSelectOptions(selectId, fieldName, defaultText) {
  const select = document.querySelector(selectId);
  if (!select) return;

  const uniqueValues = new Set();
  uniqueValues.add(defaultText);

 document.querySelectorAll(`[fs-cmsfilter-field="${fieldName}"]`).forEach(item => {
  // Если внутри есть .zone-clean, берём именно его текст, иначе стандартный textContent
  const span = item.querySelector('.zone-clean');
  let value = span ? span.textContent.trim() : item.textContent.trim();

    if (!value || value === defaultText) return;

    // Преобразование для поля Type
    if (fieldName === 'Type') {
      if (value === 'House') uniqueValues.add('Houses');
      else if (value === 'Apartment') uniqueValues.add('Apartments');
      else uniqueValues.add(value);
    }

    // Преобразование для поля zone
    else if (fieldName === 'zone') {
      if (value.includes('Prague')) {
        value = value.replace(/,\s*$/, ''); // Удаляем запятую на конце
        uniqueValues.add(value);
      }
    }

    // Все остальные поля
    else {
      uniqueValues.add(value);
    }
  });

const sortedValues = Array.from(uniqueValues)
  .filter(value => value !== defaultText)
  .sort((a, b) => {
    const aMatch = a.match(/Prague\s*(\d+)/);
    const bMatch = b.match(/Prague\s*(\d+)/);

    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }

    return a.localeCompare(b, 'ru');
  });

  
  select.innerHTML = '';

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = defaultText;
  select.appendChild(defaultOption);

  sortedValues.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

// Функция для получения текущего языка
function getCurrentLanguage() {
  const lang = document.documentElement.lang;
  if (lang === 'ru') return 'ru';
  if (lang === 'cs' || lang === 'cz') return 'cs';
  return 'en';
}

// Функция для перевода значения
function translateCmsValue(value, lang = getCurrentLanguage()) {
  if (cmsTranslations[value] && cmsTranslations[value][lang]) {
    return cmsTranslations[value][lang];
  }
  return value;
}

// Модифицируем функцию loadCMSOptions для правильной сортировки типов
function loadCMSOptions() {
  const lang = getCurrentLanguage();
  const config = [
    { id: 'type', cmsField: 'Type' },
    { id: 'category', cmsField: 'Category' },
    { id: 'district', cmsField: 'zone' },
    { id: 'rooms', cmsField: 'Rooms' },
  ];

  config.forEach(({ id, cmsField }) => {
    const container = document.getElementById(id);
    if (!container) return;

    const values = new Set();
    
    if (id === 'district') {
      for (let i = 1; i <= 22; i++) {
        values.add(`Prague ${i}`);
      }
      values.add('Suburbs');
    } else if (id === 'rooms') {
      ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6 and more'].forEach(room => {
        values.add(room);
      });
    } else if (id === 'category') {
      // Фиксированный порядок для категорий
      values.add('Rent');
      values.add('Sale');
    } else {
      document.querySelectorAll(`[fs-cmsfilter-field="${cmsField}"]`).forEach(item => {
        const text = item.textContent.trim();
        if (text) values.add(text);
      });
    }

    container.innerHTML = '';
    let sortedValues = Array.from(values);

    // Специальная сортировка для разных типов
    if (id === 'district') {
      sortedValues.sort((a, b) => {
        const aMatch = a.match(/Prague\s*(\d+)/);
        const bMatch = b.match(/Prague\s*(\d+)/);
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        return a.localeCompare(b);
      });
    } else if (id === 'rooms') {
      const roomOrder = {
        '1+kk': 0, '1+1': 1,
        '2+kk': 2, '2+1': 3,
        '3+kk': 4, '3+1': 5,
        '4+kk': 6, '4+1': 7,
        '5+kk': 8, '5+1': 9,
        '6 and more': 10
      };
      sortedValues.sort((a, b) => (roomOrder[a] || 99) - (roomOrder[b] || 99));
    } else if (id === 'type') {
      // Фиксированный порядок для типов недвижимости
      const typeOrder = ['Apartment', 'House', 'Commercial space'];
      sortedValues.sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));
    }

    sortedValues.forEach(val => {
      const label = document.createElement('label');
      label.style.display = 'block';
      const translatedValue = translateCmsValue(val, lang);
      label.innerHTML = `
        <input type="checkbox" value="${val}"> ${translatedValue}
      `;
      container.appendChild(label);
    });
  });
}

// Обновленная функция updatePriceRangeOptions
function updatePriceRangeOptions() {
  const lang = getCurrentLanguage();
  const priceRange = document.querySelector('#price-range-multiselect');
  if (!priceRange) return;

  // Уничтожаем текущий экземпляр Choices.js если он существует
  if (window.priceRangeChoices) {
    window.priceRangeChoices.destroy();
  }

  // Очищаем селект
  priceRange.innerHTML = '';

  // Создаем группы опций
  const rentGroup = document.createElement('optgroup');
  rentGroup.label = {
    en: 'Rent',
    cs: 'Pronájem',
    ru: 'Аренда'
  }[lang] || 'Rent';

  const saleGroup = document.createElement('optgroup');
  saleGroup.label = {
    en: 'Sale',
    cs: 'Prodej',
    ru: 'Продажа'
  }[lang] || 'Sale';

  // Добавляем все опции
  priceRangeTranslations.rent.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text[lang] || opt.text.en;
    rentGroup.appendChild(option);
  });

  priceRangeTranslations.sale.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text[lang] || opt.text.en;
    saleGroup.appendChild(option);
  });

  // Добавляем группы в селект
  priceRange.appendChild(rentGroup);
  priceRange.appendChild(saleGroup);

  // Инициализируем Choices.js
  window.priceRangeChoices = new Choices(priceRange, {
    removeItemButton: true,
    searchEnabled: false,
    placeholder: true,
    placeholderValue: {
      en: 'Select price range',
      cs: 'Vyberte cenové rozpětí',
      ru: 'Выберите ценовой диапазон'
    }[lang] || 'Select price range',
    shouldSort: false,
    itemSelectText: ''
  });
}

// Добавляем слушатель для чекбоксов категорий
document.addEventListener('DOMContentLoaded', () => {
  const categoryInputs = document.querySelectorAll('#category input[type="checkbox"]');
  categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
      const checkedCategories = Array.from(categoryInputs)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      updatePriceRangeOptions(checkedCategories);
    });
  });
});

// Глобальная функция для получения выбранных чекбоксов
function getCheckedValues(id) {
  if (id === 'district') {
    return window.districtChoices ? window.districtChoices.getValue(true) : [];
  }
  if (id === 'rooms') {
    return window.roomsChoices ? window.roomsChoices.getValue(true) : [];
  }
  if (id === 'price-range') {
    return window.priceRangeChoices ? window.priceRangeChoices.getValue(true) : [];
  }
  return Array.from(document.querySelectorAll(`#${id} input[type="checkbox"]:checked`)).map(cb => cb.value);
}

function openFilterPopup() {
  const popup = document.querySelector('.popup-filter');
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    fillPriceRangeOptions();

    const showBtn = document.querySelector('.show-results');
    if (showBtn) {
      showBtn.onclick = function() {
        applyFilters();
        closeFilterPopup();
      };
    }
  }
}

function closeFilterPopup() {
  const popup = document.querySelector('.popup-filter');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function openMapPopup(visibleCards = []) {
  const popup = document.querySelector('.popup-map');
  if (popup) {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (!map && typeof google !== 'undefined') {
      setTimeout(() => initMap(visibleCards), 100);
    } else if (map) {
      google.maps.event.trigger(map, 'resize');
      setTimeout(() => loadMarkers(visibleCards), 100);
    }
  }
}

function closeMapPopup() {
  const popup = document.querySelector('.popup-map');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }
  removeGlobalPopupAndActiveMarker();
}

// Функции для работы с картой
function initMap(visibleCards = []) {
  isGoogleMapsLoaded = true;
  updateButtonsState(false);

  const prague = { lat: 50.0755, lng: 14.4378 };

  map = new google.maps.Map(document.getElementById('map'), {
  zoom: 12,
  center: prague,
  styles: [{
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }],
  mapTypeControl: false,
  fullscreenControl: false,
  streetViewControl: false,
  gestureHandling: 'greedy' // ✅ ЭТО ДОБАВЛЯЕТ ОДНОПАЛЬЦЕВОЕ ПЕРЕМЕЩЕНИЕ
});

  setupAutocomplete();
  setTimeout(() => loadMarkers(visibleCards), 100); // добавляем задержку
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
    // Убираем автоматическую фильтрацию, чтобы фильтр применялся только по кнопке
    const place = autocomplete.getPlace();
    // Можно сохранить адрес, если захочешь использовать позже вручную
    // filters.location = place.formatted_address;
  });
}
}

  function loadMarkers(visibleCards = []) {
    // Полная очистка всех маркеров
    clearAllMarkers();
  
    // Получаем карточки для отображения на карте
    const cards = visibleCards.length
      ? visibleCards
      : Array.from(document.querySelectorAll('.catalog-card-rent:not(.is-hidden)'));
  
    // Создаем массив для хранения промисов геокодирования
    const geocodePromises = [];
  
    cards.forEach(card => {
      const cardData = {
        title: card.querySelector('.catalog-title-rent')?.textContent || '',
        price: card.querySelector('.catalog-price-rent')?.textContent || '',
        location: card.querySelector('.catalog-location-rent')?.textContent || '',
        image: card.querySelector('img')?.src || '',
        type: card.querySelector('[fs-cmsfilter-field="Type"]')?.textContent || '',
        rooms: card.querySelector('[fs-cmsfilter-field="Rooms"]')?.textContent || '',
        link: card.querySelector('a')?.href || '#'
      };
  
      if (cardData.location) {
        const promise = new Promise((resolve) => {
          const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: `${cardData.location}, Prague` }, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve({ ...cardData, position: results[0].geometry.location });
            } else {
              resolve(null);
            }
          });
        });
        geocodePromises.push(promise);
      }
    });
  
    // Ждем завершения всех геокодирований
    Promise.all(geocodePromises).then(results => {
      results.filter(cardData => cardData && cardData.position).forEach(cardData => {
        createMarkerForCard(cardData);
      });
    });
  }
  
  // Функция для полной очистки всех маркеров
  function clearAllMarkers() {
    markers.forEach(marker => {
      if (marker.setMap) {
        marker.setMap(null);
      }
      if (marker.onRemove) {
        marker.onRemove();
      }
    });
    markers = [];
  }
  
  // --- ДОБАВЛЯЕМ SVG КРЕСТИК ---
  const CROSS_SVG = `<img src="https://cdn.prod.website-files.com/67c42e66e687338b49c89be5/67f13f5731b69e4194170692_cross.svg" alt="Закрыть" style="width:24px;height:24px;display:block;">`;

  // Обновленная функция создания маркера
  function createMarkerForCard(cardData) {
    if (!cardData || !cardData.position) return;
  
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="map-marker-wrapper">
        <div class="map-marker">
          ${formatPrice(cardData.price)}
          <div class="marker-pointer"></div>
        </div>
        <div class="property-popup">
          <div class="popup-content">
            <img src="${cardData.image}" alt="${cardData.title}">
            <div class="popup-info">
              <div class="property-type">${cardData.type} • ${cardData.rooms}</div>
              <div class="address">${cardData.location}</div>
              <div class="price">${cardData.price}</div>
            </div>
          </div>
          <button class="popup-close-btn" style="position:absolute;top:8px;right:12px;background:none;border:none;padding:0;cursor:pointer;z-index:10;">${CROSS_SVG}</button>
        </div>
      </div>
    `;

    const markerDiv = wrapper.firstElementChild;
    const markerBox = markerDiv.querySelector('.map-marker');
    const popup = markerDiv.querySelector('.property-popup');
    const closeBtn = markerDiv.querySelector('.popup-close-btn');
    const markerWrapper = markerDiv;

    let isPopupPinned = false;
    let hideTimer;

    // --- Закрыть все попапы и снять активность со всех меток ---
    function closeAllPopupsExceptCurrent() {
      document.querySelectorAll('.property-popup.show').forEach(p => {
        if (p !== popup) p.classList.remove('show');
      });
      document.querySelectorAll('.map-marker-wrapper.is-active').forEach(w => {
        if (w !== markerWrapper) w.classList.remove('is-active');
      });
    }

    // --- Десктоп: Наведение ---
    const showPopup = () => {
      clearTimeout(hideTimer);
      if (!popup.classList.contains('show')) popup.classList.add('show');
      markerDiv.style.zIndex = '99999';
      markerWrapper.classList.add('is-active');
    };
    const hidePopupDelayed = () => {
      if (isPopupPinned) return;
      hideTimer = setTimeout(() => {
        popup.classList.remove('show');
        markerDiv.style.zIndex = '1';
        markerWrapper.classList.remove('is-active');
      }, 300);
    };

    // --- Десктоп: Клик ---
    markerBox.addEventListener('click', (e) => {
      if (window.innerWidth > 767) {
        e.stopPropagation();
        if (cardData.link) {
          window.open(cardData.link, '_blank');
          return;
        }
      } else {
        // Мобильная логика (оставляем как было)
        showGlobalPopup(cardData, markerBox);
      }
    });

    // --- Наведение только для десктопа ---
    markerBox.addEventListener('mouseenter', () => { if (window.innerWidth > 767) showPopup(); });
    markerBox.addEventListener('mouseleave', () => { if (window.innerWidth > 767) hidePopupDelayed(); });
    popup.addEventListener('mouseenter', () => { if (window.innerWidth > 767) showPopup(); });
    popup.addEventListener('mouseleave', () => { if (window.innerWidth > 767) hidePopupDelayed(); });

    // --- Клик по попапу открывает карточку (и десктоп, и мобила) ---
    if (cardData.link) {
      popup.addEventListener('click', (e) => {
        if (e.target.closest('.popup-close-btn')) return;
        window.open(cardData.link, '_blank');
      });
    }

    // --- Крестик закрытия ---
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isPopupPinned = false;
      popup.classList.remove('show');
      markerDiv.style.zIndex = '1';
      markerWrapper.classList.remove('is-active');
    });

    // --- Мобильная версия: клик по попапу открывает карточку ---
    // (уже реализовано выше)

    const overlay = new google.maps.OverlayView();
    overlay.onAdd = function() {
      this.div = markerDiv;
      const panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(this.div);
    };
    overlay.draw = function() {
      if (!this.div) return;
      const projection = this.getProjection();
      const positionPx = projection.fromLatLngToDivPixel(cardData.position);
      if (positionPx) {
        this.div.style.left = `${positionPx.x}px`;
        this.div.style.top = `${positionPx.y}px`;
        this.div.style.position = 'absolute';
        this.div.style.transform = 'translate(-50%, -100%)';
      }
    };
    overlay.onRemove = function() {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
      }
      this.div = null;
    };
    google.maps.event.addListener(map, 'dragend', () => {
      overlay.draw();
    });
    google.maps.event.addListener(map, 'zoom_changed', () => {
      overlay.draw();
    });
    overlay.setMap(map);
    markers.push(overlay);
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
  // Получаем выбранные галочки Rent/Sale
  const checkedCategories = Array.from(document.querySelectorAll('#category input[type="checkbox"]:checked')).map(cb => cb.value);
  const rentBtn = document.querySelector('.deal-btn[data-category="Rent"]');
  const saleBtn = document.querySelector('.deal-btn[data-category="Sale"]');

  // Синхронизация активности кнопок
  if (checkedCategories.includes('Rent') && checkedCategories.includes('Sale')) {
    if (rentBtn) rentBtn.classList.remove('active');
    if (saleBtn) saleBtn.classList.remove('active');
  } else if (checkedCategories.includes('Rent')) {
    if (rentBtn) rentBtn.classList.add('active');
    if (saleBtn) saleBtn.classList.remove('active');
  } else if (checkedCategories.includes('Sale')) {
    if (saleBtn) saleBtn.classList.add('active');
    if (rentBtn) rentBtn.classList.remove('active');
  } else {
    if (rentBtn) rentBtn.classList.remove('active');
    if (saleBtn) saleBtn.classList.remove('active');
  }

  // Получаем выбранную категорию из активной кнопки (для фильтрации карточек)
  const activeDealBtn = document.querySelector('.deal-btn.active');
  const selectedCategory = activeDealBtn ? activeDealBtn.dataset.category : '';

  const filters = {
    zone: getCheckedValues('district'),
    rooms: getCheckedValues('rooms'),
    type: getCheckedValues('type'),
    category: getCheckedValues('category'),
    location: document.querySelector('#location')?.value.trim().toLowerCase(),
    priceRange: (getCheckedValues('price-range') || []).map(value => {
      // Убираем префикс при фильтрации
      const [type, range] = value.split('_');
      return range;
    }),
  };

  // Фильтрация карточек: ВСЕ, а не только видимые!
  document.querySelectorAll('[fs-cmsfilter-element="item"]').forEach(card => {
    const cardCategory = card.querySelector('[fs-cmsfilter-field="Category"]')?.textContent.trim();
    let show = true;

    // Фильтрация по Rent/Sale
    if (selectedCategory && cardCategory !== selectedCategory) show = false;

    const check = (values, selector) => {
      if (values.length === 0) return true;
      const val = card.querySelector(selector)?.textContent.trim();
      return values.includes(val);
    };

    if (!check(filters.zone, '[fs-cmsfilter-field="zone"]')) show = false;
    if (!check(filters.rooms, '[fs-cmsfilter-field="Rooms"]')) show = false;
    if (!check(filters.type, '[fs-cmsfilter-field="Type"]')) show = false;
    if (!check(filters.category, '[fs-cmsfilter-field="Category"]')) show = false;

    // --- УМНЫЙ ФИЛЬТР ПО АДРЕСУ ---
    if (filters.location && show) {
      const location = card.querySelector('.catalog-location-rent')?.textContent.toLowerCase().trim();
      const searchWords = filters.location.split(/[, \s]+/).map(w => w.trim()).filter(Boolean);
      const match = searchWords.some(word => location.includes(word));
      if (!match) show = false;
    }

    // --- Фильтрация по цене (массив чекбоксов) ---
    if (filters.priceRange.length > 0 && show) {
      const priceElement = card.querySelector('.catalog-price-rent');
      if (priceElement) {
        const price = parseInt(priceElement.textContent.replace(/[^\d]/g, ''));
        let priceInRange = false;
        filters.priceRange.forEach(range => {
          if (range.includes('+')) {
            const minPrice = parseInt(range.replace('+', ''));
            if (price >= minPrice) priceInRange = true;
          } else {
            const [min, max] = range.split('-').map(num => parseInt(num));
            if (price >= min && price <= max) priceInRange = true;
          }
        });
        if (!priceInRange) show = false;
      }
    }

    card.classList.toggle('is-hidden', !show);
  });

  saveFilterState();
  if (typeof updatePaginationAfterFilter === 'function') updatePaginationAfterFilter();
  if (window.map) setTimeout(loadMarkers, 100);
}

// Функция для сброса фильтров
function resetFilters() {
  // Сбросить обычные чекбоксы
  document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => cb.checked = false);
  // Сбросить multiselect для district, rooms, price-range
  if (window.districtChoices) window.districtChoices.removeActiveItems();
  if (window.roomsChoices) window.roomsChoices.removeActiveItems();
  if (window.priceRangeChoices) window.priceRangeChoices.removeActiveItems();

  const locationInput = document.querySelector('#location');
  if (locationInput) locationInput.value = '';

  sessionStorage.removeItem('filterState'); // Очищаем сохраненное состояние

  document.querySelectorAll('.catalog-card-rent, [fs-cmsfilter-element="item"]').forEach(card => {
    card.classList.remove('is-hidden');
  });

  if (typeof updatePaginationAfterFilter === 'function') updatePaginationAfterFilter();
  if (window.map) loadMarkers();
}

  // Перезагружаем маркеры на карте (если включена карта)
  if (map) {
    loadMarkers();
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
        btn.textContent = 'Loading ...';
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

function closeMapPopup() {
  const popup = document.querySelector('.popup-map');
  if (popup) {
    popup.style.display = 'none';
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mapPopup = document.querySelector('.popup-map');
  const closeButton = mapPopup?.querySelector('.close-button');

  if (closeButton && mapPopup) {
    closeButton.addEventListener('click', () => {
      closeMapPopup();
    });

    mapPopup.addEventListener('click', (e) => {
      if (e.target === mapPopup) {
        closeMapPopup();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMapPopup();
    }
  });

  // ✅ Автозапуск Google Autocomplete, даже без открытия карты
  if (typeof google !== 'undefined' && google.maps && google.maps.places) {
    setupAutocomplete();
  } else {
    const waitForGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        clearInterval(waitForGoogle);
        setupAutocomplete();
      }
    }, 300);
  }

  const showBtn = document.querySelector('.show-results');
  if (showBtn) {
    showBtn.addEventListener('click', () => {
      // Сначала фильтруем, потом закрываем
      applyFilters();
      closeFilterPopup();
    });
  }
});

// Создаем экземпляр приложения
const app = new RealEstateApp();

  function showGlobalPopup(cardData, markerBox) {
    let oldPopup = document.getElementById('global-property-popup');
    if (oldPopup) oldPopup.remove();
    if (activeMarkerBox) {
      activeMarkerBox.closest('.map-marker-wrapper').classList.remove('is-active');
      activeMarkerBox = null;
    }
    if (markerBox) {
      markerBox.closest('.map-marker-wrapper').classList.add('is-active');
      activeMarkerBox = markerBox;
    }
    const popup = document.createElement('div');
    popup.id = 'global-property-popup';
    popup.className = 'property-popup show';
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.bottom = '40px';
    popup.style.transform = 'translateX(-50%)';
    popup.style.zIndex = '999999';
    popup.innerHTML = `
      <div class="popup-content">
        <img src="${cardData.image}" alt="${cardData.title}">
        <div class="popup-info">
          <div class="property-type">${cardData.type} • ${cardData.rooms}</div>
          <div class="address">${cardData.location}</div>
          <div class="price">${cardData.price}</div>
        </div>
      </div>
    `;
    // SVG крестик
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close-btn';
    closeBtn.innerHTML = CROSS_SVG;
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '8px';
    closeBtn.style.right = '12px';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '28px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
      popup.remove();
      if (activeMarkerBox) {
        activeMarkerBox.closest('.map-marker-wrapper').classList.remove('is-active');
        activeMarkerBox = null;
      }
    };
    popup.appendChild(closeBtn);
    // Клик по попапу открывает карточку
    if (cardData.link) {
      popup.addEventListener('click', (e) => {
        if (e.target.closest('.popup-close-btn')) return;
        window.open(cardData.link, '_blank');
      });
    }
    document.body.appendChild(popup);
  }
  
  function removeGlobalPopupAndActiveMarker() {
    console.log('removeGlobalPopupAndActiveMarker called');
    let globalPopup = document.getElementById('global-property-popup');
    if (globalPopup) globalPopup.remove();
    if (activeMarkerBox) {
      activeMarkerBox.closest('.map-marker-wrapper').classList.remove('is-active');
      activeMarkerBox = null;
    }
}

// === Динамическое обновление опций цены ===
function updatePriceRangeOptions(categories) {
  const lang = getCurrentLanguage();
  const priceRange = document.querySelector('#price-range-multiselect');
  if (!priceRange) return;

  // Уничтожаем текущий экземпляр Choices.js если он существует
  if (window.priceRangeChoices) {
    window.priceRangeChoices.destroy();
  }

  // Очищаем селект
  priceRange.innerHTML = '';

  let cats = Array.isArray(categories) ? categories : [categories];
  const showRent = cats.includes('Rent');
  const showSale = cats.includes('Sale');

  // Функция для добавления опций с учетом языка
  function addOptions(options) {
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text[lang] || opt.text.en;
      priceRange.appendChild(option);
    });
  }

  // Добавляем опции в зависимости от выбранных категорий
  if (showSale && !showRent) {
    addOptions(priceRangeTranslations.sale);
  } else if (showRent && !showSale) {
    addOptions(priceRangeTranslations.rent);
  } else if (showRent && showSale) {
    addOptions(priceRangeTranslations.rent);
    addOptions(priceRangeTranslations.sale);
  }

  // Создаем новый экземпляр Choices.js
  window.priceRangeChoices = new Choices(priceRange, {
    removeItemButton: true,
    searchEnabled: false,
    placeholder: true,
    placeholderValue: {
      en: 'Select price range',
      cs: 'Vyberte cenové rozpětí',
      ru: 'Выберите ценовой диапазон'
    }[lang] || 'Select price range',
    shouldSort: false,
    itemSelectText: '',
    renderSelectedChoices: 'auto'
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll('.deal-btn');
  const categorySelect = document.querySelector('#category');
  const priceRange = document.querySelector('#price-range-multiselect');

  function setActive(btn) {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // Обработчик изменения селекта категорий в попапе
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      updatePriceRangeOptions();
      const value = categorySelect.value;
      const matchingBtn = document.querySelector(`.deal-btn[data-category="${value}"]`);
      if (matchingBtn) {
        setActive(matchingBtn);
      }
    });
    // Инициализация при загрузке
    updatePriceRangeOptions();
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.deal-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Синхронизируем чекбокс в попапе
      const value = btn.dataset.category;
      // Снять все галочки
      document.querySelectorAll('#category input[type="checkbox"]').forEach(cb => cb.checked = false);
      // Поставить нужную галочку
      const cb = document.querySelector(`#category input[type="checkbox"][value="${value}"]`);
      if (cb) cb.checked = true;

      applyFilters();
    });
  });

  // Автоактивация по параметру в URL
  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get("category");
  const rentBtn = document.querySelector('.deal-btn[data-category="Rent"]');

  if (urlCategory) {
    const matchingBtn = document.querySelector(`.deal-btn[data-category="${urlCategory}"]`);
    if (matchingBtn) {
      matchingBtn.click();
    }
  } else {
    // Если нет параметра — показываем Rent
    if (rentBtn) {
      rentBtn.click();
    }
  }
});

// Функция для сохранения состояния фильтров
function saveFilterState() {
  const state = {
    category: getCheckedValues('category'),
    type: getCheckedValues('type'),
    district: getCheckedValues('district'),
    rooms: getCheckedValues('rooms'),
    location: document.querySelector('#location')?.value || '',
    priceRange: (getCheckedValues('price-range') || []).map(value => {
      // Убираем префикс при сохранении
      const [type, range] = value.split('_');
      return range;
    }),
  };
  sessionStorage.setItem('filterState', JSON.stringify(state));
}

// Функция для восстановления состояния фильтров
function restoreFilterState() {
  const savedState = sessionStorage.getItem('filterState');
  if (!savedState) return;

  const state = JSON.parse(savedState);
  
  // Восстанавливаем чекбоксы
  Object.entries(state).forEach(([key, values]) => {
    if (Array.isArray(values)) {
      values.forEach(value => {
        const checkbox = document.querySelector(`#${key} input[value="${value}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
  });

  // Восстанавливаем поле адреса
  if (state.location) {
    const locationInput = document.querySelector('#location');
    if (locationInput) locationInput.value = state.location;
  }
}

// Заполняем multiselect опции (можно доработать под ваши данные)
function fillDistrictOptions() {
  const select = document.getElementById('district-multiselect');
  select.innerHTML = '';
  for (let i = 1; i <= 22; i++) {
    const opt = document.createElement('option');
    opt.value = `Prague ${i}`;
    opt.textContent = `Prague ${i}`;
    select.appendChild(opt);
  }
  const suburbs = document.createElement('option');
  suburbs.value = 'Suburbs';
  suburbs.textContent = 'Suburbs';
  select.appendChild(suburbs);
}
function fillRoomsOptions() {
  const select = document.getElementById('rooms-multiselect');
  select.innerHTML = '';
  [
     '1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6 and more'
  ].forEach(val => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = val;
    select.appendChild(opt);
  });
}

function fillPriceRangeOptions() {
  const select = document.getElementById('price-range-multiselect');
  if (!select) return;

  const lang = getCurrentLanguage();

  // Уничтожаем существующий экземпляр Choices.js если он есть
  if (window.priceRangeChoices) {
    window.priceRangeChoices.destroy();
  }

  // Очищаем селект
  select.innerHTML = '';

  // Создаем группы опций
  const rentGroup = document.createElement('optgroup');
  rentGroup.label = {
    en: 'Rent',
    cs: 'Pronájem',
    ru: 'Аренда'
  }[lang] || 'Rent';

  const saleGroup = document.createElement('optgroup');
  saleGroup.label = {
    en: 'Sale',
    cs: 'Prodej',
    ru: 'Продажа'
  }[lang] || 'Sale';

  // Добавляем все опции
  priceRangeTranslations.rent.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text[lang] || opt.text.en;
    rentGroup.appendChild(option);
  });

  priceRangeTranslations.sale.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text[lang] || opt.text.en;
    saleGroup.appendChild(option);
  });

  // Добавляем группы в селект
  select.appendChild(rentGroup);
  select.appendChild(saleGroup);

  // Инициализируем Choices.js
  window.priceRangeChoices = new Choices(select, {
    removeItemButton: true,
    searchEnabled: false,
    placeholder: true,
    placeholderValue: {
      en: 'Select price range',
      cs: 'Vyberte cenové rozpětí',
      ru: 'Выберите ценовой диапазон'
    }[lang] || 'Select price range',
    shouldSort: false,
    itemSelectText: ''
  });
}

// Обновляем обработчик DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Находим все чекбоксы категорий
  const categoryCheckboxes = document.querySelectorAll('#category input[type="checkbox"]');
  
  // Добавляем обработчик изменения для каждого чекбокса
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // Обновляем ценовой диапазон при изменении категории
      fillPriceRangeOptions();
    });
  });

  // Инициализация при загрузке
  setTimeout(() => {
    fillDistrictOptions();
    fillRoomsOptions();
    fillPriceRangeOptions();
  }, 100);
});

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

// Геокодирование адреса (возвращает Promise)
function geocodeAddress(address) {
  console.log('[geocodeAddress] Геокодируем адрес:', address);
  return new Promise((resolve, reject) => {
    if (!window.google || !google.maps || !google.maps.Geocoder) {
      console.error('[geocodeAddress] Google Maps не загружен');
      reject('Google Maps не загружен');
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function(results, status) {
      if (status === 'OK' && results[0]) {
        console.log('[geocodeAddress] Успешно:', results[0].geometry.location.lat(), results[0].geometry.location.lng());
        resolve(results[0].geometry.location);
      } else {
        console.warn('[geocodeAddress] Не найден адрес:', address, 'Статус:', status);
        resolve(null);
      }
    });
  });
}

// Расчёт расстояния между двумя точками (в метрах)
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6378137;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// === ГЛАВНАЯ ФУНКЦИЯ ФИЛЬТРАЦИИ ПО РАДИУСУ ===

async function filterByAddressRadius(userAddress, radiusMeters = 500) {
  console.log('[filterByAddressRadius] Старт. Введённый адрес:', userAddress);

  // 1. Геокодируем введённый адрес
  const userLocation = await geocodeAddress(userAddress);
  if (!userLocation) {
    console.warn('[filterByAddressRadius] Не удалось геокодировать введённый адрес:', userAddress);
    // alert('Не удалось найти этот адрес на карте.');
    return;
  }
  console.log('[filterByAddressRadius] Координаты введённого адреса:', userLocation.lat(), userLocation.lng());

  // 2. Собираем все карточки объявлений
  const cards = document.querySelectorAll('.catalog-card-rent, [fs-cmsfilter-element="item"]');
  let anyVisible = false;

  // 3. Для каждой карточки:
  for (const card of cards) {
    // Получаем адрес из карточки (например, из .catalog-location-rent)
    const cardAddressElem = card.querySelector('.catalog-location-rent');
    if (!cardAddressElem) {
      console.log('[filterByAddressRadius] Нет .catalog-location-rent в карточке:', card);
      continue;
    }
    const cardAddress = cardAddressElem.textContent.trim() + ', Prague, Czech Republic';
    console.log('[filterByAddressRadius] Адрес карточки:', cardAddress);

    // Геокодируем адрес объявления (можно кэшировать для ускорения!)
    let cardLatLng = card.dataset.latlng ? JSON.parse(card.dataset.latlng) : null;
    if (!cardLatLng) {
      const loc = await geocodeAddress(cardAddress);
      if (!loc) {
        console.warn('[filterByAddressRadius] Не удалось геокодировать адрес объявления:', cardAddress);
        card.classList.add('is-hidden');
        continue;
      }
      cardLatLng = { lat: loc.lat(), lng: loc.lng() };
      card.dataset.latlng = JSON.stringify(cardLatLng); // кэшируем
      console.log('[filterByAddressRadius] Геокодирован адрес объявления:', cardLatLng);
    } else {
      console.log('[filterByAddressRadius] Используем кэшированные координаты:', cardLatLng);
    }

    // Считаем расстояние
    const dist = getDistanceMeters(
      userLocation.lat(), userLocation.lng(),
      cardLatLng.lat, cardLatLng.lng
    );
    console.log(`[filterByAddressRadius] Расстояние до объявления: ${dist.toFixed(1)} м`);

    // Показываем/скрываем карточку
    if (dist <= radiusMeters) {
      card.classList.remove('is-hidden');
      anyVisible = true;
      console.log('[filterByAddressRadius] Показываем карточку (в радиусе)');
    } else {
      card.classList.add('is-hidden');
      console.log('[filterByAddressRadius] Скрываем карточку (вне радиуса)');
    }
  }

  // 4. Сообщение, если ничего не найдено
  if (!anyVisible) {
    console.warn('[filterByAddressRadius] Нет объявлений в радиусе', radiusMeters, 'м');
    // alert('Нет объявлений в радиусе 500 метров от выбранного адреса.');
  } else {
    console.log('[filterByAddressRadius] Есть объявления в радиусе!');
  }
}

// === ВСТАВЬТЕ В ВАШУ ЛОГИКУ ФИЛЬТРА ===

// Например, при нажатии на "Show listings":
document.addEventListener('click', async function(e) {
  if (e.target.classList && e.target.classList.contains('show-results')) {
    const addressInput = document.getElementById('location');
    if (addressInput && addressInput.value.trim()) {
      const userAddress = addressInput.value.trim().toLowerCase();
      let anyStreetMatch = false;
      const cards = document.querySelectorAll('.catalog-card-rent, [fs-cmsfilter-element="item"]');

      // 1. Сначала ищем по совпадению улицы (по первым 4 символам)
      cards.forEach(card => {
        const cardAddressElem = card.querySelector('.catalog-location-rent');
        if (!cardAddressElem) return;
        const cardAddress = cardAddressElem.textContent.trim().toLowerCase();
        // Можно сравнивать по первым 4 символам, либо по includes
        if (cardAddress.includes(userAddress) || userAddress.includes(cardAddress) || cardAddress.substr(0,4) === userAddress.substr(0,4)) {
          card.classList.remove('is-hidden');
          anyStreetMatch = true;
        } else {
          card.classList.add('is-hidden');
        }
      });

      if (anyStreetMatch) {
        console.log('[filter] Найдены совпадения по улице, радиус не нужен');
        return; // Если есть совпадения по улице — не фильтруем по радиусу
      }

      // 2. Если по улице ничего не найдено — фильтруем по радиусу
      console.log('[filter] Совпадений по улице нет, фильтруем по радиусу');
      await filterByAddressRadius(addressInput.value.trim(), 500);
    } else {
      // Если адрес не введён — обычная фильтрация
      // applyFilters();
    }
  }
});

// Обновляем функцию initChoices для корректной работы с переводами
function initChoices() {
  const lang = getCurrentLanguage();
  
  // Конфигурация для Choices.js
  const choicesConfig = {
    district: {
      placeholder: {
        en: 'Select districts',
        cs: 'Vyberte městské části',
        ru: 'Выберите район'
      }
    },
    rooms: {
      placeholder: {
        en: 'Select rooms',
        cs: 'Vyberte počet pokojů',
        ru: 'Выберите количество комнат'
      }
    },
    'price-range': {
      placeholder: {
        en: 'Select price range',
        cs: 'Vyberte cenové rozpětí',
        ru: 'Выберите ценовой диапазон'
      }
    }
  };

  ['district', 'rooms', 'price-range'].forEach(type => {
    const select = document.getElementById(`${type}-multiselect`);
    if (!select) return;

    // Уничтожаем существующий экземпляр, если есть
    if (window[`${type.replace('-', '')}Choices`]) {
      window[`${type.replace('-', '')}Choices`].destroy();
    }

    // Создаем новый экземпляр
    window[`${type.replace('-', '')}Choices`] = new Choices(select, {
      removeItemButton: true,
      searchEnabled: type === 'district',
      placeholder: true,
      placeholderValue: choicesConfig[type].placeholder[lang] || choicesConfig[type].placeholder.en,
      shouldSort: false,
      itemSelectText: '',
      renderSelectedChoices: 'auto'
    });
  });
}

// Обновляем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  initChoices();
  setupNoResultsMessage();
});

// Обновляем обработчик изменения языка
const observer = new MutationObserver(() => {
  console.log('[localize] Language changed');
  localizeFilterUI();
  fillPriceRangeOptions(); // Обновляем price range при смене языка
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang']
});


