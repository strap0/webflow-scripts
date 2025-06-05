

// Г-лобальные переменные
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
      // Только районы Праги, без пригородов
      for (let i = 1; i <= 22; i++) {
        values.add(`Prague ${i}`);
      }
    } else if (id === 'rooms') {
      ['1+kk', '1+1', '2+kk', '2+1', '3+kk', '3+1', '4+kk', '4+1', '5+kk', '5+1', '6 and more'].forEach(room => {
        values.add(room);
      });
    } else if (id === 'category') {
      // Фиксированный порядок для категорий
      values.add('Rent');
      values.add('Sale');
    } else if (id === 'type') {
      // Фиксированный порядок для типов недвижимости
      values.add('Apartment');
      values.add('House');
      values.add('Commercial space');
    }

    container.innerHTML = '';
    let sortedValues = Array.from(values);

    // Специальная сортировка для районов
    if (id === 'district') {
      sortedValues.sort((a, b) => {
        const aMatch = a.match(/Prague\s*(\d+)/);
        const bMatch = b.match(/Prague\s*(\d+)/);
        if (aMatch && bMatch) {
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }
        return a.localeCompare(b);
      });
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

// Обновляем функцию applyFilters
function applyFilters() {
  console.log('Applying filters...');
  
  // Получаем значения фильтров
  const filters = {
    category: Array.from(document.querySelectorAll('#category input[type="checkbox"]:checked')).map(cb => cb.value),
    type: Array.from(document.querySelectorAll('#type input[type="checkbox"]:checked')).map(cb => cb.value),
    district: window.districtChoices ? window.districtChoices.getValue().map(choice => choice.value) : [],
    rooms: window.roomsChoices ? window.roomsChoices.getValue().map(choice => choice.value) : [],
    priceRange: window.priceRangeChoices ? window.priceRangeChoices.getValue() : []
  };

  console.log('Current filters:', filters);

  // Показываем все карточки перед фильтрацией
  const cards = document.querySelectorAll('[fs-cmsfilter-element="item"]');
  cards.forEach(card => {
    card.style.display = '';
    card.classList.remove('is-hidden');
  });

  // Фильтруем карточки
  cards.forEach(card => {
    let show = true;

    // Проверяем категорию
    if (filters.category.length > 0) {
      const categoryElement = card.querySelector('[fs-cmsfilter-field="Category"]');
      const cardCategory = categoryElement ? (categoryElement.dataset.original || categoryElement.textContent.trim()) : null;
      if (!cardCategory || !filters.category.includes(cardCategory)) {
        show = false;
      }
    }

    // Проверяем тип недвижимости
    if (show && filters.type.length > 0) {
      const typeElement = card.querySelector('[fs-cmsfilter-field="Type"]');
      const cardType = typeElement ? (typeElement.dataset.original || typeElement.textContent.trim()) : null;
      if (!cardType || !filters.type.includes(cardType)) {
        show = false;
      }
    }

    // Проверяем район
    if (show && filters.district.length > 0) {
      const zoneElement = card.querySelector('[fs-cmsfilter-field="zone"]');
      const cardZone = zoneElement ? zoneElement.textContent.trim() : null;
      if (!cardZone || !filters.district.includes(cardZone)) {
        show = false;
      }
    }

    // Проверяем комнаты
    if (show && filters.rooms.length > 0) {
      const roomsElement = card.querySelector('[fs-cmsfilter-field="Rooms"]');
      const cardRooms = roomsElement ? roomsElement.textContent.trim() : null;
      if (!cardRooms || !filters.rooms.includes(cardRooms)) {
        show = false;
      }
    }

    // Проверяем ценовой диапазон
    if (show && filters.priceRange.length > 0) {
      const priceElement = card.querySelector('.catalog-price-rent');
      if (priceElement) {
        const priceText = priceElement.textContent.trim();
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        
        let priceInRange = false;
        filters.priceRange.forEach(range => {
          if (typeof range === 'string') {
            if (range.includes('+')) {
              const minPrice = parseInt(range.split('+')[0]);
              if (price >= minPrice) priceInRange = true;
            } else if (range.includes('-')) {
              const [min, max] = range.split('-').map(v => parseInt(v));
              if (price >= min && price <= max) priceInRange = true;
            }
          }
        });
        
        if (!priceInRange) {
          show = false;
        }
      }
    }

    // Применяем фильтрацию
    if (show) {
      card.style.display = '';
      card.classList.remove('is-hidden');
    } else {
      card.style.display = 'none';
      card.classList.add('is-hidden');
    }
  });

  // Проверяем, есть ли видимые карточки
  const hasVisibleCards = Array.from(cards).some(card => !card.classList.contains('is-hidden'));
  console.log('Visible cards after filtering:', hasVisibleCards);

  // Показываем сообщение если нет результатов
  const noResultsMessage = document.querySelector('.no-results-message');
  if (noResultsMessage) {
    noResultsMessage.style.display = hasVisibleCards ? 'none' : 'block';
  }

  // Закрываем попап
  closeFilterPopup();
}

// Обновляем функцию syncDealTypeState
function syncDealTypeState(type) {
  // Обновляем кнопки
  const rentBtn = document.querySelector('.deal-btn[data-category="Rent"]');
  const saleBtn = document.querySelector('.deal-btn[data-category="Sale"]');
  
  if (rentBtn && saleBtn) {
    if (type === 'Rent') {
      rentBtn.classList.add('active');
      saleBtn.classList.remove('active');
    } else if (type === 'Sale') {
      saleBtn.classList.add('active');
      rentBtn.classList.remove('active');
    } else {
      // Если тип не указан, снимаем активное состояние с обеих кнопок
      rentBtn.classList.remove('active');
      saleBtn.classList.remove('active');
    }
  }

  // Обновляем чекбоксы в попапе
  const categoryCheckboxes = document.querySelectorAll('#category input[type="checkbox"]');
  categoryCheckboxes.forEach(checkbox => {
    checkbox.checked = checkbox.value === type;
  });

  // Фильтруем карточки только если указан тип
  if (type) {
    document.querySelectorAll('[fs-cmsfilter-element="item"]').forEach(card => {
      const categoryElement = card.querySelector('[fs-cmsfilter-field="Category"]');
      if (!categoryElement) return;
      
      const cardCategory = categoryElement.dataset.original || categoryElement.textContent.trim();
      const show = cardCategory === type;
      
      card.style.display = show ? '' : 'none';
      card.classList.toggle('is-hidden', !show);
    });
  } else {
    // Если тип не указан, показываем все карточки
    document.querySelectorAll('[fs-cmsfilter-element="item"]').forEach(card => {
      card.style.display = '';
      card.classList.remove('is-hidden');
    });
  }
}

// Обновляем обработчик DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  const rentBtn = document.querySelector('.deal-btn[data-category="Rent"]');
  const saleBtn = document.querySelector('.deal-btn[data-category="Sale"]');

  if (rentBtn && saleBtn) {
    // Сначала показываем все карточки
    document.querySelectorAll('[fs-cmsfilter-element="item"]').forEach(card => {
      card.style.display = '';
      card.classList.remove('is-hidden');
    });

    rentBtn.addEventListener('click', function(e) {
      e.preventDefault();
      syncDealTypeState('Rent');
    });

    saleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      syncDealTypeState('Sale');
    });

    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    if (categoryParam === 'Sale') {
      syncDealTypeState('Sale');
    } else if (categoryParam === 'Rent') {
      syncDealTypeState('Rent');
    } else {
      // Если категория не указана в URL, показываем все
      syncDealTypeState(null);
    }
  }

  // Инициализируем компоненты
  fillDistrictOptions();
  fillRoomsOptions();
  fillPriceRangeOptions();
  loadCMSOptions();
});

