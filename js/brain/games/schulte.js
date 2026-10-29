/* 01. Bảng Schulte — tìm số theo thứ tự. */
(() => {
  const K = KhaiLife;
  K.games.schulte = {
    id: "schulte",
    name: "Bảng Schulte",
    category: "Tập trung",
    icon: "grid",
    accent: "sage",
    description:
      "Tìm các con số theo thứ tự. Giữ mắt tập trung, tay thật nhanh.",
    rules:
      "Chạm các số từ 1 đến hết theo đúng thứ tự. Mỗi lần chạm nhầm được tính một lỗi. Thời gian và số lỗi ảnh hưởng đến điểm.",
    duration: "1–2 phút",
    start(s) {
      const size = [3, 4, 5][s.level],
        total = size * size;
      let next = 1,
        errors = 0;
      s.prompt("Chạm các số theo thứ tự tăng dần.");
      s.progress(`Tìm số 1 / ${total}`);
      s.stage.innerHTML = `<div class="schulte-board" style="--cols:${size}">${K.shuffle(
        Array.from({ length: total }, (_, i) => i + 1),
      )
        .map((n) => `<button data-n="${n}" aria-label="Số ${n}">${n}</button>`)
        .join(
          "",
        )}</div><p class="game-note">Tìm đúng quan trọng hơn tìm nhanh.</p>`;
      s.stage.querySelectorAll("button").forEach(
        (b) =>
          (b.onclick = () => {
            if (s.paused || !s.active) return;
            if (+b.dataset.n === next) {
              b.disabled = true;
              b.classList.add("found");
              next++;
              s.message("");
              s.progress(`Tìm số ${Math.min(next, total)} / ${total}`);
              if (next > total)
                s.finish({
                  correct: total,
                  total: total + errors,
                  score: Math.max(
                    100,
                    1000 -
                      (s.elapsed / 1000) * [12, 6, 3][s.level] -
                      errors * 35,
                  ),
                  detail: `Tìm đủ ${total} số · ${errors} lần chạm nhầm.`,
                });
            } else {
              errors++;
              s.message(`Hãy tìm số ${next}.`, "wrong");
            }
          }),
      );
    },
  };
})();
