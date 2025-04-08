
Webflow.push(function () {
  // Ждём прогрузку CMS карточек
  function waitForCMS(callback) {
    const check = () => {
      const cards = document.querySelectorAll('.catalog-card-rent');
      if (cards.length > 0) callback();
      else setTimeout(check, 100);
    };
    check();
  }

  waitForCMS(() => {
    let map;
    let markers = [];

    // Попапы
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

    // Навешиваем события на кнопки и крестики
    document.querySelector('.catalog-button-filter')?.addEventListener('click', () => openPopup('.popup-filter'));
    document.querySelector('.view-map')?.addEventListener('click', () => {
      openPopup('.popup-map');
      if (!map) initMap();
      else google.maps.event.trigger(map, 'resize');
    });
    document.querySelector('.map-button')?.addEventListener('click', () => {
      closePopup('.popup-filter');
      openPopup('.popup-map');
      if (!map) initMap();
    });

    document.querySelectorAll('.close-button').forEach(btn =>
      btn.addEventListener('click', () => {
        closePopup('.popup-map');
        closePopup('.popup-filter');
      })
    );

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePopup('.popup-map');
        closePopup('.popup-filter');
      }
    });

    // Google Maps
    function initMap() {
      const mapEl = document.getElementById('map');
      if (!mapEl || typeof google === 'undefined') return;

      map = new google.maps.Map(mapEl, {
        center: { lat: 50.0755, lng: 14.4378 },
        zoom: 12,
        styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });

      loadMarkers();
    }

    function loadMarkers() {
      markers.forEach(m => m.setMap(null));
      markers = [];

      const cards = document.querySelectorAll('.catalog-card-rent:not([style*="display: none"])');
      const geocoder = new google.maps.Geocoder();

      cards.forEach(card => {
        const title = card.querySelector('.catalog-title-rent')?.textContent || '';
        const price = card.querySelector('.catalog-price-rent')?.textContent || '';
        const location = card.querySelector('.catalog-location-rent')?.textContent || '';
        const image = card.querySelector('.catalog-image-rent')?.src || '';
        const type = card.querySelector('.catalog-type')?.textContent || '';
        const rooms = card.querySelector('.catalog-rooms-type')?.textContent || '';

        if (!location) return;

        geocoder.geocode({ address: location + ', Prague' }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const pos = results[0].geometry.location;
            const overlay = new google.maps.OverlayView();

            overlay.onAdd = function () {
              const div = document.createElement('div');
              div.innerHTML = `
                <div class="map-marker-wrapper">
                  <div class="map-marker">${price.replace(/\D/g, '')}<div class="marker-pointer"></div></div>
                  <div class="property-popup">
                    <div class="popup-content">
                      <img src="${image}" alt="${title}">
                      <div class="popup-info">
                        <div class="property-type">${type} ${rooms}</div>
                        <div class="address">${location}</div>
                        <div class="price">${price}</div>
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
                this.div.style.left = point.x + 'px';
                this.div.style.top = point.y + 'px';
                this.div.style.position = 'absolute';
                this.div.style.transform = 'translate(-50%, -100%)';
              }
            };

            overlay.setMap(map);
            markers.push(overlay);
          }
        });
      });
    }

    // Фильтры
    window.applyFilters = function () {
      const zone = document.querySelector('#district')?.value;
      const rooms = document.querySelector('#rooms')?.value;
      const type = document.querySelector('#type')?.value;
      const cat = document.querySelector('#category')?.value;
      const location = document.querySelector('#location')?.value.toLowerCase();
      const priceRange = document.querySelector('#price-range')?.value;

      document.querySelectorAll('.catalog-card-rent').forEach(card => {
        let show = true;

        const get = (sel) => card.querySelector(`[fs-cmsfilter-field="${sel}"]`)?.textContent.trim();
        const getLoc = () => card.querySelector('.catalog-location-rent')?.textContent.toLowerCase();

        if (zone && get('zone') !== zone) show = false;
        if (rooms && get('Rooms') !== rooms) show = false;
        if (type && get('Type') !== type) show = false;
        if (cat && get('Category') !== cat) show = false;
        if (location && !getLoc()?.includes(location)) show = false;

        if (priceRange) {
          const val = parseInt(card.querySelector('.catalog-price-rent')?.textContent.replace(/\D/g, ''));
          const [min, max] = priceRange.split('-').map(Number);
          if (priceRange === '100000+' && val <= 100000) show = false;
          else if (!isNaN(min) && !isNaN(max) && (val < min || val > max)) show = false;
        }

        card.style.display = show ? '' : 'none';
      });

      if (map) setTimeout(loadMarkers, 200);
      closePopup('.popup-filter');
    };

    window.resetFilters = function () {
      document.querySelectorAll('select').forEach(s => s.value = '');
      document.querySelector('#location').value = '';
      document.querySelectorAll('.catalog-card-rent').forEach(card => card.style.display = '');
      if (map) setTimeout(loadMarkers, 200);
    };

    // Swiper с Multi-Image
    document.querySelectorAll('.swiper-wrapper[fs-multiimage="photo-item"]').forEach(wrapper => {
      const hiddenImgs = wrapper.closest('.catalog-card-rent').querySelectorAll('.catalog-image-hidden');
      const swiperEl = wrapper.closest('.swiper');

      hiddenImgs.forEach(img => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        const image = document.createElement('img');
        image.src = img.src;
        image.alt = img.alt || '';
        slide.appendChild(image);
        wrapper.appendChild(slide);
      });

      new Swiper(swiperEl, {
        loop: hiddenImgs.length > 1,
        slidesPerView: 1,
        spaceBetween: 8,
        navigation: {
          nextEl: swiperEl.querySelector('.swiper-button-next'),
          prevEl: swiperEl.querySelector('.swiper-button-prev'),
        }
      });
    });
  });
});