// Обновляем функцию resetFilters
function resetFilters() {
  console.log('Resetting filters...');
  
  // Сбрасываем чекбоксы
  document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  // Сбрасываем мультиселекты
  if (window.districtChoices) window.districtChoices.removeActiveItems();
  if (window.roomsChoices) window.roomsChoices.removeActiveItems();
  if (window.priceRangeChoices) window.priceRangeChoices.removeActiveItems();

  // Сбрасываем поле адреса
  const locationInput = document.querySelector('#location');
  if (locationInput) locationInput.value = '';

  // Очищаем сохраненное состояние
  sessionStorage.removeItem('filterState');

  // Показываем все карточки
  document.querySelectorAll('[fs-cmsfilter-element="item"]').forEach(card => {
    card.style.display = '';
    card.classList.remove('is-hidden');
  });

  console.log('Filters reset completed');
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
    category: Array.from(document.querySelectorAll('#category input[type="checkbox"]:checked')).map(cb => cb.value),
    type: Array.from(document.querySelectorAll('#type input[type="checkbox"]:checked')).map(cb => cb.value),
    district: window.districtChoices ? window.districtChoices.getValue().map(choice => choice.value) : [],
    rooms: window.roomsChoices ? window.roomsChoices.getValue().map(choice => choice.value) : [],
    priceRange: window.priceRangeChoices ? window.priceRangeChoices.getValue() : [],
    location: document.querySelector('#location')?.value || ''
  };
  sessionStorage.setItem('filterState', JSON.stringify(state));
  console.log('Saved filter state:', state);
}

