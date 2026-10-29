/* Tiện ích dùng chung. Không chứa logic riêng của màn hình. */
window.KhaiLife = window.KhaiLife || {};
(() => {
  const K = window.KhaiLife;
  K.$ = (s, root = document) => root.querySelector(s);
  K.$$ = (s, root = document) => [...root.querySelectorAll(s)];
  K.esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  K.uid = () =>
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  K.shuffle = (values) => {
    const a = [...values];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  K.rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  K.dateKey = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  K.date = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d, 12);
  };
  K.shiftDate = (s, n) => {
    const d = K.date(s);
    d.setDate(d.getDate() + n);
    return K.dateKey(d);
  };
  K.validDate = (s) =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) && K.dateKey(K.date(s)) === s;
  K.formatDate = (s, full = false) =>
    K.date(s).toLocaleDateString(
      "vi-VN",
      full
        ? { weekday: "long", day: "numeric", month: "long", year: "numeric" }
        : { day: "2-digit", month: "2-digit" },
    );
  K.clock = (s) => {
    s = Math.max(0, Math.ceil(s));
    return `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };
  K.download = (name, content, type = "application/json") => {
    const a = document.createElement("a"),
      u = URL.createObjectURL(new Blob([content], { type }));
    a.href = u;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  K.toast = (msg) => {
    const box = K.$("#toast");
    if (!box) return;
    box.textContent = msg;
    box.classList.add("show");
    clearTimeout(K.toastTimer);
    K.toastTimer = setTimeout(() => box.classList.remove("show"), 4500);
  };
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
    brain:
      '<path d="M12 5a3 3 0 0 0-5-2 3 3 0 0 0-3 4 4 4 0 0 0-1 7 4 4 0 0 0 4 6 3 3 0 0 0 5 0V5Zm0 0a3 3 0 0 1 5-2 3 3 0 0 1 3 4 4 4 0 0 1 1 7 4 4 0 0 1-4 6 3 3 0 0 1-5 0M7 7l2 2M5 14l3-1m9-6-2 2m4 5-3-1M8 18l1-2m7 2-1-2"/>',
    book: '<path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Zm0 0v15"/>',
    list: '<path d="m3 6 1 1 2-2m-3 8 1 1 2-2m-3 8 1 1 2-2M10 6h11M10 13h11M10 20h11"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    external:
      '<path d="M14 3h7v7m0-7L10 14m1-11H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/>',
    wallet:
      '<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0-3 3v13a2 2 0 0 0 2 2h16V8H5a2 2 0 0 1 0-4"/><path d="M21 12h-6v5h6M17 14.5h.01"/>',
    settings:
      '<path d="m9 3-1 3-3 1-2 3 2 3-1 3 3 3 3-1 3 2 3-2 3-1 1-4-2-2 1-4-3-1-2-3z"/><circle cx="12" cy="12" r="3"/>',
    moon: '<path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    edit: '<path d="m14 5 5 5M3 21l5-1L21 7l-5-5L3 15z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    play: '<path d="m8 4 12 8-12 8z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    trophy:
      '<path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H3v3a5 5 0 0 0 5 5m8-8h5v3a5 5 0 0 1-5 5M12 13v5m-5 3v-3h10v3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    spark:
      '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
    headphones:
      '<path d="M3 13v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="11" width="5" height="10" rx="2"/><rect x="17" y="11" width="5" height="10" rx="2"/>',
    target:
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    pen: '<path d="m16 3 5 5L8 21H3v-5L16 3ZM14 5l5 5"/>',
    cloud:
      '<path d="M7 18H6a4 4 0 1 1 0-8 6 6 0 0 1 12-2 5 5 0 0 1 0 10h-1M12 21V11m-4 4 4-4 4 4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M3 17v4h18v-4"/>',
    refresh:
      '<path d="M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6M4 17a9 9 0 0 0 15 2l3-3m0 6v-6h-6"/>',
  };
  K.icon = (name, cls = "") =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  K.empty = (title, text, icon = "spark") =>
    `<div class="empty">${K.icon(icon)}<strong>${K.esc(title)}</strong><p>${K.esc(text)}</p></div>`;
  K.modal = (title, body, onReady) => {
    const dlg = K.$("#dialog");
    dlg.innerHTML = `<div class="dialog-head"><h2>${K.esc(title)}</h2><button class="icon-button" data-close aria-label="Đóng">${K.icon("close")}</button></div><div class="dialog-body">${body}</div>`;
    dlg.querySelector("[data-close]").onclick = () => dlg.close();
    dlg.showModal();
    onReady?.(dlg);
  };
})();
