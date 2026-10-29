/* 07. Trí nhớ vị trí — bảo đảm đủ bốn phương án khác nhau. */
(() => {
  const K = KhaiLife,
    items = [
      "🍎",
      "📚",
      "🎧",
      "🪴",
      "⌚",
      "☕",
      "🔑",
      "⚽",
      "💡",
      "🎒",
      "🍋",
      "📱",
      "🎲",
      "🚲",
      "🌻",
      "✏️",
    ];
  K.games.context = {
    id: "context",
    name: "Trí nhớ bối cảnh",
    category: "Trí nhớ",
    icon: "grid",
    accent: "mint",
    description: "Ghi nhớ đồ vật và vị trí. Một góc nhìn, nhiều điều để nhớ.",
    rules:
      "Quan sát các đồ vật trong thời gian cho trước. Khi chúng ẩn đi, chọn đồ vật từng ở ô được đánh dấu. Có 5 lượt và luôn có 4 lựa chọn khác nhau.",
    duration: "1–2 phút",
    start(s) {
      let n = 0,
        correct = 0;
      const total = 5;
      function round() {
        const count = [6, 9, 12][s.level],
          grid = K.shuffle(items).slice(0, count),
          target = K.rand(0, count - 1),
          answer = grid[target],
          options = K.shuffle([
            answer,
            ...K.shuffle(items.filter((x) => x !== answer)).slice(0, 3),
          ]);
        let locked = false;
        s.progress(`Lượt ${n + 1} / ${total}`);
        s.prompt("Quan sát đồ vật và ghi nhớ vị trí.");
        s.stage.innerHTML = `<div class="context-grid" style="--cols:${count === 12 ? 4 : 3}">${grid.map((v, i) => `<div class="context-cell"><small>${i + 1}</small><span>${v}</span></div>`).join("")}</div><div id="context-question" class="context-question">Ghi nhớ trong ${[5, 4, 3][s.level]} giây…</div><div class="game-choices" id="context-choices"></div>`;
        s.later(() => {
          s.prompt(`Đồ vật nào đã ở ô số ${target + 1}?`);
          s.stage.querySelectorAll(".context-cell").forEach((c, i) => {
            c.querySelector("span").textContent = i === target ? "?" : "·";
            if (i === target) c.classList.add("target-cell");
          });
          s.stage.querySelector("#context-question").textContent =
            `Chọn đồ vật ở ô ${target + 1}`;
          const box = s.stage.querySelector("#context-choices");
          box.innerHTML = options
            .map(
              (v) =>
                `<button class="answer-button emoji-answer" aria-label="${v}" data-value="${v}">${v}</button>`,
            )
            .join("");
          box.querySelectorAll("button").forEach(
            (b) =>
              (b.onclick = () => {
                if (locked || s.paused) return;
                locked = true;
                box
                  .querySelectorAll("button")
                  .forEach((x) => (x.disabled = true));
                const good = b.dataset.value === answer;
                if (good) correct++;
                s.message(
                  good
                    ? "Bạn nhớ đúng vị trí!"
                    : `Ô số ${target + 1} là ${answer}.`,
                  good ? "correct" : "wrong",
                );
                s.stage.querySelector(".target-cell span").textContent = answer;
                n++;
                s.later(() => {
                  s.message("");
                  if (n === total)
                    s.finish({
                      correct,
                      total,
                      detail: `Nhớ đúng ${correct}/${total} vị trí.`,
                    });
                  else round();
                }, 1200);
              }),
          );
        }, [5000, 4000, 3000][s.level]);
      }
      round();
    },
  };
})();
