document.addEventListener("DOMContentLoaded", () => {
  initBase();
  initHomePage();
  initCatalogPage();
  initFavoritesPage();
  initServicesPage();
  initContactsPage();
  initCarPage();
  initGlobalEvents();
});

function initBase() {
  setYear();
  setupTheme();
  setupBurger();
  setActiveNav();
  updateFavoritesBadge();
  setupBackTop();
}

function setYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function setupTheme() {
  const btn = document.getElementById("themeBtn");
  if (!btn) return;

  const saved = localStorage.getItem("autodrive-theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    btn.textContent = "☀️";
  }

  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("autodrive-theme", isDark ? "dark" : "light");
    btn.textContent = isDark ? "☀️" : "🌙";
  });
}

function setupBurger() {
  const burger = document.getElementById("burgerBtn");
  const nav = document.getElementById("mainNav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

function setActiveNav() {
  const links = document.querySelectorAll(".nav-link");
  let current = window.location.pathname.split("/").pop() || "index.html";
  links.forEach((link) => {
    if (link.getAttribute("href") === current) link.classList.add("active");
  });
}

function setupBackTop() {
  const btn = document.getElementById("backTop");
  if (!btn) return;

  const toggle = () => btn.classList.toggle("show", window.scrollY > 250);
  toggle();
  window.addEventListener("scroll", toggle);
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function showToast(text) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

/* ==========================
   DATA / STORAGE HELPERS
========================== */
function getCars() {
  return Array.isArray(window.CARS_DATA) ? window.CARS_DATA : [];
}

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function getFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem("autodrive-favorites") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function setFavorites(ids) {
  localStorage.setItem("autodrive-favorites", JSON.stringify(ids));
  updateFavoritesBadge();
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx >= 0) {
    favs.splice(idx, 1);
    setFavorites(favs);
    showToast("Удалено из избранного");
    return false;
  } else {
    favs.push(id);
    setFavorites(favs);
    showToast("Добавлено в избранное");
    return true;
  }
}

function updateFavoritesBadge() {
  const count = getFavorites().length;
  document.querySelectorAll("#favBadge").forEach((el) => (el.textContent = String(count)));
  const pageCount = document.getElementById("favoritesCountPage");
  if (pageCount) pageCount.textContent = String(count);
}

/* ==========================
   CARD / MODAL RENDER
========================== */
function createCarCard(car) {
  const favActive = isFavorite(car.id) ? "active" : "";
  const favIcon = isFavorite(car.id) ? "❤️" : "🤍";

  return `
    <article class="car-card" data-id="${car.id}">
      <div class="car-cover ${car.gradient}">
        ${car.emoji}
        <span class="car-rating">★ ${car.rating}</span>
      </div>
      <div class="car-body">
        <h3>${car.title}</h3>
        <p>${car.short}</p>

        <div class="car-info">
          <span>${typeLabel(car.type)}</span>
          <span>${car.engine}</span>
          <span>${car.year}</span>
          <span>${car.drive}</span>
        </div>

        <span class="car-price">${formatPrice(car.price)}</span>

        <div class="card-actions">
          <button class="small-btn js-details" type="button" data-id="${car.id}">Подробнее</button>
          <button class="small-btn fav-btn js-fav ${favActive}" type="button" data-id="${car.id}">${favIcon}</button>
          <a class="small-btn" href="car.html?id=${car.id}">Открыть</a>
        </div>
      </div>
    </article>
  `;
}

function openCarModal(carId) {
  const modal = document.getElementById("carModal");
  const body = document.getElementById("modalBody");
  const car = getCars().find((c) => c.id === carId);
  if (!modal || !body || !car) return;

  const favText = isFavorite(car.id) ? "Убрать из избранного" : "В избранное";

  body.innerHTML = `
    <div class="modal-car">
      <div class="modal-cover ${car.gradient}">${car.emoji}</div>
      <div class="modal-body">
        <h3>${car.title}</h3>
        <p>${car.description}</p>

        <div class="modal-meta">
          <div><b>Год</b>${car.year}</div>
          <div><b>Кузов</b>${typeLabel(car.type)}</div>
          <div><b>Двигатель</b>${car.engine}</div>
          <div><b>КПП</b>${car.transmission}</div>
          <div><b>Привод</b>${car.drive}</div>
          <div><b>Пробег</b>${new Intl.NumberFormat("ru-RU").format(car.mileage)} км</div>
        </div>

        <div class="modal-price">${formatPrice(car.price)}</div>

        <ul class="feature-list">
          ${car.features.map((f) => `<li>${f}</li>`).join("")}
        </ul>

        <div class="modal-actions">
          <button class="btn btn-primary js-fav-text" type="button" data-id="${car.id}">${favText}</button>
          <a href="car.html?id=${car.id}" class="btn btn-outline">Страница авто</a>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("carModal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function refreshFavoriteButtonsUI() {
  document.querySelectorAll(".js-fav").forEach((btn) => {
    const id = btn.dataset.id;
    const active = isFavorite(id);
    btn.classList.toggle("active", active);
    btn.textContent = active ? "❤️" : "🤍";
  });

  const modalBtn = document.querySelector(".js-fav-text");
  if (modalBtn) {
    modalBtn.textContent = isFavorite(modalBtn.dataset.id) ? "Убрать из избранного" : "В избранное";
  }

  updateFavoritesBadge();
}

function typeLabel(type) {
  const map = {
    sedan: "Седан",
    crossover: "Кроссовер",
    hatchback: "Хэтчбек"
  };
  return map[type] || type;
}

/* ==========================
   HOME PAGE
========================== */
function initHomePage() {
  const sliderRoot = document.getElementById("heroSlider");
  const featuredGrid = document.getElementById("featuredGrid");
  if (!sliderRoot && !featuredGrid) return;

  const cars = getCars();
  const featured = [...cars].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const slides = featured.slice(0, 3);

  if (featuredGrid) {
    featuredGrid.innerHTML = featured.slice(0, 3).map(createCarCard).join("");
  }

  if (sliderRoot) {
    const dotsRoot = document.getElementById("heroDots");
    const prevBtn = document.getElementById("heroPrev");
    const nextBtn = document.getElementById("heroNext");
    let current = 0;
    let timer = null;

    const renderSlide = () => {
      const car = slides[current];
      sliderRoot.innerHTML = `
        <div class="slide">
          <div class="slide-cover ${car.gradient}">${car.emoji}</div>
          <div class="slide-body">
            <h4>${car.title}</h4>
            <p>${car.short}</p>
            <div class="slide-meta">
              <span>${typeLabel(car.type)}</span>
              <span>${car.engine}</span>
              <span>${car.year}</span>
            </div>
            <div class="slide-bottom">
              <span class="slide-price">${formatPrice(car.price)}</span>
              <a class="btn btn-primary" href="car.html?id=${car.id}">Открыть</a>
            </div>
          </div>
        </div>
      `;

      if (dotsRoot) {
        dotsRoot.innerHTML = slides
          .map((_, i) => `<button class="dot ${i === current ? "active" : ""}" data-slide="${i}" type="button"></button>`)
          .join("");
      }
    };

    const go = (dir) => {
      current = (current + dir + slides.length) % slides.length;
      renderSlide();
    };

    renderSlide();
    prevBtn?.addEventListener("click", () => go(-1));
    nextBtn?.addEventListener("click", () => go(1));

    dotsRoot?.addEventListener("click", (e) => {
      const btn = e.target.closest(".dot");
      if (!btn) return;
      current = Number(btn.dataset.slide);
      renderSlide();
    });

    const startAuto = () => {
      clearInterval(timer);
      timer = setInterval(() => go(1), 3500);
    };
    startAuto();
    sliderRoot.addEventListener("mouseenter", () => clearInterval(timer));
    sliderRoot.addEventListener("mouseleave", startAuto);
  }

  const heroSearchForm = document.getElementById("heroSearchForm");
  if (heroSearchForm) {
    heroSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = document.getElementById("heroSearchText")?.value.trim() || "";
      const type = document.getElementById("heroSearchType")?.value || "all";
      const params = new URLSearchParams();
      if (text) params.set("search", text);
      if (type !== "all") params.set("type", type);
      window.location.href = `catalog.html?${params.toString()}`;
    });
  }
}

/* ==========================
   CATALOG PAGE
========================== */
function initCatalogPage() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;

  const filterSearch = document.getElementById("filterSearch");
  const filterBrand = document.getElementById("filterBrand");
  const filterType = document.getElementById("filterType");
  const filterDrive = document.getElementById("filterDrive");
  const filterSort = document.getElementById("filterSort");
  const minPrice = document.getElementById("minPrice");
  const maxPrice = document.getElementById("maxPrice");
  const favOnly = document.getElementById("filterFavOnly");
  const resetBtn = document.getElementById("resetFilters");
  const countEl = document.getElementById("catalogCount");
  const emptyEl = document.getElementById("catalogEmpty");

  // Бренды в select
  const brands = [...new Set(getCars().map((c) => c.brand))].sort();
  filterBrand.innerHTML = `<option value="all">Все бренды</option>` + brands.map((b) => `<option value="${b}">${b}</option>`).join("");

  // URL params (для поиска с главной)
  const params = new URLSearchParams(window.location.search);
  if (params.get("search")) filterSearch.value = params.get("search");
  if (params.get("type")) filterType.value = params.get("type");

  function render() {
    let items = [...getCars()];
    const q = (filterSearch.value || "").trim().toLowerCase();
    const brand = filterBrand.value;
    const type = filterType.value;
    const drive = filterDrive.value;
    const sort = filterSort.value;
    const min = Number(minPrice.value || 0);
    const max = Number(maxPrice.value || 0);
    const onlyFav = favOnly.checked;
    const favs = getFavorites();

    items = items.filter((car) => {
      const bySearch =
        !q ||
        car.title.toLowerCase().includes(q) ||
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.short.toLowerCase().includes(q);

      const byBrand = brand === "all" || car.brand === brand;
      const byType = type === "all" || car.type === type;
      const byDrive = drive === "all" || car.drive === drive;
      const byMin = !min || car.price >= min;
      const byMax = !max || car.price <= max;
      const byFav = !onlyFav || favs.includes(car.id);

      return bySearch && byBrand && byType && byDrive && byMin && byMax && byFav;
    });

    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    if (sort === "year-desc") items.sort((a, b) => b.year - a.year);
    if (sort === "year-asc") items.sort((a, b) => a.year - b.year);
    if (sort === "popular") items.sort((a, b) => b.rating - a.rating);

    grid.innerHTML = items.map(createCarCard).join("");
    countEl.textContent = String(items.length);
    emptyEl.classList.toggle("hidden", items.length > 0);
  }

  [filterSearch, filterBrand, filterType, filterDrive, filterSort, minPrice, maxPrice, favOnly].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  resetBtn.addEventListener("click", () => {
    filterSearch.value = "";
    filterBrand.value = "all";
    filterType.value = "all";
    filterDrive.value = "all";
    filterSort.value = "popular";
    minPrice.value = "";
    maxPrice.value = "";
    favOnly.checked = false;
    render();
  });

  render();
  window.__rerenderCatalog = render; // чтобы обновлять после добавления в избранное
}

/* ==========================
   FAVORITES PAGE
========================== */
function initFavoritesPage() {
  const grid = document.getElementById("favoritesGrid");
  if (!grid) return;

  const empty = document.getElementById("favoritesEmpty");
  const clearBtn = document.getElementById("clearFavorites");

  function renderFavorites() {
    const ids = getFavorites();
    const items = getCars().filter((c) => ids.includes(c.id));

    grid.innerHTML = items.map(createCarCard).join("");
    updateFavoritesBadge();

    empty.classList.toggle("hidden", items.length > 0);
    grid.classList.toggle("hidden", items.length === 0);
    clearBtn.disabled = items.length === 0;
  }

  clearBtn.addEventListener("click", () => {
    setFavorites([]);
    renderFavorites();
    showToast("Избранное очищено");
  });

  renderFavorites();
  window.__rerenderFavorites = renderFavorites;
}

/* ==========================
   SERVICES PAGE
========================== */
function initServicesPage() {
  const form = document.getElementById("serviceCalcForm");
  if (form) {
    const result = document.getElementById("calcResult");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const service = document.getElementById("calcService").value;
      const urgency = document.getElementById("calcUrgency").value;
      const wash = document.getElementById("calcWash").checked;
      const report = document.getElementById("calcReport").checked;

      const baseMap = {
        diagnostic: 3500,
        maintenance: 8000,
        selection: 12000,
        prep: 7000
      };

      let total = baseMap[service] || 0;
      if (wash) total += 1500;
      if (report) total += 2500;
      if (urgency === "urgent") total = Math.round(total * 1.2);

      result.textContent = `Стоимость: ${formatPrice(total)}`;
      showToast("Стоимость рассчитана");
    });
  }

  document.querySelectorAll(".faq-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

/* ==========================
   CONTACTS PAGE
========================== */
function initContactsPage() {
  setupPhoneMasks();

  const form = document.getElementById("contactForm");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const agreeInput = document.getElementById("agree");

  const errors = {
    name: document.getElementById("nameError"),
    phone: document.getElementById("phoneError"),
    email: document.getElementById("emailError"),
    message: document.getElementById("messageError"),
    agree: document.getElementById("agreeError")
  };

  const success = document.getElementById("formSuccess");
  const note = document.getElementById("lastRequestNote");

  // Показать последнюю отправку (демо)
  try {
    const last = JSON.parse(localStorage.getItem("autodrive-last-lead") || "null");
    if (last && note) {
      note.classList.add("show");
      note.textContent = `Последняя заявка: ${last.name}, ${last.phone} (${last.date})`;
    }
  } catch {}

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    Object.values(errors).forEach((el) => (el.textContent = ""));
    success.textContent = "";

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    const agree = agreeInput.checked;

    let valid = true;

    if (name.length < 2) {
      errors.name.textContent = "Минимум 2 символа";
      valid = false;
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 11) {
      errors.phone.textContent = "Введите полный номер";
      valid = false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email.textContent = "Некорректный email";
      valid = false;
    }

    if (message.length < 5) {
      errors.message.textContent = "Сообщение слишком короткое";
      valid = false;
    }

    if (!agree) {
      errors.agree.textContent = "Нужно поставить галочку";
      valid = false;
    }

    if (!valid) return;

    const record = {
      name,
      phone,
      email,
      message,
      date: new Date().toLocaleString("ru-RU")
    };

    localStorage.setItem("autodrive-last-lead", JSON.stringify(record));
    success.textContent = "Заявка отправлена! (демо)";
    showToast("Форма отправлена");
    form.reset();

    if (note) {
      note.classList.add("show");
      note.textContent = `Последняя заявка: ${record.name}, ${record.phone} (${record.date})`;
    }
  });
}

function setupPhoneMasks() {
  document.querySelectorAll(".js-phone-mask").forEach((input) => {
    input.addEventListener("input", onPhoneInput);
    input.addEventListener("focus", onPhoneInput);
    input.addEventListener("blur", onPhoneBlur);
  });
}

function onPhoneInput(e) {
  const input = e.target;
  let digits = input.value.replace(/\D/g, "");

  if (!digits.startsWith("7")) {
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    else if (digits.length) digits = "7" + digits;
  }

  digits = digits.slice(0, 11);

  let out = "+7";
  if (digits.length > 1) out += " (" + digits.slice(1, 4);
  if (digits.length >= 4) out += ")";
  if (digits.length > 4) out += " " + digits.slice(4, 7);
  if (digits.length > 7) out += "-" + digits.slice(7, 9);
  if (digits.length > 9) out += "-" + digits.slice(9, 11);

  input.value = out;
}

function onPhoneBlur(e) {
  const input = e.target;
  if (input.value === "+7") input.value = "";
}

/* ==========================
   CAR PAGE
========================== */
function initCarPage() {
  const root = document.getElementById("carPage");
  if (!root) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const car = getCars().find((c) => c.id === id);

  if (!car) {
    root.innerHTML = `
      <div class="empty-state">
        <p>Автомобиль не найден.</p>
        <a href="catalog.html" class="btn btn-primary">В каталог</a>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="car-page">
      <div class="detail-gallery">
        <div id="detailMain" class="detail-main ${car.gradient}">${car.emoji}</div>
        <div class="detail-thumbs">
          <button class="thumb active ${car.gradient}" data-emoji="${car.emoji}" data-gradient="${car.gradient}" type="button">${car.emoji}</button>
          <button class="thumb gradient-2" data-emoji="🚘" data-gradient="gradient-2" type="button">🚘</button>
          <button class="thumb gradient-5" data-emoji="🚗" data-gradient="gradient-5" type="button">🚗</button>
        </div>
      </div>

      <div class="detail-info">
        <h2>${car.title}</h2>
        <p>${car.description}</p>
        <div class="detail-price">${formatPrice(car.price)}</div>

        <div class="detail-grid">
          <div><b>Год</b>${car.year}</div>
          <div><b>Пробег</b>${new Intl.NumberFormat("ru-RU").format(car.mileage)} км</div>
          <div><b>Двигатель</b>${car.engine}</div>
          <div><b>Мощность</b>${car.power} л.с.</div>
          <div><b>КПП</b>${car.transmission}</div>
          <div><b>Привод</b>${car.drive}</div>
          <div><b>Топливо</b>${car.fuel}</div>
          <div><b>Цвет</b>${car.color}</div>
        </div>

        <div class="detail-actions">
          <button class="btn btn-primary js-details" type="button" data-id="${car.id}">Быстрое окно</button>
          <button class="btn btn-outline js-fav-text" type="button" data-id="${car.id}">
            ${isFavorite(car.id) ? "Убрать из избранного" : "В избранное"}
          </button>
          <a href="contacts.html" class="btn btn-outline">Оставить заявку</a>
        </div>

        <ul class="feature-list">
          ${car.features.map((f) => `<li>${f}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;

  // мини-галерея
  root.querySelectorAll(".thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      const main = document.getElementById("detailMain");
      if (!main) return;
      root.querySelectorAll(".thumb").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      main.className = `detail-main ${btn.dataset.gradient}`;
      main.textContent = btn.dataset.emoji;
    });
  });

  // похожие
  const similarGrid = document.getElementById("similarGrid");
  if (similarGrid) {
    const items = getCars()
      .filter((c) => c.id !== car.id && (c.type === car.type || c.brand === car.brand))
      .slice(0, 3);
    similarGrid.innerHTML = items.map(createCarCard).join("");
  }
}

/* ==========================
   GLOBAL EVENTS
========================== */
function initGlobalEvents() {
  document.addEventListener("click", (e) => {
    const detailsBtn = e.target.closest(".js-details");
    if (detailsBtn) {
      openCarModal(detailsBtn.dataset.id);
      return;
    }

    const favBtn = e.target.closest(".js-fav");
    if (favBtn) {
      toggleFavorite(favBtn.dataset.id);
      refreshFavoriteButtonsUI();
      if (typeof window.__rerenderFavorites === "function") window.__rerenderFavorites();
      if (typeof window.__rerenderCatalog === "function") window.__rerenderCatalog();
      return;
    }

    const favTextBtn = e.target.closest(".js-fav-text");
    if (favTextBtn) {
      toggleFavorite(favTextBtn.dataset.id);
      refreshFavoriteButtonsUI();
      if (typeof window.__rerenderFavorites === "function") window.__rerenderFavorites();
      if (typeof window.__rerenderCatalog === "function") window.__rerenderCatalog();
      return;
    }

    if (e.target.closest("[data-close-modal]")) {
      closeModal();
      return;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}