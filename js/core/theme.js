(() => {
  const K = KhaiLife;
  K.theme = {
    apply() {
      const p = K.store.get().preferences;
      document.documentElement.dataset.theme =
        p.theme === "dark" ? "dark" : "light";
      K.$$("#theme-toggle").forEach((b) => {
        b.innerHTML = K.icon(p.theme === "dark" ? "sun" : "moon");
        b.setAttribute(
          "aria-label",
          p.theme === "dark" ? "Bật giao diện sáng" : "Bật giao diện tối",
        );
      });
      K.$$(".app-logo").forEach(
        (i) => (i.src = p.logo || "assets/icons/logo.svg"),
      );
      if (p.logo) K.$('link[rel="apple-touch-icon"]').href = p.logo;
    },
    toggle() {
      K.store.update(
        (s) =>
          (s.preferences.theme =
            s.preferences.theme === "dark" ? "light" : "dark"),
      );
      K.theme.apply();
    },
  };
})();
