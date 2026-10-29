/* 05. Vẽ gương: đường ngẫu nhiên, đổi trái/phải, chấm khoảng cách và độ phủ. */
(() => {
  const K = KhaiLife;
  K.games.mirror = {
    id: "mirror",
    name: "Nét vẽ trong gương",
    category: "Phối hợp",
    icon: "pen",
    accent: "rose",
    description: "Điều khiển nét vẽ phản chiếu để đi theo đường dẫn.",
    rules:
      "Bắt đầu tại chấm xanh. Mức Dễ: nét vẽ theo tay. Mức Vừa/Khó: trái và phải bị đảo như soi gương. Theo đường nét đứt tới chấm đích. Điểm dựa trên độ chính xác và độ phủ đường dẫn.",
    duration: "1–3 phút",
    start(s) {
      const size = 360,
        margin = 40,
        points = Array.from({ length: 5 + s.level }, (_, i) => ({
          x: margin + (i * (size - margin * 2)) / (4 + s.level),
          y: K.rand(65, 295),
        })),
        samples = [];
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1],
          b = points[i],
          len = Math.hypot(b.x - a.x, b.y - a.y);
        for (let t = 0; t < len; t += 4)
          samples.push({
            x: a.x + ((b.x - a.x) * t) / len,
            y: a.y + ((b.y - a.y) * t) / len,
          });
      }
      samples.push(points.at(-1));
      let trail = [],
        drawing = false,
        started = false,
        last = null,
        moves = 0;
      const tolerance = [22, 20, 14][s.level],
        mirror = s.level > 0;
      s.prompt(
        mirror
          ? "Di chuyển tay sang trái để nét vẽ đi sang phải."
          : "Đi theo đường nét đứt từ chấm xanh tới đích.",
      );
      s.progress(mirror ? "Điều khiển phản chiếu" : "Điều khiển trực tiếp");
      s.stage.innerHTML = `<div class="mirror-canvas-wrap"><canvas width="720" height="720" id="mirror-canvas" aria-label="Bảng vẽ đường dẫn, dùng chuột hoặc ngón tay"></canvas></div><p class="game-note">${mirror ? "Vị trí bắt đầu của tay ở phía đối diện chấm xanh." : "Chạm vào chấm xanh để bắt đầu."} Có thể nhấc tay rồi vẽ tiếp.</p><div class="row mirror-actions"><button class="btn" id="clear-drawing">${K.icon("refresh")} Vẽ lại</button><button class="btn primary" id="finish-drawing">${K.icon("check")} Chấm nét vẽ</button></div>`;
      const canvas = s.stage.querySelector("canvas"),
        ctx = canvas.getContext("2d");
      ctx.scale(2, 2);
      function paint() {
        ctx.clearRect(0, 0, size, size);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#b0c6aa";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        points.forEach((p, i) =>
          i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "#398b66";
        ctx.lineWidth = 4;
        ctx.beginPath();
        let prev = false;
        trail.forEach((p) => {
          if (!p) {
            prev = false;
            return;
          }
          if (prev) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
          prev = true;
        });
        ctx.stroke();
        [points[0], points.at(-1)].forEach((p, i) => {
          ctx.beginPath();
          ctx.fillStyle = i ? "#b66b59" : "#3f9568";
          ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.font = "bold 9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(i ? "B" : "A", p.x, p.y + 3);
        });
      }
      function pos(e) {
        const r = canvas.getBoundingClientRect(),
          x = ((e.clientX - r.left) / r.width) * size,
          y = ((e.clientY - r.top) / r.height) * size;
        return { x: mirror ? size - x : x, y };
      }
      canvas.onpointerdown = (e) => {
        if (s.paused || !s.active) return;
        const p = pos(e);
        if (!started && Math.hypot(p.x - points[0].x, p.y - points[0].y) > 25) {
          s.message("Bắt đầu ở chấm A màu xanh nhé.", "wrong");
          return;
        }
        started = true;
        drawing = true;
        trail.push(null, p);
        last = p;
        canvas.setPointerCapture(e.pointerId);
        s.message("");
        paint();
      };
      canvas.onpointermove = (e) => {
        if (!drawing || s.paused) return;
        const p = pos(e);
        if (p.x < 0 || p.x > size || p.y < 0 || p.y > size) return;
        const dist = Math.hypot(p.x - last.x, p.y - last.y);
        if (dist < 2) return;
        for (let t = 3; t < dist; t += 3)
          trail.push({
            x: last.x + ((p.x - last.x) * t) / dist,
            y: last.y + ((p.y - last.y) * t) / dist,
          });
        trail.push(p);
        last = p;
        moves++;
        paint();
      };
      canvas.onpointerup = canvas.onpointercancel = () => (drawing = false);
      s.onPause(() => (drawing = false));
      s.stage.querySelector("#clear-drawing").onclick = () => {
        trail = [];
        drawing = false;
        started = false;
        moves = 0;
        s.message("");
        paint();
      };
      s.stage.querySelector("#finish-drawing").onclick = () => {
        const drawn = trail.filter(Boolean);
        if (moves < 10 || drawn.length < 20) {
          s.message("Hãy vẽ từ chấm A đến chấm B trước.", "wrong");
          return;
        }
        const distance = (p, arr) =>
            Math.min(...arr.map((q) => Math.hypot(p.x - q.x, p.y - q.y))),
          coverage =
            samples.filter((p) => distance(p, drawn) < tolerance).length /
            samples.length,
          precision =
            drawn.filter((p) => distance(p, samples) < tolerance).length /
            drawn.length;
        const reached = distance(points.at(-1), drawn) < 25;
        if (!reached || coverage < 0.65) {
          s.message(
            `Bạn đã phủ ${Math.round(coverage * 100)}% đường dẫn. Vẽ tới chấm B và phủ ít nhất 65% để hoàn thành.`,
            "wrong",
          );
          return;
        }
        const score = Math.round(precision * coverage * 1000);
        s.finish({
          correct: Math.round(precision * 100),
          total: 100,
          score,
          detail: `Độ chính xác ${Math.round(precision * 100)}% · Độ phủ ${Math.round(coverage * 100)}%.`,
        });
      };
      paint();
    },
  };
})();
