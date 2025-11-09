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
    this.currentSceneKey = null;
    this.sceneConfigs = {};
    this.preloadedClues = [];
    this.preloadedClueData = null;
  }

  init(data) {
    this.pendingSceneKey = data?.targetScene;
    this.preloadedClues = data?.discoveredClues || window.__GLOBAL_DISCOVERED_CLUES || [];
    this.preloadedClueData = data?.allCluesData || window.__GLOBAL_CLUE_DATA || null;
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
    this.load.spritesheet('clue-fire', 'images/fire_animation2.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.image('corpse', 'images/corpse.png');

    // Load monster images for 8 areas
    this.load.image('bifang', 'images/bifang.png');
    this.load.image('kui', 'images/kui.png');
    this.load.image('qingniao', 'images/qingniao.png');
    this.load.image('qiongqi', 'images/qiongqi.png');
    this.load.image('xiangliu', 'images/xiangliu.png');
    this.load.image('xingxing', 'images/xingxing.png');
    this.load.image('yingzhao', 'images/yingzhao.png');
  }

  setupSceneConfigs() {
    this.sceneConfigs = {
      qingqiuVillage: {
        key: 'qingqiuVillage',
        displayName: 'Qingqiu Village (Crime Scene)',
        summary: 'Investigate Aqi’s bloodless death beneath the eclipse.',
        gridCols: 2,
        gridRows: 1,
        areaWidth: 24,
        areaHeight: 18,
        tileSize: 24,
        areaNames: ['Qingqiu Village', 'Eastern Path'],
        areaColors: [0x1b1f34, 0x101524],
        backgroundColor: '#050712',
        cameraZoom: 3.8,
        playerStart: { areaIndex: 0, tileX: 10, tileY: 9 },
        catStart: { areaIndex: 0, tileX: 8, tileY: 11 },
        clueAreas: ['Qingqiu Village'],
        clueSpawns: {
          'Qingqiu Village': [
            { areaIndex: 0, tileX: 12, tileY: 8 },
            { areaIndex: 0, tileX: 7, tileY: 12 },
            { areaIndex: 0, tileX: 16, tileY: 10 }
          ]
        },
        corpse: {
          texture: 'corpse',
          areaIndex: 0,
          tileX: 11,
          tileY: 9,
          scale: 0.4
        },
        corpseClueIndex: 2,
        ambientFog: 0x050607,
        spawnMonsters: false,
        showGridTiles: false
      },
      shrineGrounds: {
        key: 'shrineGrounds',
        displayName: 'Moonlit Shrine Grounds',
        summary: 'Explore the eight sanctums of the Moon Eclipse Trial.',
        gridCols: 4,
        gridRows: 2,
        areaWidth: 28,
        areaHeight: 20,
        tileSize: 24,
        areaNames: [
          'Entrance Hall',
          'Forest Shrine',
          'Spirit Garden',
          'Blood Altar',
          'Water Temple',
          'Ancient Library',
          'Mountain Pass',
          'Moonlit Summit'
        ],
        areaColors: [
          0xFF6B9D,
          0x4ECDC4,
          0xFFE66D,
          0xA8E6CF,
          0xFF8B94,
          0xB4A7D6,
          0xFDCB82,
          0x95E1D3
        ],
        backgroundColor: '#0a0015',
        cameraZoom: 2.5,
        playerStart: { areaIndex: 0, tileX: 14, tileY: 10 },
        catStart: { areaIndex: 0, tileX: 12, tileY: 10 },
        clueAreas: [
          'Entrance Hall',
          'Forest Shrine',
          'Spirit Garden',
          'Blood Altar',
          'Water Temple',
          'Ancient Library',
          'Mountain Pass',
          'Moonlit Summit'
        ],
        spawnMonsters: true,
        showGridTiles: false
      },
      councilChamber: {
        key: 'councilChamber',
        displayName: 'Moonlit Tribunal',
        summary: 'Convene every eyewitness and spirit to debate the culprit.',
        gridCols: 1,
        gridRows: 1,
        areaWidth: 24,
        areaHeight: 18,
        tileSize: 24,
        areaNames: ['Council Hall'],
        areaColors: [0x1f1230],
        backgroundColor: '#150820',
        cameraZoom: 3.2,
        playerStart: { areaIndex: 0, tileX: 12, tileY: 10 },
        catStart: { areaIndex: 0, tileX: 10, tileY: 11 },
        clueAreas: [],
        spawnMonsters: false,
        extraNPCs: [
          { npcId: 'bifang', npcName: 'Bifang', texture: 'bifang', areaIndex: 0, tileX: 6, tileY: 8, scale: 0.13 },
          { npcId: 'kui', npcName: 'Kui', texture: 'kui', areaIndex: 0, tileX: 18, tileY: 8, scale: 0.13 },
          { npcId: 'qingniao', npcName: 'Qingniao', texture: 'qingniao', areaIndex: 0, tileX: 6, tileY: 13, scale: 0.13 },
          { npcId: 'qiongqi', npcName: 'Qiongqi', texture: 'qiongqi', areaIndex: 0, tileX: 18, tileY: 13, scale: 0.13 },
          { npcId: 'xiangliu', npcName: 'Xiangliu', texture: 'xiangliu', areaIndex: 0, tileX: 12, tileY: 6, scale: 0.14 },
          { npcId: 'xingxing', npcName: 'Xingxing', texture: 'xingxing', areaIndex: 0, tileX: 12, tileY: 14, scale: 0.13 },
          { npcId: 'yingzhao', npcName: 'Yingzhao', texture: 'yingzhao', areaIndex: 0, tileX: 4, tileY: 10, scale: 0.13 },
          { npcId: 'jiuweihu', npcName: 'Nine-Tail Fox', texture: 'jiuweihu', areaIndex: 0, tileX: 20, tileY: 10, scale: 0.13 }
        ],
        showGridTiles: false
      }
    };
  }

  applySceneConfig(key) {
    this.currentSceneConfig = this.sceneConfigs[key] || this.sceneConfigs.shrineGrounds;
    this.currentSceneKey = this.currentSceneConfig.key;
    this.gridCols = this.currentSceneConfig.gridCols;
    this.gridRows = this.currentSceneConfig.gridRows;
    this.areaWidth = this.currentSceneConfig.areaWidth;
    this.areaHeight = this.currentSceneConfig.areaHeight;
    this.tileSize = this.currentSceneConfig.tileSize || 24;
    this.gridWidth = this.gridCols * this.areaWidth;
    this.gridHeight = this.gridRows * this.areaHeight;
    this.areaNames = [...this.currentSceneConfig.areaNames];
    this.areaColors = [...this.currentSceneConfig.areaColors];
    this.showGridTiles = this.currentSceneConfig.showGridTiles !== undefined ? this.currentSceneConfig.showGridTiles : false;
    if (this.cameras && this.cameras.main) {
      this.cameras.main.setBackgroundColor(this.currentSceneConfig.backgroundColor || '#0a0015');
    }
  }

  create() {
    this.inputEnabled = true;
    this.setupSceneConfigs();
    const initialKey = this.pendingSceneKey || 'qingqiuVillage';
    this.applySceneConfig(initialKey);
    this.worldWidth = this.gridWidth * this.tileSize;
    this.worldHeight = this.gridHeight * this.tileSize;

    // Create 8-area map
    this.createMap();

    // Create player
    this.createPlayer();

    // Create NPCs and monsters
    this.createNPCs();

    // Clue tracking structures
    this.clueGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.clueSprites = [];
    this.discoveredClues = this.preloadedClues ? [...this.preloadedClues] : [];

    // Ensure physics world matches full grid so players can reach every area
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Setup camera - zoom in and follow player
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.currentSceneConfig.cameraZoom || 4.2);

    // Setup controls
    this.setupControls();
    this.physics.add.overlap(this.player, this.clueGroup);
    this.physics.add.overlap(this.cat, this.clueGroup);

    this.initializeMemoryBookUI();
    this.initializeSceneSwitcherUI();
    this.createClueAnimation();
    this.loadCluesData();

    // Story intro
    this.startIntroSequence();

    this.events.once('shutdown', () => {
      if (this.memoryBookEscHandler) {
        document.removeEventListener('keydown', this.memoryBookEscHandler);
      }
      if (this.sceneSwitcherEscHandler) {
        document.removeEventListener('keydown', this.sceneSwitcherEscHandler);
      }
      if (this.actionMenuEscHandler) {
        document.removeEventListener('keydown', this.actionMenuEscHandler);
      }
    });
  }

  createMap() {
    this.walls = this.physics.add.staticGroup();

    if (this.showGridTiles) {
      for (let x = 0; x < this.gridWidth; x++) {
        for (let y = 0; y < this.gridHeight; y++) {
          const areaCol = Math.floor(x / this.areaWidth);
          const areaRow = Math.floor(y / this.areaHeight);
          const areaIndex = areaRow * this.gridCols + areaCol;
          const areaColor = this.getAreaColor(areaIndex);
          this.add.rectangle(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            areaColor,
            1
          );
        }
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

    this.drawProceduralTerrain();
  }

  getAreaColor(areaIndex) {
    return this.areaColors[areaIndex] !== undefined ? this.areaColors[areaIndex] : 0x2c3e50;
  }

  createPlayer() {
    const start = this.resolvePosition(this.currentSceneConfig.playerStart, {
      areaIndex: 0,
      tileX: this.areaWidth / 2,
      tileY: this.areaHeight / 2
    });

    this.player = this.add.sprite(start.x, start.y, 'player-down-1');
    const playerScale = this.currentSceneConfig.playerScale || 1;
    this.player.setScale(playerScale);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    // Tighten collision bounds to match smaller tiles
    this.player.body.setSize(this.player.width * playerScale * 0.7, this.player.height * playerScale * 0.9);
    this.player.body.setOffset(this.player.width * (playerScale * 0.4), this.player.height * (playerScale * 0.2));

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
    const catStart = this.resolvePosition(this.currentSceneConfig.catStart, {
      areaIndex: 0,
      tileX: this.areaWidth / 2 - 2,
      tileY: this.areaHeight / 2
    });

    this.cat = this.add.sprite(catStart.x, catStart.y, 'cat-idle', 0);
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

    this.npcs = [this.cat];
    this.monsters = [];

    if (this.currentSceneConfig.spawnMonsters !== false) {
      for (let row = 0; row < this.gridRows; row++) {
        for (let col = 0; col < this.gridCols; col++) {
          const areaIndex = row * this.gridCols + col;
          const monster = monsters[areaIndex];
          if (!monster) continue;

          const centerX = (col * this.areaWidth + this.areaWidth / 2) * this.tileSize;
          const centerY = (row * this.areaHeight + this.areaHeight / 2) * this.tileSize;
          const monsterSprite = this.add.sprite(centerX, centerY, monster.key);
          monsterSprite.setDisplaySize(120, 120);

          this.physics.add.existing(monsterSprite);
          monsterSprite.body.setImmovable(false);
          monsterSprite.body.setCollideWorldBounds(false);

          monsterSprite.npcId = monster.id;
          monsterSprite.npcName = monster.name;

          this.npcs.push(monsterSprite);
          this.monsters.push(monsterSprite);
        }
      }
    }

    if (Array.isArray(this.currentSceneConfig.extraNPCs)) {
      this.currentSceneConfig.extraNPCs.forEach((npc) => {
        const pos = this.resolvePosition(npc, {
          areaIndex: npc.areaIndex || 0,
          tileX: npc.tileX || this.areaWidth / 2,
          tileY: npc.tileY || this.areaHeight / 2
        });
        const sprite = this.add.sprite(pos.x, pos.y, npc.texture || npc.npcId);
        sprite.setScale(npc.scale || 0.2);
        this.physics.add.existing(sprite);
        sprite.body.setImmovable(true);
        sprite.body.setCollideWorldBounds(false);
        sprite.npcId = npc.npcId || npc.texture;
        sprite.npcName = npc.npcName || npc.texture;
        this.npcs.push(sprite);
      });
    }

    this.createCorpse();
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
      this.openMemoryBook();
    } else if (choice === 'Settings') {
      this.openSceneSwitcher();
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

  createCorpse() {
    if (!this.currentSceneConfig.corpse) return;
    const corpseData = this.currentSceneConfig.corpse;
    const pos = this.resolvePosition(corpseData, {
      areaIndex: corpseData.areaIndex || 0,
      tileX: corpseData.tileX || this.areaWidth / 2,
      tileY: corpseData.tileY || this.areaHeight / 2
    });
    this.corpseSprite = this.add.image(pos.x, pos.y, corpseData.texture || 'corpse');
    this.corpseSprite.setScale(corpseData.scale || 0.6);
    this.corpseSprite.setDepth(2);
    this.corpseSprite.setInteractive({ useHandCursor: true });
    this.corpseSprite.on('pointerdown', () => this.handleCorpseClick());
  }

  createClueAnimation() {
    if (this.anims.exists('clue-fire-loop')) return;
    const texture = this.textures.get('clue-fire');
    const total = texture ? texture.frameTotal : 0;
    if (!total) return;

    this.anims.create({
      key: 'clue-fire-loop',
      frames: this.anims.generateFrameNumbers('clue-fire', { start: 0, end: total - 1 }),
      frameRate: 12,
      repeat: -1
    });
  }

  loadCluesData() {
    if (this.preloadedClueData) {
      this.cluesData = this.preloadedClueData;
      this.placeClues();
      return;
    }

    const basePromise = fetch('clues.json').then((res) => res.json()).catch((error) => {
      console.error('Failed to load clues.json', error);
      return { locations: [] };
    });

    const crimePromise = fetch('crime_clues.json').then((res) => res.json()).catch((error) => {
      console.warn('Failed to load crime_clues.json', error);
      return null;
    });

    Promise.all([basePromise, crimePromise]).then(([baseData, crimeData]) => {
      const baseLocations = baseData?.locations || [];
      const merged = this.mergeCrimeSceneClues(baseLocations, crimeData);
      this.cluesData = merged;
      this.preloadedClueData = merged;
      window.__GLOBAL_CLUE_DATA = merged;
      this.placeClues();
    });
  }

  placeClues() {
    if (!this.cluesData || !Array.isArray(this.cluesData)) return;

    if (this.clueSprites && this.clueSprites.length) {
      this.clueSprites.forEach((sprite) => sprite.destroy());
    }
    if (this.clueGroup) {
      this.clueGroup.clear(true, true);
    }
    this.clueSprites = [];

    this.corpseClueInfo = null;

    const cluesPerArea = 3;
    const allowedAreas = new Set(
      (this.currentSceneConfig.clueAreas && this.currentSceneConfig.clueAreas.length > 0)
        ? this.currentSceneConfig.clueAreas
        : this.areaNames
    );
    const spawnOverrides = this.currentSceneConfig.clueSpawns || {};

    this.cluesData.forEach((location) => {
      const areaIndex = this.areaNames.indexOf(location.name);
      if (areaIndex === -1 || !allowedAreas.has(location.name)) return;
      let count = Math.min(cluesPerArea, location.clues.length);
      let fireClueCount = count;

      if (this.currentSceneKey === 'qingqiuVillage' && location.name === 'Qingqiu Village') {
        fireClueCount = Math.min(2, location.clues.length);
        const corpseIndex = this.currentSceneConfig.corpseClueIndex ?? 2;
        if (location.clues[corpseIndex]) {
          this.corpseClueInfo = {
            area: location.name,
            beast: location.beast,
            text: location.clues[corpseIndex].clue
          };
        }
      }

      let placements = [];
      const overrides = spawnOverrides[location.name];
      if (overrides && overrides.length) {
        overrides.slice(0, fireClueCount).forEach((spawn) => {
          const worldPos = this.resolvePosition(
            {
              areaIndex: spawn.areaIndex ?? areaIndex,
              tileX: spawn.tileX,
              tileY: spawn.tileY
            },
            {
              areaIndex,
              tileX: this.areaWidth / 2,
              tileY: this.areaHeight / 2
            }
          );
          placements.push(worldPos);
        });
      } else {
        placements = this.getCluePositionsForArea(areaIndex, fireClueCount);
      }

      placements.forEach((pos, idx) => {
        const clueInfo = location.clues[idx];
        if (!clueInfo) return;
        const sprite = this.createClueSprite(pos.x, pos.y, {
          area: location.name,
          beast: location.beast,
          text: clueInfo.clue
        });
        this.clueSprites.push(sprite);
      });
    });
  }

  getCluePositionsForArea(areaIndex, count) {
    const positions = [];
    const col = areaIndex % this.gridCols;
    const row = Math.floor(areaIndex / this.gridCols);
    const areaPixelX = col * this.areaWidth * this.tileSize;
    const areaPixelY = row * this.areaHeight * this.tileSize;
    const areaPixelWidth = this.areaWidth * this.tileSize;
    const areaPixelHeight = this.areaHeight * this.tileSize;
    const padding = this.tileSize * 2;

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(areaPixelX + padding, areaPixelX + areaPixelWidth - padding);
      const y = Phaser.Math.Between(areaPixelY + padding, areaPixelY + areaPixelHeight - padding);
      positions.push({ x, y });
    }

    return positions;
  }

  createClueSprite(x, y, clueInfo) {
    const sprite = this.physics.add.sprite(x, y, 'clue-fire', 0);
    sprite.setScale(1.4);
    sprite.body.setImmovable(true);
    sprite.body.setAllowGravity(false);
    sprite.clueInfo = clueInfo;
    sprite.collected = false;
    sprite.setInteractive({ useHandCursor: true });
    sprite.on('pointerdown', () => this.handleClueClick(sprite));
    if (this.anims.exists('clue-fire-loop')) {
      sprite.anims.play('clue-fire-loop');
    }
    this.clueGroup.add(sprite);
    return sprite;
  }

  handleClueClick(sprite) {
    if (!this.inputEnabled || !sprite || sprite.collected) return;
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
    if (dist > 80) {
      this.showClueToast('Get closer to inspect the clue', true);
      return;
    }
    sprite.collected = true;
    sprite.disableInteractive();
    sprite.setAlpha(0.65);
    this.recordClue(sprite.clueInfo);
  }

  recordClue(clueInfo) {
    if (!clueInfo) return;
    if (this.discoveredClues.find((entry) => entry.text === clueInfo.text)) {
      this.showClueToast('Clue already recorded', true);
      return;
    }

    const entry = {
      area: clueInfo.area,
      beast: clueInfo.beast,
      text: clueInfo.text,
      timestamp: new Date().toISOString()
    };

    this.discoveredClues.push(entry);
    this.updateMemoryBookUI();
    this.showClueToast('Clue recorded in Memory Book');
    this.logClueToBackend(entry);
  }

  logClueToBackend(entry) {
    const payload = { ...entry };
    fetch('http://localhost:5001/api/clues/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch((error) => {
      console.warn('Failed to save clue to backend:', error);
    });
  }

  initializeMemoryBookUI() {
    this.memoryBookOverlay = document.getElementById('memory-book');
    this.memoryBookList = document.getElementById('memory-book-list');
    this.memoryBookEmpty = document.getElementById('memory-book-empty');
    this.memoryBookCloseBtn = document.getElementById('close-memory-book');
    this.clueToast = document.getElementById('clue-toast');

    if (this.memoryBookCloseBtn) {
      this.memoryBookCloseBtn.addEventListener('click', () => this.closeMemoryBook());
    }

    this.memoryBookEscHandler = (e) => {
      if (e.key === 'Escape' && this.memoryBookOverlay && !this.memoryBookOverlay.classList.contains('hidden')) {
        this.closeMemoryBook();
      }
    };
    document.addEventListener('keydown', this.memoryBookEscHandler);

    this.updateMemoryBookUI();
  }

  updateMemoryBookUI() {
    if (!this.memoryBookOverlay) return;
    if (!this.discoveredClues || this.discoveredClues.length === 0) {
      if (this.memoryBookEmpty) this.memoryBookEmpty.classList.remove('hidden');
      if (this.memoryBookList) this.memoryBookList.innerHTML = '';
      return;
    }

    if (this.memoryBookEmpty) this.memoryBookEmpty.classList.add('hidden');
    if (!this.memoryBookList) return;

    this.memoryBookList.innerHTML = '';
    this.discoveredClues.forEach((entry, index) => {
      const clueDiv = document.createElement('div');
      clueDiv.className = 'memory-clue';

      const title = document.createElement('div');
      title.className = 'memory-clue-area';
      title.textContent = `${entry.area} — ${entry.beast}`;

      const text = document.createElement('p');
      text.textContent = entry.text;

      clueDiv.appendChild(title);
      clueDiv.appendChild(text);
      this.memoryBookList.appendChild(clueDiv);
    });
  }

  openMemoryBook() {
    if (!this.memoryBookOverlay) return;
    this.updateMemoryBookUI();
    this.memoryBookOverlay.classList.remove('hidden');
    this.disableInput();
  }

  closeMemoryBook() {
    if (!this.memoryBookOverlay) return;
    this.memoryBookOverlay.classList.add('hidden');
    this.enableInput();
  }

  showClueToast(message, isWarning = false) {
    if (!this.clueToast) return;
    this.clueToast.textContent = message;
    this.clueToast.style.borderColor = isWarning ? 'rgba(255, 120, 120, 0.8)' : 'rgba(255, 215, 0, 0.6)';
    this.clueToast.classList.remove('hidden');

    if (this.clueToastTimeout) {
      clearTimeout(this.clueToastTimeout);
    }
    this.clueToastTimeout = setTimeout(() => {
      this.clueToast.classList.add('hidden');
    }, 2000);
  }

  handleCorpseClick() {
    if (!this.corpseSprite || !this.corpseClueInfo) {
      this.showClueToast('Nothing else to inspect here', true);
      return;
    }
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.corpseSprite.x, this.corpseSprite.y);
    if (dist > 80) {
      this.showClueToast('Get closer to inspect the corpse', true);
      return;
    }
    this.recordClue(this.corpseClueInfo);
  }

  initializeSceneSwitcherUI() {
    this.sceneSwitcherOverlay = document.getElementById('scene-switcher');
    this.sceneSwitcherList = document.getElementById('scene-switcher-list');
    this.sceneSwitcherCloseBtn = document.getElementById('close-scene-switcher');

    if (this.sceneSwitcherCloseBtn) {
      this.sceneSwitcherCloseBtn.addEventListener('click', () => this.closeSceneSwitcher());
    }

    this.sceneSwitcherEscHandler = (e) => {
      if (
        e.key === 'Escape' &&
        this.sceneSwitcherOverlay &&
        !this.sceneSwitcherOverlay.classList.contains('hidden')
      ) {
        this.closeSceneSwitcher();
      }
    };
    document.addEventListener('keydown', this.sceneSwitcherEscHandler);
  }

  renderSceneOptions() {
    if (!this.sceneSwitcherList) return;
    this.sceneSwitcherList.innerHTML = '';
    Object.values(this.sceneConfigs).forEach((config) => {
      const button = document.createElement('button');
      button.className = 'scene-option';
      button.textContent = config.displayName;
      if (config.key === this.currentSceneKey) {
        button.disabled = true;
        button.classList.add('active');
      } else {
        button.addEventListener('click', () => this.switchScene(config.key));
      }

      if (config.summary) {
        const summary = document.createElement('span');
        summary.textContent = config.summary;
        button.appendChild(summary);
      }

      this.sceneSwitcherList.appendChild(button);
    });
  }

  openSceneSwitcher() {
    if (!this.sceneSwitcherOverlay) return;
    this.renderSceneOptions();
    this.sceneSwitcherOverlay.classList.remove('hidden');
    this.disableInput();
  }

  closeSceneSwitcher(skipEnable = false) {
    if (!this.sceneSwitcherOverlay) return;
    this.sceneSwitcherOverlay.classList.add('hidden');
    if (!skipEnable) {
      this.enableInput();
    }
  }

  switchScene(targetKey) {
    if (targetKey === this.currentSceneKey) {
      this.showClueToast('Already investigating here', true);
      this.closeSceneSwitcher();
      return;
    }
    window.__GLOBAL_DISCOVERED_CLUES = this.discoveredClues;
    window.__GLOBAL_CLUE_DATA = this.cluesData;
    this.closeSceneSwitcher(true);
    this.scene.restart({
      targetScene: targetKey,
      discoveredClues: this.discoveredClues,
      allCluesData: this.cluesData
    });
  }

  resolvePosition(configPos, fallback) {
    const data = configPos || {};
    const fb = fallback || {};
    const areaIndex = data.areaIndex ?? fb.areaIndex ?? 0;
    const tileX = data.tileX ?? fb.tileX ?? this.areaWidth / 2;
    const tileY = data.tileY ?? fb.tileY ?? this.areaHeight / 2;
    return this.getWorldPosition(areaIndex, tileX, tileY);
  }

  getWorldPosition(areaIndex, tileX, tileY) {
    const col = areaIndex % this.gridCols;
    const row = Math.floor(areaIndex / this.gridCols);
    const x = (col * this.areaWidth + tileX) * this.tileSize;
    const y = (row * this.areaHeight + tileY) * this.tileSize;
    return { x, y };
  }
  mergeCrimeSceneClues(baseLocations, crimeData) {
    const mergedLocations = baseLocations.map((location) => ({
      ...location,
      clues: Array.isArray(location.clues) ? location.clues.map((clue) => ({ ...clue })) : []
    }));

    if (!crimeData) return mergedLocations;

    const crimeEntries = Array.isArray(crimeData) ? crimeData : [crimeData];

    crimeEntries.forEach((entry) => {
      if (!entry || !entry.location || !entry.clues) return;

      const normalizedClues = entry.clues.map((clue) =>
        typeof clue === 'string' ? { clue } : { clue: clue.clue }
      );

      const existingIndex = mergedLocations.findIndex((loc) => loc.name === entry.location);

      if (existingIndex >= 0) {
        mergedLocations[existingIndex] = {
          ...mergedLocations[existingIndex],
          beast: entry.beast || mergedLocations[existingIndex].beast,
          clues: normalizedClues
        };
      } else {
        mergedLocations.push({
          name: entry.location,
          beast: entry.beast || 'Unknown',
          clues: normalizedClues
        });
      }
    });

    return mergedLocations;
  }

  drawProceduralTerrain() {
    if (this.terrainLayer) {
      this.terrainLayer.destroy(true);
    }
    this.terrainLayer = this.add.container(0, 0);
    this.terrainLayer.setDepth(-1);

    const rng = new Phaser.Math.RandomDataGenerator([this.currentSceneKey || 'default-terrain']);

    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const areaIndex = row * this.gridCols + col;
        const baseColor = this.areaColors[areaIndex] !== undefined ? this.areaColors[areaIndex] : 0x1c1f2a;
        const startX = col * this.areaWidth * this.tileSize;
        const startY = row * this.areaHeight * this.tileSize;
        const width = this.areaWidth * this.tileSize;
        const height = this.areaHeight * this.tileSize;

        const gradient = this.add.graphics({ x: startX, y: startY });
        const lighter = this.adjustColor(baseColor, 1.1);
        const darker = this.adjustColor(baseColor, 0.7);
        gradient.fillGradientStyle(baseColor, lighter, darker, baseColor, 1);
        gradient.fillRect(0, 0, width, height);
        this.terrainLayer.add(gradient);

        const noiseBlob = this.add.graphics({ x: startX, y: startY });
        const blobCount = Phaser.Math.Clamp(Math.round((width * height) / 6000), 4, 12);
        for (let i = 0; i < blobCount; i++) {
          const blobX = rng.between(0, width);
          const blobY = rng.between(0, height);
          const blobRadiusX = rng.between(40, 80);
          const blobRadiusY = rng.between(20, 50);
          const blobColor = this.adjustColor(baseColor, rng.realInRange(0.8, 1.2));
          noiseBlob.fillStyle(blobColor, 0.25);
          noiseBlob.fillEllipse(blobX, blobY, blobRadiusX, blobRadiusY);
        }
        this.terrainLayer.add(noiseBlob);

        const treeGraphics = this.add.graphics({ x: startX, y: startY });
        const treeCount = Phaser.Math.Clamp(Math.round((width * height) / 3000), 6, 20);
        for (let t = 0; t < treeCount; t++) {
          const tx = rng.between(20, width - 20);
          const ty = rng.between(30, height - 10);
          const scale = rng.realInRange(0.6, 1.4);
          const foliageColor = this.adjustColor(baseColor, rng.realInRange(1.1, 1.4));
          const trunkColor = this.adjustColor(baseColor, 0.45);
          this.drawStylizedTree(treeGraphics, tx, ty, scale, foliageColor, trunkColor);
        }
        this.terrainLayer.add(treeGraphics);

        const sparkGraphics = this.add.graphics({ x: startX, y: startY });
        const sparkleCount = Phaser.Math.Clamp(Math.round((width * height) / 8000), 3, 10);
        for (let s = 0; s < sparkleCount; s++) {
          const sx = rng.between(0, width);
          const sy = rng.between(0, height);
          const radius = rng.realInRange(1, 2.5);
          sparkGraphics.fillStyle(0xffffff, rng.realInRange(0.1, 0.2));
          sparkGraphics.fillCircle(sx, sy, radius);
        }
        this.terrainLayer.add(sparkGraphics);
      }
    }
  }

  adjustColor(colorInt, multiplier) {
    const color = Phaser.Display.Color.IntegerToRGB(colorInt);
    const r = Phaser.Math.Clamp(Math.round(color.r * multiplier), 0, 255);
    const g = Phaser.Math.Clamp(Math.round(color.g * multiplier), 0, 255);
    const b = Phaser.Math.Clamp(Math.round(color.b * multiplier), 0, 255);
    return Phaser.Display.Color.GetColor(r, g, b);
  }

  drawStylizedTree(graphics, x, y, scale, foliageColor, trunkColor) {
    const height = 45 * scale;
    const width = 30 * scale;
    const trunkHeight = 12 * scale;
    const trunkWidth = 6 * scale;

    graphics.fillStyle(trunkColor, 0.9);
    graphics.fillRect(x - trunkWidth / 2, y - trunkHeight, trunkWidth, trunkHeight);

    graphics.fillStyle(foliageColor, 0.9);
    graphics.fillTriangle(
      x,
      y - height,
      x - width / 2,
      y - trunkHeight,
      x + width / 2,
      y - trunkHeight
    );
    graphics.fillTriangle(
      x,
      y - height * 0.75,
      x - width * 0.45,
      y - trunkHeight - height * 0.2,
      x + width * 0.45,
      y - trunkHeight - height * 0.2
    );
  }

  startIntroSequence() {
    const introOverlay = document.getElementById('intro-overlay');
    const beginButton = document.getElementById('intro-begin');

    if (!introOverlay || !beginButton) {
      this.enableInput();
      return;
    }

    if (window.__INTRO_SHOWN) {
      introOverlay.classList.add('hidden');
      this.enableInput();
      return;
    }

    this.disableInput();
    introOverlay.classList.remove('hidden');

    const handleBegin = () => {
      introOverlay.classList.add('hidden');
      beginButton.removeEventListener('click', handleBegin);
      window.__INTRO_SHOWN = true;
      this.currentNPC = 'baize';
      this.lastNPC = null;
      this.openDialogue('Baize', 'baize');
    };

    beginButton.addEventListener('click', handleBegin);
  }
}
