from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
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
