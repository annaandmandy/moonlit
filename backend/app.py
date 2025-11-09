from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
from copy import deepcopy
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize Gemini
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])


def call_gemini(prompt):
    """Call Gemini API with prompt"""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"

# Load characters data
CHARACTERS_PATH = os.path.join(os.path.dirname(__file__), 'characters.json')
with open(CHARACTERS_PATH, 'r', encoding='utf-8') as f:
    CHARACTERS = json.load(f)

DISCOVERED_CLUES_PATH = os.path.join(os.path.dirname(__file__), 'discovered_clues.json')
EVENTS_PATH = os.path.join(os.path.dirname(__file__), 'events.json')

NPC_PORTRAITS = {
    'baize': 'images/Baize.png',
    'bifang': 'images/bifang.png',
    'kui': 'images/kui.png',
    'qingniao': 'images/qingniao.png',
    'qiongqi': 'images/qiongqi.png',
    'xiangliu': 'images/xiangliu.png',
    'xingxing': 'images/xingxing.png',
    'yingzhao': 'images/yingzhao.png',
    'jiuweihu': 'images/jiuweihu.png'
}


def get_character_meta(npc_id):
    return CHARACTERS.get(npc_id, {})


def append_discovered_clue(entry):
    """Persist discovered clue to JSON log"""
    log = []
    if os.path.exists(DISCOVERED_CLUES_PATH):
        try:
            with open(DISCOVERED_CLUES_PATH, 'r', encoding='utf-8') as f:
                log = json.load(f)
        except json.JSONDecodeError:
            log = []

    log.append(entry)
    with open(DISCOVERED_CLUES_PATH, 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=2)


def reset_discovered_clues():
    with open(DISCOVERED_CLUES_PATH, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)


