// ==========================================
// 🛠️ 교실 수업용 내장 인터랙티브 도구 모듈 (Clean Light UI)
// ==========================================

window.ClassroomTools = {
  picker: {
    isRunning: false,
    intervalId: null,
    history: []
  },

  timer: {
    totalSeconds: 300,
    remainingSeconds: 300,
    intervalId: null,
    isRunning: false
  },

  // 1. 랜덤 발표자 뽑기 모달
  openPicker() {
    const modal = document.getElementById("tool-modal");
    const title = document.getElementById("tool-modal-title");
    const body = document.getElementById("tool-modal-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i data-lucide="dice-5" class="w-5 h-5 text-indigo-600"></i> <span class="uppercase tracking-wider font-bold">교실 발표자 & 모둠 랜덤 추첨기</span>`;
    
    body.innerHTML = `
      <div class="space-y-8 text-center">
        <!-- 번호 범위 컨트롤 -->
        <div class="flex items-center justify-center gap-6 text-xs uppercase tracking-wider font-semibold text-slate-500">
          <label class="flex items-center gap-2">
            <span>시작 번호</span>
            <input id="picker-min" type="number" value="1" min="1" max="100" class="w-16 px-2 py-1 text-center border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold" />
          </label>
          <span class="text-slate-400">—</span>
          <label class="flex items-center gap-2">
            <span>끝 번호</span>
            <input id="picker-max" type="number" value="28" min="1" max="100" class="w-16 px-2 py-1 text-center border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-mono font-bold" />
          </label>
        </div>

        <!-- 초대형 다이나믹 디스플레이 -->
        <div class="relative flex flex-col items-center justify-center py-16 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
          <div id="picker-display" class="text-8xl sm:text-9xl font-black text-slate-900 font-mono tracking-widest transition-transform duration-75">
            ?
          </div>
          <div class="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-2 font-bold">REAL-TIME RANDOMIZER</div>
        </div>

        <!-- 컨트롤 버튼 -->
        <div class="flex items-center justify-center gap-3">
          <button id="picker-start-btn" onclick="ClassroomTools.togglePicker()" class="px-8 py-4 bg-black hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center gap-2">
            <i data-lucide="play" class="w-4 h-4 fill-white"></i>
            <span id="picker-btn-text">추첨 시작하기</span>
          </button>
          <button onclick="ClassroomTools.resetPickerHistory()" class="px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs uppercase tracking-wider font-bold border border-slate-200 transition">
            초기화
          </button>
        </div>

        <!-- 당첨 기록 -->
        <div class="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">당첨 기록</div>
          <div id="picker-history" class="flex flex-wrap gap-2 text-xs font-mono">
            ${this.picker.history.length === 0 ? '<span class="text-slate-400">아직 추첨 기록이 없습니다.</span>' : this.picker.history.map(n => `<span class="px-2.5 py-1 bg-white text-indigo-600 rounded-lg font-bold border border-slate-200 shadow-sm">${n}번</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  },

  togglePicker() {
    const display = document.getElementById("picker-display");
    const btnText = document.getElementById("picker-btn-text");
    const minInput = document.getElementById("picker-min");
    const maxInput = document.getElementById("picker-max");

    const min = parseInt(minInput.value) || 1;
    const max = parseInt(maxInput.value) || 28;

    if (this.picker.isRunning) {
      clearInterval(this.picker.intervalId);
      this.picker.isRunning = false;
      btnText.innerText = "다음 번호 추첨";

      const finalNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      display.innerText = finalNumber;
      display.classList.add("text-indigo-600", "scale-110");
      setTimeout(() => display.classList.remove("scale-110"), 300);

      this.picker.history.push(finalNumber);
      this.updatePickerHistoryUI();
    } else {
      this.picker.isRunning = true;
      btnText.innerText = "멈추기!";
      display.classList.remove("text-indigo-600");

      this.picker.intervalId = setInterval(() => {
        const rand = Math.floor(Math.random() * (max - min + 1)) + min;
        display.innerText = rand;
      }, 40);
    }
  },

  updatePickerHistoryUI() {
    const historyEl = document.getElementById("picker-history");
    if (!historyEl) return;
    historyEl.innerHTML = this.picker.history.map(n => 
      `<span class="px-2.5 py-1 bg-white text-indigo-600 rounded-lg font-bold border border-slate-200 shadow-sm">${n}번</span>`
    ).join('');
  },

  resetPickerHistory() {
    this.picker.history = [];
    this.updatePickerHistoryUI();
    const display = document.getElementById("picker-display");
    if (display) display.innerText = "?";
  },

  // 2. 모둠 타이머 모달 (Clean Light Dashboard UI)
  openTimer() {
    const modal = document.getElementById("tool-modal");
    const title = document.getElementById("tool-modal-title");
    const body = document.getElementById("tool-modal-body");
    if (!modal || !title || !body) return;

    title.innerHTML = `<i data-lucide="clock" class="w-5 h-5 text-emerald-600"></i> <span class="uppercase tracking-wider font-bold">시각적 모둠 활동 집중 타이머</span>`;
    
    body.innerHTML = `
      <div class="space-y-8 text-center">
        <!-- 프리셋 바 -->
        <div class="flex items-center justify-center gap-2 flex-wrap text-xs font-mono font-bold">
          <button onclick="ClassroomTools.setTimerDuration(60)" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition">1분</button>
          <button onclick="ClassroomTools.setTimerDuration(180)" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition">3분</button>
          <button onclick="ClassroomTools.setTimerDuration(300)" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition">5분</button>
          <button onclick="ClassroomTools.setTimerDuration(600)" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition">10분</button>
          <button onclick="ClassroomTools.setTimerDuration(900)" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition">15분</button>
        </div>

        <!-- 하이테크 타이머 디스플레이 -->
        <div class="relative flex flex-col items-center justify-center py-16 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
          <div id="timer-display" class="text-8xl sm:text-9xl font-black font-mono tracking-widest text-slate-900">
            05:00
          </div>
          <div id="timer-status" class="mt-2 text-xs font-mono font-bold tracking-widest uppercase text-slate-400">준비 완료</div>
        </div>

        <!-- 컨트롤 버튼 -->
        <div class="flex items-center justify-center gap-3">
          <button id="timer-toggle-btn" onclick="ClassroomTools.toggleTimer()" class="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2">
            <i data-lucide="play" class="w-4 h-4 fill-white"></i>
            <span id="timer-toggle-text">타이머 시작</span>
          </button>
          <button onclick="ClassroomTools.resetTimer()" class="px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs uppercase tracking-wider font-bold border border-slate-200 transition">
            초기화
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();
    this.updateTimerDisplay();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  },

  setTimerDuration(seconds) {
    if (this.timer.isRunning) this.toggleTimer();
    this.timer.totalSeconds = seconds;
    this.timer.remainingSeconds = seconds;
    this.updateTimerDisplay();
  },

  toggleTimer() {
    const btnText = document.getElementById("timer-toggle-text");
    const statusEl = document.getElementById("timer-status");

    if (this.timer.isRunning) {
      clearInterval(this.timer.intervalId);
      this.timer.isRunning = false;
      if (btnText) btnText.innerText = "계속 진행";
      if (statusEl) statusEl.innerText = "일시 정지됨";
    } else {
      if (this.timer.remainingSeconds <= 0) {
        this.timer.remainingSeconds = this.timer.totalSeconds;
      }
      this.timer.isRunning = true;
      if (btnText) btnText.innerText = "일시 정지";
      if (statusEl) statusEl.innerText = "집중 탐구 시간 진행 중...";

      this.timer.intervalId = setInterval(() => {
        if (this.timer.remainingSeconds > 0) {
          this.timer.remainingSeconds--;
          this.updateTimerDisplay();
        } else {
          clearInterval(this.timer.intervalId);
          this.timer.isRunning = false;
          if (btnText) btnText.innerText = "다시 시작";
          if (statusEl) statusEl.innerText = "🎉 활동 시간이 종료되었습니다!";
          this.playBeepSound();
        }
      }, 1000);
    }
  },

  resetTimer() {
    if (this.timer.isRunning) {
      clearInterval(this.timer.intervalId);
      this.timer.isRunning = false;
    }
    this.timer.remainingSeconds = this.timer.totalSeconds;
    this.updateTimerDisplay();
    const btnText = document.getElementById("timer-toggle-text");
    const statusEl = document.getElementById("timer-status");
    if (btnText) btnText.innerText = "타이머 시작";
    if (statusEl) statusEl.innerText = "준비 완료";
  },

  updateTimerDisplay() {
    const display = document.getElementById("timer-display");
    if (!display) return;
    const mins = Math.floor(this.timer.remainingSeconds / 60).toString().padStart(2, '0');
    const secs = (this.timer.remainingSeconds % 60).toString().padStart(2, '0');
    display.innerText = `${mins}:${secs}`;

    if (this.timer.remainingSeconds <= 10 && this.timer.remainingSeconds > 0) {
      display.classList.add("text-rose-600", "animate-pulse");
    } else {
      display.classList.remove("text-rose-600", "animate-pulse");
    }
  },

  playBeepSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.log("Audio not supported", e);
    }
  },

  closeModal() {
    const modal = document.getElementById("tool-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }
};
