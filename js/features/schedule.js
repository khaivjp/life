/* Lịch học, lịch tự thêm và nhập Excel/CSV. */
(() => {
  const K = KhaiLife,
    E = K.esc;
  let selected = K.dateKey(),
    view = "week",
    filter = "ALL";
  const parseVN = (s) => {
    const m = String(s).match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (!m) return null;
    const key = `${+m[3] < 100 ? 2000 + +m[3] : +m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    return K.validDate(key) ? key : null;
  };
  function sessions(date) {
    const state = K.store.get(),
      d = K.date(date),
      day = d.getDay() === 0 ? 8 : d.getDay() + 1;
    return [
      ...state.schedule
        .filter((r) => {
          const a = String(r.range).match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [],
            start = parseVN(a[0]),
            end = parseVN(a[1] || a[0]);
          return start && date >= start && date <= end && Number(r.day) === day;
        })
        .map((r, i) => ({
          ...r,
          id: `row-${i}`,
          periodLabel: `Tiết ${r.start}${+r.count > 1 ? `–${+r.start + +r.count - 1}` : ""}`,
        })),
      ...(state.events[date] || []).map((r) => ({ ...r, isCustom: true })),
    ].sort((a, b) => a.start - b.start);
  }
  function cards(date, compact = false) {
    let ss = sessions(date).filter(
      (x) => compact || filter === "ALL" || x.code === filter,
    );
    return ss.length
      ? ss
          .map(
            (s) =>
              `<article class="class-card ${compact ? "compact" : ""}"><div class="class-icon">${K.icon(s.isCustom ? "calendar" : "book")}</div><div class="class-body"><div class="row"><span class="subject-code">${E(s.code || "CÁ NHÂN")}</span><span class="small-note">${E(s.periodLabel || "")}</span></div><h3>${E(s.name)}</h3><p>Phòng ${E(s.room || "—")}${s.gv ? " · " + E(s.gv) : ""}</p></div>${s.isCustom && !compact ? `<button class="icon-button" data-delete-event="${E(s.id)}" aria-label="Xóa lịch ${E(s.name)}">${K.icon("trash")}</button>` : ""}</article>`,
          )
          .join("")
      : K.empty(
          "Hôm nay chưa có lịch",
          "Bạn có thể thêm một buổi học hoặc dành thời gian ôn tập.",
          "calendar",
        );
  }
  function addEvent() {
    K.modal(
      "Thêm lịch cá nhân",
      `<form id="event-form" class="field-grid"><label class="field-full">Tên môn / công việc<input name="name" required maxlength="150" placeholder="Ví dụ: Ôn tập Toán rời rạc"></label><label>Ngày<input name="date" type="date" value="${selected}" required></label><label>Tiết học<input name="period" value="1-5" pattern="[0-9]{1,2}(-[0-9]{1,2})?" title="Nhập một tiết hoặc khoảng tiết, ví dụ 1 hoặc 1-5" required></label><label>Phòng<input name="room" maxlength="80" placeholder="Tự học"></label><label>Giảng viên<input name="gv" maxlength="80" placeholder="Tùy chọn"></label><div class="form-actions field-full"><button class="btn primary">${K.icon("plus")} Thêm vào lịch</button></div></form>`,
      (dlg) => {
        dlg.querySelector("form").onsubmit = (e) => {
          e.preventDefault();
          const f = new FormData(e.target),
            [start, end] = f.get("period").split("-").map(Number),
            date = f.get("date"),
            name = f.get("name").trim();
          if (
            !name ||
            !K.validDate(date) ||
            start < 1 ||
            start > 20 ||
            (end && (end < start || end > 20))
          ) {
            K.toast("Kiểm tra tên, ngày và tiết học (1–20).");
            return;
          }
          selected = date;
          K.store.update((s) => {
            s.events[date] ??= [];
            s.events[date].push({
              id: K.uid(),
              name,
              code: "CUSTOM",
              start,
              periodLabel: `Tiết ${start}${end ? `–${end}` : ""}`,
              room: f.get("room").trim() || "Tự học",
              gv: f.get("gv").trim(),
            });
          });
          dlg.close();
          K.toast("Đã thêm lịch.");
        };
      },
    );
  }
  function csvRows(text) {
    const rows = [];
    let row = [],
      v = "",
      q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (q && text[i + 1] === '"') {
          v += '"';
          i++;
        } else q = !q;
      } else if (c === "," && !q) {
        row.push(v);
        v = "";
      } else if ((c === "\n" || c === "\r") && !q) {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(v);
        if (row.some(Boolean)) rows.push(row);
        row = [];
        v = "";
      } else v += c;
    }
    row.push(v);
    if (row.some(Boolean)) rows.push(row);
    return rows;
  }
  const normalize = (s) =>
    String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .toLowerCase()
      .trim();
  function parseRows(rows) {
    let map = {
        code: 0,
        name: 1,
        day: 5,
        start: 6,
        count: 7,
        room: 8,
        gv: 9,
        range: 10,
      },
      parsed = [];
    for (const r of rows) {
      const n = r.map(normalize);
      if (n.some((x) => /ten mon|ten hoc phan|^name$/.test(x))) {
        r.forEach((c, i) => {
          const x = normalize(c);
          if (/ma mh|ma mon|ma hoc phan|^code$/.test(x)) map.code = i;
          else if (/ten mon|ten hoc phan|^name$/.test(x)) map.name = i;
          else if (/^thu$|^day$/.test(x)) map.day = i;
          else if (/tiet bat dau|tiet bd|^start$/.test(x)) map.start = i;
          else if (/so tiet|^count$/.test(x)) map.count = i;
          else if (/phong|^room$/.test(x)) map.room = i;
          else if (/giang vien|^gv$/.test(x)) map.gv = i;
          else if (/thoi gian|^range$/.test(x)) map.range = i;
        });
        continue;
      }
      const name = String(r[map.name] || "").trim(),
        range = String(r[map.range] || "").trim(),
        day = /cn|chu nhat/i.test(normalize(r[map.day]))
          ? 8
          : Number(String(r[map.day]).replace(/\D/g, "")),
        start = +r[map.start],
        count = +r[map.count];
      if (!name || !parseVN(range) || day < 2 || day > 8 || !start || !count)
        continue;
      parsed.push({
        name,
        code: String(r[map.code] || "HVU"),
        range,
        day,
        start,
        count,
        room: String(r[map.room] || ""),
        gv: String(r[map.gv] || ""),
      });
    }
    return parsed;
  }
  async function importFile(file) {
    if (!file) return;
    try {
      let rows;
      if (/\.csv$/i.test(file.name)) rows = csvRows(await file.text());
      else {
        if (!window.XLSX)
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "vendor/xlsx.full.min.js";
            s.onload = resolve;
            s.onerror = () =>
              reject(
                new Error(
                  "Không tải được bộ đọc Excel. Bạn có thể lưu file thành CSV rồi nhập lại.",
                ),
              );
            document.head.append(s);
          });
        const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
        rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
          header: 1,
          defval: "",
        });
      }
      const parsed = parseRows(rows);
      if (!parsed.length)
        throw new Error(
          "Không tìm thấy lịch hợp lệ. Hãy tham khảo file mẫu CSV.",
        );
      K.modal(
        "Nhập thời khóa biểu",
        `<p>Tìm thấy <b>${parsed.length} dòng lịch</b>. Lịch môn học hiện tại sẽ được thay thế; lịch cá nhân vẫn được giữ.</p><p>Ví dụ: ${E(parsed[0].name)} · ${E(parsed[0].range)}</p><div class="form-actions"><button class="btn" data-cancel>Hủy</button><button class="btn primary" data-confirm>Nhập ${parsed.length} dòng</button></div>`,
        (dlg) => {
          dlg.querySelector("[data-cancel]").onclick = () => dlg.close();
          dlg.querySelector("[data-confirm]").onclick = () => {
            K.store.update((s) => {
              s.legacy ??= {};
              s.legacy.previousSchedule = s.schedule;
              s.schedule = parsed;
            });
            dlg.close();
            K.toast("Đã nhập thời khóa biểu.");
          };
        },
      );
    } catch (e) {
      K.toast(e.message);
    }
  }
  function render(root) {
    const d = K.date(selected),
      today = K.dateKey(),
      monday = K.shiftDate(selected, -((d.getDay() + 6) % 7)),
      week = Array.from({ length: 7 }, (_, i) => K.shiftDate(monday, i)),
      subjects = [
        ...new Map(
          K.store.get().schedule.map((s) => [s.code, s.name]),
        ).entries(),
      ];
    root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">SẮP XẾP NGÀY CỦA BẠN</span><h1>Thời khóa biểu</h1><p>Lịch học rõ ràng, dành chỗ cho những kế hoạch mới.</p></div><button class="btn primary" id="add-event">${K.icon("plus")} Thêm lịch</button></div><section class="card"><div class="schedule-toolbar"><div class="row"><button class="icon-button" id="prev-period" aria-label="Khoảng trước">‹</button><strong>${view === "month" ? `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}` : `${K.formatDate(week[0])} – ${K.formatDate(week[6])} / ${d.getFullYear()}`}</strong><button class="icon-button" id="next-period" aria-label="Khoảng tiếp theo">›</button><button class="btn small" id="today-btn">Hôm nay</button></div><div class="segmented">${[
      ["week", "Tuần"],
      ["month", "Tháng"],
      ["raw", "Bảng dữ liệu"],
    ]
      .map(
        ([v, n]) =>
          `<button data-view="${v}" class="${view === v ? "active" : ""}">${n}</button>`,
      )
      .join(
        "",
      )}</div></div><div class="row schedule-filter"><label>Chọn ngày<input type="date" id="date-picker" value="${selected}"></label><label>Môn học<select id="subject-filter"><option value="ALL">Tất cả môn</option>${subjects.map(([c, n]) => `<option value="${E(c)}" ${filter === c ? "selected" : ""}>${E(n)}</option>`).join("")}<option value="CUSTOM" ${filter === "CUSTOM" ? "selected" : ""}>Lịch cá nhân</option></select></label></div><div id="schedule-body"></div></section><div class="import-bar"><span class="small-note">Dữ liệu được lấy từ lịch trong file gốc và các lịch bạn nhập.</span><div class="row"><button class="text-link" id="csv-template">${K.icon("download")} File CSV mẫu</button><label class="btn small">${K.icon("cloud")} Nhập Excel / CSV<input type="file" id="schedule-file" accept=".xlsx,.xls,.csv" hidden></label></div></div>`;
    const body = K.$("#schedule-body");
    if (view === "raw") {
      body.innerHTML = `<div class="table-scroll"><table><thead><tr><th>Mã môn</th><th>Tên môn</th><th>Thứ</th><th>Tiết</th><th>Phòng</th><th>Giảng viên</th><th>Thời gian</th></tr></thead><tbody>${K.store
        .get()
        .schedule.filter((s) => filter === "ALL" || s.code === filter)
        .map(
          (s) =>
            `<tr><td>${E(s.code)}</td><td>${E(s.name)}</td><td>${s.day === 8 ? "CN" : s.day}</td><td>${s.start}–${+s.start + +s.count - 1}</td><td>${E(s.room)}</td><td>${E(s.gv)}</td><td>${E(s.range)}</td></tr>`,
        )
        .join("")}</tbody></table></div>`;
    } else {
      let dates = week;
      if (view === "month") {
        const first = K.dateKey(new Date(d.getFullYear(), d.getMonth(), 1, 12)),
          offset = (K.date(first).getDay() + 6) % 7,
          count = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        dates = Array.from(
          { length: Math.ceil((offset + count) / 7) * 7 },
          (_, i) => K.shiftDate(first, i - offset),
        );
      }
      body.innerHTML = `<div class="calendar-days ${view === "month" ? "month-grid" : ""}">${dates
        .map((date, i) => {
          const inMonth = K.date(date).getMonth() === d.getMonth(),
            count = sessions(date).filter(
              (x) => filter === "ALL" || x.code === filter,
            ).length;
          return `<button data-date="${date}" class="calendar-day ${date === selected ? "selected" : ""} ${date === today ? "today" : ""} ${!inMonth && view === "month" ? "other-month" : ""}" aria-label="${E(K.formatDate(date, true))}, ${count} lịch" aria-pressed="${date === selected}"><small>${["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i % 7]}</small><strong>${K.date(date).getDate()}</strong><span class="day-indicator ${count ? "has-class" : ""}">${count ? `${count} lịch` : "—"}</span></button>`;
        })
        .join(
          "",
        )}</div><div class="card-head day-heading"><h3>${E(K.formatDate(selected, true))}</h3>${selected === today ? '<span class="tag">Hôm nay</span>' : ""}</div><div class="stack">${cards(selected)}</div>`;
      body.querySelectorAll("[data-date]").forEach(
        (b) =>
          (b.onclick = () => {
            selected = b.dataset.date;
            render(root);
          }),
      );
      body.querySelectorAll("[data-delete-event]").forEach(
        (b) =>
          (b.onclick = () =>
            K.modal(
              "Xóa lịch cá nhân?",
              `<p>Lịch được chọn sẽ được xóa khỏi ngày ${K.formatDate(selected)}.</p><div class="form-actions"><button class="btn" data-cancel>Giữ lại</button><button class="btn danger" data-confirm>Xóa lịch</button></div>`,
              (dlg) => {
                dlg.querySelector("[data-cancel]").onclick = () => dlg.close();
                dlg.querySelector("[data-confirm]").onclick = () => {
                  K.store.update(
                    (s) =>
                      (s.events[selected] = (s.events[selected] || []).filter(
                        (x) => String(x.id) !== b.dataset.deleteEvent,
                      )),
                  );
                  dlg.close();
                };
              },
            )),
      );
    }
    K.$("#add-event").onclick = addEvent;
    K.$("#today-btn").onclick = () => {
      selected = today;
      render(root);
    };
    K.$("#date-picker").onchange = (e) => {
      if (K.validDate(e.target.value)) {
        selected = e.target.value;
        render(root);
      }
    };
    K.$("#subject-filter").onchange = (e) => {
      filter = e.target.value;
      render(root);
    };
    K.$$("[data-view]", root).forEach(
      (b) =>
        (b.onclick = () => {
          view = b.dataset.view;
          render(root);
        }),
    );
    const shift = (n) => {
      if (view === "month")
        selected = K.dateKey(
          new Date(d.getFullYear(), d.getMonth() + n, 1, 12),
        );
      else selected = K.shiftDate(selected, n * 7);
      render(root);
    };
    K.$("#prev-period").onclick = () => shift(-1);
    K.$("#next-period").onclick = () => shift(1);
    K.$("#schedule-file").onchange = (e) => importFile(e.target.files[0]);
    K.$("#csv-template").onclick = () =>
      K.download(
        "mau-thoi-khoa-bieu.csv",
        "\uFEFFMã môn,Tên môn,Thứ,Tiết bắt đầu,Số tiết,Phòng,Giảng viên,Thời gian\r\nINT342,Lập trình cơ bản,5,6,5,NDH216,N.T.Kiên,05/11/26 đến 12/11/26\r\n",
        "text/csv;charset=utf-8",
      );
  }
  K.schedule = {
    render,
    sessions,
    cards,
    parseRows,
    parseVN,
    newDay(old) {
      if (selected === old) selected = K.dateKey();
    },
  };
})();
