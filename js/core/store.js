/* Lưu dữ liệu, nâng cấp từ KhaiLife cũ và nhập/xuất bản sao lưu. */
(() => {
  const K = KhaiLife,
    KEY = "khailife_v3",
    clone = (o) => JSON.parse(JSON.stringify(o));
  const read = (key, fallback = null) => {
    try {
      const s = localStorage.getItem(key);
      return s === null ? fallback : JSON.parse(s);
    } catch {
      return fallback;
    }
  };
  const text = (key, fallback = "") => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  };
  const old =
    read("lifesync_minimal_v4") || read("khailife_saved_user_backup_v1")?.state;
  // Các môn theo ảnh, không đưa điểm cá nhân vào mã nguồn công khai.
  const freshGpa = () => ({
    "version": 1,
    "semesters": [
      {
        "id": "hvu-2026-2",
        "year": "2026-2027",
        "term": 2,
        "courses": [
          {
            "id": "hvu-2-0",
            "code": "INT304",
            "group": "03",
            "name": "Cơ sở dữ liệu",
            "credits": 3,
            "process": "",
            "exam": "",
            "weightProcess": 50,
            "weightExam": 50
          },
          {
            "id": "hvu-2-1",
            "code": "INT342",
            "group": "03",
            "name": "Lập trình cơ bản",
            "credits": 3,
            "process": "",
            "exam": "",
            "weightProcess": 50,
            "weightExam": 50
          },
          {
            "id": "hvu-2-2",
            "code": "INT349",
            "group": "03",
            "name": "Toán rời rạc",
            "credits": 3,
            "process": "",
            "exam": "",
            "weightProcess": 50,
            "weightExam": 50
          },
          {
            "id": "hvu-2-3",
            "code": "INT358",
            "group": "04",
            "name": "Đồ họa ứng dụng 1",
            "credits": 3,
            "process": "",
            "exam": "",
            "weightProcess": 50,
            "weightExam": 50
          }
        ]
      },
      {
        "id": "hvu-2026-1",
        "year": "2026-2027",
        "term": 1,
        "courses": [
          {
            "id": "hvu-1-0",
            "code": "INT343",
            "group": "03",
            "name": "Quản lý hệ thống máy tính",
            "credits": 3,
            "process": "",
            "exam": "",
            "weightProcess": 50,
            "weightExam": 50
          },
          {
            "id": "hvu-1-1",
            "code": "LAW207",
            "group": "12",
            "name": "Pháp luật đại cương",
            "credits": 2,
            "process": "",
            "exam": "",
            "weightProcess": 50,
            "weightExam": 50
          },
          {
            "id": "hvu-1-2",
            "code": "MAT356",
            "group": "03",
            "name": "Toán cho công nghệ thông tin",
            "credits": 3,
            "process": "",
            "exam": "",
            "weightProcess": 50,
            "weightExam": 50
          }
        ]
      }
    ]
  });
  const fresh = () => ({
    version: 3,
    updatedAt: 0,
    tasks: clone(old?.tasks || []),
    schedule: clone(old?.tkbRows || K.defaultSchedule),
    events: read("ls_custom_events_v1", {}),
    aptis: {
      start: text("aptis16-start", K.dateKey()),
      progress: read("aptis16-progress", {}),
      notes: {},
    },
    gpa: freshGpa(),
    brain: {
      history: [],
      legacy: {
        total: read("bgTotal", 0),
        played: read("bgPlayed", []),
        best: read("bgBest", 0),
      },
    },
    preferences: {
      theme: text("lifesync_theme", "light"),
      logo: text("khailife_custom_app_logo_v1"),
    },
    legacy: {
      state: old || null,
      gpa: read("so_lam_viec_1_gpa_v2"),
      sudoku: read("khailife_sudoku_state_v1"),
      savedBackup: read("khailife_saved_user_backup_v1"),
    },
  });
  const object = (v) => v && typeof v === "object" && !Array.isArray(v);
  function validate(v) {
    if (
      !object(v) ||
      v.version !== 3 ||
      !Array.isArray(v.tasks) ||
      !Array.isArray(v.schedule) ||
      !object(v.events) ||
      !object(v.aptis) ||
      !object(v.aptis.progress) ||
      !K.validDate(v.aptis.start) ||
      !object(v.brain) ||
      !Array.isArray(v.brain.history) ||
      !object(v.preferences)
    )
      throw new Error(
        "Bản sao lưu thiếu dữ liệu hoặc không đúng định dạng KhaiLife.",
      );
    if (
      v.tasks.some(
        (t) => !object(t) || typeof t.title !== "string" || t.id == null,
      ) ||
      v.schedule.some(
        (r) =>
          !object(r) ||
          typeof r.name !== "string" ||
          typeof r.range !== "string" ||
          ![2, 3, 4, 5, 6, 7, 8].includes(Number(r.day)) ||
          Number(r.start) < 1 ||
          Number(r.count) < 1,
      )
    )
      throw new Error("Nhiệm vụ hoặc lịch học trong file không hợp lệ.");
    if (
      Object.entries(v.events).some(
        ([d, a]) =>
          !K.validDate(d) ||
          !Array.isArray(a) ||
          a.some((e) => !object(e) || typeof e.name !== "string"),
      )
    )
      throw new Error("Lịch tự thêm trong file không hợp lệ.");
    if (
      v.brain.history.some(
        (x) =>
          !object(x) ||
          typeof x.game !== "string" ||
          !Number.isFinite(x.score) ||
          !K.validDate(x.date),
      )
    )
      throw new Error("Lịch sử Brain Gym không hợp lệ.");
    if (
      v.preferences.logo &&
      !/^data:image\/(png|jpeg|webp);base64,/.test(v.preferences.logo)
    )
      v.preferences.logo = "";
    v.aptis.notes = object(v.aptis.notes) ? v.aptis.notes : {};
    // Bản sao lưu cũ vẫn nhập được và được bổ sung mục GPA mới.
    v.gpa = object(v.gpa) && Array.isArray(v.gpa.semesters) ? v.gpa : freshGpa();
    return v;
  }
  let state;
  try {
    state = validate(read(KEY) || fresh());
  } catch {
    state = fresh();
  }
  let saveError = false, pending = 0, previous = read("khailife_before_restore");
  let db = null, queue = Promise.resolve();
  const channel = typeof BroadcastChannel === "function" ? new BroadcastChannel("khailife-storage") : null;
  if (channel) channel.onmessage = () => K.toast("Một tab khác vừa thay đổi dữ liệu. Xuất sao lưu nếu có thay đổi chưa lưu, rồi tải lại để dùng bản mới nhất.");
  const transaction = (mode, run) => new Promise((resolve, reject) => {
    const tx = db.transaction("data", mode);
    let result;
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(tx.error || new Error("Không lưu được dữ liệu."));
    tx.onerror = () => {};
    run(tx.objectStore("data"), value => { result = value; });
  });
  const ready = new Promise((resolve, reject) => {
    const request = indexedDB.open("khailife", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("data");
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Hãy đóng tab KhaiLife khác rồi thử lại."));
    request.onsuccess = () => { db = request.result; resolve(); };
  }).then(async () => {
    const saved = await transaction("readonly", (store, done) => {
      const req = store.get(KEY); req.onsuccess = () => done(req.result);
    });
    if (saved) state = validate(saved);
    else {
      // Chỉ chuyển bản cũ sau khi giao dịch mới đã lưu thành công.
      await transaction("readwrite", store => {
        store.put(clone(state), KEY);
        if (previous) store.put(clone(previous), "before_restore");
      });
    }
    previous = await transaction("readonly", (store, done) => {
      const req = store.get("before_restore"); req.onsuccess = () => done(req.result);
    }) || previous;
  });
  function enqueue(work) {
    const task = queue.then(() => ready).then(work);
    queue = task.catch(() => {});
    return task;
  }
  function notify() { window.dispatchEvent(new CustomEvent("khailife:storage")); }
  function persist(emit = true) {
    state.updatedAt = Date.now();
    const snapshot = clone(state);
    pending++; notify();
    const task = enqueue(() => transaction("readwrite", store => store.put(snapshot, KEY)))
      .then(() => { saveError = false; channel?.postMessage("saved"); return true; })
      .catch(() => {
        saveError = true;
        K.toast("Chưa lưu được dữ liệu. Hãy xuất bản sao lưu trước khi đóng trang.");
        return false;
      }).finally(() => { pending--; notify(); });
    if (emit) window.dispatchEvent(new CustomEvent("khailife:change"));
    return task;
  }
  // Tránh cảnh báo Promise chưa xử lý trước khi app chờ ready.
  ready.catch(() => { saveError = true; });
  window.addEventListener("beforeunload", e => {
    if (pending || saveError) { e.preventDefault(); e.returnValue = ""; }
  });
  const normalize = (payload) => {
    if (payload?.version === 3) return validate(clone(payload));
    if (payload?.data?.version === 3) return validate(clone(payload.data));
    if (
      payload?.state &&
      Array.isArray(payload.state.tasks) &&
      Array.isArray(payload.state.tkbRows)
    ) {
      const x = fresh();
      x.tasks = clone(payload.state.tasks);
      x.schedule = clone(payload.state.tkbRows);
      x.events = clone(payload.customEvents || {});
      x.legacy = { ...x.legacy, ...clone(payload) };
      delete x.legacy.token;
      if (payload.aptis) x.aptis = payload.aptis;
      if (payload.appLogo) x.preferences.logo = payload.appLogo;
      return validate(x);
    }
    throw new Error("File này không phải bản sao lưu KhaiLife.");
  };
  K.store = {
    ready,
    previous: () => previous,
    status: () => pending ? "Đang lưu…" : saveError ? "Chưa lưu được — hãy xuất sao lưu" : "Đã lưu trên thiết bị",
    get: () => state,
    read,
    text,
    persist,
    validate,
    normalize,
    update: (fn) => {
      fn(state);
      persist();
    },
    backup: () =>
      K.download(
        `khailife-backup-${K.dateKey()}.json`,
        JSON.stringify(
          {
            app: "KhaiLife",
            exportedAt: new Date().toISOString(),
            data: state,
          },
          null,
          2,
        ),
      ),
    replace: async (payload) => {
      const next = normalize(payload);
      next.updatedAt = Date.now();
      pending++; notify();
      try {
        await enqueue(() => {
          const before = clone(state);
          return transaction("readwrite", store => {
            store.put(before, "before_restore");
            store.put(next, KEY);
          }).then(() => { previous = before; state = next; });
        });
        saveError = false;
        channel?.postMessage("saved");
        window.dispatchEvent(new CustomEvent("khailife:change"));
      } catch {
        saveError = true;
        throw new Error("Không nhập được dữ liệu. Bản hiện tại vẫn được giữ; hãy xuất sao lưu.");
      } finally { pending--; notify(); }
    },
    storageOkay: () => !saveError,
  };
})();
