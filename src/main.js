console.log('🚀 main.js is loading...');

import ShrineScene from './ShrineScene.js';
import { DialogueSystem } from './ui/dialogue.js';

console.log('✓ Imports successful!');
console.log('ShrineScene:', ShrineScene);
console.log('DialogueSystem:', DialogueSystem);

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0a0015',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [ShrineScene]
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Initialize dialogue system when scene is ready
game.events.on('ready', () => {
  const scene = game.scene.getScene('ShrineScene');
  scene.events.on('create', () => {
    new DialogueSystem(scene);
  });
});
