/* 03. Trí nhớ tuần tự — chuỗi ngẫu nhiên mới cho từng lượt. */
(() => {
  const K = KhaiLife,
    items = ["☀", "☾", "★", "♣", "♥", "◆"];
  K.games.sequence = {
    id: "sequence",
    name: "Trí nhớ tuần tự",
    category: "Trí nhớ",
    icon: "list",
    accent: "peach",
    description: "Ghi nhớ một chuỗi biểu tượng, rồi tái hiện đúng thứ tự.",
    rules:
      "Xem các ô sáng lần lượt. Khi có thông báo “Đến lượt bạn”, chạm lại theo đúng thứ tự. Có 4 lượt và độ dài tăng dần.",
    duration: "2–3 phút",
    start(s) {
      let n = 0,
        correct = 0;
      const total = 4;
      function round() {
        const len = Math.min(8, 2 + s.level + n),
          seq = Array.from({ length: len }, () => K.rand(0, 5)),
          answer = [];
        let recall = false,
          locked = false;
        s.progress(`Lượt ${n + 1} / ${total} · ${len} biểu tượng`);
        s.prompt("Quan sát thứ tự các ô sáng.");
        s.stage.innerHTML = `<div class="sequence-answer" id="sequence-answer">Đang ghi nhớ…</div><div class="sequence-grid">${items.map((v, i) => `<button disabled data-symbol="${i}" aria-label="Biểu tượng ${i + 1}: ${v}"><span>${v}</span><small>${i + 1}</small></button>`).join("")}</div>`;
        const buttons = [...s.stage.querySelectorAll("[data-symbol]")],
          answerBox = s.stage.querySelector("#sequence-answer"),
          pace = [850, 700, 550][s.level];
        seq.forEach((v, i) => {
          s.later(() => buttons[v].classList.add("lit"), 400 + i * pace);
          s.later(
            () => buttons[v].classList.remove("lit"),
            400 + i * pace + pace * 0.65,
          );
        });
        s.later(
          () => {
            recall = true;
            buttons.forEach((b) => (b.disabled = false));
            s.prompt("Đến lượt bạn: chạm lại chuỗi vừa xem.");
            answerBox.textContent = "Chọn " + len + " biểu tượng";
          },
          500 + len * pace,
        );
        buttons.forEach(
          (b) =>
            (b.onclick = () => {
              if (!recall || locked || s.paused) return;
              answer.push(+b.dataset.symbol);
              answerBox.textContent = answer.map((i) => items[i]).join("  ");
              if (answer.length === len) {
                locked = true;
                buttons.forEach((x) => (x.disabled = true));
                const good = seq.every((v, i) => v === answer[i]);
                if (good) correct++;
                s.message(
                  good
                    ? "Bạn nhớ rất chính xác!"
                    : `Chuỗi đúng: ${seq.map((i) => items[i]).join(" → ")}`,
                  good ? "correct" : "wrong",
                );
                n++;
                s.later(() => {
                  s.message("");
                  if (n === total)
                    s.finish({
                      correct,
                      total,
                      detail: `Ghi nhớ đúng ${correct}/${total} chuỗi.`,
                    });
                  else round();
                }, 1800);
              }
            }),
        );
      }
      round();
    },
  };
})();
