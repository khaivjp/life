/* Cài đặt, sao lưu JSON và cấu hình GitHub. */
(() => {
  const K = KhaiLife,
    E = K.esc;
  async function importBackup(file) {
    if (!file) return;
    try {
      if (file.size > 15 * 1024 * 1024)
        throw new Error("File sao lưu quá lớn (tối đa 15 MB).");
      const next = K.store.normalize(JSON.parse(await file.text()));
      K.modal(
        "Nhập bản sao lưu?",
        `<p>Bản sao lưu có ${next.tasks.length} việc nên làm, ${next.schedule.length} dòng lịch và ${next.brain.history.length} lượt Brain Gym.</p><p>Dữ liệu trên thiết bị sẽ được thay bằng bản này. Bản hiện tại được giữ để khôi phục lại.</p><div class="form-actions"><button class="btn" data-backup>Xuất bản hiện tại</button><button class="btn primary" data-confirm>Nhập dữ liệu</button></div>`,
        (dlg) => {
          dlg.querySelector("[data-backup]").onclick = K.store.backup;
          dlg.querySelector("[data-confirm]").onclick = async () => {
            try {
              await K.store.replace(next);
              K.theme.apply();
              dlg.close();
              K.toast("Đã nhập bản sao lưu.");
            } catch (e) {
              K.toast(e.message);
            }
          };
        },
      );
    } catch (e) {
      K.toast(e.message || "Không đọc được file JSON.");
    }
  }
  function uploadLogo(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      K.toast("Hãy chọn một file ảnh.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      K.toast("Chọn ảnh dưới 10 MB.");
      return;
    }
    const url = URL.createObjectURL(file),
      img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 192;
      const edge = Math.min(img.width, img.height);
      c.getContext("2d").drawImage(
        img,
        (img.width - edge) / 2,
        (img.height - edge) / 2,
        edge,
        edge,
        0,
        0,
        192,
        192,
      );
      URL.revokeObjectURL(url);
      K.store.update((s) => (s.preferences.logo = c.toDataURL("image/png")));
      K.theme.apply();
      K.toast("Đã đổi logo.");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      K.toast("Không đọc được ảnh. Thử ảnh PNG hoặc JPG.");
    };
    img.src = url;
  }
  K.settings = {
    render(root) {
      const c = K.gitSync.config(),
        p = K.store.get().preferences;
      root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">GÓC RIÊNG CỦA KHẢI</span><h1>Cài đặt & dữ liệu</h1><p>Tùy chỉnh không gian và giữ những tiến bộ của bạn.</p></div></div><div class="settings-grid"><div class="stack"><section class="card"><div class="card-head"><h2>Giao diện</h2>${K.icon("sun")}</div><label>Chế độ hiển thị</label><div class="theme-options"><button class="btn ${p.theme !== "dark" ? "primary" : ""}" data-theme="light">${K.icon("sun")} Sáng</button><button class="btn ${p.theme === "dark" ? "primary" : ""}" data-theme="dark">${K.icon("moon")} Tối</button></div><div class="logo-settings"><img class="app-logo" width="56" height="56" src="${E(p.logo || "assets/icons/logo.svg")}" alt="Logo hiện tại"><div><label class="btn small">Đổi logo<input type="file" id="logo-file" accept="image/*" hidden></label><button class="text-link" id="reset-logo">Mặc định</button></div></div></section><section class="card"><div class="card-head"><h2>Bản sao lưu</h2>${K.icon("download")}</div><p class="settings-copy">Dữ liệu được lưu trên trình duyệt hiện tại. Xuất file JSON để chuyển thiết bị hoặc giữ một bản dự phòng.</p><div class="stack"><button class="btn primary" id="backup-export">${K.icon("download")} Xuất toàn bộ dữ liệu</button><label class="btn">${K.icon("cloud")} Nhập bản sao lưu JSON<input type="file" id="backup-import" accept="application/json,.json" hidden></label><button class="text-link" id="restore-previous">Khôi phục bản trước lần nhập gần nhất</button></div><p class="small-note" style="margin:18px 0 0">Gồm nhiệm vụ, lịch học, Aptis, ghi chú, Brain Gym và giao diện. Token GitHub không nằm trong bản sao lưu.</p></section><section class="card"><h2>Đưa KhaiLife lên điện thoại</h2><p class="settings-copy">Mở website bằng Safari trên iPhone → Chia sẻ → Thêm vào Màn hình chính. Để dùng dữ liệu trên thiết bị khác, nhập bản sao lưu hoặc tải từ GitHub.</p></section></div><section class="card"><div class="card-head"><h2>Đồng bộ GitHub</h2>${K.icon("cloud")}</div><p class="settings-copy">Lưu dữ liệu vào repository của bạn. Nên chọn repository riêng tư nếu chứa lịch học hoặc ghi chú cá nhân.</p><form id="git-form" class="stack"><label>Repository<input name="repo" value="${E(c.repo)}" placeholder="khaivjp/ten-repository" required autocomplete="off"></label><div class="field-grid"><label>Nhánh<input name="branch" value="${E(c.branch)}" placeholder="Mặc định của repo"></label><label>File dữ liệu<input name="path" value="${E(c.path)}" required></label></div><label>GitHub token<input name="token" type="password" placeholder="${K.gitSync.connected() ? "Đã có token trên trình duyệt này" : "Nhập token có quyền Contents: Read & write"}" autocomplete="off"></label><label class="check-label"><input type="checkbox" name="remember" ${K.gitSync.remembered() ? "checked" : ""}>Ghi nhớ token trên thiết bị này</label><p class="small-note" style="margin:0">Chỉ bật trên thiết bị cá nhân. Token được lưu trong trình duyệt này để dùng khi mở lại; không nằm trong bản sao lưu hoặc dữ liệu đồng bộ. Bỏ chọn rồi lưu để chỉ giữ token trong phiên tab hiện tại.</p><label class="check-label"><input type="checkbox" name="auto" ${c.autoSync ? "checked" : ""}>Tự đẩy sau khi thay đổi dữ liệu</label><button class="btn primary">Lưu cấu hình</button></form><div class="sync-status" data-git-status role="status">${E(K.gitSync.status())}</div><div class="row"><button class="btn" id="git-push">${K.icon("cloud")} Đẩy lên GitHub</button><button class="btn" id="git-pull">${K.icon("download")} Tải về</button></div><button class="text-link" id="git-disconnect" style="margin-top:15px">Ngắt kết nối và quên token</button><div class="notice" style="margin-top:25px">Khi hai thiết bị có bản khác nhau, ứng dụng sẽ yêu cầu bạn chọn bản cần dùng trước khi ghi đè.</div></section></div>`;
      K.$$("[data-theme]", root).forEach(
        (b) =>
          (b.onclick = () => {
            K.store.update((s) => (s.preferences.theme = b.dataset.theme));
            K.theme.apply();
          }),
      );
      K.$("#logo-file").onchange = (e) => uploadLogo(e.target.files[0]);
      K.$("#reset-logo").onclick = () => {
        K.store.update((s) => (s.preferences.logo = ""));
        K.theme.apply();
        K.$('link[rel="apple-touch-icon"]').href =
          "assets/icons/apple-touch-icon.png";
      };
      K.$("#backup-export").onclick = K.store.backup;
      K.$("#backup-import").onchange = (e) => importBackup(e.target.files[0]);
      K.$("#restore-previous").onclick = () => {
        const data = K.store.previous();
        if (!data) {
          K.toast("Chưa có bản trước lần nhập.");
          return;
        }
        K.modal(
          "Khôi phục bản trước lần nhập?",
          `<p>Ứng dụng sẽ chuyển về dữ liệu trước lần nhập gần nhất.</p><div class="form-actions"><button class="btn primary" data-restore>Khôi phục</button></div>`,
          (dlg) => {
            dlg.querySelector("[data-restore]").onclick = async () => {
              try {
                await K.store.replace(data);
                K.theme.apply();
                dlg.close();
                K.toast("Đã khôi phục bản trước.");
              } catch (e) {
                K.toast(e.message);
              }
            };
          },
        );
      };
      K.$("#git-form").onsubmit = (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        try {
          K.gitSync.save(
            {
              repo: f
                .get("repo")
                .trim()
                .replace(/^https?:\/\/github.com\//, ""),
              branch: f.get("branch").trim(),
              path: f.get("path").trim(),
              autoSync: f.get("auto") === "on",
            },
            f.get("token").trim(),
            f.get("remember") === "on",
          );
          e.target.elements.token.value = "";
          e.target.elements.token.placeholder = "Đã có token trên trình duyệt này";
          K.toast("Đã lưu cấu hình GitHub.");
        } catch (err) {
          K.toast(err.message);
        }
      };
      K.$("#git-push").onclick = () => K.gitSync.push(true);
      K.$("#git-pull").onclick = K.gitSync.pull;
      K.$("#git-disconnect").onclick = () => {
        try {
          K.gitSync.disconnect();
          K.settings.render(root);
          K.toast("Đã ngắt kết nối và xóa token đã ghi nhớ.");
        } catch (err) { K.toast(err.message); }
      };
    },
  };
})();
