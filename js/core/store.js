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
  let saveError = false;
  function persist(emit = true) {
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      saveError = false;
    } catch {
      saveError = true;
      K.toast(
        "Không lưu được trên thiết bị. Hãy xuất bản sao lưu để giữ dữ liệu.",
      );
    }
    if (emit) window.dispatchEvent(new CustomEvent("khailife:change"));
  }
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
    replace: (payload) => {
      const next = normalize(payload);
      try {
        localStorage.setItem("khailife_before_restore", JSON.stringify(state));
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        throw new Error(
          "Không đủ dung lượng lưu dữ liệu. Hãy xuất sao lưu trước.",
        );
      }
      state = next;
      persist();
    },
    storageOkay: () => !saveError,
  };
})();
