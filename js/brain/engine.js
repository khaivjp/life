/* Vòng đời phiên chơi: hủy bộ đếm, tạm dừng, chấm và lưu một lần. */
(() => {
  const K = KhaiLife;
  K.games = {};
  class Session {
    constructor(game, level, root, onDone) {
      this.game = game;
      this.level = level;
      this.root = root;
      this.stage = root.querySelector("#game-stage");
      this.onDone = onDone;
      this.elapsed = 0;
      this.tasks = [];
      this.cleanups = [];
      this.pauseHandlers = [];
      this.active = true;
      this.paused = false;
      this.finished = false;
      this.last = performance.now();
      this.tick = setInterval(() => this.step(), 50);
      this.visibility = () => {
        if (document.hidden) this.pause();
      };
      document.addEventListener("visibilitychange", this.visibility);
      this.onCleanup(() =>
        document.removeEventListener("visibilitychange", this.visibility),
      );
    }
    step() {
      const now = performance.now(),
        delta = now - this.last;
      this.last = now;
      if (!this.active || this.paused) return;
      this.elapsed += delta;
      const due = this.tasks.filter((t) => t.at <= this.elapsed);
      this.tasks = this.tasks.filter((t) => t.at > this.elapsed);
      for (const t of due) if (this.active && !this.paused) t.fn();
      const clock = this.root.querySelector("#session-time");
      if (clock) clock.textContent = K.clock(this.elapsed / 1000);
      this.onTick?.(this.elapsed);
    }
    later(fn, ms) {
      this.tasks.push({ at: this.elapsed + ms, fn });
    }
    onCleanup(fn) {
      this.cleanups.push(fn);
    }
    onPause(fn) {
      this.pauseHandlers.push(fn);
    }
    prompt(text) {
      this.root.querySelector("#game-prompt").textContent = text;
    }
    message(text, type = "") {
      const e = this.root.querySelector("#game-feedback");
      e.textContent = text;
      e.className = "game-feedback " + type;
    }
    progress(text) {
      this.root.querySelector("#game-progress").textContent = text;
    }
    pause() {
      if (!this.active || this.paused) return;
      this.paused = true;
      this.pauseHandlers.forEach((f) => f());
      this.stage.inert = true;
      this.root.querySelector("#pause-overlay").hidden = false;
      this.root.querySelector("#resume-game").focus();
    }
    resume() {
      if (!this.active) return;
      this.last = performance.now();
      this.paused = false;
      this.stage.inert = false;
      this.root.querySelector("#pause-overlay").hidden = true;
    }
    destroy() {
      this.active = false;
      clearInterval(this.tick);
      this.tasks = [];
      this.cleanups.splice(0).forEach((f) => f());
      this.onTick = null;
    }
    finish({ correct = 0, total = 1, score, detail = "" }) {
      if (!this.active || this.finished) return;
      this.finished = true;
      const record = {
        id: K.uid(),
        game: this.game.id,
        level: this.level,
        date: K.dateKey(),
        at: Date.now(),
        duration: Math.round(this.elapsed / 100) / 10,
        correct,
        total,
        accuracy: Math.round((correct / Math.max(1, total)) * 100),
        score: Math.round(
          Math.max(
            0,
            Math.min(1000, score ?? (correct / Math.max(1, total)) * 1000),
          ),
        ),
        detail,
      };
      this.destroy();
      K.store.update((s) => {
        s.brain.history.unshift(record);
        s.brain.history = s.brain.history.slice(0, 500);
      });
      this.onDone(record);
    }
  }
  K.BrainSession = Session;
})();
