# Moon Eclipse Trial - Game Features

## Implemented Features

### 1. Larger Game Scene
- Game canvas increased to **1280x720** pixels
- Massive world map: **80x60 tiles** (2560x1920 pixels total)

### 2. Player Character with Walking Animations
- Female character sprite with 4-directional walking animations
- **WASD** movement controls with smooth animations
- Walking animations for: Up, Down, Left, Right directions

### 3. Eight Distinct Areas
The game world is divided into 8 themed regions:
1. **Entrance Hall** (Dark blue-gray) - Starting area
2. **Forest Shrine** (Dark green) - Where Baize resides
3. **Spirit Garden** (Purple) - Mystical area
4. **Blood Altar** (Dark red) - Central altar location
5. **Water Temple** (Deep blue) - Water pools and reflections
6. **Ancient Library** (Brown) - Bookshelves and knowledge
7. **Mountain Pass** (Gray) - Rocky terrain, Nine-Tail Fox location
8. **Sacred Grove** (Teal) - Trees and nature

### 4. Three NPCs

#### Baize (Forest Shrine)
- Wise keeper of knowledge
- Golden aura effect
- Knowledgeable about the blood moon ritual

#### Nine-Tail Fox (Mountain Pass)
- Cunning and playful
- Crimson aura effect
- Deals in bargains and mysteries

#### Mysterious Cat (Entrance Hall)
- Special interactive menu
- Animated idle behaviors
- Three interaction modes: Talk, Play, Read Memory

### 5. Complex Obstacles
The world includes various obstacles:
- **Tables** - Wooden tables in Entrance Hall
- **Boxes** - Stacked crates
- **Pillars** - Stone columns in Forest Shrine
- **Bookshelves** - Library furniture in Ancient Library
- **Rocks** - Natural formations in Mountain Pass
- **Trees** - Living trees in Sacred Grove
- **Water Pools** - Shimmering water in Water Temple

### 6. Enhanced Dialogue System
- **NPC Portraits** - Character images displayed next to dialogue
- Portrait changes based on which NPC you're talking to
- Contextual responses based on keywords
- Memory system (stores conversation history)

### 7. Cat Interaction Menu
When you press **E** near the cat, you get three options:
- **Talk** - Opens dialogue with the cat
- **Play** - Cat plays with you (animation)
- **Read Memory** - View conversation history with timestamps

### 8. World Map (Press M)
- Shows all 8 areas with color coding
- Displays your current location
- Shows NPC locations
- Press **M** or **Esc** to close

### 9. Fixed Keyboard Conflicts
- **WASD** and **E** keys work normally when typing in dialogue
- Game movement is disabled during dialogue/menus
- Event propagation properly handled to prevent conflicts

## Controls

| Key | Action |
|-----|--------|
| **W** | Move Up |
| **A** | Move Left |
| **S** | Move Down |
| **D** | Move Right |
| **E** | Interact with NPCs |
| **Space** | Jump |
| **M** | Toggle Map |
| **Enter** | Send message (in dialogue) |
| **Esc** | Close dialogue/menu/map |

## How to Run

```bash
npm install
npm start
```

Then open http://localhost:8080

## Game Features to Explore

1. **Explore all 8 areas** - Each has unique visuals and obstacles
2. **Talk to Baize** - Ask about the altar, moon, truth, or murder
3. **Visit Nine-Tail Fox** - Discover her mysterious perspective
4. **Interact with the Cat** - Try all three menu options
5. **Use the Map** - Press M to see where you are and where NPCs are located
6. **Test the obstacles** - Navigate around tables, boxes, pillars, rocks, and trees

## Future Expansion Ideas

- Connect to real AI backend for dynamic NPC conversations
- Add more NPC portraits with different emotions
- Expand cat memory to include visual timeline
- Add inventory system
- Create quest/investigation mechanics
- Add sound effects and background music
