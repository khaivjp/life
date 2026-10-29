/* Danh sách việc nên làm: thêm, sửa, xóa; không tự đặt lại theo ngày. */
(() => {
  const K = KhaiLife,
    E = K.esc;
  function list(limit = 0) {
    const all = K.store.get().tasks,
      items = limit ? all.slice(0, limit) : all;
    return items.length
      ? `<div class="task-list">${items.map((t) => `<div class="task-row"><span class="task-dot ${t.prio === "Cao" ? "high" : t.prio === "Thấp" ? "low" : ""}"></span><div class="task-text"><strong>${E(t.title)}</strong><small>Ưu tiên ${t.prio === "Cao" ? "cao" : t.prio === "Thấp" ? "thấp" : "vừa"}</small></div><button class="icon-button" data-edit-task="${E(t.id)}" aria-label="Sửa ${E(t.title)}">${K.icon("edit")}</button><button class="icon-button" data-delete-task="${E(t.id)}" aria-label="Xóa ${E(t.title)}">${K.icon("trash")}</button></div>`).join("")}</div>`
      : K.empty(
          "Một khoảng trống cho ý tưởng mới",
          "Thêm những việc bạn muốn dành thời gian thực hiện.",
          "list",
        );
  }
  function edit(id = null) {
    const t = K.store.get().tasks.find((x) => String(x.id) === String(id));
    K.modal(
      t ? "Sửa việc nên làm" : "Thêm việc nên làm",
      `<form id="task-form"><label>Nội dung<input name="title" maxlength="250" value="${E(t?.title || "")}" placeholder="Ví dụ: Ôn bài Cơ sở dữ liệu" required autofocus></label><label style="margin-top:16px">Mức ưu tiên<select name="prio">${["Cao", "TB", "Thấp"].map((v) => `<option value="${v}" ${v === (t?.prio || "TB") ? "selected" : ""}>${v === "TB" ? "Vừa" : v}</option>`).join("")}</select></label><div class="form-actions"><button type="button" class="btn" data-cancel>Hủy</button><button class="btn primary">${K.icon("check")} Lưu nhiệm vụ</button></div></form>`,
      (dlg) => {
        dlg.querySelector("[data-cancel]").onclick = () => dlg.close();
        dlg.querySelector("form").onsubmit = (e) => {
          e.preventDefault();
          const f = new FormData(e.target),
            title = f.get("title").trim();
          if (!title) return;
          K.store.update((s) => {
            if (t) {
              const target = s.tasks.find((x) => x.id === t.id);
              Object.assign(target, { title, prio: f.get("prio") });
            } else
              s.tasks.unshift({
                id: K.uid(),
                title,
                prio: f.get("prio"),
                createdAt: new Date().toISOString(),
              });
          });
          dlg.close();
          K.toast("Đã lưu việc nên làm.");
        };
      },
    );
  }
  function bind(root) {
    root
      .querySelectorAll("[data-add-task]")
      .forEach((b) => (b.onclick = () => edit()));
    root
      .querySelectorAll("[data-edit-task]")
      .forEach((b) => (b.onclick = () => edit(b.dataset.editTask)));
    root.querySelectorAll("[data-delete-task]").forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.deleteTask,
            t = K.store.get().tasks.find((x) => String(x.id) === id);
          K.modal(
            "Xóa việc nên làm?",
            `<p>${E(t?.title)}</p><div class="form-actions"><button class="btn" data-cancel>Giữ lại</button><button class="btn danger" data-confirm>Xóa nhiệm vụ</button></div>`,
            (dlg) => {
              dlg.querySelector("[data-cancel]").onclick = () => dlg.close();
              dlg.querySelector("[data-confirm]").onclick = () => {
                K.store.update(
                  (s) => (s.tasks = s.tasks.filter((x) => String(x.id) !== id)),
                );
                dlg.close();
                K.toast("Đã xóa nhiệm vụ.");
              };
            },
          );
        }),
    );
  }
  K.tasks = {
    list,
    bind,
    render(root) {
      root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">DÀNH THỜI GIAN CHO ĐIỀU QUAN TRỌNG</span><h1>Việc nên làm</h1><p>Giữ những dự định ở một nơi. Làm theo nhịp của bạn.</p></div><button class="btn primary" data-add-task>${K.icon("plus")} Thêm nhiệm vụ</button></div><div class="card"><div class="card-head"><h2>Danh sách của Khải</h2><span class="tag neutral">${K.store.get().tasks.length} việc</span></div>${list()}</div>`;
      bind(root);
    },
  };
})();