// Функция для восстановления состояния фильтров
function restoreFilterState() {
  const savedState = sessionStorage.getItem('filterState');
  if (!savedState) return;

  const state = JSON.parse(savedState);
  console.log('Restoring filter state:', state);

  // Восстанавливаем чекбоксы категорий
  if (state.category) {
    document.querySelectorAll('#category input[type="checkbox"]').forEach(cb => {
      cb.checked = state.category.includes(cb.value);
    });
  }

  // Восстанавливаем чекбоксы типов
  if (state.type) {
    document.querySelectorAll('#type input[type="checkbox"]').forEach(cb => {
      cb.checked = state.type.includes(cb.value);
    });
  }

  // Восстанавливаем district
  if (state.district && window.districtChoices) {
    window.districtChoices.removeActiveItems();
    state.district.forEach(value => {
      window.districtChoices.setChoiceByValue(value);
    });
  }

  // Восстанавливаем rooms
  if (state.rooms && window.roomsChoices) {
    window.roomsChoices.removeActiveItems();
    state.rooms.forEach(value => {
      window.roomsChoices.setChoiceByValue(value);
    });
  }

  // Восстанавливаем price range
  if (state.priceRange && window.priceRangeChoices) {
    window.priceRangeChoices.removeActiveItems();
    state.priceRange.forEach(value => {
      window.priceRangeChoices.setChoiceByValue(value);
    });
  }

  // Восстанавливаем location
  if (state.location) {
    const locationInput = document.querySelector('#location');
    if (locationInput) locationInput.value = state.location;
  }
}

// Обновляем функцию fillDistrictOptions
function fillDistrictOptions() {
  const select = document.getElementById('district-multiselect');
  if (!select) return;

  select.innerHTML = '';
  // Только районы Праги, без пригородов
  for (let i = 1; i <= 22; i++) {
    const opt = document.createElement('option');
    opt.value = `Prague ${i}`;
    opt.textContent = `Prague ${i}`;
    select.appendChild(opt);
  }

  // Инициализируем Choices.js
  if (window.districtChoices) {
    window.districtChoices.destroy();
  }

  window.districtChoices = new Choices(select, {
    removeItemButton: true,
    searchEnabled: true,
    placeholder: true,
    placeholderValue: {
      en: 'Select districts',
      cs: 'Vyberte městské části',
      ru: 'Выберите район'
    }[getCurrentLanguage()] || 'Select districts',
    shouldSort: false,
    itemSelectText: ''
  });
}

function fillRoomsOptions() {
  const select = document.getElementById('rooms-multiselect');
  if (!select) return;

  const lang = getCurrentLanguage();
  select.innerHTML = '';

  const roomOptions = [
    { value: '1+kk', text: '1+kk' },
    { value: '1+1', text: '1+1' },
    { value: '2+kk', text: '2+kk' },
    { value: '2+1', text: '2+1' },
    { value: '3+kk', text: '3+kk' },
    { value: '3+1', text: '3+1' },
    { value: '4+kk', text: '4+kk' },
    { value: '4+1', text: '4+1' },
    { value: '5+kk', text: '5+kk' },
    { value: '5+1', text: '5+1' },
    { value: '6 and more', text: {
      en: '6 and more',
      cs: '6 a více',
      ru: '6 и более'
    }[lang] || '6 and more' }
  ];

  roomOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text.toString();
    select.appendChild(option);
  });

  // Инициализируем Choices.js
  if (window.roomsChoices) {
    window.roomsChoices.destroy();
  }

  window.roomsChoices = new Choices(select, {
    removeItemButton: true,
    searchEnabled: false,
    placeholder: true,
    placeholderValue: {
      en: 'Select rooms',
      cs: 'Vyberte počet pokojů',
      ru: 'Выберите количество комнат'
    }[lang] || 'Select rooms',
    shouldSort: false,
    itemSelectText: ''
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
  // Восстанавливаем состояние фильтров при загрузке
  restoreFilterState();

  // Обработчик для кнопки "Показать объявления"
  const showResultsBtn = document.querySelector('.show-results');
  if (showResultsBtn) {
    showResultsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Show results button clicked');
      applyFilters();
    });
  }

  // Обработчик для кнопки "Сбросить фильтры"
  const resetBtn = document.querySelector('.reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      resetFilters();
    });
  }

  // Обработчик открытия попапа фильтров
  const filterBtn = document.querySelector('.catalog-button-filter');
  if (filterBtn) {
    filterBtn.addEventListener('click', function(e) {
      e.preventDefault();
      restoreFilterState(); // Восстанавливаем состояние при открытии попапа
    });
  }

  // Обработчики для чекбоксов
  ['category', 'type'].forEach(group => {
    const checkboxes = document.querySelectorAll(`#${group} input[type="checkbox"]`);
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        console.log(`${group} checkbox changed:`, this.value, this.checked);
        if (group === 'category') {
          // При изменении категории обновляем ценовые диапазоны
          updatePriceRangeOptions([this.value]);
        }
      });
    });
  });
});

