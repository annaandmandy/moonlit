Moon Eclipse Trial — 2D RPG (Phaser 3)

A mythological detective RPG inspired by Shan Hai Jing.
You play a wandering detective accompanied by Baize, exploring a shrine during a blood-moon ritual to uncover the truth behind a divine murder.

🎮 Features

2D top-down exploration — player moves with WASD

Procedural map generation — no assets needed, tiles drawn by code

Collisions — walls and altar block movement

Jump ability — press Space to hop over the altar

NPC interactions — press E near Baize to talk

Dialogue system — HTML overlay with text input

Mock backend chat — player types and gets Baize’s AI-like replies

🧩 Folder Structure
/src
 ├── main.js          # Phaser setup and scene definition
 ├── assets/          # optional future art (tileset, portraits)
 ├── ui/
 │    ├── dialogue.html
 │    └── ui.css
 └── server/           # (optional backend)
      └── api.js

⚙️ Setup
npm install phaser
npm start
# then open http://localhost:8080

🗺️ Core Scene Logic (ShrineScene.js)
- Procedurally generates 20x15 grid of 32px tiles
- Randomly spawns walls and one central altar
- Adds player (yellow square)
- Adds Baize NPC (blue square)
- Sets collision on walls/altar
- Enables camera follow and moonlight overlay

💬 Dialogue System (HTML Overlay)

When the player presses E near Baize:

A translucent dialogue box appears.

Player can type directly into a text area.

Press Enter to send —
currently returns a mock AI reply like:

“The moon remembers what men forget.”

Future backend plan

const res = await fetch("/reply", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ npc: "baize", message: playerText })
});
const data = await res.json();

🕹️ Controls
Key	Action
WASD	Move
E	Interact / talk
Space	Jump (over altar)
Enter	Send chat message
Esc	Close dialogue
🌈 Art & Mood

Style: stylized 2D, low-poly, desaturated blues & crimson glow

Lighting: gradient moonlight overlay

Baize: white-gold aura

NineTailFox (future): crimson eyes, smooth animation

🧠 Expansion Ideas

Add NineTailFox NPC with alternate dialogue memory.

Add Trial Scene (Danganronpa-style cross-examination).

Connect real AI backend for dynamic responses.

Store dialogue logs to localStorage for persistent memory.

🪶 Example Dialogue

Baize: “The moonlight shivers… what brings you here?”
You: “I saw the altar bleed.”
Baize: “Then truth itself is waking.”

🧱 Tech Stack
Area	Tool
Engine	Phaser 3
Rendering	Canvas (2D)
Dialogue	HTML + JS
Backend (optional)	Node.js / Flask / FastAPI
Style	Minimal serif UI + gradient overlay
🧭 Quick Summary

Build Goal:
Create a procedural-map RPG with a living dialogue agent.

Interaction Flow:
Explore → Find Baize → Press E → Type & chat → Receive AI replies.

Hackathon Target:
12-hour playable demo, no art assets required.