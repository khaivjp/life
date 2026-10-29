/* 04. Đếm âm cao — Web Audio chỉ khởi chạy khi người dùng bấm nghe. */
(() => {
  const K = KhaiLife;
  K.games.auditory = {
    id: "auditory",
    name: "Lắng nghe chọn lọc",
    category: "Chú ý",
    icon: "headphones",
    accent: "sky",
    description: "Lắng nghe tiếng cao và thấp. Đếm đúng âm thanh mục tiêu.",
    rules:
      "Nghe chuỗi âm thanh và đếm số tiếng TING cao. Bạn có thể nghe mẫu và phát lại trước khi trả lời. Có 4 lượt. Cần bật âm lượng thiết bị.",
    duration: "2–3 phút",
    start(s) {
      let ctx = null,
        nodes = [],
        n = 0,
        correct = 0,
        token = 0;
      const total = 4;
      async function context() {
        if (!ctx)
          ctx = new (window.AudioContext || window.webkitAudioContext)();
        await ctx.resume();
        return ctx;
      }
      function stop() {
        nodes.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
        nodes = [];
        token++;
      }
      function tone(h, t) {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.frequency.value = h ? 880 : 330;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.1, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(t);
        o.stop(t + 0.21);
        nodes.push(o);
      }
      s.onCleanup(() => {
        stop();
        ctx?.close().catch(() => {});
      });
      let onPause = () => {};
      s.onPause(() => {
        stop();
        onPause();
      });
      function round() {
        let listened = false,
          playing = false,
          locked = false;
        const length = [6, 8, 12][s.level],
          count = K.rand(2, length - 2),
          pattern = K.shuffle(Array.from({ length }, (_, i) => i < count)),
          gap = [0.65, 0.5, 0.36][s.level];
        s.progress(`Lượt ${n + 1} / ${total}`);
        s.prompt("Đếm số tiếng TING cao trong chuỗi.");
        s.stage.innerHTML = `<div class="audio-orb">${K.icon("headphones")}</div><div class="row audio-samples"><button class="btn small" data-tone="high">Nghe mẫu TING</button><button class="btn small" data-tone="low">Nghe mẫu BOP</button></div><button class="btn primary" id="play-audio">${K.icon("play")} Nghe chuỗi âm</button><p class="game-note" id="audio-status">${length} âm thanh · Bật âm lượng vừa đủ</p><form id="audio-answer" class="audio-answer"><label>Số tiếng TING cao<input type="number" inputmode="numeric" min="0" max="${length}" required disabled name="count" placeholder="Nhập số lượng"></label><button class="btn" disabled>Kiểm tra</button></form>`;
        const play = s.stage.querySelector("#play-audio"),
          status = s.stage.querySelector("#audio-status"),
          input = s.stage.querySelector("input"),
          submit = s.stage.querySelector("form button");
        function controls() {
          input.disabled = submit.disabled = !listened || playing || locked;
          s.stage
            .querySelectorAll("[data-tone]")
            .forEach((b) => (b.disabled = playing || locked));
          play.disabled = playing || locked;
        }
        onPause = () => {
          if (playing) {
            playing = false;
            listened = false;
            status.textContent = "Chuỗi âm bị ngắt. Bấm nghe lại để tiếp tục.";
            controls();
          }
        };
        s.stage.querySelectorAll("[data-tone]").forEach(
          (b) =>
            (b.onclick = async () => {
              try {
                await context();
                if (!s.active || s.paused || playing) return;
                stop();
                tone(b.dataset.tone === "high", ctx.currentTime + 0.02);
              } catch {
                s.message(
                  "Trình duyệt chưa hỗ trợ âm thanh. Hãy thử Chrome hoặc Safari mới.",
                  "wrong",
                );
              }
            }),
        );
        play.onclick = async () => {
          if (playing || locked) return;
          playing = true;
          listened = false;
          controls();
          try {
            await context();
            if (!s.active || s.paused) {
              playing = false;
              controls();
              return;
            }
            stop();
            const current = token;
            pattern.forEach((h, i) => tone(h, ctx.currentTime + 0.1 + i * gap));
            status.textContent = "Đang phát… Hãy đếm tiếng TING cao.";
            s.later(
              () => {
                if (current !== token) return;
                playing = false;
                listened = true;
                status.textContent =
                  "Đã phát xong. Nhập câu trả lời hoặc nghe lại.";
                play.innerHTML = K.icon("refresh") + " Nghe lại";
                controls();
                input.focus();
              },
              (pattern.length * gap + 0.2) * 1000,
            );
          } catch {
            playing = false;
            controls();
            s.message("Không phát được âm thanh trên thiết bị này.", "wrong");
          }
        };
        s.stage.querySelector("form").onsubmit = (e) => {
          e.preventDefault();
          if (!listened || playing || locked || s.paused) return;
          locked = true;
          controls();
          const good = +input.value === count;
          if (good) correct++;
          s.message(
            good ? "Đúng rồi!" : `Có ${count} tiếng TING cao.`,
            good ? "correct" : "wrong",
          );
          n++;
          s.later(() => {
            s.message("");
            if (n === total)
              s.finish({
                correct,
                total,
                detail: `Đếm đúng ${correct}/${total} chuỗi âm thanh.`,
              });
            else round();
          }, 1300);
        };
      }
      round();
    },
  };
})();
