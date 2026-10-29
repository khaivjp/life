/* Aptis 16 tuần: tiến độ, ghi chú, xuất CSV và đồng hồ theo thời điểm kết thúc. */
(() => {
  const K = KhaiLife,
    E = K.esc,
    { weeks, days, tasks } = K.aptisPlan;
  let w = 0,
    d = 0,
    timer = { remaining: 7200, end: null, label: "Phiên học 2 giờ" },
    timerId = null,
    root = null;
  const key = (wi, di, t) => `${wi + 1}-${di + 1}-${t}`;
  const count = (wi, di) =>
    tasks.filter((t) => K.store.get().aptis.progress[key(wi, di, t.key)])
      .length;
  const weekDone = (wi) =>
    Array.from({ length: 7 }, (_, di) => count(wi, di)).reduce(
      (a, b) => a + b,
      0,
    );
  const taskText = (t) => {
    const week = weeks[w],
      day = days[d];
    const field =
      {
        listening: "listen",
        reading: "read",
        speaking: "speak",
        writing: "write",
      }[t.key] || t.key;
    return t.key === "vocab"
      ? `Ôn từ đến hạn 10 phút; học hoặc luyện từ về ${week.vocab} trong 15 phút; tự đặt 3 câu với từ mới trong 5 phút.`
      : `${week[field]}. ${day[field]}`;
  };
  function paintTimer() {
    const box = K.$("#aptis-time");
    if (!box) return;
    const remaining = timer.end
      ? Math.max(0, (timer.end - Date.now()) / 1000)
      : timer.remaining;
    box.textContent = K.clock(remaining);
    K.$("#aptis-timer-label").textContent = timer.label;
    K.$("#timer-play").innerHTML =
      K.icon(timer.end ? "pause" : "play") +
      (timer.end ? "Tạm dừng" : "Bắt đầu");
  }
  function tick() {
    if (timer.end && Date.now() >= timer.end) {
      timer.remaining = 0;
      timer.end = null;
      clearInterval(timerId);
      timerId = null;
      K.toast("Hết giờ phiên học. Nghỉ một chút rồi đánh dấu phần đã học nhé.");
    }
    paintTimer();
  }
  function runTimer(seconds, label) {
    if (timerId) clearInterval(timerId);
    timer.remaining = seconds;
    timer.end = Date.now() + seconds * 1000;
    timer.label = label;
    timerId = setInterval(tick, 400);
    paintTimer();
  }
  function exportCSV() {
    const rows = [
      ["Tuần", "Ngày", "Ngày học", "Hoạt động", "Số phút", "Hoàn thành"],
    ];
    for (let wi = 0; wi < 16; wi++)
      for (let di = 0; di < 7; di++)
        for (const t of tasks)
          rows.push([
            wi + 1,
            di + 1,
            K.shiftDate(K.store.get().aptis.start, wi * 7 + di),
            t.title,
            t.mins,
            K.store.get().aptis.progress[key(wi, di, t.key)] ? "Có" : "Chưa",
          ]);
    K.download(
      "tien-do-aptis-16-tuan.csv",
      "\uFEFF" +
        rows
          .map((r) =>
            r.map((x) => '"' + String(x).replaceAll('"', '""') + '"').join(","),
          )
          .join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }
  function render(container) {
    root = container;
    const a = K.store.get().aptis,
      week = weeks[w],
      completed = Object.values(a.progress).filter(Boolean).length,
      date = K.shiftDate(a.start, w * 7 + d),
      noteKey = `${w + 1}-${d + 1}`;
    root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">ĐỀU ĐẶN MỖI NGÀY</span><h1>Aptis · 16 tuần</h1><p>2 giờ/ngày · 30 phút từ vựng · Mục tiêu B1, phấn đấu B2.</p></div><button class="btn" id="aptis-export">${K.icon("download")} Xuất tiến độ</button></div><div class="aptis-resources"><a href="https://openquiz.ai/vi/" target="_blank" rel="noopener noreferrer"><span class="quick-icon">${K.icon("brain")}</span><div><strong>OpenQuiz</strong><small>Từ vựng · 30 phút/ngày</small></div>${K.icon("external")}</a><a href="https://www.britishcouncil.org/exam/english/aptis/prepare-general" target="_blank" rel="noopener noreferrer"><span class="quick-icon lavender">${K.icon("book")}</span><div><strong>British Council</strong><small>Tài liệu Aptis General</small></div>${K.icon("external")}</a><a href="https://learnenglish.britishcouncil.org/" target="_blank" rel="noopener noreferrer"><span class="quick-icon peach">${K.icon("headphones")}</span><div><strong>LearnEnglish</strong><small>Ngữ pháp & bốn kỹ năng</small></div>${K.icon("external")}</a></div><div class="aptis-overview"><div><strong>${Math.round((completed / 672) * 100)}%</strong><small>${completed} / 672 hoạt động</small></div><div class="progress-track"><div class="progress-fill" style="width:${(completed / 672) * 100}%"></div></div><label>Bắt đầu<input type="date" id="aptis-start" value="${a.start}" required></label><button class="btn small" id="aptis-today">Đến hôm nay</button></div><div class="aptis-layout"><aside class="aptis-weeks"><span class="eyebrow">LỘ TRÌNH CỦA BẠN</span><label class="week-mobile">Chọn tuần<select id="aptis-week-select">${weeks.map((v, i) => `<option value="${i}" ${w === i ? "selected" : ""}>Tuần ${i + 1}: ${E(v.title)}</option>`).join("")}</select></label><div class="week-list">${weeks.map((v, i) => `<button data-week="${i}" class="${w === i ? "active" : ""}" aria-pressed="${w === i}"><span>${String(i + 1).padStart(2, "0")}</span><div><strong>${E(v.title)}</strong><small>${E(v.goal)} · ${Math.round((weekDone(i) / 42) * 100)}%</small></div></button>`).join("")}</div></aside><div class="aptis-content"><section class="aptis-week-hero"><span class="eyebrow">TUẦN ${String(w + 1).padStart(2, "0")} / 16</span><h2>${E(week.title)}</h2><p>${E(week.desc)}</p><span class="tag">${E(week.goal)}</span></section><div class="aptis-days">${days.map((x, i) => `<button data-day="${i}" class="${i === d ? "active" : ""}" aria-pressed="${i === d}"><small>Ngày ${i + 1}</small><strong>${K.formatDate(K.shiftDate(a.start, w * 7 + i))}</strong><span>${count(w, i)}/6</span></button>`).join("")}</div><section class="card"><div class="card-head"><div><span class="eyebrow">${E(K.formatDate(date, true))}</span><h2>${E(days[d].name)}</h2></div><span class="tag neutral">120 phút</span></div><div class="study-tasks">${tasks.map((t) => `<article class="study-task ${a.progress[key(w, d, t.key)] ? "done" : ""}"><label class="study-check"><input type="checkbox" data-task="${t.key}" aria-label="Hoàn thành ${E(t.title)}" ${a.progress[key(w, d, t.key)] ? "checked" : ""}></label><div><div class="row between"><h3>${E(t.title)}</h3><span class="tag neutral">${t.mins} phút</span></div><p>${E(taskText(t))}</p><button class="text-link" data-study-timer="${t.key}">${K.icon("play")} Hẹn giờ ${t.mins} phút</button></div></article>`).join("")}</div></section><div class="aptis-bottom-grid"><section class="card timer-card"><span class="eyebrow">MỘT PHIÊN TẬP TRUNG</span><div id="aptis-time" aria-label="Thời gian còn lại">120:00</div><p id="aptis-timer-label">Phiên học 2 giờ</p><div class="row"><button class="btn primary" id="timer-play">${K.icon("play")} Bắt đầu</button><button class="icon-button" id="timer-reset" aria-label="Đặt lại đồng hồ 2 giờ">${K.icon("refresh")}</button></div></section><section class="card"><span class="eyebrow">GHI CHÚ NGÀY HỌC</span><label for="study-note">Từ mới, lỗi cần sửa, điều đã học</label><textarea id="study-note" rows="4" maxlength="8000" placeholder="Ghi lại một điều bạn muốn nhớ…">${E(a.notes[noteKey] || "")}</textarea><span class="small-note" id="note-status">Tự lưu khi bạn nhập.</span></section></div><div class="notice"><strong>Mốc tuần ${w + 1}:</strong> ${E(week.milestone)}</div></div></div><p class="brain-footnote">Lộ trình tự học tham khảo; cấp độ thực tế cần được đánh giá qua bài thi. Các ô hoàn thành phản ánh hoạt động bạn tự xác nhận.</p>`;
    K.$$("[data-week]", root).forEach(
      (b) =>
        (b.onclick = () => {
          w = +b.dataset.week;
          render(root);
        }),
    );
    K.$("#aptis-week-select").onchange = (e) => {
      w = +e.target.value;
      render(root);
    };
    K.$$("[data-day]", root).forEach(
      (b) =>
        (b.onclick = () => {
          d = +b.dataset.day;
          render(root);
        }),
    );
    K.$$("[data-task]", root).forEach(
      (c) =>
        (c.onchange = () =>
          K.store.update(
            (s) => (s.aptis.progress[key(w, d, c.dataset.task)] = c.checked),
          )),
    );
    K.$("#aptis-start").onchange = (e) => {
      if (K.validDate(e.target.value))
        K.store.update((s) => (s.aptis.start = e.target.value));
    };
    K.$("#aptis-today").onclick = () => {
      const diff = Math.round(
          (K.date(K.dateKey()) - K.date(a.start)) / 86400000,
        ),
        n = Math.max(0, Math.min(111, diff));
      w = Math.floor(n / 7);
      d = n % 7;
      render(root);
    };
    K.$("#aptis-export").onclick = exportCSV;
    K.$$("[data-study-timer]", root).forEach(
      (b) =>
        (b.onclick = () => {
          const t = tasks.find((x) => x.key === b.dataset.studyTimer);
          if (
            timer.end &&
            !confirm("Thay đồng hồ đang chạy bằng phiên học mới?")
          )
            return;
          runTimer(t.mins * 60, t.title);
          K.$(".timer-card").scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }),
    );
    K.$("#timer-play").onclick = () => {
      if (timer.end) {
        timer.remaining = Math.max(0, (timer.end - Date.now()) / 1000);
        timer.end = null;
        clearInterval(timerId);
        paintTimer();
      } else runTimer(timer.remaining || 7200, timer.label);
    };
    K.$("#timer-reset").onclick = () => {
      if (timer.end && !confirm("Đặt lại đồng hồ đang chạy về 2 giờ?")) return;
      clearInterval(timerId);
      timer = { remaining: 7200, end: null, label: "Phiên học 2 giờ" };
      paintTimer();
    };
    K.$("#study-note").oninput = (e) => {
      K.store.get().aptis.notes[noteKey] = e.target.value;
      K.store.persist(false);
      K.$("#note-status").textContent = K.store.storageOkay()
        ? "Đã lưu ghi chú."
        : "Chưa lưu được — hãy xuất sao lưu.";
      K.gitSync?.schedule();
    };
    paintTimer();
  }
  K.aptis = { render, exportCSV };
})();
