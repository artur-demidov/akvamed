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
  const icon = getElement("mobile-menu-icon", toggleButton);
  toggleButton.addEventListener("click", () => {
    const isOpen = toggleOpen(mobileMenu);
    icon.setAttribute("href", `#icon_${isOpen ? "close" : "menu"}_24`);
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
    const item = getElement("license-scroll-item", scroll);
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

  scroll.addEventListener("scrollend", updateButtons);
  window.addEventListener("resize", updateButtons);
  window.addEventListener("load", updateButtons);
  updateButtons();
}

function resultIcon(success) {
  return `<svg width="24" height="24"><use href="${success ? "#icon_check_24" : "#icon_close_24"}"></use></svg>`;
}

function addRequestModal() {
  const modal = getElement("request-modal");
  if (!modal) return;

  const title = getElement("request-modal-title", modal);
  const subtitle = getElement("request-modal-subtitle", modal);
  const form = getElement("request-form", modal);

  const DEFAULT_TITLE =
    "Не знаете какая капельница или процедура вам подойдет?";
  const DEFAULT_SUBTITLE =
    "Оставьте заявку, наш специалист перезвонит вам и бесплатно проконсультирует вас";

  const setIntroHidden = (hidden) => {
    title.hidden = hidden;
    subtitle.hidden = hidden;
  };

  const clearResult = () =>
    getElements("request-result", modal).forEach((el) => el.remove());

  function showForm() {
    clearResult();
    setIntroHidden(false);
    form.hidden = false;
  }

  function showSuccess() {
    setIntroHidden(true);
    form.hidden = true;
    const result = document.createElement("div");
    result.className = "form-result";
    result.dataset.jsElement = "request-result";
    result.innerHTML = `
      <div class="form-result__icon">${resultIcon(true)}</div>
      <h3 class="form-result__title heading">Заявка успешно отправлена!</h3>
      <button type="button" class="button button--secondary button--lg form-result__button" data-js-element="request-result-button">Хорошо</button>`;
    getElement("request-result-button", result).onclick = () => modal.close();
    form.after(result);
  }

  function showError(message) {
    setIntroHidden(true);
    form.hidden = true;
    const error = document.createElement("div");
    error.className = "form-error";
    error.dataset.jsElement = "request-result";
    error.innerHTML = `
      <div class="form-result__icon">${resultIcon(false)}</div>
      <h3 class="modal__title heading" data-js-element="request-result-title"></h3>
      <button type="button" class="button button--secondary button--lg form-result__button" data-js-element="request-result-button">Повторить попытку</button>`;
    getElement("request-result-title", error).textContent = message;
    getElement("request-result-button", error).onclick = showForm;
    form.after(error);
  }

  getElements("open-request-modal").forEach((button) => {
    button.addEventListener("click", () => {
      title.textContent =
        button.getAttribute("data-modal-title") || DEFAULT_TITLE;
      subtitle.textContent =
        button.getAttribute("data-modal-subtitle") || DEFAULT_SUBTITLE;
      modal.showModal();
    });
  });

  getElement("request-modal-close", modal).addEventListener("click", () =>
    modal.close(),
  );

  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });

  modal.addEventListener("close", () => {
    showForm();
    form.reset();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = getElement("request-form-submit", form);
    submit.disabled = true;
    clearResult();

    try {
      // const response = await fetch("/request", {
      //   method: "POST",
      //   body: new FormData(form),
      // });
      // const data = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 600));
      const data = { ok: Math.random() < 0.5 };

      if (data.ok) {
        showSuccess();
      } else {
        showError(data.error || "Произошла какая-то ошибка");
      }
    } catch {
      showError("Произошла какая-то ошибка");
    } finally {
      submit.disabled = false;
    }
  });
}

addToggleMobileMenu();
addToggleMobileNavDropdown();
addLicenseScroll();
addRequestModal();
