/* Đồng bộ GitHub có kiểm tra SHA; token ở phiên hiện tại, không vào bản sao lưu. */
(() => {
  const K = KhaiLife,
    CONFIG = "khailife_git_v3",
    TOKEN = "khailife_git_token_session";
  let busy = false,
    pending = null,
    queued = false,
    baseSha = null,
    status = "Chưa kết nối GitHub.";
  let cfg =
    K.store.read(CONFIG) ||
    (() => {
      const old = K.store.read("khailife_git_sync_config_v1");
      return {
        repo: old?.repo || "",
        branch: old?.branch || "",
        path: old?.path || "khailife-data.json",
        autoSync: false,
      };
    })();
  const getToken = () => {
    try {
      return sessionStorage.getItem(TOKEN) || "";
    } catch {
      return "";
    }
  };
  const setStatus = (text) => {
    status = text;
    document
      .querySelectorAll("[data-git-status]")
      .forEach((n) => (n.textContent = text));
  };
  const endpoint = () =>
    `https://api.github.com/repos/${cfg.repo}/contents/${cfg.path.split("/").map(encodeURIComponent).join("/")}`;
  const headers = () => ({
    Authorization: `Bearer ${getToken()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  });
  const encode = (text) => {
    let bin = "";
    new TextEncoder()
      .encode(text)
      .forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  };
  const decode = (text) =>
    new TextDecoder().decode(
      Uint8Array.from(atob(text.replace(/\s/g, "")), (c) => c.charCodeAt(0)),
    );
  async function remote() {
    const url =
      endpoint() + (cfg.branch ? "?ref=" + encodeURIComponent(cfg.branch) : "");
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok)
      throw new Error(
        `GitHub trả mã ${res.status}. Kiểm tra token, repository, nhánh và quyền Contents.`,
      );
    return res.json();
  }
  function configured() {
    return Boolean(getToken() && cfg.repo);
  }
  async function push(manual = false) {
    clearTimeout(pending);
    if (!configured()) {
      if (manual) K.toast("Lưu cấu hình và token trước khi đồng bộ.");
      return;
    }
    if (busy) {
      queued = true;
      return;
    }
    busy = true;
    setStatus("Đang kiểm tra phiên bản trên GitHub…");
    try {
      const r = await remote();
      if (r && r.sha !== baseSha) {
        setStatus(
          "Có phiên bản trên GitHub chưa được đối chiếu. Hãy tải về hoặc xác nhận ghi đè.",
        );
        if (manual) {
          K.modal(
            "Dữ liệu trên GitHub khác bản đang dùng",
            `<p>Hãy tải về để xem bản trên GitHub, hoặc ghi đè bằng dữ liệu trên thiết bị này. Bạn có thể xuất sao lưu trước khi chọn.</p><div class="form-actions"><button class="btn" data-backup>Xuất sao lưu</button><button class="btn danger" data-overwrite>Ghi đè bản GitHub</button></div>`,
            (dlg) => {
              dlg.querySelector("[data-backup]").onclick = () =>
                K.store.backup();
              dlg.querySelector("[data-overwrite]").onclick = () => {
                baseSha = r.sha;
                dlg.close();
                push(true);
              };
            },
          );
        }
        return;
      }
      const payload = { app: "KhaiLife", data: K.store.get() },
        localVersion = K.store.get().updatedAt,
        body = {
          message: "Cập nhật dữ liệu KhaiLife",
          content: encode(JSON.stringify(payload, null, 2)),
        };
      if (r) body.sha = r.sha;
      if (cfg.branch) body.branch = cfg.branch;
      const res = await fetch(endpoint(), {
        method: "PUT",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok)
        throw new Error(
          res.status === 409
            ? "Có thay đổi đồng thời. Tải lại dữ liệu GitHub trước khi đồng bộ."
            : `Không ghi được dữ liệu: HTTP ${res.status}.`,
        );
      const saved = await res.json();
      baseSha = saved.content.sha;
      setStatus("Đã đồng bộ lúc " + new Date().toLocaleTimeString("vi-VN"));
      if (manual) K.toast("Đã lưu dữ liệu lên GitHub.");
      if (K.store.get().updatedAt !== localVersion) queued = true;
    } catch (e) {
      setStatus(e.message);
      if (manual) K.toast(e.message);
    } finally {
      busy = false;
      if (queued) {
        queued = false;
        schedule();
      }
    }
  }
  async function pull() {
    if (!configured()) {
      K.toast("Lưu cấu hình và token trước.");
      return;
    }
    if (busy) return;
    busy = true;
    clearTimeout(pending);
    setStatus("Đang tải dữ liệu từ GitHub…");
    try {
      const r = await remote();
      if (!r) {
        setStatus("Chưa có file dữ liệu. Bấm Đẩy lên GitHub để tạo.");
        return;
      }
      const next = K.store.normalize(JSON.parse(decode(r.content)));
      K.modal(
        "Khôi phục dữ liệu từ GitHub?",
        `<p>Bản này có <b>${next.tasks.length} nhiệm vụ</b>, <b>${next.schedule.length} dòng lịch</b> và <b>${next.brain.history.length} lượt Brain Gym</b>.</p><p>Dữ liệu hiện tại sẽ được thay thế. Một bản trước khi khôi phục được giữ trên thiết bị.</p><div class="form-actions"><button class="btn" data-backup>Xuất bản hiện tại</button><button class="btn primary" data-confirm>Dùng bản GitHub</button></div>`,
        (dlg) => {
          dlg.querySelector("[data-backup]").onclick = () => K.store.backup();
          dlg.querySelector("[data-confirm]").onclick = async () => {
            try {
              await K.store.replace(next);
              baseSha = r.sha;
              dlg.close();
              K.theme.apply();
              setStatus("Đã tải bản dữ liệu từ GitHub.");
            } catch (e) {
              K.toast(e.message);
            }
          };
        },
      );
      setStatus("Đã tải. Chờ lựa chọn bản dữ liệu.");
    } catch (e) {
      setStatus(e.message);
      K.toast(e.message);
    } finally {
      busy = false;
    }
  }
  function schedule() {
    if (!cfg.autoSync || !configured()) return;
    clearTimeout(pending);
    pending = setTimeout(() => push(false), 1800);
  }
  K.gitSync = {
    config: () => cfg,
    status: () => status,
    connected: configured,
    save(newCfg, token) {
      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(newCfg.repo))
        throw new Error("Repository cần có dạng tên-tài-khoản/tên-repo.");
      if (
        !newCfg.path ||
        newCfg.path.startsWith("/") ||
        newCfg.path.split("/").some((x) => x === ".." || x === "")
      )
        throw new Error("Đường dẫn file không hợp lệ.");
      if (!token && !getToken())
        throw new Error("Nhập token GitHub cho phiên này.");
      if (
        cfg.repo !== newCfg.repo ||
        cfg.path !== newCfg.path ||
        cfg.branch !== newCfg.branch
      )
        baseSha = null;
      cfg = newCfg;
      localStorage.setItem(CONFIG, JSON.stringify(cfg));
      if (token) sessionStorage.setItem(TOKEN, token);
      setStatus("Đã lưu cấu hình. Chọn tải về hoặc đẩy lên.");
    },
    disconnect() {
      clearTimeout(pending);
      sessionStorage.removeItem(TOKEN);
      baseSha = null;
      setStatus("Đã ngắt kết nối trong phiên này.");
    },
    push,
    pull,
    schedule,
  };
  window.addEventListener("khailife:change", schedule);
})();
