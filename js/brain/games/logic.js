/* 06. Logic — sinh đề số học theo tham số, trộn câu và lựa chọn. */
(() => {
  const K = KhaiLife;
  function makeQuestion(level) {
    const kind = K.rand(0, level === 0 ? 2 : 4);
    let q,
      a,
      why,
      others = [];
    if (kind === 0) {
      const first = K.rand(1, 20),
        step = K.rand(2, level ? 9 : 5);
      a = first + 4 * step;
      q = `Số tiếp theo là gì?\n${[0, 1, 2, 3].map((i) => first + i * step).join("  ·  ")}  ·  ?`;
      why = `Mỗi số tăng thêm ${step}, nên đáp án là ${a}.`;
      others = [a - step, a + step, a + 1];
    } else if (kind === 1) {
      const x = K.rand(2, 7),
        mul = level ? K.rand(2, 4) : 2;
      a = x * mul ** 3;
      q = `Hoàn thành quy luật:\n${x}  ·  ${x * mul}  ·  ${x * mul ** 2}  ·  ?`;
      why = `Mỗi số gấp ${mul} lần số trước: ${x * mul ** 2} × ${mul} = ${a}.`;
      others = [a + mul, a - mul, x * mul ** 2 + mul];
    } else if (kind === 2) {
      const sets = [
        {
          all: ["Chuột", "Bàn phím", "Máy quét"],
          odd: "Màn hình",
          why: "Màn hình là thiết bị xuất; ba thiết bị còn lại dùng để nhập dữ liệu.",
        },
        {
          all: ["Tam giác", "Hình tròn", "Hình vuông"],
          odd: "Hình cầu",
          why: "Hình cầu là hình không gian; các hình còn lại là hình phẳng.",
        },
        {
          all: ["Sắt", "Đồng", "Nhôm"],
          odd: "Gỗ",
          why: "Gỗ không phải kim loại.",
        },
        {
          all: ["Python", "C++", "Java"],
          odd: "HDMI",
          why: "HDMI là giao diện truyền tín hiệu; ba tên còn lại là ngôn ngữ lập trình.",
        },
      ];
      const x = sets[K.rand(0, sets.length - 1)];
      a = x.odd;
      others = x.all;
      q = "Chọn mục khác nhóm với ba mục còn lại.";
      why = x.why;
    } else if (kind === 3) {
      const first = K.rand(2, 15),
        step = K.rand(2, 5);
      const values = [
        first,
        first + step,
        first + step * 2 + 1,
        first + step * 3 + 3,
      ];
      a = values[3] + step + 3;
      q = `Tìm số tiếp theo:\n${values.join("  ·  ")}  ·  ?`;
      why = `Các bước tăng lần lượt là ${step}, ${step + 1}, ${step + 2}, ${step + 3}.`;
      others = [a - 1, a + 1, a + step];
    } else {
      const a1 = K.rand(3, 9),
        b = K.rand(2, 8),
        c = K.rand(2, 7);
      a = a1 + b * c;
      q = `Tính đúng thứ tự:\n${a1} + ${b} × ${c} = ?`;
      why = `Thực hiện nhân trước: ${b} × ${c} = ${b * c}; sau đó cộng ${a1}, được ${a}.`;
      others = [(a1 + b) * c, a + 1, a - c];
    }
    const options = [...new Set([String(a), ...others.map(String)])];
    while (options.length < 4) {
      const x = String(Number(a) + K.rand(2, 20));
      if (!options.includes(x)) options.push(x);
    }
    return { q, a: String(a), why, options: K.shuffle(options) };
  }
  K.games.logic = {
    id: "logic",
    name: "Giải mã quy luật",
    category: "Logic",
    icon: "target",
    accent: "sand",
    description: "Tìm mối liên hệ, phân loại và khám phá những quy luật ẩn.",
    rules:
      "Chọn một đáp án cho mỗi câu hỏi. Đọc giải thích trước khi sang câu tiếp theo. Có 8 câu; câu hỏi và đáp án được xáo trộn mỗi phiên.",
    duration: "2–4 phút",
    start(s) {
      let n = 0,
        correct = 0;
      const total = 8,
        seen = new Set();
      s.prompt("Tìm quy luật và chọn đáp án hợp lý.");
      function round() {
        let q,
          tries = 0;
        do {
          q = makeQuestion(s.level);
          tries++;
        } while (seen.has(q.q + q.a) && tries < 30);
        seen.add(q.q + q.a);
        let locked = false;
        s.progress(`Câu ${n + 1} / ${total}`);
        s.stage.innerHTML = `<div class="logic-question">${K.esc(q.q).replace(/\n/g, "<br>")}</div><div class="game-choices">${q.options.map((v) => `<button class="answer-button" data-value="${K.esc(v)}">${K.esc(v)}</button>`).join("")}</div><div class="logic-explanation" id="logic-explanation" hidden></div><button class="btn primary" id="logic-next" hidden>Câu tiếp theo ${K.icon("arrow")}</button>`;
        s.stage.querySelectorAll("[data-value]").forEach(
          (b) =>
            (b.onclick = () => {
              if (locked || s.paused) return;
              locked = true;
              const good = b.dataset.value === q.a;
              if (good) correct++;
              s.stage.querySelectorAll("[data-value]").forEach((x) => {
                x.disabled = true;
                if (x.dataset.value === q.a) x.classList.add("correct");
                else if (x === b) x.classList.add("wrong");
              });
              s.message(
                good ? "Chính xác!" : "Cùng xem lại quy luật nhé.",
                good ? "correct" : "wrong",
              );
              const box = s.stage.querySelector("#logic-explanation");
              box.hidden = false;
              box.textContent = q.why;
              const next = s.stage.querySelector("#logic-next");
              next.hidden = false;
              if (n === total - 1) next.textContent = "Xem kết quả";
              next.onclick = () => {
                n++;
                s.message("");
                if (n === total)
                  s.finish({
                    correct,
                    total,
                    detail: `Giải đúng ${correct}/${total} câu logic.`,
                  });
                else round();
              };
            }),
        );
      }
      round();
    },
  };
  K.logicQuestion = makeQuestion;
})();
