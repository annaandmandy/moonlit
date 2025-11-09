# Moonlit Backend Server

Flask-based backend server for the Moonlit game, providing AI-powered NPC dialogue using Google Gemini API.

## Features

- **AI-Powered NPCs**: Each monster and Baize (cat companion) uses Google Gemini to generate contextual, character-specific responses
- **Character Database**: Integrated with characters.json for authentic mythological personalities
- **Conversation History**: Maintains context across dialogue exchanges
- **CORS Enabled**: Ready for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Key

Open `app.py` and replace the API key on line 10:

```python
genai.configure(api_key="YOUR_GOOGLE_GEMINI_API_KEY")
```

To get a free Google Gemini API key:
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy and paste it into the app.py file

### 3. Run the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/chat
Send a message to an NPC and get a response.

**Request Body:**
```json
{
  "npc_id": "baize",
  "message": "Tell me about the blood moon",
  "history": [
    {"role": "player", "text": "Hello"},
    {"role": "npc", "text": "Greetings, traveler..."}
  ]
}
```

**Response:**
```json
{
  "npc_id": "baize",
  "response": "The blood moon rises when divine truth is wounded...",
  "success": true
}
```

### GET /api/characters
Get all character information from the database.

### GET /api/character/<npc_id>
Get specific character information.

### GET /api/health
Health check endpoint.

## Supported NPCs

- **baize**: Wise cat companion, mentor figure
- **bifang**: One-legged fire bird
- **kui**: Thunder beast
- **qingniao**: Blue bird messenger
- **qiongqi**: Fierce beast
- **xiangliu**: Nine-headed serpent
- **xingxing**: Mischievous creature
- **yingzhao**: Celestial courier
- **jiuweihu**: Nine-tailed fox

## Character Personalities

Each NPC has unique traits defined in `characters.json`:
- **System Prompt**: Defines personality and speaking style
- **Emotion State**: Current emotional context
- **Abilities**: Special powers that influence responses
- **Relationships**: How they feel about other characters
- **Memories**: Event-specific knowledge

## Development

The backend uses:
- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Google Generative AI**: Gemini API for AI responses

## Troubleshooting

**Error: "HTTP error! status: 500"**
- Check if the Gemini API key is valid
- Ensure characters.json exists in the backend directory

**Error: "Failed to fetch"**
- Make sure the Flask server is running
- Check that the server is on port 5000
- Verify CORS is enabled

**NPCs give generic responses**
- Check characters.json has complete data for the NPC
- Ensure conversation history is being passed correctly
