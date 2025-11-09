# Moon Eclipse Trial – Investigator’s Build

Moonlit Eclipse Trial is a Shan Hai Jing–inspired detective RPG built with Phaser 3 for the exploration layer and a Flask backend for live NPC dialogue and tribunal debates. You begin in Qingqiu Village beside Baize, collect evidence from animated clue markers, and eventually convene a Danganronpa‑style trial in the Moonlit Tribunal.

---

## Highlights

- **Procedural multi-map world** – stylized terrain layers for the Qingqiu crime scene, the Moonlit Shrine overworld, and the Council Tribunal chamber.
- **Animated evidence system** – glowing fire sprites + corpse inspection convert to Memory Book entries and sync to the backend.
- **Baize companion + cat menu** – talk, open the Memory Book, or fast-travel between scenes from the cat action menu (`V`).
- **Danganronpa-inspired tribunal** – press `J` in the Council Hall to open the Moonlit Tribunal overlay, scroll the clue board, choose speakers, or submit an “Object!” line.
- **LLM-powered NPC banter** – the backend merges live clues into `events.json`, uses character personas, and picks the next speaker automatically.

---

## Controls

| Key / UI | Action |
| --- | --- |
| `W`, `A`, `S`, `D` | Walk |
| `E` | Interact with nearby NPCs / clues |
| `V` | Open the Baize action menu (Memory Book, travel, talk) |
| `M` | Toggle the strategic map overlay |
| `J` | (Council Hall only) open the Moonlit Tribunal |
| `Enter` | Send dialogue / tribunal “Object!” (use `⌘/Ctrl + Enter` inside the tribunal text box) |
| `Esc` | Close overlays (dialogue, Memory Book, tribunal) |

---

## Repository Layout

```
.
├─ index.html                # Page shell + overlays
├─ src/
│  ├─ main.js               # Phaser bootstrapping
│  ├─ ShrineScene.js        # Core gameplay scene (maps, clues, tribunal hotkeys)
│  └─ ui/
│     ├─ ui.css             # Game + overlay styling
│     └─ tribunal.js        # Moonlit Tribunal client logic
├─ backend/
│  ├─ app.py                # Flask API (clues, tribunal events, Gemini calls)
│  ├─ characters.json       # Persona data per mythological NPC
│  ├─ events.json           # Tribunal event definitions (auto-filled with discovered clues)
│  ├─ requirements.txt      # Python dependencies
│  └─ game_agent.py         # Prototype trial simulator / prompt playground
├─ clues.json / crime_clues.json
│                           # Static clue pools merged at runtime
└─ scripts/
   └─ setup.sh              # Installs JS + backend deps
```

---

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+ (used for the Flask backend)
- A Google Generative AI key exposed as `GOOGLE_API_KEY`

---

## One-time Setup

Run the helper script to install both npm and Python dependencies. It also creates a backend virtual environment under `backend/.venv`.

```bash
bash scripts/setup.sh
```

After the script finishes, activate the backend environment whenever you work on the server:

```bash
source backend/.venv/bin/activate
```

---

## Running the Game

1. **Start the backend API** (needs `GOOGLE_API_KEY` in your environment):

   ```bash
   source backend/.venv/bin/activate
   export GOOGLE_API_KEY="sk-..."   # or add to backend/.env
   python backend/app.py
   ```

2. **Start the Phaser client** (serves `index.html` + modules):

   ```bash
   npm start
   # open http://localhost:8080
   ```

3. **Play loop**
   - Investigate Qingqiu Village clues (fire markers collectable when close; the corpse counts as its own clue).
   - Use the Baize menu (`V`) to fast-travel to the Moonlit Shrine grounds or the Council Hall.
   - Inside the Council Hall press `J` to open the Moonlit Tribunal overlay. The clue board lists only the clues you collected this session, and the chat pane scrolls within the panel.
   - Use the action buttons: `Auto` lets the AI pick the next speaker, `Select Speaker` uses the dropdown (now includes Xiangliu), and `Object!` sends your own line.

> **Tip:** Clue progress resets on each fresh run so the tribunal always debates the current case state. The Memory Book shows exactly what you’ve logged this session.

---

## Data & Customization

- **Clues** – `clues.json` (general shrine) + `crime_clues.json` (Qingqiu) merge on load. Update these files to author new evidence pools.
- **Characters & prompts** – `backend/characters.json` controls each NPC’s persona, abilities, and emotional tone; adjust to change how they speak in the tribunal.
- **Events** – `backend/events.json` declares tribunal rosters. `p_clues` can reference `"discovered_clues.json"` to auto-fill with the player’s latest findings.
- **LLM prompts** – `backend/app.py` contains the narration + speaker selection prompts that emulate the `trial.ipynb` prototype. Tweak them there if you need different behavior.

---

## Troubleshooting

- **No portrait / blank dropdown** – ensure the backend is running; the tribunal pulls its roster and clues from `/api/tribunal/event/<id>`.
- **Stuck keys in the tribunal input** – the text box captures WASD/interaction keys as of the current build. If you still see character movement, reload after the latest update.
- **Google API errors** – verify `GOOGLE_API_KEY` is set before launching `app.py`. Keys rotate frequently; update your secret as needed.

Enjoy unraveling the Moonlit Eclipse Trial!
