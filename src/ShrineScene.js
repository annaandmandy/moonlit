export default class ShrineScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShrineScene' });
    this.areaNames = [
      'Entrance Hall',
      'Forest Shrine',
      'Spirit Garden',
      'Blood Altar',
      'Water Temple',
      'Ancient Library',
      'Mountain Pass',
      'Moonlit Summit'
    ];
    this.worldWidth = 0;
    this.worldHeight = 0;
    this.lastNPC = null;
  }

  preload() {
    // Load player walking animations
    for (let i = 1; i <= 3; i++) {
      this.load.image(`player-down-${i}`, `images/human/Female Character 1_Walking Down_${i}.png`);
      this.load.image(`player-up-${i}`, `images/human/Female Character 1_Walking Up_${i}.png`);
      this.load.image(`player-left-${i}`, `images/human/Female Character 1_Walking Left_${i}.png`);
      this.load.image(`player-right-${i}`, `images/human/Female Character 1_Walking Right_${i}.png`);
    }

    // Load NPC images
    this.load.image('baize', 'images/Baize.png');
    this.load.image('jiuweihu', 'images/jiuweihu.png');

    // Load cat animations (spritesheets trim to single frame 50x50)
    this.load.spritesheet('cat-idle', 'images/Cat-5/Cat-5-Idle.png', {
      frameWidth: 50,
      frameHeight: 50
    });
    this.load.spritesheet('cat-walk', 'images/Cat-5/Cat-5-Walk.png', {
      frameWidth: 50,
      frameHeight: 50
    });
    this.load.image('cat-sitting', 'images/Cat-5/Cat-5-Sitting.png');

    // Load monster images for 8 areas
    this.load.image('bifang', 'images/bifang.png');
    this.load.image('kui', 'images/kui.png');
    this.load.image('qingniao', 'images/qingniao.png');
    this.load.image('qiongqi', 'images/qiongqi.png');
    this.load.image('xiangliu', 'images/xiangliu.png');
    this.load.image('xingxing', 'images/xingxing.png');
    this.load.image('yingzhao', 'images/yingzhao.png');
  }

  create() {
    // 8-area grid map (4 columns x 2 rows)
    this.gridCols = 4;
    this.gridRows = 2;
    this.areaWidth = 28; // tiles per area width (smaller tiles, more detail)
    this.areaHeight = 20; // tiles per area height
    this.gridWidth = this.gridCols * this.areaWidth;
    this.gridHeight = this.gridRows * this.areaHeight;
    this.tileSize = 24;
    this.inputEnabled = true;
    this.worldWidth = this.gridWidth * this.tileSize;
    this.worldHeight = this.gridHeight * this.tileSize;

    // Create 8-area map
    this.createMap();

    // Create player
    this.createPlayer();

    // Create NPCs and monsters
    this.createNPCs();

    // Ensure physics world matches full grid so players can reach every area
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Setup camera - zoom in and follow player
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // Setup controls
    this.setupControls();

    // Story intro
    this.startIntroSequence();
  }

  createMap() {
    this.walls = this.physics.add.staticGroup();

    // Create floor with 8 different colored areas
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        // Determine which area this tile belongs to
        const areaCol = Math.floor(x / this.areaWidth);
        const areaRow = Math.floor(y / this.areaHeight);
        const areaIndex = areaRow * this.gridCols + areaCol;

        // Get color for this area
        const areaColor = this.getAreaColor(areaIndex);

        const floor = this.add.rectangle(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          areaColor
        );
        floor.setStrokeStyle(1, 0x1c2833);
      }
    }

    // Create walls only around world border (no walls between areas)
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        // Walls only at world border
        const isWorldBorder = x === 0 || x === this.gridWidth - 1 || y === 0 || y === this.gridHeight - 1;

        if (isWorldBorder) {
          const wall = this.add.rectangle(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            0x1c1c1c
          );
          this.walls.add(wall);
        }
      }
    }
  }

  getAreaColor(areaIndex) {
    const colors = [
      0xFF6B9D,  // Pink - Area 1
      0x4ECDC4,  // Teal - Area 2
      0xFFE66D,  // Yellow - Area 3
      0xA8E6CF,  // Mint green - Area 4
      0xFF8B94,  // Coral - Area 5
      0xB4A7D6,  // Lavender - Area 6
      0xFDCB82,  // Peach - Area 7
      0x95E1D3   // Aqua - Area 8
    ];
    return colors[areaIndex] || 0x2c3e50;
  }

  createPlayer() {
    // Create player sprite - start in first area (pink area)
    const startX = (this.areaWidth / 2 + 2) * this.tileSize; // Slightly offset from center
    const startY = (this.areaHeight / 2) * this.tileSize;

    this.player = this.add.sprite(startX, startY, 'player-down-1');
    this.player.setScale(2);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    // Tighten collision bounds to match smaller tiles
    this.player.body.setSize(this.player.width * 0.35, this.player.height * 0.55);
    this.player.body.setOffset(this.player.width * 0.15, this.player.height * 0.2);

    // Create player animations
    this.anims.create({
      key: 'walk-down',
      frames: [
        { key: 'player-down-1' },
        { key: 'player-down-2' },
        { key: 'player-down-3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'walk-up',
      frames: [
        { key: 'player-up-1' },
        { key: 'player-up-2' },
        { key: 'player-up-3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'walk-left',
      frames: [
        { key: 'player-left-1' },
        { key: 'player-left-2' },
        { key: 'player-left-3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'walk-right',
      frames: [
        { key: 'player-right-1' },
        { key: 'player-right-2' },
        { key: 'player-right-3' }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  createNPCs() {
    // Cat companion (Baize in disguise) - starts in center of first area
    const startAreaCol = 0;
    const startAreaRow = 0;
    const catX = (startAreaCol * this.areaWidth + this.areaWidth / 2) * this.tileSize;
    const catY = (startAreaRow * this.areaHeight + this.areaHeight / 2) * this.tileSize;

    this.cat = this.add.sprite(catX, catY, 'cat-idle', 0);
    this.cat.setScale(0.9);
    this.physics.add.existing(this.cat);
    this.cat.body.setCollideWorldBounds(true);
    this.cat.npcId = 'baize';
    this.cat.npcName = 'Baize';

    // Cat animations
    this.anims.create({
      key: 'cat-walk-anim',
      frames: this.anims.generateFrameNumbers('cat-walk', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'cat-idle-anim',
      frames: this.anims.generateFrameNumbers('cat-idle', { start: 0, end: 9 }),
      frameRate: 6,
      repeat: -1
    });
    this.cat.anims.play('cat-idle-anim');

    // Monster data for 8 areas
    const monsters = [
      { key: 'bifang', name: 'Bifang', id: 'bifang' },
      { key: 'kui', name: 'Kui', id: 'kui' },
      { key: 'qingniao', name: 'Qingniao', id: 'qingniao' },
      { key: 'qiongqi', name: 'Qiongqi', id: 'qiongqi' },
      { key: 'xiangliu', name: 'Xiangliu', id: 'xiangliu' },
      { key: 'xingxing', name: 'Xingxing', id: 'xingxing' },
      { key: 'yingzhao', name: 'Yingzhao', id: 'yingzhao' },
      { key: 'jiuweihu', name: 'Nine-Tail Fox', id: 'jiuweihu' }
    ];

    // Place one monster in each area
    this.npcs = [this.cat];
    this.monsters = [];

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const areaIndex = row * this.gridCols + col;
        const monster = monsters[areaIndex];

        // Calculate center position of this area
        const centerX = (col * this.areaWidth + this.areaWidth / 2) * this.tileSize;
        const centerY = (row * this.areaHeight + this.areaHeight / 2) * this.tileSize;

        // Create monster sprite at the area's center
        const monsterSprite = this.add.sprite(centerX, centerY, monster.key);

        // Set display size around 1 tile
        monsterSprite.setDisplaySize(100, 100);

        this.physics.add.existing(monsterSprite);
        // Don't make monsters immovable - they shouldn't block player movement
        monsterSprite.body.setImmovable(false);
        // Disable collision for monsters so players can walk through them
        monsterSprite.body.setCollideWorldBounds(false);

        monsterSprite.npcId = monster.id;
        monsterSprite.npcName = monster.name;

        this.npcs.push(monsterSprite);
        this.monsters.push(monsterSprite);
      }
    }
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      catInteract: Phaser.Input.Keyboard.KeyCodes.V,
      map: Phaser.Input.Keyboard.KeyCodes.M
    });

    // Collision
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.cat, this.walls);

    // Action menu state
    this.actionMenuVisible = false;

    // Map toggle state
    this.mapVisible = false;

    // 8-area map colors (4x2 grid)
    this.areaColors = [
      0xFF6B9D,  // Pink - Area 1
      0x4ECDC4,  // Teal - Area 2
      0xFFE66D,  // Yellow - Area 3
      0xA8E6CF,  // Mint green - Area 4
      0xFF8B94,  // Coral - Area 5
      0xB4A7D6,  // Lavender - Area 6
      0xFDCB82,  // Peach - Area 7
      0x95E1D3   // Aqua - Area 8
    ];
  }

  update() {
    if (!this.inputEnabled) {
      this.player.body.setVelocity(0);
      this.player.anims.stop();
      this.cat.body.setVelocity(0);
      return;
    }

    const speed = 150;
    this.player.body.setVelocity(0);

    // Player movement
    if (this.wasd.left.isDown || this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.anims.play('walk-left', true);
    } else if (this.wasd.right.isDown || this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.anims.play('walk-right', true);
    } else if (this.wasd.up.isDown || this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      this.player.anims.play('walk-up', true);
    } else if (this.wasd.down.isDown || this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      this.player.anims.play('walk-down', true);
    } else {
      this.player.anims.stop();
    }

    // Update cat to follow player
    this.updateCatFollow();

    // Check for NPC interaction (E key for statues)
    if (Phaser.Input.Keyboard.JustDown(this.wasd.interact)) {
      this.checkNPCInteraction();
    }

    // Check for cat interaction (V key for cat)
    if (Phaser.Input.Keyboard.JustDown(this.wasd.catInteract)) {
      this.checkCatInteraction();
    }

    // Toggle map with M key
    if (Phaser.Input.Keyboard.JustDown(this.wasd.map)) {
      this.toggleMap();
    }
  }

  updateCatFollow() {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.cat.x, this.cat.y);
    const followDistance = 100;

    if (dist > followDistance) {
      const speed = 100;
      const angle = Phaser.Math.Angle.Between(this.cat.x, this.cat.y, this.player.x, this.player.y);
      this.cat.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
      this.cat.anims.play('cat-walk-anim', true);
    } else {
      this.cat.body.setVelocity(0);
      this.cat.anims.play('cat-idle-anim', true);
    }
  }

  checkNPCInteraction() {
    const interactDistance = 80;
    let closestNPC = null;
    let closestDistance = interactDistance;

    // Find the closest NPC within interaction distance (excluding cat)
    for (const npc of this.npcs) {
      if (npc === this.cat) continue; // Skip the cat

      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        npc.x, npc.y
      );

      if (dist < closestDistance) {
        closestDistance = dist;
        closestNPC = npc;
      }
    }

    // Interact with the closest NPC if found
    if (closestNPC) {
      this.currentNPC = closestNPC.npcId;
      this.openDialogue(closestNPC.npcName, closestNPC.npcId);
    }
  }

  checkCatInteraction() {
    const interactDistance = 80;
    const dist = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.cat.x, this.cat.y
    );

    if (dist < interactDistance) {
      this.showActionMenu();
    }
  }

  openDialogue(npcName, npcId) {
    const dialogueBox = document.getElementById('dialogue-box');
    const npcNameElement = document.getElementById('npc-name');
    const npcPortrait = document.getElementById('npc-portrait');
    const chatHistory = document.getElementById('chat-history');

    // Set NPC name
    npcNameElement.textContent = npcName;

    // Set NPC portrait
    const portraits = {
      'baize': { src: 'images/Baize.png', alt: 'Baize' },
      'bifang': { src: 'images/bifang.png', alt: 'Bifang' },
      'kui': { src: 'images/kui.png', alt: 'Kui' },
      'qingniao': { src: 'images/qingniao.png', alt: 'Qingniao' },
      'qiongqi': { src: 'images/qiongqi.png', alt: 'Qiongqi' },
      'xiangliu': { src: 'images/xiangliu.png', alt: 'Xiangliu' },
      'xingxing': { src: 'images/xingxing.png', alt: 'Xingxing' },
      'yingzhao': { src: 'images/yingzhao.png', alt: 'Yingzhao' },
      'jiuweihu': { src: 'images/jiuweihu.png', alt: 'Nine-Tail Fox' }
    };

    const portrait = portraits[npcId];
    if (portrait) {
      npcPortrait.src = portrait.src;
      npcPortrait.alt = portrait.alt;
    }

    dialogueBox.classList.remove('hidden');

    // Clear chat history if switching to a different NPC
    if (this.currentNPC !== this.lastNPC) {
      chatHistory.innerHTML = '';
      this.lastNPC = this.currentNPC;
    }

    // Add initial greeting if first time with this NPC
    if (chatHistory.children.length === 0) {
      const greeting = this.getGreeting(npcId);
      this.addNPCMessage(greeting);
    }

    // Pause game
    this.disableInput();
    this.scene.pause();
  }

  getGreeting(npcId) {
    const greetings = {
      'baize': "The moonlight shivers... I am Baize, your companion and living bestiary. I've catalogued every monster in this shrine and will guide you through this investigation.",
      'bifang': "*The one-legged bird watches with a fiery gaze* I am Bifang, herald of flames.",
      'kui': "*A thunderous presence fills the air* Kui speaks. Few mortals dare approach.",
      'qingniao': "*Melodious chirping* Qingniao greets you, messenger of the west.",
      'qiongqi': "*A menacing growl* Qiongqi does not welcome uninvited guests...",
      'xiangliu': "*Nine serpent heads hiss in unison* Xiangliu observes your courage... or foolishness.",
      'xingxing': "*Mischievous laughter echoes* Xingxing at your service! What brings you here?",
      'yingzhao': "*Majestic wings unfold* I am Yingzhao, guardian of the eastern winds.",
      'jiuweihu': "*The fox's eyes gleam crimson* Welcome, mortal. You seek the truth of the bleeding altar?"
    };
    return greetings[npcId] || "...";
  }

  addNPCMessage(text) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'npc-message';
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  disableInput() {
    this.inputEnabled = false;
  }

  enableInput() {
    this.inputEnabled = true;
  }

  showActionMenu() {
    if (this.actionMenuVisible) return;

    this.actionMenuVisible = true;
    this.disableInput();

    // Show DOM-based action menu
    const actionMenu = document.getElementById('cat-action-menu');
    actionMenu.classList.remove('hidden');

    // Setup button event listeners
    const memoryBookBtn = document.getElementById('action-memory-book');
    const talkBtn = document.getElementById('action-talk');
    const settingsBtn = document.getElementById('action-settings');

    memoryBookBtn.onclick = () => this.handleActionMenuChoice('Memory Book');
    talkBtn.onclick = () => this.handleActionMenuChoice('Talk');
    settingsBtn.onclick = () => this.handleActionMenuChoice('Settings');

    // ESC key to close
    this.actionMenuEscHandler = (e) => {
      if (e.key === 'Escape') {
        this.hideActionMenu();
      }
    };
    document.addEventListener('keydown', this.actionMenuEscHandler);
  }

  handleActionMenuChoice(choice) {
    this.hideActionMenu();

    if (choice === 'Talk') {
      // Open dialogue with cat/Baize
      this.currentNPC = 'baize';
      this.openDialogue('Baize', 'baize');
    } else if (choice === 'Memory Book') {
      // TODO: Implement memory book
      console.log('Memory Book clicked');
    } else if (choice === 'Settings') {
      // TODO: Implement settings
      console.log('Settings clicked');
    }
  }

  hideActionMenu() {
    if (!this.actionMenuVisible) return;

    this.actionMenuVisible = false;
    this.enableInput();

    // Hide DOM-based action menu
    const actionMenu = document.getElementById('cat-action-menu');
    actionMenu.classList.add('hidden');

    // Remove event listener
    if (this.actionMenuEscHandler) {
      document.removeEventListener('keydown', this.actionMenuEscHandler);
      this.actionMenuEscHandler = null;
    }
  }

  toggleMap() {
    if (!this.mapVisible) {
      // Show map
      this.showMap();
    } else {
      // Hide map
      this.hideMap();
    }
  }

  showMap() {
    if (this.mapVisible) return;
    this.mapVisible = true;

    const viewWidth = this.scale.width;
    const viewHeight = this.scale.height;
    const worldWidth = this.worldWidth || this.gridWidth * this.tileSize;
    const worldHeight = this.worldHeight || this.gridHeight * this.tileSize;

    // Dim the background
    this.mapOverlay = this.add.graphics();
    this.mapOverlay.setScrollFactor(0);
    this.mapOverlay.setDepth(1000);
    this.mapOverlay.fillStyle(0x000000, 0.8);
    this.mapOverlay.fillRect(0, 0, viewWidth, viewHeight);

    const panelWidth = Math.min(viewWidth * 0.85, 780);
    const panelHeight = Math.min(viewHeight * 0.85, 560);
    const panelX = (viewWidth - panelWidth) / 2;
    const panelY = (viewHeight - panelHeight) / 2;
    const panelPadding = 28;
    const headerHeight = 60;
    const footerHeight = 90;
    const usableWidth = panelWidth - panelPadding * 2;
    const usableHeight = panelHeight - panelPadding * 2 - headerHeight - footerHeight;
    const worldRatio = worldWidth / worldHeight;

    const mapMargin = 20;
    let mapWidth = usableWidth - mapMargin * 2;
    let mapHeight = mapWidth / worldRatio;
    if (mapHeight > usableHeight - mapMargin * 2) {
      mapHeight = usableHeight - mapMargin * 2;
      mapWidth = mapHeight * worldRatio;
    }

    const mapX = panelX + panelPadding + mapMargin + (usableWidth - mapMargin * 2 - mapWidth) / 2;
    const mapY = panelY + panelPadding + headerHeight + mapMargin / 2 + (usableHeight - mapMargin * 2 - mapHeight) / 2;
    const miniAreaWidth = mapWidth / this.gridCols;
    const miniAreaHeight = mapHeight / this.gridRows;

    this.mapPanel = this.add.graphics();
    this.mapPanel.setScrollFactor(0);
    this.mapPanel.setDepth(1001);
    this.mapPanel.fillStyle(0x0f1424, 0.95);
    this.mapPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 18);
    this.mapPanel.lineStyle(3, 0xffd700, 0.7);
    this.mapPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 18);

    this.mapTitle = this.add.text(
      panelX + panelWidth / 2,
      panelY + 35,
      'Shrine Grounds',
      { fontSize: '28px', fill: '#ffd700', fontStyle: 'bold' }
    );
    this.mapTitle.setOrigin(0.5);
    this.mapTitle.setScrollFactor(0);
    this.mapTitle.setDepth(1002);

    // Draw the detailed map
    this.mapBackground = this.add.graphics();
    this.mapBackground.setScrollFactor(0);
    this.mapBackground.setDepth(1002);
    this.mapBackground.fillStyle(0x070a12, 0.85);
    this.mapBackground.fillRoundedRect(
      mapX - mapMargin / 2,
      mapY - mapMargin / 2,
      mapWidth + mapMargin,
      mapHeight + mapMargin,
      12
    );
    this.mapBackground.lineStyle(2, 0x25304d, 0.9);
    this.mapBackground.strokeRoundedRect(
      mapX - mapMargin / 2,
      mapY - mapMargin / 2,
      mapWidth + mapMargin,
      mapHeight + mapMargin,
      12
    );

    this.mapGraphics = this.add.graphics();
    this.mapGraphics.setScrollFactor(0);
    this.mapGraphics.setDepth(1002);
    this.mapAreaLabels = [];

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const areaIndex = row * this.gridCols + col;
        const drawX = mapX + col * miniAreaWidth;
        const drawY = mapY + row * miniAreaHeight;

        const fillColor = this.areaColors && this.areaColors[areaIndex] !== undefined
          ? this.areaColors[areaIndex]
          : 0x2c3e50;

        this.mapGraphics.fillStyle(fillColor, 0.85);
        this.mapGraphics.fillRect(drawX, drawY, miniAreaWidth, miniAreaHeight);

        this.mapGraphics.lineStyle(2, 0xffffff, 0.8);
        this.mapGraphics.strokeRect(drawX, drawY, miniAreaWidth, miniAreaHeight);

        const label = this.add.text(
          drawX + miniAreaWidth / 2,
          drawY + miniAreaHeight / 2,
          this.areaNames[areaIndex] || `Area ${areaIndex + 1}`,
          {
            fontSize: '18px',
            fill: '#0a0015',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: miniAreaWidth - 20 }
          }
        );
        label.setOrigin(0.5);
        label.setScrollFactor(0);
        label.setDepth(1003);
        this.mapAreaLabels.push(label);
      }
    }

    // Fine tile grid lines for a classic RPG feel
    const totalTilesX = this.gridCols * this.areaWidth;
    const totalTilesY = this.gridRows * this.areaHeight;

    this.mapGraphics.lineStyle(1, 0xffffff, 0.12);
    for (let i = 1; i < totalTilesX; i++) {
      const normalized = i / totalTilesX;
      const lineX = mapX + normalized * mapWidth;
      this.mapGraphics.lineBetween(lineX, mapY, lineX, mapY + mapHeight);
    }

    this.mapGraphics.lineStyle(1, 0xffffff, 0.12);
    for (let j = 1; j < totalTilesY; j++) {
      const normalized = j / totalTilesY;
      const lineY = mapY + normalized * mapHeight;
      this.mapGraphics.lineBetween(mapX, lineY, mapX + mapWidth, lineY);
    }

    const projectToMiniMap = (worldX, worldY) => {
      const normalizedX = Phaser.Math.Clamp(worldX / worldWidth, 0, 1);
      const normalizedY = Phaser.Math.Clamp(worldY / worldHeight, 0, 1);
      return {
        x: mapX + normalizedX * mapWidth,
        y: mapY + normalizedY * mapHeight
      };
    };

    // Player marker
    const playerPoint = projectToMiniMap(this.player.x, this.player.y);
    this.mapGraphics.fillStyle(0xfff06a, 1);
    this.mapGraphics.fillCircle(playerPoint.x, playerPoint.y, 5);

    // Cat companion marker
    const catPoint = projectToMiniMap(this.cat.x, this.cat.y);
    this.mapGraphics.fillStyle(0xffffff, 1);
    this.mapGraphics.fillCircle(catPoint.x, catPoint.y, 4);

    // Monster markers
    this.monsters.forEach((monster) => {
      const monsterPoint = projectToMiniMap(monster.x, monster.y);
      this.mapGraphics.fillStyle(0xdc143c, 1);
      this.mapGraphics.fillCircle(monsterPoint.x, monsterPoint.y, 3);
    });

    this.mapInstructions = this.add.text(
      panelX + panelWidth / 2,
      panelY + panelPadding + headerHeight - 20,
      'Press M to close map',
      { fontSize: '20px', fill: '#f0f0f0' }
    );
    this.mapInstructions.setOrigin(0.5);
    this.mapInstructions.setScrollFactor(0);
    this.mapInstructions.setDepth(1003);

    const legendText = [
      'Legend',
      '- Yellow: You',
      '- White: Baize',
      '- Crimson: Monsters'
    ].join('\n');

    this.mapLegendText = this.add.text(
      panelX + panelWidth / 2,
      panelY + panelHeight - footerHeight / 2,
      legendText,
      { fontSize: '18px', fill: '#ffffff', align: 'center' }
    );
    this.mapLegendText.setOrigin(0.5);
    this.mapLegendText.setScrollFactor(0);
    this.mapLegendText.setDepth(1003);
  }

  hideMap() {
    if (!this.mapVisible) return;

    this.mapVisible = false;

    if (this.mapOverlay) {
      this.mapOverlay.destroy();
      this.mapOverlay = null;
    }

    if (this.mapPanel) {
      this.mapPanel.destroy();
      this.mapPanel = null;
    }

    if (this.mapBackground) {
      this.mapBackground.destroy();
      this.mapBackground = null;
    }

    if (this.mapGraphics) {
      this.mapGraphics.destroy();
      this.mapGraphics = null;
    }

    if (this.mapInstructions) {
      this.mapInstructions.destroy();
      this.mapInstructions = null;
    }

    if (this.mapTitle) {
      this.mapTitle.destroy();
      this.mapTitle = null;
    }

    if (this.mapLegendText) {
      this.mapLegendText.destroy();
      this.mapLegendText = null;
    }

    if (this.mapAreaLabels) {
      this.mapAreaLabels.forEach((label) => label.destroy());
      this.mapAreaLabels = null;
    }
  }

  startIntroSequence() {
    const introOverlay = document.getElementById('intro-overlay');
    const beginButton = document.getElementById('intro-begin');

    if (!introOverlay || !beginButton) {
      this.enableInput();
      return;
    }

    this.disableInput();
    introOverlay.classList.remove('hidden');

    const handleBegin = () => {
      introOverlay.classList.add('hidden');
      beginButton.removeEventListener('click', handleBegin);
      this.currentNPC = 'baize';
      this.lastNPC = null;
      this.openDialogue('Baize', 'baize');
    };

    beginButton.addEventListener('click', handleBegin);
  }
}
