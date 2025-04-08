
Webflow.push(function () {
  // Проверка, что CMS карточки прогрузились
  function waitForCMSContent(callback) {
    const check = () => {
      const cards = document.querySelectorAll('.catalog-card-rent');
      if (cards.length > 0) callback();
      else setTimeout(check, 100);
    };
    check();
  }

  waitForCMSContent(() => {
    // === Глобальные переменные ===
    let map;
    let markers = [];
    let autocomplete;
    let mapAutocomplete;

    // === Инициализация событий ===
    const filterBtn = document.querySelector('.catalog-button-filter');
    const viewMapBtn = document.querySelector('.view-map');
    const mapButton = document.querySelector('.map-button');
    const filterCloseBtn = document.querySelector('.popup-filter .close-button');
    const mapCloseBtn = document.querySelector('.popup-map .close-button');

    if (filterBtn) filterBtn.addEventListener('click', () => openPopup('.popup-filter'));
    if (viewMapBtn) viewMapBtn.addEventListener('click', () => openPopup('.popup-map', true));
    if (mapButton) mapButton.addEventListener('click', () => {
      closePopup('.popup-filter');
      openPopup('.popup-map', true);
    });
    if (filterCloseBtn) filterCloseBtn.addEventListener('click', () => closePopup('.popup-filter'));
    if (mapCloseBtn) mapCloseBtn.addEventListener('click', () => closePopup('.popup-map'));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePopup('.popup-filter');
        closePopup('.popup-map');
      }
    });

    function openPopup(selector, triggerMap = false) {
      const popup = document.querySelector(selector);
      if (popup) {
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (triggerMap && map) {
          google.maps.event.trigger(map, 'resize');
        }
        if (triggerMap && !map) {
          initMap();
        }
      }
    }

    function closePopup(selector) {
      const popup = document.querySelector(selector);
      if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = '';
      }
    }

    // === Загрузка карты ===
    function initMap() {
      const el = document.getElementById('map');
      if (!el || typeof google === 'undefined') return;
      map = new google.maps.Map(el, {
        center: { lat: 50.0755, lng: 14.4378 },
        zoom: 12,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });
      setupAutocomplete();
      loadMarkers();
    }

    function setupAutocomplete() {
      const locInput = document.getElementById('location');
      const mapInput = document.getElementById('map-search');
      const options = { componentRestrictions: { country: 'cz' }, types: ['address'] };

      if (locInput) {
        autocomplete = new google.maps.places.Autocomplete(locInput, options);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) filterByAddress(place.formatted_address);
        });
      }

      if (mapInput) {
        mapAutocomplete = new google.maps.places.Autocomplete(mapInput, options);
        mapAutocomplete.addListener('place_changed', () => {
          const place = mapAutocomplete.getPlace();
          if (place.geometry) {
            map.setCenter(place.geometry.location);
            map.setZoom(15);
          }
        });
      }
    }

    function loadMarkers() {
      markers.forEach(m => m.setMap(null));
      markers = [];

      document.querySelectorAll('.catalog-card-rent:not([style*="display: none"])').forEach(card => {
        const cardData = {
          title: card.querySelector('.catalog-title-rent')?.textContent || '',
          price: card.querySelector('.catalog-price-rent')?.textContent || '',
          location: card.querySelector('.catalog-location-rent')?.textContent || '',
          image: card.querySelector('.catalog-image-rent')?.src || '',
          type: card.querySelector('.catalog-type')?.textContent || '',
          rooms: card.querySelector('.catalog-rooms-type')?.textContent || ''
        };
        createMarker(cardData);
      });
    }

    function createMarker(data) {
      if (!data.location) return;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: `${data.location}, Prague` }, (results, status) => {
        if (status !== 'OK' || !results[0]) return;
        const pos = results[0].geometry.location;
        const overlay = new google.maps.OverlayView();

        overlay.onAdd = function () {
          const div = document.createElement('div');
          div.innerHTML = `
            <div class="map-marker-wrapper">
              <div class="map-marker">${data.price.replace(/\D/g, '')}<div class="marker-pointer"></div></div>
              <div class="property-popup">
                <div class="popup-content">
                  <img src="${data.image}" alt="${data.title}">
                  <div class="popup-info">
                    <div class="property-type">${data.type} ${data.rooms}</div>
                    <div class="address">${data.location}</div>
                    <div class="price">${data.price}</div>
                  </div>
                </div>
              </div>
            </div>`;
          this.div = div;
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(div);

          const marker = div.querySelector('.map-marker');
          const popup = div.querySelector('.property-popup');
          let timer;

          marker.addEventListener('mouseenter', () => {
            clearTimeout(timer);
            popup.classList.add('show');
          });
          marker.addEventListener('mouseleave', () => {
            timer = setTimeout(() => popup.classList.remove('show'), 300);
          });
          popup.addEventListener('mouseenter', () => clearTimeout(timer));
          popup.addEventListener('mouseleave', () => {
            timer = setTimeout(() => popup.classList.remove('show'), 300);
          });
        };

        overlay.draw = function () {
          const projection = this.getProjection();
          const point = projection.fromLatLngToDivPixel(pos);
          if (this.div) {
            this.div.style.left = `${point.x}px`;
            this.div.style.top = `${point.y}px`;
            this.div.style.position = 'absolute';
            this.div.style.transform = 'translate(-50%, -100%)`;
          }
        };

        overlay.setMap(map);
        markers.push(overlay);
      });
    }

    function filterByAddress(address) {
      if (!address) return;
      const normalized = address.toLowerCase();
      document.querySelectorAll('.catalog-card-rent').forEach(card => {
        const loc = card.querySelector('.catalog-location-rent')?.textContent.toLowerCase() || '';
        const visible = loc.includes(normalized) || normalized.includes(loc);
        card.style.display = visible ? '' : 'none';
      });
      loadMarkers();
    }

    // формат цен и площадей
    document.querySelectorAll('.catalog-price-rent').forEach(el => {
      const num = parseInt(el.textContent.replace(/\D/g, ''));
      if (!isNaN(num)) el.textContent = num.toLocaleString('ru-RU') + ' CZK';
    });

    document.querySelectorAll('.catalog-area-rent').forEach(el => {
      const num = parseInt(el.textContent.replace(/\D/g, ''));
      if (!isNaN(num)) el.textContent = num + ' м²';
    });
  });
});