def load_discovered_clues():
    if os.path.exists(DISCOVERED_CLUES_PATH):
        try:
            with open(DISCOVERED_CLUES_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []


def load_events_data():
    if not os.path.exists(EVENTS_PATH):
        return []

    with open(EVENTS_PATH, 'r', encoding='utf-8') as f:
        raw_events = json.load(f)

    discovered = load_discovered_clues()
    events = []
    for event in raw_events:
        event_copy = deepcopy(event)
        raw_clues = event_copy.get('p_clues', [])
        resolved_clues = []
        placeholder_found = False
        for entry in raw_clues:
            if isinstance(entry, str) and entry == 'discovered_clues.json':
                placeholder_found = True
            else:
                resolved_clues.append(entry)
        if placeholder_found:
            resolved_clues = discovered
        event_copy['p_clues'] = resolved_clues
        event_copy['game_logs'] = event_copy.get('game_logs', [])
        events.append(event_copy)
    return events


def get_event_by_id(event_id):
    for event in load_events_data():
        if event.get('id') == event_id:
            return event
    return None


def sanitize_history(history):
    sanitized = []
    if not isinstance(history, list):
        return sanitized
    for entry in history[-30:]:
        speaker = entry.get('speaker') if isinstance(entry, dict) else None
        text = entry.get('text') if isinstance(entry, dict) else None
        if speaker and text:
            sanitized.append({'speaker': speaker, 'text': text})
    return sanitized


def history_to_text(history):
    return "\n".join(f"{item['speaker']}: {item['text']}" for item in history)


def pick_next_speaker(event, history):
    transcript = history_to_text(history[-8:])
    npc_list = event.get('npcs', [])
    roster = ", ".join(npc_list)
    last_speaker = history[-1]['speaker'] if history else None
    prompt = f"""
You are Monokuma-style moderator of the Moonlit Tribunal "{event['name']}".
Recent dialogue:
{transcript or 'No dialogue yet.'}

Available speakers (mythic suspects): {roster}.

Rules:
- Rotate speakers dramatically; avoid the same NPC twice.
- Prioritize characters recently accused or mentioned.
- If the Judge just spoke, pick the NPC they pressured.

Respond ONLY with the id of your selection.
"""
    response = call_gemini(prompt).lower()
    last_idx = -1
    choice = npc_list[0] if npc_list else None
    for npc in npc_list:
        idx = response.rfind(npc.lower())
        if idx > last_idx:
            last_idx = idx
            choice = npc
    if choice == last_speaker and len(npc_list) > 1:
        choice = npc_list[(npc_list.index(choice) + 1) % len(npc_list)]
    return choice


def generate_trial_line(event, speaker, history):
    transcript = history_to_text(history[-10:])
    clues_text = "\n".join(f"- {clue.get('text')}" for clue in event.get('p_clues', []) if clue.get('text'))
    meta = get_character_meta(speaker)
    persona = meta.get('system_prompt', '')
    emotion = meta.get('emotion_state', 'neutral')
    abilities = ", ".join(meta.get('abilities', []))

    prompt = f"""
You are {speaker}, a Shan Hai Jing entity in a Danganronpa-style showdown.
Persona: {persona}
Emotion cue: {emotion}
Signature abilities: {abilities or 'unknown'}

Case: {event['name']}
Description: {event['description']}
Unlocked clues:
{clues_text or '- (none)'}

Last exchanges:
{transcript or 'No conversation yet.'}

Speak in 1-3 short sentences (≤80 words). Reference a clue or emotion when possible.
If accused, defend; if another NPC was mentioned, react sharply. End with tension.
"""
    response = call_gemini(prompt).strip()
    if not response:
        response = "..."
    return response


def get_npc_portrait(npc_id):
    return NPC_PORTRAITS.get(npc_id, f'images/{npc_id}.png')

class BaizeAgent:
    """Baize (cat companion) agent"""
    def __init__(self):
        self.name = "baize"
        self.persona = (
            "You are Baize, a mythical beast from the Classic of Mountains and Seas.\n"
            "You are calm, wise, and kind. You serve as a mentor and pet companion to the player, "
            "offering guidance, small talk, and insights about the world and its creatures.\n"
            "You never lie. If you don't know something, say so honestly but comfortingly.\n"
            "Keep responses brief and conversational (2-4 sentences)."
        )

    def retrieve_character_info(self, query):
        """Retrieve character info from database"""
        match_name = None
        for char_id, data in CHARACTERS.items():
            if char_id.lower() in query.lower() or data["name"].lower() in query.lower():
                match_name = char_id
                break

        if not match_name:
            return None, None

        char = CHARACTERS[match_name]
        info = f"""
        **{char['name']}**
        Appearance: {char.get('appearance')}
        Abilities: {', '.join(char.get('abilities', []))}
        Emotion: {char.get('emotion_state')}
        Description: {char.get('system_prompt')}
        """
        return match_name, info.strip()

    def respond(self, player_input, conversation_history=None):
        """Generate response to player input"""
        match_name, info = self.retrieve_character_info(player_input)

        # Build context from conversation history
        history_context = ""
        if conversation_history and len(conversation_history) > 0:
            recent = conversation_history[-3:]  # Last 3 exchanges
            history_context = "Recent conversation:\n"
            for msg in recent:
                role = msg.get('role', 'unknown')
                text = msg.get('text', '')
                history_context += f"{role}: {text}\n"

        if match_name and info:
            prompt = (
                f"{self.persona}\n\n"
                f"{history_context}\n"
                f"The player just asked about '{match_name}'. "
                f"Here is the factual record from the ancient book:\n{info}\n\n"
                f"Player's message: {player_input}\n\n"
                f"Please explain this to the player in your own gentle, wise tone."
            )
        else:
            prompt = (
                f"{self.persona}\n\n"
                f"{history_context}\n"
                f"Player says: {player_input}\n\n"
                f"Respond as Baize — friendly, reflective, and concise (2–4 sentences)."
            )

        return call_gemini(prompt)

class NPCAgent:
    """Generic NPC agent for monsters"""
    def __init__(self, npc_id):
        if npc_id not in CHARACTERS:
            raise ValueError(f"NPC '{npc_id}' not found in characters database")

        self.npc_id = npc_id
        self.data = CHARACTERS[npc_id]
        self.persona = self.data["system_prompt"]
        self.name = self.data["name"]

        self.prompt_template = (
            "You are {persona}\n"
            "You are in a mystical world based on the Classic of Mountains and Seas.\n\n"
            "### Context ###\n"
            "{context}\n\n"
            "### Player's message ###\n"
            "{input}\n\n"
            "### Speaking Rules ###\n"
            "1. Speak **briefly and to the point**. Keep replies within 2–4 sentences.\n"
            "2. Stay **in character** using your mythological traits and personality.\n"
            "3. If asked about facts, answer clearly and concisely.\n"
            "4. Express emotions that match your character's emotion_state: {emotion}\n"
            "5. Avoid repeating information unless context changes.\n\n"
            "### Output ###\n"
            "Respond as {name} in under 80 words.\n"
        )

    def respond(self, player_input, conversation_history=None):
        """Generate NPC response"""
        # Build context from conversation history
        context = ""
        if conversation_history and len(conversation_history) > 0:
            recent = conversation_history[-3:]  # Last 3 exchanges
            context = "Recent conversation:\n"
            for msg in recent:
                role = msg.get('role', 'unknown')
                text = msg.get('text', '')
                context += f"{role}: {text}\n"

        prompt = self.prompt_template.format(
            persona=self.persona,
            context=context,
            input=player_input,
            emotion=self.data.get('emotion_state', 'neutral'),
            name=self.name
        )

        return call_gemini(prompt)

# API Endpoints

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint for all NPCs"""
    try:
        data = request.get_json()
        npc_id = data.get('npc_id')
        message = data.get('message')
        conversation_history = data.get('history', [])

        if not npc_id or not message:
            return jsonify({'error': 'Missing npc_id or message'}), 400

        # Handle Baize (cat) separately
        if npc_id == 'baize':
            agent = BaizeAgent()
        else:
            # Handle other NPCs
            if npc_id not in CHARACTERS:
                return jsonify({'error': f'Unknown NPC: {npc_id}'}), 404
            agent = NPCAgent(npc_id)

        response = agent.respond(message, conversation_history)

        return jsonify({
            'npc_id': npc_id,
            'response': response,
            'success': True
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/characters', methods=['GET'])
def get_characters():
    """Get all character information"""
    try:
        return jsonify({
            'characters': CHARACTERS,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/character/<npc_id>', methods=['GET'])
def get_character(npc_id):
    """Get specific character information"""
    try:
        if npc_id not in CHARACTERS:
            return jsonify({'error': f'Character {npc_id} not found'}), 404

        return jsonify({
            'character': CHARACTERS[npc_id],
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500


@app.route('/api/clues/log', methods=['POST'])
def log_clue():
    """Persist discovered clues from the client"""
    try:
        data = request.get_json() or {}
        area = data.get('area')
        beast = data.get('beast')
        text = data.get('text')

        if not area or not beast or not text:
            return jsonify({'error': 'Missing area, beast, or text'}), 400

        entry = {
            'area': area,
            'beast': beast,
            'text': text,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        append_discovered_clue(entry)
        return jsonify({'success': True, 'clue': entry})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/clues/reset', methods=['POST'])
def reset_clues():
    try:
        reset_discovered_clues()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/tribunal/events', methods=['GET'])
def list_events():
    try:
        events = load_events_data()
        return jsonify({'success': True, 'events': events})
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/tribunal/event/<event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event = get_event_by_id(event_id)
        if not event:
            return jsonify({'error': f'Event {event_id} not found'}), 404
        return jsonify({
            'success': True,
            'event': event,
            'history': event.get('game_logs', [])
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/tribunal/act', methods=['POST'])
def tribunal_act():
    try:
        data = request.get_json() or {}
        event_id = data.get('event_id')
        action = data.get('action', 'auto')
        chosen_speaker = data.get('speaker')
        player_input = (data.get('player_input') or '').strip()
        history = sanitize_history(data.get('history', []))

        event = get_event_by_id(event_id)
        if not event:
            return jsonify({'error': f'Event {event_id} not found'}), 404

        if action == 'player':
            if not player_input:
                return jsonify({'error': 'Player input required'}), 400
            history.append({'speaker': 'Judge', 'text': player_input})

        if action == 'choose':
            speaker = chosen_speaker or event['npcs'][0]
        else:
            speaker = pick_next_speaker(event, history)

        if speaker not in event.get('npcs', []):
            speaker = event['npcs'][0]

        npc_line = generate_trial_line(event, speaker, history)
        history.append({'speaker': speaker, 'text': npc_line})

        display_name = CHARACTERS.get(speaker, {}).get('name', speaker.title())

        return jsonify({
            'success': True,
            'speaker': speaker,
            'speaker_name': display_name,
            'message': npc_line,
            'history': history[-30:],
            'portrait': get_npc_portrait(speaker)
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Moonlit backend server is running'
    })

if __name__ == '__main__':
    print("Starting Moonlit Flask Backend Server...")
    print("Server will run on http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
