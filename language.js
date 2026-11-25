(() => {
  const storageKey = "arrived-site-language";
  const languages = { zh: "zh-CN", en: "en" };
  const isSupported = (language) => language === "zh" || language === "en";
  const title = document.querySelector("title");
  const localizedMetadata = Array.from(document.querySelectorAll("meta[data-english-content]"))
    .map((meta) => [meta, meta.content]);
  const chineseTitle = document.title;
  let languageSwitch;
  let buttons;

  function readPreference() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function savePreference(language) {
    try {
      window.localStorage.setItem(storageKey, language);
    } catch {
      // The current page still works when storage is unavailable.
    }
  }

  function render(language) {
    const english = language === "en";
    document.documentElement.lang = languages[language];
    document.title = english ? title.dataset.englishContent : chineseTitle;
    for (const [meta, chinese] of localizedMetadata) {
      meta.content = english ? meta.dataset.englishContent : chinese;
    }

    if (languageSwitch) {
      languageSwitch.setAttribute("aria-label", english ? "Page language" : "页面语言");
      for (const button of buttons) {
        button.setAttribute("aria-pressed", String(button.dataset.selectLanguage === language));
      }
      for (const element of document.querySelectorAll("[data-english-label]")) {
        element.setAttribute("aria-label", english ? element.dataset.englishLabel : element.dataset.chineseLabel);
      }
    }
  }

  const requested = new URLSearchParams(window.location.search).get("lang");
  let language = requested;
  if (!isSupported(language)) {
    language = readPreference();
  }
  if (!isSupported(language)) {
    language = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  if (isSupported(requested)) {
    savePreference(requested);
  }
  render(language);

  document.addEventListener("DOMContentLoaded", () => {
    languageSwitch = document.querySelector(".language-switch");
    buttons = languageSwitch.querySelectorAll("button");
    render(language);

    for (const button of buttons) {
      button.addEventListener("click", () => {
        language = button.dataset.selectLanguage;
        render(language);
        savePreference(language);

        const url = new URL(window.location.href);
        url.searchParams.set("lang", language);
        window.history.replaceState(window.history.state, "", url);
      });
    }

    languageSwitch.hidden = false;
  });
})();
