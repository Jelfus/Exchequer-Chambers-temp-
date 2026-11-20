const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    navigation.classList.toggle("is-open", !expanded);
  });
}

const currentPage = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".primary-nav a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.setAttribute("aria-current", "page");
  }
});

const searchInput = document.querySelector("#barrister-search");
if (searchInput) {
  const cards = [...document.querySelectorAll(".directory-card")];
  const emptyState = document.querySelector(".empty-state");
  const filterCards = () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    let visibleCount = 0;
    cards.forEach((card) => {
      const searchableText = `${card.textContent} ${card.dataset.search || ""}`.toLocaleLowerCase();
      const matches = searchableText.includes(query);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    if (emptyState) emptyState.hidden = visibleCount > 0;
  };
  searchInput.addEventListener("input", filterCards);
  document.querySelectorAll("[data-search-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      searchInput.value = button.dataset.searchTopic;
      filterCards();
      searchInput.focus();
    });
  });
}

const carousel = document.querySelector("[data-carousel]");
if (carousel) {
  const slides = [...carousel.querySelectorAll("[data-slide]")];
  const track = carousel.querySelector(".carousel-track");
  const dots = [...carousel.querySelectorAll("[data-slide-to]")];
  const previousButton = carousel.querySelector("[data-previous]");
  const nextButton = carousel.querySelector("[data-next]");
  const toggleButton = carousel.querySelector("[data-carousel-toggle]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 1;
  let timer;
  let paused = reducedMotion;

  if (track && slides.length > 1) {
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.removeAttribute("data-slide");
    lastClone.removeAttribute("data-slide");
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    firstClone.setAttribute("inert", "");
    lastClone.setAttribute("inert", "");
    track.append(firstClone);
    track.prepend(lastClone);

    track.style.transform = "translateX(-100%)";

    track.addEventListener("transitionend", (event) => {
      if (event.target !== track || event.propertyName !== "transform") return;
      if (activeIndex === 0) {
        track.style.transition = "none";
        activeIndex = slides.length;
        track.style.transform = `translateX(-${activeIndex * 100}%)`;
        track.offsetHeight;
        track.style.transition = "";
      } else if (activeIndex === slides.length + 1) {
        track.style.transition = "none";
        activeIndex = 1;
        track.style.transform = "translateX(-100%)";
        track.offsetHeight;
        track.style.transition = "";
      }
    });
  }

  const showSlide = (index) => {
    activeIndex = index;
    if (track) track.style.transform = `translateX(-${activeIndex * 100}%)`;
    const dotIndex = (activeIndex - 1 + slides.length) % slides.length;
    dots.forEach((dot, index) => {
      dot.setAttribute("aria-current", String(index === dotIndex));
    });
  };

  const stopTimer = () => {
    window.clearInterval(timer);
    timer = undefined;
  };

  const startTimer = () => {
    stopTimer();
    if (!paused && !document.hidden) {
      timer = window.setInterval(() => showSlide(activeIndex + 1), 6500);
    }
  };

  previousButton?.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startTimer();
  });
  nextButton?.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startTimer();
  });
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index + 1);
      startTimer();
    });
  });
  toggleButton?.addEventListener("click", () => {
    paused = !paused;
    toggleButton.setAttribute("aria-pressed", String(paused));
    toggleButton.textContent = paused ? "Play slides" : "Pause slides";
    startTimer();
  });
  document.addEventListener("visibilitychange", startTimer);
  showSlide(1);
  if (toggleButton && reducedMotion) {
    toggleButton.setAttribute("aria-pressed", "true");
    toggleButton.textContent = "Play slides";
  }
  startTimer();
}
