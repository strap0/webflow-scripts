
// ✅ filtersitems-final.js — рабочая версия со всеми функциями

document.addEventListener("DOMContentLoaded", function () {
  // ---------- ПОПАПЫ ----------
  const openPopup = (selector) => {
    const popup = document.querySelector(selector);
    if (popup) {
      popup.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  const closePopup = (selector) => {
    const popup = document.querySelector(selector);
    if (popup) {
      popup.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // Открытие попапов
  document.querySelector('.catalog-button-filter')?.addEventListener('click', () => openPopup('.popup-filter'));
  document.querySelector('.view-map')?.addEventListener('click', () => openPopup('.popup-map'));
  document.querySelector('.map-button')?.addEventListener('click', () => {
    closePopup('.popup-filter');
    openPopup('.popup-map');
  });

  // Закрытие по крестику
  document.querySelectorAll('.close-button').forEach(btn => {
    btn.addEventListener('click', () => {
      closePopup('.popup-map');
      closePopup('.popup-filter');
    });
  });

  // Закрытие по ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePopup('.popup-map');
      closePopup('.popup-filter');
    }
  });

  // ---------- СВАЙПЕР + MULTI-IMAGE ----------
  document.querySelectorAll('.swiper-wrapper[fs-multiimage="photo-item"]').forEach(wrapper => {
    const hiddenImages = wrapper.closest('.w-dyn-item')?.querySelectorAll('[data-multi-image]');
    const swiperEl = wrapper.closest('.swiper');

    if (!hiddenImages || !swiperEl) return;

    hiddenImages.forEach(img => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      const image = document.createElement('img');
      image.src = img.src;
      image.alt = img.alt || '';
      image.loading = 'lazy';
      image.style.width = '100%';
      image.style.height = '100%';
      image.style.objectFit = 'cover';
      slide.appendChild(image);
      wrapper.appendChild(slide);
    });

    const slidesCount = wrapper.querySelectorAll('.swiper-slide').length;

    const swiperInstance = new Swiper(swiperEl, {
      loop: slidesCount > 1,
      slidesPerView: 1,
      spaceBetween: 8,
      navigation: {
        nextEl: swiperEl.querySelector('.swiper-button-next'),
        prevEl: swiperEl.querySelector('.swiper-button-prev'),
      }
    });

    if (slidesCount <= 1) {
      swiperEl.querySelector('.swiper-button-prev')?.classList.add('hide');
      swiperEl.querySelector('.swiper-button-next')?.classList.add('hide');
    }
  });

  // ---------- ФИЛЬТРЫ ----------
  window.applyFilters = function () {
    const filters = {
      zone: document.querySelector('#district')?.value,
      rooms: document.querySelector('#rooms')?.value,
      type: document.querySelector('#type')?.value,
      category: document.querySelector('#category')?.value,
      priceRange: document.querySelector('#price-range')?.value,
      location: document.querySelector('#location')?.value?.toLowerCase()
    };

    const cards = document.querySelectorAll('.catalog-card-rent');

    cards.forEach(card => {
      let show = true;

      const getText = (selector) => card.querySelector(`[fs-cmsfilter-field="${selector}"]`)?.textContent.trim();

      if (filters.zone && getText('zone') !== filters.zone) show = false;
      if (filters.rooms && getText('Rooms') !== filters.rooms) show = false;
      if (filters.type && getText('Type') !== filters.type) show = false;
      if (filters.category && getText('Category') !== filters.category) show = false;

      const cardLocation = card.querySelector('.catalog-location-rent')?.textContent?.toLowerCase() || '';
      if (filters.location && !cardLocation.includes(filters.location)) show = false;

      if (filters.priceRange && show) {
        const price = parseInt(card.querySelector('.catalog-price-rent')?.textContent.replace(/\D/g, ''));
        switch (filters.priceRange) {
          case '0-25000': if (price > 25000) show = false; break;
          case '25000-50000': if (price <= 25000 || price > 50000) show = false; break;
          case '50000-75000': if (price <= 50000 || price > 75000) show = false; break;
          case '75000-100000': if (price <= 75000 || price > 100000) show = false; break;
          case '100000+': if (price <= 100000) show = false; break;
        }
      }

      card.style.display = show ? '' : 'none';
    });

    if (window.map) setTimeout(loadMarkers, 100);
    closePopup('.popup-filter');
  };

  window.resetFilters = function () {
    document.querySelectorAll('select').forEach(s => s.value = '');
    document.querySelector('#location').value = '';
    document.querySelectorAll('.catalog-card-rent').forEach(card => card.style.display = '');
    if (window.map) setTimeout(loadMarkers, 100);
  };

  // ---------- КАРТА И МАРКЕРЫ ----------
  window.map = null;
  window.markers = [];

  window.initMap = function () {
    const prague = { lat: 50.0755, lng: 14.4378 };
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof google === 'undefined') return;

    map = new google.maps.Map(mapEl, {
      zoom: 12,
      center: prague,
      styles: [{
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }],
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    });

    loadMarkers();
  };

  window.loadMarkers = function () {
    if (!map) return;

    markers.forEach(m => m.setMap(null));
    markers = [];

    const visibleCards = document.querySelectorAll('.catalog-card-rent:not([style*="display: none"])');

    visibleCards.forEach(card => {
      const location = card.querySelector('.catalog-location-rent')?.textContent;
      const price = card.querySelector('.catalog-price-rent')?.textContent;
      const type = card.querySelector('.catalog-type')?.textContent;
      const rooms = card.querySelector('.catalog-rooms-type')?.textContent;
      const image = card.querySelector('.catalog-image-rent')?.src;
      const link = card.querySelector('a')?.href;

      if (!location) return;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: location + ", Prague" }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const pos = results[0].geometry.location;
          const overlay = new google.maps.OverlayView();

          overlay.onAdd = function () {
            const div = document.createElement('div');
            div.innerHTML = `
              <div class="map-marker-wrapper">
                <div class="map-marker">
                  ${price}
                  <div class="marker-pointer"></div>
                </div>
                <div class="property-popup">
                  <div class="popup-content">
                    <img src="${image}" alt="">
                    <div class="popup-info">
                      <div class="property-type">${type} ${rooms}</div>
                      <div class="address">${location}</div>
                      <div class="price">${price}</div>
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
            const show = () => { clearTimeout(timer); popup.classList.add('show'); };
            const hide = () => { timer = setTimeout(() => popup.classList.remove('show'), 300); };

            marker.addEventListener('mouseenter', show);
            marker.addEventListener('mouseleave', hide);
            popup.addEventListener('mouseenter', show);
            popup.addEventListener('mouseleave', hide);

            div.addEventListener('click', () => {
              if (link) window.location.href = link;
            });
          };

          overlay.draw = function () {
            const proj = this.getProjection();
            const posPx = proj.fromLatLngToDivPixel(pos);
            if (this.div) {
              this.div.style.left = posPx.x + 'px';
              this.div.style.top = posPx.y + 'px';
              this.div.style.position = 'absolute';
              this.div.style.transform = 'translate(-50%, -100%)';
            }
          };

          overlay.setMap(map);
          markers.push(overlay);
        }
      });
    });
  };
});
