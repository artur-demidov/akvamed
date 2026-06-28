function getElement(name, scope = document) {
  return scope.querySelector(`[data-js-element="${name}"]`);
}

function getElements(name, scope = document) {
  return scope.querySelectorAll(`[data-js-element="${name}"]`);
}

function toggleOpen(element) {
  const isOpen = element.getAttribute("data-open") === "true";
  element.setAttribute("data-open", String(!isOpen));
  return !isOpen;
}

function addToggleMobileMenu() {
  const toggleButton = getElement("mobile-menu-toggle");
  const mobileMenu = getElement("mobile-menu");
  toggleButton.addEventListener("click", () => {
    const isOpen = toggleOpen(mobileMenu);
    toggleButton
      .querySelector("use")
      .setAttribute("href", `#icon_${isOpen ? "close" : "menu"}_24`);
  });
}

function addToggleMobileNavDropdown() {
  const dropdowns = getElements("mobile-menu-dropdown");
  dropdowns.forEach((dropdown) => {
    const toggle = getElement("mobile-menu-dropdown-toggle", dropdown);
    toggle.addEventListener("click", () => toggleOpen(dropdown));
  });
}

function addLicenseScroll() {
  const scroll = getElement("license-scroll");
  if (!scroll) return;

  const buttons = getElements("license-scroll-button");

  function getStep() {
    const item = scroll.firstElementChild;
    if (!item) return scroll.clientWidth;
    const gap = parseFloat(getComputedStyle(scroll).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  }

  function updateButtons() {
    const maxScroll = scroll.scrollWidth - scroll.clientWidth;
    buttons.forEach((button) => {
      const isNext = button.getAttribute("data-direction") === "next";
      button.disabled = isNext
        ? scroll.scrollLeft >= maxScroll - 1
        : scroll.scrollLeft <= 0;
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const isNext = button.getAttribute("data-direction") === "next";
      scroll.scrollBy({
        left: isNext ? getStep() : -getStep(),
        behavior: "smooth",
      });
    });
  });

  scroll.addEventListener("scroll", updateButtons);
  window.addEventListener("resize", updateButtons);
  window.addEventListener("load", updateButtons);
  updateButtons();
}

function addRequestModal() {
  const modal = getElement("request-modal");
  if (!modal) return;

  const title = getElement("request-modal-title", modal);
  const subtitle = getElement("request-modal-subtitle", modal);
  const closeButton = getElement("request-modal-close", modal);

  const DEFAULT_TITLE =
    "Не знаете какая капельница или процедура вам подойдет?";
  const DEFAULT_SUBTITLE =
    "Оставьте заявку, наш специалист перезвонит вам и бесплатно проконсультирует вас";

  getElements("open-request-modal").forEach((button) => {
    button.addEventListener("click", () => {
      title.textContent =
        button.getAttribute("data-modal-title") || DEFAULT_TITLE;
      subtitle.textContent =
        button.getAttribute("data-modal-subtitle") || DEFAULT_SUBTITLE;
      modal.showModal();
    });
  });

  closeButton.addEventListener("click", () => modal.close());

  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
}

addToggleMobileMenu();
addToggleMobileNavDropdown();
addLicenseScroll();
addRequestModal();
