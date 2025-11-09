// Dialogue system handler
export class DialogueSystem {
  constructor(scene) {
    this.scene = scene;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const playerInput = document.getElementById('player-input');
    const closeButton = document.getElementById('close-dialogue');

    // Handle Enter key to send message (only when not holding Shift)
    playerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
      // Stop event propagation to prevent game controls from triggering
      e.stopPropagation();
    });

    // Prevent WASD and E from being captured by game when typing
    playerInput.addEventListener('keypress', (e) => {
      e.stopPropagation();
    });

    playerInput.addEventListener('keyup', (e) => {
      e.stopPropagation();
    });

    // Handle Escape key to close dialogue
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const dialogueBox = document.getElementById('dialogue-box');
        if (!dialogueBox.classList.contains('hidden')) {
          this.closeDialogue();
        }
      }
    });

    // Handle close button click
    closeButton.addEventListener('click', () => {
      this.closeDialogue();
    });
  }

  sendMessage() {
    const playerInput = document.getElementById('player-input');
    const message = playerInput.value.trim();

    if (message === '') return;

    // Add player message to chat
    this.addPlayerMessage(message);

    // Clear input
    playerInput.value = '';

    // Get NPC reply
    this.getNPCReply(message);
  }

  addPlayerMessage(text) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'player-message';
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  addNPCMessage(text) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'npc-message';
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  async getNPCReply(playerMessage) {
    const currentNPC = this.scene.currentNPC;

    // Get conversation history from chat
    const history = this.getConversationHistory();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Call Flask backend API
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          npc_id: currentNPC,
          message: playerMessage,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Remove typing indicator
      this.hideTypingIndicator();

      if (data.success && data.response) {
        this.addNPCMessage(data.response);
      } else {
        this.addNPCMessage('*silence*');
      }
    } catch (error) {
      console.error('Error fetching NPC reply:', error);
      // Remove typing indicator
      this.hideTypingIndicator();
      // Fallback to mock reply if backend is unavailable
      const reply = this.generateMockReply(currentNPC, playerMessage);
      this.addNPCMessage(reply);
    }
  }

  getConversationHistory() {
    // Get recent conversation history from the chat
    const chatHistory = document.getElementById('chat-history');
    const messages = chatHistory.querySelectorAll('.player-message, .npc-message');
    const history = [];

    messages.forEach((msg) => {
      const isPlayer = msg.classList.contains('player-message');
      history.push({
        role: isPlayer ? 'player' : 'npc',
        text: msg.textContent
      });
    });

    return history;
  }

  showTypingIndicator() {
    const chatHistory = document.getElementById('chat-history');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'npc-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.textContent = '...';
    chatHistory.appendChild(typingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  hideTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
      typingDiv.remove();
    }
  }

  generateMockReply(npc, message) {
    const lowerMessage = message.toLowerCase();

    const baizeReplies = {
      'altar': "The altar bleeds when divine truth is wounded. Someone... or something... has committed sacrilege.",
      'moon': "The moon remembers what mortals forget. Tonight it reveals all secrets.",
      'truth': "Truth is a blade that cuts both ways. Are you prepared to wield it?",
      'murder': "A god was slain on holy ground. The heavens themselves weep crimson.",
      'help': "I am Baize, keeper of knowledge. I document all creatures, all mysteries. What troubles you?",
      'cat': "*purrs softly* I may look like a simple cat, but I am Baize, in feline form. The blood moon requires... discretion.",
      'shrine': "Each shrine in this realm holds fragments of truth. Explore them all to understand what transpired.",
      'default': "Interesting... the threads of fate twist around your words."
    };

    const foxReplies = {
      'altar': "That altar? Drenched in divine blood. Quite the spectacle, wouldn't you say?",
      'moon': "The blood moon is my favorite time. Everything hidden comes to light... eventually.",
      'truth': "Truth is such a flexible concept. Whose truth are we seeking?",
      'murder': "Murder implies wrongdoing. Perhaps it was... justice?",
      'help': "Help? How delightfully mortal. I deal in bargains, not charity.",
      'baize': "*laughs* That fluffy creature following you? More than meets the eye, I assure you.",
      'default': "How curious you are... like a moth to crimson flame."
    };

    if (npc === 'baize') {
      for (const [key, reply] of Object.entries(baizeReplies)) {
        if (lowerMessage.includes(key)) return reply;
      }
      return baizeReplies.default;
    } else if (npc === 'jiuweihu') {
      for (const [key, reply] of Object.entries(foxReplies)) {
        if (lowerMessage.includes(key)) return reply;
      }
      return foxReplies.default;
    }

    return "...";
  }

  closeDialogue() {
    const dialogueBox = document.getElementById('dialogue-box');
    const chatHistory = document.getElementById('chat-history');
    const playerInput = document.getElementById('player-input');

    dialogueBox.classList.add('hidden');
    chatHistory.innerHTML = '';
    playerInput.value = '';

    // Resume game
    this.scene.enableInput();
    this.scene.scene.resume();
  }
}
