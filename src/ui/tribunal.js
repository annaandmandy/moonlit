const API_BASE = 'http://localhost:5001';

const NPC_METADATA = {
  baize: { name: 'Baize', portrait: 'images/Baize.png' },
  bifang: { name: 'Bifang', portrait: 'images/bifang.png' },
  kui: { name: 'Kui', portrait: 'images/kui.png' },
  qingniao: { name: 'Qingniao', portrait: 'images/qingniao.png' },
  qiongqi: { name: 'Qiongqi', portrait: 'images/qiongqi.png' },
  xiangliu: { name: 'Xiangliu', portrait: 'images/xiangliu.png' },
  xingxing: { name: 'Xingxing', portrait: 'images/xingxing.png' },
  yingzhao: { name: 'Yingzhao', portrait: 'images/yingzhao.png' },
  jiuweihu: { name: 'Jiuweihu', portrait: 'images/jiuweihu.png' }
};

class TribunalUI {
  constructor() {
    this.overlay = document.getElementById('tribunal-overlay');
    if (!this.overlay) return;

    this.logEl = document.getElementById('tribunal-log');
    this.clueList = document.getElementById('tribunal-clue-list');
    this.clueCount = document.getElementById('tribunal-clue-count');
    this.speakerSelect = document.getElementById('tribunal-speaker-select');
    this.inputEl = document.getElementById('tribunal-input');
    this.submitBtn = document.getElementById('tribunal-submit');
    this.closeBtn = document.getElementById('tribunal-close');
    this.actionButtons = Array.from(document.querySelectorAll('.tribunal-action'));
    this.portraitEl = document.getElementById('tribunal-portrait');
    this.speakerNameEl = document.getElementById('tribunal-speaker-name');
    this.sceneTitleEl = document.getElementById('tribunal-scene-title');
    this.latestTextEl = document.getElementById('tribunal-latest-text');

    this.event = null;
    this.history = [];
    this.isOpen = false;
    this.closeCallback = null;

    this.closeBtn?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') {
        this.close();
      }
    });

    this.submitBtn?.addEventListener('click', () => this.handleAction('player'));
    this.inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        this.handleAction('player');
      }
      e.stopPropagation();
    });
    this.inputEl?.addEventListener('keypress', (e) => {
      e.stopPropagation();
    });
    this.inputEl?.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });

    this.actionButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
    });
  }

  async open(eventId, options = {}) {
    if (!this.overlay) return;
    this.closeCallback = options.onClose || null;
    await this.ensureEvent(eventId);
    this.overlay.classList.remove('hidden');
    this.isOpen = true;
    this.inputEl?.focus();
  }

  close() {
    if (!this.overlay || !this.isOpen) return;
    this.overlay.classList.add('hidden');
    this.isOpen = false;
    if (typeof this.closeCallback === 'function') {
      this.closeCallback();
    }
  }

  async ensureEvent(eventId) {
    if (this.event && this.event.id === eventId) {
      return;
    }
    const res = await fetch(`${API_BASE}/api/tribunal/event/${eventId}`);
    if (!res.ok) {
      console.error('Failed to load tribunal event');
      return;
    }
    const data = await res.json();
    this.event = data.event;
    this.history = this.normalizeHistory(data.history || []);
    this.populateSpeakerSelect();
    this.renderClues();
    this.renderHistory();
    this.sceneTitleEl.textContent = this.event?.name || 'Moonlit Tribunal';
    this.updateHighlight('baize', 'Awaiting testimony...');
  }

  populateSpeakerSelect() {
    if (!this.speakerSelect || !this.event) return;
    this.speakerSelect.innerHTML = '';
    (this.event.npcs || []).forEach((npcId) => {
      const option = document.createElement('option');
      const meta = NPC_METADATA[npcId] || {};
      option.value = npcId;
      option.textContent = meta.name || npcId;
      this.speakerSelect.appendChild(option);
    });
  }

  renderClues() {
    if (!this.clueList || !this.event) return;
    this.clueList.innerHTML = '';
    const clues = this.event.p_clues || [];
    clues.forEach((clue, idx) => {
      const li = document.createElement('li');
      li.textContent = clue.text || clue.clue || `Clue ${idx + 1}`;
      this.clueList.appendChild(li);
    });
    if (this.clueCount) {
      this.clueCount.textContent = `${clues.length} clues`;
    }
  }

  renderHistory() {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    let lastEntry = null;
    this.history.forEach((entry) => {
      this.logEl.appendChild(this.createLine(entry.speaker, entry.text));
      lastEntry = entry;
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
    if (lastEntry) {
      this.updateHighlight(lastEntry.speaker, lastEntry.text);
    } else {
      this.updateHighlight('baize', 'Awaiting testimony...');
    }
  }

  createLine(speaker, text) {
    const row = document.createElement('div');
    row.className = 'tribunal-line';
    if (speaker === 'Judge') {
      row.classList.add('judge');
    }
    const speakerSpan = document.createElement('div');
    speakerSpan.className = 'speaker';
    const meta = NPC_METADATA[speaker];
    speakerSpan.textContent = meta?.name || speaker;
    const textSpan = document.createElement('div');
    textSpan.className = 'line-text';
    textSpan.textContent = text;
    row.appendChild(speakerSpan);
    row.appendChild(textSpan);
    return row;
  }

  updateHighlight(speaker, text) {
    if (!this.speakerNameEl || !this.portraitEl || !this.latestTextEl) return;
    const meta = NPC_METADATA[speaker];
    if (meta) {
      this.speakerNameEl.textContent = meta.name;
      this.portraitEl.src = meta.portrait;
      this.portraitEl.alt = meta.name;
    } else {
      this.speakerNameEl.textContent = speaker;
      this.portraitEl.src = NPC_METADATA.baize.portrait;
      this.portraitEl.alt = NPC_METADATA.baize.name;
    }
    this.latestTextEl.textContent = text || '';
  }

  async handleAction(action) {
    if (!this.event || !this.overlay) return;
    if (action === 'player') {
      const text = (this.inputEl?.value || '').trim();
      if (!text) {
        this.flashInput();
        return;
      }
    }

    const payload = {
      event_id: this.event.id,
      action,
      history: this.history
    };

    if (action === 'choose') {
      payload.speaker = this.speakerSelect?.value;
    }
    if (action === 'player') {
      payload.player_input = this.inputEl.value.trim();
    }

    this.setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/tribunal/act`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.error('Tribunal action failed');
        return;
      }
      const data = await res.json();
      if (!data.success) {
        console.error('Tribunal action error', data.error);
        return;
      }
      this.history = this.normalizeHistory(data.history || []);
      if (action === 'player' && this.inputEl) {
        this.inputEl.value = '';
      }
      this.renderHistory();
    } finally {
      this.setLoading(false);
    }
  }

  flashInput() {
    if (!this.inputEl) return;
    this.inputEl.classList.add('shake');
    setTimeout(() => this.inputEl.classList.remove('shake'), 400);
  }

  setLoading(isLoading) {
    this.actionButtons.forEach((btn) => (btn.disabled = isLoading));
    if (this.submitBtn) this.submitBtn.disabled = isLoading;
    if (this.speakerSelect) this.speakerSelect.disabled = isLoading;
  }

  normalizeHistory(entries) {
    if (!Array.isArray(entries)) return [];
    return entries
      .map((entry) => {
        if (!entry) return null;
        if (entry.speaker && entry.text) return entry;
        const keys = Object.keys(entry);
        if (!keys.length) return null;
        return { speaker: keys[0], text: entry[keys[0]] };
      })
      .filter(Boolean);
  }
}

export const tribunalUI = new TribunalUI();
