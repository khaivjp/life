/* 02. Stroop — khóa mọi đáp án ngay lần chọn đầu. */
(() => {
  const K = KhaiLife;
  K.games.stroop = {
    id: "stroop",
    name: "Màu sắc & chú ý",
    category: "Phản xạ",
    icon: "spark",
    accent: "lavender",
    description: "Đọc màu mực của chữ. Vượt qua sự đánh lạc hướng của từ.",
    rules:
      "Chọn tên màu mực đang hiển thị, không chọn nghĩa của từ. Chọn một lần ở mỗi lượt. Có 10, 15 hoặc 20 lượt tùy mức độ.",
    duration: "1–2 phút",
    start(s) {
      const colors = [
          ["ĐỎ", "#d54b55"],
          ["XANH LÁ", "#27985b"],
          ["XANH DƯƠNG", "#3d7ed8"],
          ["TÍM", "#a763d4"],
          ["CAM", "#d27920"],
          ["HỒNG", "#ce5494"],
        ].slice(0, [3, 4, 6][s.level]),
        total = [10, 15, 20][s.level];
      let n = 0,
        correct = 0;
      s.prompt("Chọn MÀU MỰC của chữ.");
      function round() {
        let locked = false;
        const ink = K.rand(0, colors.length - 1),
          word =
            Math.random() < 0.2
              ? ink
              : K.shuffle(colors.map((_, i) => i).filter((i) => i !== ink))[0];
        s.progress(`Lượt ${n + 1} / ${total}`);
        s.stage.innerHTML = `<div class="stroop-word" style="color:${colors[ink][1]}">${colors[word][0]}</div><div class="game-choices">${K.shuffle(
          colors.map((c, i) => ({ c, i })),
        )
          .map(
            ({ c, i }) =>
              `<button class="answer-button" data-i="${i}">${c[0]}</button>`,
          )
          .join("")}</div>`;
        s.stage.querySelectorAll("button").forEach(
          (b) =>
            (b.onclick = () => {
              if (locked || s.paused) return;
              locked = true;
              s.stage
                .querySelectorAll("button")
                .forEach((x) => (x.disabled = true));
              const good = +b.dataset.i === ink;
              if (good) correct++;
              s.message(
                good ? "Chính xác!" : `Màu mực là ${colors[ink][0]}.`,
                good ? "correct" : "wrong",
              );
              n++;
              s.later(() => {
                s.message("");
                if (n === total)
                  s.finish({
                    correct,
                    total,
                    detail: `Nhận diện đúng ${correct}/${total} màu mực.`,
                  });
                else round();
              }, 650);
            }),
        );
      }
      round();
    },
  };
})();
