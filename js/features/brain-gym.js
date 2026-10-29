/* Danh mục, phiên luyện tập, thử thách ngày và lịch sử. */
(() => {
  const K = KhaiLife,
    E = K.esc,
    levels = ["Dễ", "Vừa", "Khó"];
  let session = null,
    mode = "lobby",
    root = null,
    category = "Tất cả",
    routine = null;
  const games = () => Object.values(K.games);
  function streak(history) {
    const days = new Set(history.map((x) => x.date));
    let date = K.dateKey(),
      n = 0;
    if (!days.has(date)) date = K.shiftDate(date, -1);
    while (days.has(date)) {
      n++;
      date = K.shiftDate(date, -1);
    }
    return n;
  }
  function dailyGames() {
    const seed = Number(K.dateKey().replaceAll("-", ""));
    return [0, 2, 4].map((n) => games()[(seed + n) % 7]);
  }
  function preview(id) {
    const previews = {
      schulte:
        '<div class="preview-numbers"><i>8</i><i>2</i><i>6</i><i>4</i><i class="highlight">1</i><i>9</i><i>3</i><i>7</i><i>5</i></div>',
      stroop:
        '<span class="preview-word">XANH</span><div class="preview-swatches"><i></i><i></i><i></i></div>',
      sequence:
        '<div class="preview-symbols"><i>☀</i><i>★</i><i>◆</i></div><span class="preview-caption">NHÌN · NHỚ · LẶP LẠI</span>',
      auditory:
        '<div class="preview-wave">' +
        [22, 42, 66, 34, 80, 52, 28, 60, 38]
          .map((h) => '<i style="height:' + h + '%"></i>')
          .join("") +
        "</div>",
      mirror:
        '<svg viewBox="0 0 260 100"><path d="M20 75 55 25 90 65 120 30M240 75 205 25 170 65 140 30"/><path class="mirror-axis" d="M130 10v80"/><circle cx="20" cy="75" r="5"/><circle cx="240" cy="75" r="5"/></svg>',
      logic:
        '<div class="preview-equation"><i>2</i><span>→</span><i>4</i><span>→</span><i>8</i><span>→</span><i class="highlight">?</i></div>',
      context:
        '<div class="preview-objects"><i>🪴</i><i>📚</i><i>☕</i><i class="highlight">?</i></div>',
    };
    return previews[id];
  }
  function historyCard(history) {
    return history.length
      ? `<div class="history-list">${history
          .slice(0, 5)
          .map(
            (r) =>
              `<div class="history-row"><span class="history-icon">${K.icon(K.games[r.game]?.icon || "brain")}</span><div><strong>${E(K.games[r.game]?.name || r.game)}</strong><small>${K.formatDate(r.date)} · ${levels[r.level] || "Vừa"} · ${K.clock(r.duration)}</small></div><span class="history-score">${r.score}<small>/ 1000</small></span></div>`,
          )
          .join("")}</div>`
      : K.empty(
          "Lượt đầu tiên đang chờ bạn",
          "Kết quả thực tế sẽ xuất hiện sau khi hoàn thành một trò.",
          "trophy",
        );
  }
  function lobby(container) {
    root = container;
    mode = "lobby";
    const h = K.store.get().brain.history,
      today = K.dateKey(),
      daily = dailyGames(),
      todayGames = new Set(
        h.filter((x) => x.date === today).map((x) => x.game),
      ),
      done = daily.filter((g) => todayGames.has(g.id)).length,
      shown = games().filter(
        (g) => category === "Tất cả" || g.category === category,
      ),
      minutes = Math.round(h.reduce((a, r) => a + r.duration, 0) / 60);
    root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">THƯ GIÃN MỘT CHÚT. TẬP TRUNG HƠN.</span><h1>Brain Gym<span class="heading-dot">.</span></h1><p>Một sân chơi nhỏ cho trí nhớ, sự tập trung và khả năng quan sát.</p></div><button class="btn" id="brain-history">${K.icon("trophy")} Lịch sử của bạn</button></div><section class="brain-banner"><div><span class="hero-label">BÀI TẬP NHỎ · NIỀM VUI MỖI NGÀY</span><h2>Khởi động trí óc.<br>Tìm lại nhịp tập trung.</h2><p>Ba thử thách được chọn cho hôm nay.<br>Bắt đầu nhẹ nhàng và thử sức theo cách của bạn.</p><button class="btn lime" id="daily-start">${K.icon("play")} Bắt đầu phiên hôm nay ${K.icon("arrow")}</button></div><div class="daily-routine"><span class="eyebrow">PHIÊN HÔM NAY <span>${done}/3</span></span>${daily.map((g, i) => `<div class="daily-step"><span class="step-number ${todayGames.has(g.id) ? "completed" : ""}">${todayGames.has(g.id) ? K.icon("check") : String(i + 1).padStart(2, "0")}</span><div><strong>${g.name}</strong><small>${g.category} · ${g.duration}</small></div>${K.icon(g.icon)}</div>`).join("")}</div></section><div class="brain-stats"><div><span class="stat-label">${K.icon("trophy")} Lượt hoàn thành</span><strong>${h.length}</strong><small>Từng lượt đều là một bước tiến</small></div><div><span class="stat-label">${K.icon("clock")} Thời gian đã luyện</span><strong>${minutes}<em> phút</em></strong><small>Tổng thời gian các lượt hoàn thành</small></div><div><span class="stat-label">${K.icon("spark")} Chuỗi ngày luyện</span><strong>${streak(h)}<em> ngày</em></strong><small>Giữ một khoảng nhỏ mỗi ngày</small></div></div><div class="card-head game-library-heading"><div><span class="eyebrow">KHÁM PHÁ THEO CÁCH CỦA BẠN</span><h2>Chọn một thử thách</h2></div><span class="small-note">7 trò chơi · 3 mức độ</span></div><div class="game-filters" role="group" aria-label="Lọc loại trò chơi">${["Tất cả", "Tập trung", "Trí nhớ", "Phản xạ", "Chú ý", "Logic", "Phối hợp"].map((c) => `<button data-category="${c}" class="${c === category ? "active" : ""}" aria-pressed="${c === category}">${c}</button>`).join("")}</div><div class="games-grid">${shown
      .map((g) => {
        const best = h
          .filter((x) => x.game === g.id && x.level === 1)
          .reduce((m, x) => Math.max(m, x.score), 0);
        return `<article class="game-card"><div class="game-card-top"><span class="game-tile ${g.accent}">${K.icon(g.icon)}</span><span class="tag neutral">${g.category}</span></div><div class="game-preview preview-${g.id}" aria-hidden="true">${preview(g.id)}</div><h3>${g.name}</h3><p>${g.description}</p><div class="game-meta"><span>${K.icon("clock")} ${g.duration}</span><span>${best ? "Vừa: " + best + " điểm" : "Chưa có điểm mức Vừa"}</span></div><button class="btn game-launch" data-game="${g.id}">Khám phá ${K.icon("arrow")}</button></article>`;
      })
      .join(
        "",
      )}</div><section class="card brain-history" id="history-section"><div class="card-head"><h2>Những lượt gần đây</h2><button class="text-link" id="all-history">Xem lịch sử ${K.icon("arrow")}</button></div>${historyCard(h)}</section><p class="brain-footnote">Điểm số phản ánh kết quả trong từng trò chơi, không phải chỉ số IQ. So sánh tiến bộ trong cùng trò và cùng mức độ.</p>`;
    K.$$("[data-game]", root).forEach(
      (b) =>
        (b.onclick = () => {
          routine = null;
          prepare(b.dataset.game);
        }),
    );
    K.$$("[data-category]", root).forEach(
      (b) =>
        (b.onclick = () => {
          category = b.dataset.category;
          lobby(root);
        }),
    );
    K.$("#daily-start").onclick = () => {
      routine = daily.map((g) => g.id);
      prepare(routine[0]);
    };
    K.$("#brain-history").onclick = () =>
      K.$("#history-section").scrollIntoView({ behavior: "smooth" });
    K.$("#all-history").onclick = () =>
      K.modal(
        "Lịch sử luyện tập",
        h.length
          ? `<p>${h.length} lượt gần nhất (lưu tối đa 500 lượt).</p><div class="history-list">${h.map((r) => `<div class="history-row"><div><strong>${E(K.games[r.game]?.name || r.game)}</strong><small>${K.formatDate(r.date)} · ${levels[r.level]} · ${K.clock(r.duration)}</small></div><span class="history-score">${r.score}<small>điểm</small></span></div>`).join("")}</div>`
          : K.empty("Chưa có lượt hoàn thành", "Chọn một trò chơi để bắt đầu."),
      );
  }
  function prepare(id) {
    const g = K.games[id];
    K.modal(
      g.name,
      `<div class="game-intro"><span class="game-tile ${g.accent}">${K.icon(g.icon)}</span><span class="tag">${g.category}</span></div><p class="rules-text">${g.rules}</p><label>Chọn mức độ<select id="game-level">${levels.map((x, i) => `<option value="${i}" ${i === 1 ? "selected" : ""}>${x}</option>`).join("")}</select></label><div class="form-actions"><button class="btn primary" id="start-game">${K.icon("play")} Bắt đầu chơi</button></div>`,
      (dlg) => {
        dlg.querySelector("#start-game").onclick = () => {
          const level = +dlg.querySelector("select").value;
          dlg.close();
          launch(id, level);
        };
      },
    );
  }
  function launch(id, level) {
    session?.destroy();
    mode = "playing";
    const g = K.games[id];
    root.innerHTML = `<div class="play-heading"><button class="btn ghost small" id="exit-game">‹ Thư viện trò chơi</button><span class="tag">${g.category} · ${levels[level]}</span></div><div class="game-play-card"><div class="game-play-top"><div><span class="eyebrow">BRAIN GYM / ${levels[level]}</span><h1>${g.name}</h1></div><div class="row"><span class="session-time">${K.icon("clock")} <span id="session-time">00:00</span></span><button class="icon-button" id="pause-game" aria-label="Tạm dừng">${K.icon("pause")}</button></div></div><p id="game-prompt" class="game-prompt"></p><div id="game-progress" class="game-progress"></div><div class="stage-wrap"><div id="game-stage"></div><div id="pause-overlay" class="pause-overlay" hidden><span class="game-tile sage">${K.icon("pause")}</span><h2>Thả lỏng một chút</h2><p>Trò chơi và thời gian đã tạm dừng.</p><button class="btn primary" id="resume-game">${K.icon("play")} Tiếp tục</button></div></div><div id="game-feedback" class="game-feedback" role="status" aria-live="polite"></div></div><p class="brain-footnote">${E(g.rules)}</p>`;
    session = new K.BrainSession(g, level, root, result);
    K.$("#pause-game").onclick = () => session.pause();
    K.$("#resume-game").onclick = () => session.resume();
    K.$("#exit-game").onclick = () =>
      quit(() => {
        routine = null;
        lobby(root);
      });
    g.start(session);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function quit(done) {
    if (!session?.active) {
      done();
      return;
    }
    session.pause();
    K.modal(
      "Kết thúc lượt đang chơi?",
      `<p>Lượt chưa hoàn thành sẽ không được ghi vào lịch sử.</p><div class="form-actions"><button class="btn" data-resume>Chơi tiếp</button><button class="btn danger" data-quit>Thoát lượt chơi</button></div>`,
      (dlg) => {
        dlg.querySelector("[data-resume]").onclick = () => {
          dlg.close();
          session.resume();
        };
        dlg.querySelector("[data-quit]").onclick = () => {
          session.destroy();
          dlg.close();
          done();
        };
      },
    );
  }
  function result(r) {
    mode = "result";
    const g = K.games[r.game],
      previous = K.store
        .get()
        .brain.history.filter(
          (x) => x.game === r.game && x.level === r.level && x.id !== r.id,
        ),
      best = previous.reduce((m, x) => Math.max(m, x.score), 0),
      newBest = r.score > best,
      next = routine && routine[routine.indexOf(r.game) + 1];
    root.innerHTML = `<div class="result-wrap"><span class="result-trophy">${K.icon("trophy")}</span><span class="eyebrow">${newBest ? "MỘT DẤU MỐC MỚI" : "THÊM MỘT LƯỢT LUYỆN TẬP"}</span><h1>Hoàn thành rồi, Khải!</h1><p>${g.name} · Mức ${levels[r.level]}</p><div class="result-score">${r.score}<small>/ 1000 điểm</small></div><div class="result-details"><div><strong>${r.accuracy}%</strong><small>Độ chính xác</small></div><div><strong>${K.clock(r.duration)}</strong><small>Thời gian</small></div><div><strong>${Math.max(best, r.score)}</strong><small>Kỷ lục cùng mức</small></div></div><p class="result-explain">${E(r.detail)}</p><p class="small-note">${previous.length ? `Lượt trước ở mức ${levels[r.level]}: ${previous[0].score} điểm.` : "Đây là lượt đầu tiên của bạn ở mức này."}</p><div class="row result-actions">${next ? `<button class="btn primary" id="next-daily">Thử thách tiếp theo ${K.icon("arrow")}</button>` : `<button class="btn primary" id="replay-game">${K.icon("refresh")} Chơi lại</button>`}<button class="btn" id="back-brain">Về Brain Gym</button></div>${routine && !next ? '<p class="notice">Bạn đã hoàn thành phiên luyện tập 3 trò. Nghỉ một chút nhé!</p>' : ""}</div>`;
    K.$("#back-brain").onclick = () => {
      routine = null;
      lobby(root);
    };
    if (next) K.$("#next-daily").onclick = () => launch(next, r.level);
    else
      K.$("#replay-game").onclick = () => {
        routine = null;
        launch(r.game, r.level);
      };
  }
  K.brain = {
    render: lobby,
    isPlaying: () => mode === "playing",
    session: () => session,
    leave: () => {
      session?.destroy();
      session = null;
      mode = "lobby";
      routine = null;
    },
    guard: quit,
    stats: streak,
  };
})();
