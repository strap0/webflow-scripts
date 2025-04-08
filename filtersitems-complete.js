

document.addEventListener("DOMContentLoaded", function () {
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

  document.querySelector('.catalog-button-filter')?.addEventListener('click', () => openPopup('.popup-filter'));
  document.querySelector('.view-map')?.addEventListener('click', () => openPopup('.popup-map'));
  document.querySelector('.map-button')?.addEventListener('click', () => {
    closePopup('.popup-filter');
    openPopup('.popup-map');
  });

  document.querySelectorAll('.close-button').forEach(btn => {
    btn.addEventListener('click', () => {
      closePopup('.popup-map');
      closePopup('.popup-filter');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePopup('.popup-map');
      closePopup('.popup-filter');
    }
  });

  // Фильтрация
  window.applyFilters = function () {
    const zone = document.querySelector('#district')?.value;
    const rooms = document.querySelector('#rooms')?.value;
    const type = document.querySelector('#type')?.value;
    const category = document.querySelector('#category')?.value;
    const location = document.querySelector('#location')?.value.toLowerCase();
    const priceRange = document.querySelector('#price-range')?.value;

    document.querySelectorAll('.catalog-card-rent').forEach(card => {
      let show = true;
      const get = (sel) => card.querySelector(`[fs-cmsfilter-field="${sel}"]`)?.textContent.trim();

      if (zone && get('zone') !== zone) show = false;
      if (rooms && get('Rooms') !== rooms) show = false;
      if (type && get('Type') !== type) show = false;
      if (category && get('Category') !== category) show = false;

      const cardLoc = card.querySelector('.catalog-location-rent')?.textContent.toLowerCase() || '';
      if (location && !cardLoc.includes(location)) show = false;

      if (priceRange && show) {
        const price = parseInt(card.querySelector('.catalog-price-rent')?.textContent.replace(/\D/g, ''));
        switch (priceRange) {
          case '0-25000': if (price > 25000) show = false; break;
          case '25000-50000': if (price <= 25000 || price > 50000) show = false; break;
          case '50000-75000': if (price <= 50000 || price > 75000) show = false; break;
          case '75000-100000': if (price <= 75000 || price > 100000) show = false; break;
          case '100000+': if (price <= 100000) show = false; break;
        }
      }

      card.style.display = show ? '' : 'none';
    });
  };

  window.resetFilters = function () {
    document.querySelectorAll('select').forEach(s => s.value = '');
    document.querySelector('#location').value = '';
    document.querySelectorAll('.catalog-card-rent').forEach(card => card.style.display = '');
  };

  // Swiper + Multi-image CMS
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

});