// Обновляем функцию resetFilters
function resetFilters() {
  console.log('Resetting filters...');
  
  // Сбрасываем чекбоксы
  document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  // Сбрасываем мультиселекты
  if (window.districtChoices) window.districtChoices.removeActiveItems();
  if (window.roomsChoices) window.roomsChoices.removeActiveItems();
  if (window.priceRangeChoices) window.priceRangeChoices.removeActiveItems();

  // Сбрасываем поле адреса
  const locationInput = document.querySelector('#location');
  if (locationInput) locationInput.value = '';

  // Очищаем сохраненное состояние
  sessionStorage.removeItem('filterState');

  // Показываем все карточки
  document.querySelectorAll('[fs-cmsfilter-element="item"]').forEach(card => {
    card.style.display = '';
    card.classList.remove('is-hidden');
  });

  console.log('Filters reset completed');
}

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
    removeItemButton: true,
    searchEnabled: false,
    placeholder: true,
    shouldSort: false,
    itemSelectText: '',
    renderSelectedChoices: 'auto'
  };

  // Инициализация district
  const districtSelect = document.getElementById('district-multiselect');
  if (districtSelect) {
    if (window.districtChoices) window.districtChoices.destroy();
    window.districtChoices = new Choices(districtSelect, {
      ...choicesConfig,
      searchEnabled: true,
      placeholderValue: {
        en: 'Select districts',
        cs: 'Vyberte městské části',
        ru: 'Выберите район'
      }[lang] || 'Select districts'
    });
  }

  // Инициализация rooms
  const roomsSelect = document.getElementById('rooms-multiselect');
  if (roomsSelect) {
    if (window.roomsChoices) window.roomsChoices.destroy();
    window.roomsChoices = new Choices(roomsSelect, {
      ...choicesConfig,
      placeholderValue: {
        en: 'Select rooms',
        cs: 'Vyberte počet pokojů',
        ru: 'Выберите количество комнат'
      }[lang] || 'Select rooms'
    });
  }

  // Инициализация price range
  const priceRangeSelect = document.getElementById('price-range-multiselect');
  if (priceRangeSelect) {
    if (window.priceRangeChoices) window.priceRangeChoices.destroy();
    window.priceRangeChoices = new Choices(priceRangeSelect, {
      ...choicesConfig,
      placeholderValue: {
        en: 'Select price range',
        cs: 'Vyberte cenové rozpětí',
        ru: 'Выберите ценовой диапазон'
      }[lang] || 'Select price range'
    });
  }
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

// Добавляем функцию для перевода контента карточек
function translateCardContent() {
  const lang = getCurrentLanguage();
  
  // Переводим все карточки
  document.querySelectorAll('[fs-cmsfilter-element="item"]').forEach(card => {
    // Перевод типа недвижимости
    const typeElement = card.querySelector('[fs-cmsfilter-field="Type"]');
    if (typeElement) {
      const originalType = typeElement.textContent.trim();
      if (cmsTranslations[originalType] && cmsTranslations[originalType][lang]) {
        typeElement.textContent = cmsTranslations[originalType][lang];
      }
    }

    // Перевод категории (Rent/Sale)
    const categoryElement = card.querySelector('[fs-cmsfilter-field="Category"]');
    if (categoryElement) {
      const originalCategory = categoryElement.textContent.trim();
      if (cmsTranslations[originalCategory] && cmsTranslations[originalCategory][lang]) {
        categoryElement.textContent = cmsTranslations[originalCategory][lang];
      }
    }

    // Перевод количества комнат (оставляем как есть, так как это технические обозначения)
    // Но можно добавить всплывающую подсказку с переводом
    const roomsElement = card.querySelector('[fs-cmsfilter-field="Rooms"]');
    if (roomsElement) {
      const originalRooms = roomsElement.textContent.trim();
      if (originalRooms === '6 and more' && cmsTranslations[originalRooms]) {
        roomsElement.textContent = cmsTranslations[originalRooms][lang] || originalRooms;
      }
    }
  });
}

// Обновляем обработчик DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Существующий код инициализации
  fillDistrictOptions();
  fillRoomsOptions();
  fillPriceRangeOptions();
  loadCMSOptions();

  // Добавляем перевод карточек
  translateCardContent();
});

// Добавляем слушатель изменения языка для обновления переводов
const languageObserver = new MutationObserver(() => {
  console.log('[translate] Language changed, updating translations');
  translateCardContent();
});

languageObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang']
});


