/* Điều hướng và khởi tạo; mỗi chức năng tự quản lý giao diện của nó. */
(() => {
  const K = KhaiLife,
    routes = {
      home: { name: "Tổng quan", icon: "home", module: K.dashboard },
      tasks: { name: "Việc nên làm", icon: "list", module: K.tasks },
      schedule: {
        name: "Thời khóa biểu",
        icon: "calendar",
        module: K.schedule,
      },
      aptis: { name: "Aptis 16 tuần", icon: "book", module: K.aptis },
      gpa: { name: "Bảng điểm & GPA", icon: "trophy", module: K.gpa },
      brain: { name: "Brain Gym", icon: "brain", module: K.brain },
      settings: {
        name: "Cài đặt & dữ liệu",
        icon: "settings",
        module: K.settings,
      },
    };
  let current = "",
    lastToday = K.dateKey();
  const route = () =>
    routes[location.hash.slice(1)] ? location.hash.slice(1) : "home";
  function closeMenu() {
    K.$("#sidebar").classList.remove("open");
    K.$("#menu-overlay").hidden = true;
    K.$("#menu-toggle").setAttribute("aria-expanded", "false");
  }
  function render() {
    const next = route();
    if (current === "brain" && next !== "brain") K.brain.leave();
    current = next;
    document.title = `${routes[current].name} — KhaiLife`;
    K.$("#route-title").textContent = routes[current].name;
    K.$$(".main-nav a,.bottom-nav a").forEach((a) => {
      const active = a.hash === "#" + current;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    routes[current].module.render(K.$("#content"));
    K.theme.apply();
  }
  K.$("#main-nav").innerHTML = Object.entries(routes)
    .filter(([key]) => key !== "settings")
    .map(
      ([key, r]) =>
        `<a href="#${key}">${K.icon(r.icon)}<span>${r.name}</span></a>`,
    )
    .join("");
  K.$("#bottom-nav").innerHTML = ["home", "schedule", "aptis", "gpa", "brain"]
    .map(
      (key) =>
        `<a href="#${key}">${K.icon(routes[key].icon)}<span>${key === "home" ? "Tổng quan" : key === "schedule" ? "Lịch học" : key === "aptis" ? "Aptis" : key === "gpa" ? "GPA" : "Brain Gym"}</span></a>`,
    )
    .join("");
  K.$$("[data-icon]").forEach((n) => (n.innerHTML = K.icon(n.dataset.icon)));
  K.$("#menu-toggle").onclick = () => {
    const open = !K.$("#sidebar").classList.contains("open");
    K.$("#sidebar").classList.toggle("open", open);
    K.$("#menu-overlay").hidden = !open;
    K.$("#menu-toggle").setAttribute("aria-expanded", String(open));
  };
  K.$("#menu-overlay").onclick = closeMenu;
  K.$("#theme-toggle").onclick = K.theme.toggle;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hash === "#content") return;
    closeMenu();
    if (K.brain.isPlaying() && a.hash !== location.hash) {
      e.preventDefault();
      K.brain.guard(() => (location.hash = a.hash));
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  window.addEventListener("hashchange", () => {
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
    K.$("#content").focus({ preventScroll: true });
  });
  window.addEventListener("khailife:change", () => {
    if (current === "brain" && K.brain.isPlaying()) return;
    render();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === "khailife_v3")
      K.toast(
        "Một tab khác vừa thay đổi dữ liệu. Tải lại trang để dùng bản mới nhất.",
      );
  });
  function dayCheck() {
    const now = K.dateKey();
    K.$("#header-date").textContent = new Date().toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "long",
    });
    if (now !== lastToday) {
      K.schedule.newDay(lastToday);
      lastToday = now;
      if (!(current === "brain" && K.brain.isPlaying())) render();
    }
  }
  setInterval(dayCheck, 15000);
  window.addEventListener("focus", dayCheck);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) dayCheck();
  });
  dayCheck();
  render();
})();
