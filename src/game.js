/* global Phaser */

const HUD = {
  score: document.getElementById("scoreValue"),
  best: document.getElementById("bestValue"),
  wave: document.getElementById("waveValue"),
  levelWave: document.getElementById("levelWaveValue"),
  combo: document.getElementById("comboValue"),
  lives: document.getElementById("livesValue"),
  shield: document.getElementById("shieldValue"),
  bombs: document.getElementById("bombValue"),
  kills: document.getElementById("killsValue"),
  graze: document.getElementById("grazeValue"),
  profile: document.getElementById("profileValue"),
  supplyLabel: document.getElementById("supplyLabel"),
  supplyFill: document.getElementById("supplyFill"),
  boostLabel: document.getElementById("boostLabel"),
  boostFill: document.getElementById("boostFill"),
  laserRow: document.querySelector(".laser-row"),
  laserLabel: document.getElementById("laserLabel"),
  laserFill: document.getElementById("laserFill"),
  dashRow: document.querySelector(".dash-row"),
  dashLabel: document.getElementById("dashLabel"),
  dashFill: document.getElementById("dashFill"),
  overdriveRow: document.querySelector(".overdrive-row"),
  overdriveLabel: document.getElementById("overdriveLabel"),
  overdriveFill: document.getElementById("overdriveFill"),
  droneLabel: document.getElementById("droneLabel"),
  droneFill: document.getElementById("droneFill"),
  bossPanel: document.getElementById("bossPanel"),
  bossLabel: document.getElementById("bossLabel"),
  bossFill: document.getElementById("bossFill"),
  threatLabel: document.getElementById("threatLabel"),
  threatFill: document.getElementById("threatFill"),
  objectiveList: document.getElementById("objectiveList"),
  feed: document.getElementById("feedText"),
  overlay: document.getElementById("screenOverlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayCopy: document.getElementById("overlayCopy"),
  primaryAction: document.getElementById("primaryAction"),
  pauseButton: document.getElementById("pauseButton"),
  bombButton: document.getElementById("bombButton"),
  dashButton: document.getElementById("dashButton"),
  overdriveButton: document.getElementById("overdriveButton"),
  audioButton: document.getElementById("audioButton"),
  restartButton: document.getElementById("restartButton"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  difficultyOptions: document.getElementById("difficultyOptions"),
};

const GAME_STATE = {
  READY: "ready",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "game-over",
  VICTORY: "victory",
};

const READY_OVERLAY = {
  title: "星翼突击",
  copy: "穿过碎星航道，守住最后一道轨道门。",
  action: "启动",
};

const STORAGE_KEYS = {
  highScore: "starwing.highScore",
  difficulty: "starwing.difficulty",
  profile: "starwing.profile",
};

const DIFFICULTY_MODES = {
  normal: {
    label: "普通",
    enemyCountBonus: 0,
    hpMultiplier: 1,
    speedMultiplier: 1,
    fireRateMultiplier: 1,
    scoreMultiplier: 1,
  },
  veteran: {
    label: "老兵",
    enemyCountBonus: 3,
    hpMultiplier: 1.22,
    speedMultiplier: 1.12,
    fireRateMultiplier: 0.88,
    scoreMultiplier: 1.25,
  },
  nightmare: {
    label: "噩梦",
    enemyCountBonus: 6,
    hpMultiplier: 1.48,
    speedMultiplier: 1.24,
    fireRateMultiplier: 0.74,
    scoreMultiplier: 1.6,
  },
};

const LASER_CONFIG = {
  minChargeMs: 420,
  fullChargeMs: 1800,
  cooldownMs: 2300,
  baseDamage: 5,
  maxBonusDamage: 18,
  minWidth: 18,
  maxWidth: 74,
  meterWidth: 116,
};

const DASH_CONFIG = {
  activeMs: 620,
  cooldownMs: 4200,
  speedMultiplier: 1.72,
  bulletClearRadius: 148,
};

const OVERDRIVE_CONFIG = {
  maxCharge: 100,
  killCharge: 8,
  bossKillCharge: 28,
  grazeCharge: 4,
  activeMs: 6400,
  bulletClearRadius: 118,
  fireRateMultiplier: 0.68,
  damageBonus: 0.45,
  speedBonus: 70,
};

const RUN_PERMANENT = Number.POSITIVE_INFINITY;

const POWER_LIMITS = {
  weaponMaxLevel: 5,
  droneMaxLevel: 4,
  maxLives: 7,
  shieldMax: 150,
};

const SUPPLY_CONFIG = {
  killsPerDrop: 8,
};

const GRAZE_CONFIG = {
  radius: 58,
  minDistance: 22,
  score: 22,
  shieldEvery: 6,
  shieldReward: 8,
};

const SHIELD_BREAK_CONFIG = {
  clearRadius: 178,
  invulnerableMs: 760,
  scorePerBullet: 16,
};

const LEVEL_CONFIG = {
  maxLevel: 10,
  wavesPerLevel: 10,
  bossWave: 10,
};

const FLAWLESS_WAVE_CONFIG = {
  score: 260,
  bossScore: 900,
  shield: 10,
  bossShield: 24,
  overdriveCharge: 10,
  bossOverdriveCharge: 24,
};

const BOSS_PHASES = [
  {
    threshold: 1,
    label: "巡航",
    fireRateMultiplier: 1,
    bulletSpeed: 240,
    spread: [-210, -105, 0, 105, 210],
    tint: 0xffffff,
  },
  {
    threshold: 0.75,
    label: "护盾裂解",
    fireRateMultiplier: 0.86,
    bulletSpeed: 258,
    spread: [-240, -120, 0, 120, 240],
    tint: 0xffd166,
  },
  {
    threshold: 0.5,
    label: "核心过热",
    fireRateMultiplier: 0.72,
    bulletSpeed: 278,
    spread: [-280, -168, -56, 56, 168, 280],
    tint: 0xff8f70,
  },
  {
    threshold: 0.25,
    label: "终局狂暴",
    fireRateMultiplier: 0.58,
    bulletSpeed: 306,
    spread: [-320, -224, -128, -32, 32, 128, 224, 320],
    tint: 0xff5f78,
  },
];

const POWER_MAGNET_CONFIG = {
  radius: 190,
  minSpeed: 150,
  maxSpeed: 440,
};

const POWER_LABELS = {
  weapon: "火力",
  shield: "护盾",
  repair: "维修",
  pulse: "脉冲",
  drone: "僚机",
  bomb: "炸弹",
};

const COMBO_REWARDS = [
  {
    combo: 8,
    label: "护盾回充",
    shield: 18,
    score: 180,
  },
  {
    combo: 16,
    label: "战术炸弹",
    shield: 24,
    bombs: 1,
    score: 320,
  },
  {
    combo: 28,
    label: "火控超频",
    shield: 32,
    weaponUpgrade: 1,
    score: 520,
  },
  {
    combo: 42,
    label: "僚机支援",
    shield: 42,
    droneUpgrade: 1,
    score: 800,
  },
];

const MISSION_OBJECTIVES = [
  {
    key: "kills",
    label: "击坠",
    target: 20,
    rewardLabel: "+1 炸弹",
    score: 420,
    bombs: 1,
  },
  {
    key: "combo",
    label: "连击",
    target: 18,
    rewardLabel: "火力补偿",
    score: 520,
    shield: 18,
    weaponUpgrade: 1,
  },
  {
    key: "graze",
    label: "擦弹",
    target: 12,
    rewardLabel: "护盾回充",
    score: 360,
    shield: 28,
  },
];

const POWER_TYPES = {
  weapon: {
    tint: 0xffd166,
    scale: 0.62,
  },
  shield: {
    tint: 0x64f2a4,
    scale: 0.68,
  },
  repair: {
    tint: 0x38d7ff,
    scale: 0.66,
  },
  pulse: {
    tint: 0xb98cff,
    scale: 0.7,
  },
  drone: {
    tint: 0xffffff,
    scale: 0.6,
  },
  bomb: {
    tint: 0xff5f78,
    scale: 0.72,
  },
};

const ENEMY_TYPES = {
  scout: {
    key: "enemyScout",
    hp: 2,
    speed: 92,
    score: 80,
    fireRate: 2100,
    scale: 0.64,
    tint: 0xffffff,
  },
  heavy: {
    key: "enemyHeavy",
    hp: 5,
    speed: 62,
    score: 210,
    fireRate: 1550,
    scale: 0.76,
    tint: 0xffe8a3,
  },
  interceptor: {
    key: "enemyInterceptor",
    hp: 3,
    speed: 118,
    score: 150,
    fireRate: 1850,
    scale: 0.66,
    tint: 0x9ef7ff,
  },
};

const clamp = Phaser.Math.Clamp;

class StarwingAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicTimer = null;
    this.step = 0;
    this.enabled = true;
    this.started = false;
    this.lastShotAt = 0;
    this.chargeOscillators = [];
    this.chargeGain = null;
  }

  ensureContext() {
    if (this.context) return this.context;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.master.gain.value = this.enabled ? 0.72 : 0;
    this.musicGain.gain.value = 0.18;
    this.sfxGain.gain.value = 0.72;
    this.musicGain.connect(this.master);
    this.sfxGain.connect(this.master);
    this.master.connect(this.context.destination);
    return this.context;
  }

  async unlock() {
    const context = this.ensureContext();
    if (!context) return false;
    if (context.state === "suspended") {
      await context.resume();
    }
    if (!this.started) {
      this.started = true;
      this.startMusic();
    }
    return true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    const context = this.ensureContext();
    if (!context || !this.master) return;
    this.master.gain.cancelScheduledValues(context.currentTime);
    this.master.gain.setTargetAtTime(enabled ? 0.72 : 0, context.currentTime, 0.025);
    if (!enabled) this.stopCharge();
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  startMusic() {
    if (this.musicTimer || !this.context) return;
    this.musicTimer = window.setInterval(() => this.playMusicStep(), 185);
  }

  stopMusic() {
    if (!this.musicTimer) return;
    window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  playMusicStep() {
    if (!this.enabled || !this.context || this.context.state !== "running") return;

    const bass = [55, 55, 82.41, 73.42, 65.41, 65.41, 98, 82.41];
    const arp = [220, 277.18, 329.63, 415.3, 329.63, 277.18, 246.94, 196];
    const time = this.context.currentTime;
    const index = this.step % bass.length;

    if (index % 2 === 0) {
      this.tone(bass[index], 0.22, "sawtooth", 0.045, this.musicGain, time, 700);
      this.noise(0.025, 0.045, this.musicGain, time, 900);
    }

    this.tone(arp[index], 0.08, "triangle", 0.025, this.musicGain, time + 0.018, 1800);
    this.step += 1;
  }

  tone(frequency, duration, type = "sine", volume = 0.2, destination = this.sfxGain, when = this.context?.currentTime || 0, filterFrequency = 2400) {
    if (!this.enabled || !this.context || !destination) return null;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, when);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFrequency, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), when + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.03);
    return oscillator;
  }

  sweep(fromFrequency, toFrequency, duration, type = "sawtooth", volume = 0.25) {
    if (!this.enabled || !this.context) return;

    const time = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(fromFrequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(toFrequency, time + duration);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain);
    gain.connect(this.sfxGain);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.03);
  }

  noise(duration, volume = 0.2, destination = this.sfxGain, when = this.context?.currentTime || 0, filterFrequency = 1600) {
    if (!this.enabled || !this.context || !destination) return;

    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, Math.max(1, Math.floor(sampleRate * duration)), sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(filterFrequency, when);
    filter.Q.value = 0.8;
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    source.start(when);
  }

  playShot() {
    if (!this.context || this.context.currentTime - this.lastShotAt < 0.045) return;
    this.lastShotAt = this.context.currentTime;
    this.sweep(740, 1180, 0.055, "square", 0.08);
  }

  playDroneShot() {
    this.sweep(520, 880, 0.05, "triangle", 0.055);
  }

  playEnemyShot() {
    this.sweep(290, 140, 0.09, "sawtooth", 0.07);
  }

  startCharge() {
    if (!this.enabled || !this.context || this.chargeGain) return;

    const time = this.context.currentTime;
    this.chargeGain = this.context.createGain();
    this.chargeGain.gain.setValueAtTime(0.0001, time);
    this.chargeGain.gain.exponentialRampToValueAtTime(0.12, time + 0.18);
    this.chargeGain.connect(this.sfxGain);
    this.chargeOscillators = [110, 220].map((frequency, index) => {
      const oscillator = this.context.createOscillator();
      oscillator.type = index === 0 ? "sawtooth" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, time);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 2.6, time + 1.8);
      oscillator.connect(this.chargeGain);
      oscillator.start(time);
      return oscillator;
    });
  }

  stopCharge() {
    if (!this.context || !this.chargeGain) return;

    const time = this.context.currentTime;
    this.chargeGain.gain.cancelScheduledValues(time);
    this.chargeGain.gain.setTargetAtTime(0.0001, time, 0.035);
    this.chargeOscillators.forEach((oscillator) => {
      try {
        oscillator.stop(time + 0.12);
      } catch {
        // Oscillators can already be stopped if the browser suspends audio.
      }
    });
    this.chargeOscillators = [];
    this.chargeGain = null;
  }

  playLaser(chargeRatio) {
    this.stopCharge();
    this.sweep(360 + chargeRatio * 220, 80, 0.24, "sawtooth", 0.24 + chargeRatio * 0.08);
    this.noise(0.18, 0.13 + chargeRatio * 0.06, this.sfxGain, this.context.currentTime, 2100);
  }

  playExplosion(isBoss = false) {
    this.sweep(isBoss ? 140 : 190, isBoss ? 38 : 62, isBoss ? 0.42 : 0.22, "sawtooth", isBoss ? 0.34 : 0.18);
    this.noise(isBoss ? 0.38 : 0.18, isBoss ? 0.32 : 0.18, this.sfxGain, this.context.currentTime, isBoss ? 760 : 1200);
  }

  playPower() {
    const time = this.context?.currentTime || 0;
    this.tone(523.25, 0.08, "triangle", 0.12, this.sfxGain, time, 2400);
    this.tone(783.99, 0.12, "triangle", 0.1, this.sfxGain, time + 0.055, 2600);
  }

  playHit() {
    this.sweep(210, 86, 0.16, "square", 0.18);
    this.noise(0.12, 0.16, this.sfxGain, this.context.currentTime, 650);
  }

  playBomb() {
    this.sweep(95, 32, 0.52, "sawtooth", 0.38);
    this.noise(0.45, 0.34, this.sfxGain, this.context.currentTime, 520);
  }

  playDash() {
    this.sweep(420, 1180, 0.14, "triangle", 0.16);
    this.noise(0.1, 0.08, this.sfxGain, this.context.currentTime, 2600);
  }

  playMissionEnd(victory) {
    const time = this.context?.currentTime || 0;
    if (victory) {
      [392, 523.25, 659.25, 783.99].forEach((frequency, index) => {
        this.tone(frequency, 0.18, "triangle", 0.11, this.sfxGain, time + index * 0.12, 2800);
      });
    } else {
      [220, 174.61, 130.81].forEach((frequency, index) => {
        this.tone(frequency, 0.2, "sawtooth", 0.12, this.sfxGain, time + index * 0.13, 1200);
      });
    }
  }
}

const AUDIO = new StarwingAudio();

function readHighScore() {
  try {
    return Number.parseInt(window.localStorage.getItem(STORAGE_KEYS.highScore) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.highScore, String(score));
  } catch {
    // Ignore storage failures; the current run still works without persistence.
  }
}

function readDifficulty() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.difficulty);
    return DIFFICULTY_MODES[stored] ? stored : "normal";
  } catch {
    return "normal";
  }
}

function saveDifficulty(difficulty) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.difficulty, difficulty);
  } catch {
    // Difficulty still applies for this run even if persistence is unavailable.
  }
}

const GRADE_RANK = {
  D: 0,
  C: 1,
  B: 2,
  A: 3,
  S: 4,
};

function readProfile() {
  const fallback = {
    bestGrade: "D",
    bestLevel: 0,
    bestKills: 0,
    bestCombo: 0,
  };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.profile) || "null");
    return parsed && typeof parsed === "object" ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

function saveProfile(profile) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  } catch {
    // Profile stats are nice-to-have; gameplay continues without persistence.
  }
}

class StarwingScene extends Phaser.Scene {
  constructor() {
    super("starwing");
    this.state = GAME_STATE.READY;
    this.score = 0;
    this.bestScore = readHighScore();
    this.profile = readProfile();
    this.difficulty = readDifficulty();
    this.wave = 1;
    this.levelWave = 1;
    this.lives = 3;
    this.maxLives = 5;
    this.shield = 0;
    this.maxShield = 99;
    this.bombs = 1;
    this.maxBombs = 3;
    this.weaponLevel = 1;
    this.weaponUpgradeLevel = 0;
    this.weaponBoostUntil = 0;
    this.dashActiveUntil = 0;
    this.dashCooldownUntil = 0;
    this.overdriveCharge = 0;
    this.overdriveUntil = 0;
    this.droneUntil = 0;
    this.droneLevel = 0;
    this.drones = [];
    this.invulnerableUntil = 0;
    this.laserCharging = false;
    this.laserChargeStartedAt = 0;
    this.laserChargeRatio = 0;
    this.laserCooldownUntil = 0;
    this.laserButton = null;
    this.laserChargeBack = null;
    this.laserChargeFill = null;
    this.laserChargeCore = null;
    this.laserChargeHalo = null;
    this.laserChargeText = null;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.comboRewardIndex = 0;
    this.comboWindowUntil = 0;
    this.maxCombo = 0;
    this.killCount = 0;
    this.grazeCount = 0;
    this.lastGrazeNoticeAt = 0;
    this.completedObjectives = {};
    this.objectiveHudKey = "";
    this.supplyCharge = 0;
    this.lastShotAt = 0;
    this.lastDroneShotAt = 0;
    this.lastDashTrailAt = 0;
    this.waveActive = false;
    this.waveHadDamage = false;
    this.pendingSpawns = 0;
    this.spawnTimers = [];
    this.nextWaveTimer = null;
    this.uiAbort = null;
    this.autoStartAfterRestart = false;
    this.boss = null;
  }

  preload() {
  }

  create() {
    const shouldAutoStart = this.autoStartAfterRestart === true;
    this.autoStartAfterRestart = false;
    this.resetGameState();
    this.bounds = {
      width: this.scale.width,
      height: this.scale.height,
    };

    this.createGeneratedTextures();
    this.createLayers();
    this.createPlayer();
    this.createInput();
    this.createCollisions();
    this.bindUi();
    this.resetRuntimeState();
    this.events.once("shutdown", this.cleanupScene, this);
    this.events.once("destroy", this.cleanupScene, this);
    this.updateHud("等待发射许可。");
    this.scale.on("resize", this.handleResize, this);

    if (shouldAutoStart) {
      this.startMission();
    }
  }

  createGeneratedTextures() {
    if (this.textures.exists("player")) return;

    const graphics = this.add.graphics();
    const makeTexture = (key, width, height, draw) => {
      graphics.clear();
      draw(graphics);
      graphics.generateTexture(key, width, height);
    };

    makeTexture("player", 96, 96, (g) => {
      g.lineStyle(2, 0xdffbff, 1);
      g.fillStyle(0x38d7ff, 1);
      g.beginPath();
      g.moveTo(48, 5);
      g.lineTo(62, 59);
      g.lineTo(48, 92);
      g.lineTo(34, 59);
      g.closePath();
      g.fillPath();
      g.strokePath();

      g.fillStyle(0x64f2a4, 1);
      g.beginPath();
      g.moveTo(35, 49);
      g.lineTo(7, 77);
      g.lineTo(40, 69);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.beginPath();
      g.moveTo(61, 49);
      g.lineTo(89, 77);
      g.lineTo(56, 69);
      g.closePath();
      g.fillPath();
      g.strokePath();

      g.fillStyle(0x08131a, 0.78);
      g.beginPath();
      g.moveTo(42, 34);
      g.lineTo(48, 16);
      g.lineTo(56, 34);
      g.lineTo(48, 45);
      g.closePath();
      g.fillPath();

      g.fillStyle(0xffd166, 1);
      g.fillTriangle(33, 70, 25, 88, 42, 78);
      g.fillTriangle(63, 70, 71, 88, 54, 78);
    });

    makeTexture("enemyScout", 92, 92, (g) => {
      g.lineStyle(2, 0xffd5c2, 1);
      g.fillStyle(0xff5f78, 1);
      g.beginPath();
      g.moveTo(46, 82);
      g.lineTo(62, 50);
      g.lineTo(84, 29);
      g.lineTo(56, 35);
      g.lineTo(46, 9);
      g.lineTo(36, 35);
      g.lineTo(8, 29);
      g.lineTo(30, 50);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0x160b12, 0.7);
      g.fillTriangle(36, 40, 46, 24, 56, 40);
      g.fillStyle(0xffd166, 1);
      g.fillTriangle(29, 58, 15, 76, 38, 66);
      g.fillTriangle(63, 58, 77, 76, 54, 66);
    });

    makeTexture("enemyHeavy", 104, 104, (g) => {
      g.lineStyle(2, 0xffe7a5, 1);
      g.fillStyle(0xff6b7a, 1);
      g.beginPath();
      g.moveTo(52, 9);
      g.lineTo(69, 39);
      g.lineTo(98, 47);
      g.lineTo(75, 65);
      g.lineTo(78, 94);
      g.lineTo(52, 78);
      g.lineTo(26, 94);
      g.lineTo(29, 65);
      g.lineTo(6, 47);
      g.lineTo(35, 39);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0xffd166, 1);
      g.fillCircle(31, 56, 5);
      g.fillCircle(73, 56, 5);
      g.fillStyle(0x160b12, 0.74);
      g.beginPath();
      g.moveTo(39, 42);
      g.lineTo(52, 24);
      g.lineTo(65, 42);
      g.lineTo(60, 58);
      g.lineTo(44, 58);
      g.closePath();
      g.fillPath();
    });

    makeTexture("enemyInterceptor", 96, 96, (g) => {
      g.lineStyle(2, 0xdffbff, 1);
      g.fillStyle(0x38d7ff, 1);
      g.beginPath();
      g.moveTo(48, 86);
      g.lineTo(68, 49);
      g.lineTo(88, 22);
      g.lineTo(56, 34);
      g.lineTo(48, 8);
      g.lineTo(40, 34);
      g.lineTo(8, 22);
      g.lineTo(28, 49);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0x071018, 0.76);
      g.beginPath();
      g.moveTo(38, 45);
      g.lineTo(48, 25);
      g.lineTo(58, 45);
      g.lineTo(53, 60);
      g.lineTo(43, 60);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xff5f78, 1);
      g.fillCircle(28, 52, 5);
      g.fillCircle(68, 52, 5);
    });

    makeTexture("drone", 54, 54, (g) => {
      g.lineStyle(2, 0xf7ffff, 1);
      g.fillStyle(0x64f2a4, 1);
      g.fillTriangle(27, 4, 47, 42, 27, 32);
      g.fillTriangle(27, 4, 7, 42, 27, 32);
      g.strokeTriangle(27, 4, 47, 42, 27, 32);
      g.strokeTriangle(27, 4, 7, 42, 27, 32);
      g.fillStyle(0x071018, 0.7);
      g.fillCircle(27, 25, 8);
      g.fillStyle(0x38d7ff, 1);
      g.fillCircle(27, 25, 4);
    });

    makeTexture("boss", 180, 160, (g) => {
      g.lineStyle(3, 0xffd4ff, 1);
      g.fillStyle(0xb98cff, 1);
      g.fillTriangle(52, 62, 8, 36, 36, 94);
      g.fillTriangle(128, 62, 172, 36, 144, 94);
      g.fillStyle(0xff5f78, 1);
      g.beginPath();
      g.moveTo(90, 16);
      g.lineTo(118, 68);
      g.lineTo(170, 91);
      g.lineTo(119, 107);
      g.lineTo(90, 148);
      g.lineTo(61, 107);
      g.lineTo(10, 91);
      g.lineTo(62, 68);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0x130915, 0.82);
      g.beginPath();
      g.moveTo(68, 70);
      g.lineTo(90, 35);
      g.lineTo(112, 70);
      g.lineTo(104, 96);
      g.lineTo(76, 96);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffd166, 1);
      g.fillCircle(47, 88, 7);
      g.fillCircle(133, 88, 7);
      g.fillStyle(0x38d7ff, 1);
      g.fillCircle(90, 106, 9);
    });

    makeTexture("playerShot", 28, 42, (g) => {
      g.fillStyle(0x38d7ff, 1);
      g.beginPath();
      g.moveTo(14, 1);
      g.lineTo(24, 19);
      g.lineTo(16, 41);
      g.lineTo(4, 19);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(14, 12, 4);
    });

    makeTexture("enemyShot", 30, 42, (g) => {
      g.fillStyle(0xff5f78, 1);
      g.beginPath();
      g.moveTo(15, 41);
      g.lineTo(4, 20);
      g.lineTo(13, 1);
      g.lineTo(26, 20);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffd166, 0.95);
      g.fillCircle(15, 18, 5);
    });

    makeTexture("powerCore", 64, 64, (g) => {
      g.lineStyle(2, 0xf7ffff, 1);
      g.fillStyle(0x64f2a4, 1);
      g.beginPath();
      g.moveTo(32, 4);
      g.lineTo(51, 13);
      g.lineTo(60, 32);
      g.lineTo(51, 51);
      g.lineTo(32, 60);
      g.lineTo(13, 51);
      g.lineTo(4, 32);
      g.lineTo(13, 13);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.fillStyle(0x071018, 0.68);
      g.beginPath();
      g.moveTo(32, 15);
      g.lineTo(43, 32);
      g.lineTo(32, 49);
      g.lineTo(21, 32);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffffff, 1);
      g.fillCircle(32, 32, 7);
    });

    makeTexture("spark", 12, 12, (g) => {
      g.fillStyle(0x9ef7ff, 1);
      g.fillCircle(6, 6, 6);
    });

    graphics.destroy();
  }

  createLayers() {
    this.starsFar = this.createStarField(76, 0.35, 0x6fb7ff);
    this.starsNear = this.createStarField(44, 0.72, 0xffffff);

    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: false,
    });
    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      runChildUpdate: false,
    });
    this.enemies = this.physics.add.group();
    this.powerUps = this.physics.add.group();

    this.explosions = this.add.particles(0, 0, "spark", {
      speed: { min: 70, max: 260 },
      lifespan: { min: 220, max: 640 },
      quantity: 0,
      scale: { start: 1.1, end: 0 },
      alpha: { start: 0.88, end: 0 },
      blendMode: "ADD",
    });
  }

  createStarField(count, depth, color) {
    return Array.from({ length: count }, () => {
      const star = this.add.circle(
        Phaser.Math.Between(0, this.bounds.width),
        Phaser.Math.Between(0, this.bounds.height),
        Phaser.Math.FloatBetween(0.8, 2.4) * depth,
        color,
        Phaser.Math.FloatBetween(0.28, 0.82)
      );
      star.speed = Phaser.Math.FloatBetween(18, 76) * depth;
      return star;
    });
  }

  createPlayer() {
    this.player = this.physics.add.image(this.bounds.width / 2, this.bounds.height - 86, "player");
    this.player.isPlayer = true;
    this.player.setScale(0.82);
    this.player.setDepth(3);
    this.player.setCollideWorldBounds(true);
    this.player.setCircle(34, 14, 14);

    this.playerAura = this.add.circle(this.player.x, this.player.y, 46, 0x38d7ff, 0.1);
    this.playerAura.setDepth(2);
    const droneSlots = [
      { side: -1, offsetX: -54, offsetY: 28 },
      { side: 1, offsetX: 54, offsetY: 28 },
      { side: -1, offsetX: -88, offsetY: 58 },
      { side: 1, offsetX: 88, offsetY: 58 },
    ];
    this.drones = droneSlots.map((slot, index) => {
      const drone = this.physics.add.image(this.player.x + slot.offsetX, this.player.y + slot.offsetY, "drone");
      drone.side = slot.side;
      drone.slotIndex = index;
      drone.offsetX = slot.offsetX;
      drone.offsetY = slot.offsetY;
      drone.setScale(0.58);
      drone.setDepth(2.8);
      drone.setAlpha(0);
      drone.setActive(false);
      drone.setVisible(false);
      return drone;
    });
    this.createLaserChargeFeedback();
  }

  createLaserChargeFeedback() {
    this.laserChargeHalo = this.add.circle(this.player.x, this.player.y, 46, 0xb98cff, 0.08);
    this.laserChargeHalo.setStrokeStyle(2, 0x38d7ff, 0.36);
    this.laserChargeHalo.setDepth(2.5);

    this.laserChargeBack = this.add.rectangle(0, 0, LASER_CONFIG.meterWidth, 12, 0x06090d, 0.84);
    this.laserChargeBack.setStrokeStyle(1, 0xb98cff, 0.72);
    this.laserChargeBack.setDepth(8);

    this.laserChargeFill = this.add.rectangle(0, 0, LASER_CONFIG.meterWidth - 8, 7, 0xb98cff, 0.92);
    this.laserChargeFill.setOrigin(0, 0.5);
    this.laserChargeFill.setDepth(9);

    this.laserChargeCore = this.add.rectangle(0, 0, LASER_CONFIG.meterWidth - 8, 2, 0xffffff, 0.86);
    this.laserChargeCore.setOrigin(0, 0.5);
    this.laserChargeCore.setDepth(10);

    this.laserChargeText = this.add.text(0, 0, "0%", {
      color: "#f7ffff",
      fontFamily: "Inter, Microsoft YaHei, sans-serif",
      fontSize: "12px",
      fontStyle: "700",
    });
    this.laserChargeText.setOrigin(0.5);
    this.laserChargeText.setDepth(11);

    this.setLaserChargeFeedbackVisible(false);
  }

  createInput() {
    this.input.mouse?.disableContextMenu?.();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      fire: Phaser.Input.Keyboard.KeyCodes.SPACE,
      overdrive: Phaser.Input.Keyboard.KeyCodes.E,
      pause: Phaser.Input.Keyboard.KeyCodes.P,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
    });

    this.input.on("pointermove", (pointer) => {
      if (this.state !== GAME_STATE.PLAYING) return;
      this.pointerTarget = {
        x: pointer.x,
        y: pointer.y,
      };
    });

    this.input.on("pointerdown", (pointer) => {
      if (
        this.state === GAME_STATE.READY ||
        this.state === GAME_STATE.GAME_OVER ||
        this.state === GAME_STATE.VICTORY
      ) {
        this.startMission();
        return;
      }

      if (this.state !== GAME_STATE.PLAYING) return;
      this.pointerTarget = {
        x: pointer.x,
        y: pointer.y,
      };
      this.beginLaserCharge(pointer);
    });

    this.input.on("pointerup", (pointer) => {
      if (this.state !== GAME_STATE.PLAYING) {
        this.cancelLaserCharge();
        return;
      }
      this.releaseLaserCharge(pointer);
    });
  }

  createCollisions() {
    this.physics.add.overlap(this.playerBullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.enemyBullets, this.player, this.hitPlayer, null, this);
    this.physics.add.overlap(this.enemies, this.player, this.enemyRammedPlayer, null, this);
    this.physics.add.overlap(this.powerUps, this.player, this.collectPower, null, this);
  }

  bindUi() {
    this.uiAbort?.abort();
    this.uiAbort = new AbortController();
    const options = { signal: this.uiAbort.signal };

    HUD.primaryAction.addEventListener("click", () => this.startMission(), options);
    HUD.pauseButton.addEventListener("click", () => this.togglePause(), options);
    HUD.bombButton.addEventListener("click", () => this.useBomb(), options);
    HUD.dashButton.addEventListener("click", () => this.useDash(), options);
    HUD.overdriveButton.addEventListener("click", () => this.useOverdrive(), options);
    HUD.audioButton.addEventListener("click", () => this.toggleAudio(), options);
    HUD.restartButton.addEventListener("click", () => this.restartMission(true), options);
    HUD.fullscreenButton.addEventListener("click", () => this.toggleFullscreen(), options);
    HUD.difficultyOptions?.querySelectorAll("button[data-difficulty]").forEach((button) => {
      button.addEventListener("click", () => this.setDifficulty(button.dataset.difficulty), options);
    });
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.code !== "KeyB" || event.repeat) return;
        this.useBomb();
      },
      options
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.code !== "ShiftLeft" && event.code !== "ShiftRight") return;
        if (event.repeat) return;
        event.preventDefault();
        this.useDash();
      },
      options
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.code !== "KeyE" || event.repeat) return;
        this.useOverdrive();
      },
      options
    );
    document.getElementById("game-root")?.addEventListener("contextmenu", (event) => event.preventDefault(), options);
    document.querySelector(".stage-wrap")?.addEventListener("contextmenu", (event) => event.preventDefault(), options);
  }

  resetGameState() {
    this.state = GAME_STATE.READY;
    this.score = 0;
    this.bestScore = readHighScore();
    this.profile = readProfile();
    this.difficulty = this.difficulty || readDifficulty();
    this.wave = 1;
    this.levelWave = 1;
    this.lives = 3;
    this.maxLives = 5;
    this.shield = 0;
    this.maxShield = 99;
    this.bombs = 1;
    this.maxBombs = 3;
    this.weaponLevel = 1;
    this.weaponUpgradeLevel = 0;
    this.weaponBoostUntil = 0;
    this.dashActiveUntil = 0;
    this.dashCooldownUntil = 0;
    this.overdriveCharge = 0;
    this.overdriveUntil = 0;
    this.droneUntil = 0;
    this.droneLevel = 0;
    this.invulnerableUntil = 0;
    this.laserCharging = false;
    this.laserChargeStartedAt = 0;
    this.laserChargeRatio = 0;
    this.laserCooldownUntil = 0;
    this.laserButton = null;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.comboRewardIndex = 0;
    this.comboWindowUntil = 0;
    this.maxCombo = 0;
    this.killCount = 0;
    this.grazeCount = 0;
    this.lastGrazeNoticeAt = 0;
    this.completedObjectives = {};
    this.objectiveHudKey = "";
    this.supplyCharge = 0;
    this.lastShotAt = 0;
    this.lastDroneShotAt = 0;
    this.lastDashTrailAt = 0;
    this.waveActive = false;
    this.waveHadDamage = false;
    this.pendingSpawns = 0;
    this.spawnTimers = [];
    this.nextWaveTimer = null;
    this.pointerTarget = null;
    this.boss = null;
    this.updateDifficultyUi();
  }

  resetRuntimeState() {
    this.time.paused = false;
    this.physics.world.resume();
    this.tweens.resumeAll();
    HUD.pauseButton.textContent = "II";
    this.showOverlay(READY_OVERLAY.title, READY_OVERLAY.copy, READY_OVERLAY.action);
  }

  addScore(points) {
    this.score += Math.max(0, Math.round(points));
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      saveHighScore(this.bestScore);
    }
  }

  awardEnemyScore(baseScore) {
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboWindowUntil = this.time.now + 3200;
    this.comboMultiplier = Math.min(5, 1 + Math.floor(Math.max(0, this.combo - 1) / 4) * 0.25);
    const awarded = Math.round(baseScore * this.comboMultiplier * this.getDifficultyConfig().scoreMultiplier);
    this.addScore(awarded);
    const rewardMessage = this.checkComboRewards();
    return {
      awarded,
      rewardMessage,
    };
  }

  recordKill(enemy, allowSupplyDrop) {
    this.killCount += 1;
    this.addOverdriveCharge(enemy?.isBoss ? OVERDRIVE_CONFIG.bossKillCharge : OVERDRIVE_CONFIG.killCharge);
    if (!allowSupplyDrop || enemy?.isBoss) return false;

    this.supplyCharge = Math.min(SUPPLY_CONFIG.killsPerDrop, this.supplyCharge + 1);
    if (this.supplyCharge < SUPPLY_CONFIG.killsPerDrop) return false;

    this.supplyCharge = 0;
    return true;
  }

  addOverdriveCharge(amount) {
    if (this.overdriveUntil > this.time.now) return;
    this.overdriveCharge = clamp(this.overdriveCharge + amount, 0, OVERDRIVE_CONFIG.maxCharge);
  }

  isOverdriveActive() {
    return this.overdriveUntil > this.time.now;
  }

  useOverdrive() {
    if (this.state !== GAME_STATE.PLAYING || !this.player?.active) return;
    if (this.isOverdriveActive()) {
      this.updateHud("超载模式已在运行。");
      return;
    }
    if (this.overdriveCharge < OVERDRIVE_CONFIG.maxCharge) {
      this.updateHud(`超载能量不足：${Math.round(this.overdriveCharge)}%。`);
      return;
    }

    AUDIO.playPower();
    this.overdriveCharge = 0;
    this.overdriveUntil = this.time.now + OVERDRIVE_CONFIG.activeMs;
    const clearedBullets = this.clearEnemyBulletsNearPlayer(OVERDRIVE_CONFIG.bulletClearRadius);
    this.addScore(clearedBullets * 14);
    this.showOverdrivePulse();
    this.updateHud(clearedBullets > 0 ? `超载模式启动，清除近身弹体 ${clearedBullets} 枚。` : "超载模式启动，火控阵列加速。");
  }

  showOverdrivePulse() {
    const ring = this.add.circle(this.player.x, this.player.y, 28, 0xffd166, 0.13);
    ring.setStrokeStyle(3, 0xffffff, 0.74);
    ring.setDepth(6);
    this.tweens.add({
      targets: ring,
      radius: OVERDRIVE_CONFIG.bulletClearRadius,
      alpha: 0,
      duration: 320,
      ease: "Quad.easeOut",
      onComplete: () => ring.destroy(),
    });
  }

  checkComboRewards() {
    let rewardMessage = "";

    while (this.comboRewardIndex < COMBO_REWARDS.length) {
      const reward = COMBO_REWARDS[this.comboRewardIndex];
      if (this.combo < reward.combo) break;

      this.comboRewardIndex += 1;
      rewardMessage = this.applyComboReward(reward);
    }

    return rewardMessage;
  }

  applyComboReward(reward) {
    AUDIO.playPower();
    if (reward.score) this.addScore(reward.score);
    if (reward.shield) this.shield = clamp(this.shield + reward.shield, 0, this.maxShield);
    if (reward.bombs) this.bombs = clamp(this.bombs + reward.bombs, 0, this.maxBombs);

    if (reward.weaponUpgrade) {
      this.weaponBoostUntil = RUN_PERMANENT;
      if (this.weaponUpgradeLevel < POWER_LIMITS.weaponMaxLevel - 1) {
        this.weaponUpgradeLevel += reward.weaponUpgrade;
        this.weaponUpgradeLevel = Math.min(this.weaponUpgradeLevel, POWER_LIMITS.weaponMaxLevel - 1);
        this.weaponLevel = 1 + this.weaponUpgradeLevel;
      }
    }

    if (reward.droneUpgrade) {
      this.droneUntil = RUN_PERMANENT;
      this.droneLevel = Math.min(POWER_LIMITS.droneMaxLevel, this.droneLevel + reward.droneUpgrade);
    }

    const message = `${reward.combo} 连击奖励：${reward.label}。`;
    this.showComboRewardText(reward.label);
    return message;
  }

  showComboRewardText(label) {
    if (!this.player?.active) return;

    const text = this.add.text(this.player.x, this.player.y - 76, label, {
      color: "#f7ffff",
      fontFamily: "Inter, Microsoft YaHei, sans-serif",
      fontSize: "18px",
      fontStyle: "900",
      stroke: "#071018",
      strokeThickness: 5,
    });
    text.setOrigin(0.5);
    text.setDepth(8);

    this.tweens.add({
      targets: text,
      y: text.y - 34,
      alpha: 0,
      scale: 1.18,
      duration: 760,
      ease: "Quad.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  resetCombo() {
    this.combo = 0;
    this.comboMultiplier = 1;
    this.comboRewardIndex = 0;
    this.comboWindowUntil = 0;
  }

  updateCombo(time) {
    if (this.combo > 0 && time > this.comboWindowUntil) {
      this.resetCombo();
    }
  }

  getPointerButton(pointer) {
    const eventButton = pointer?.event?.button;
    return Number.isInteger(eventButton) ? eventButton : pointer?.button;
  }

  isLaserButton(pointer) {
    const button = this.getPointerButton(pointer);
    return button === 0 || button === 2;
  }

  beginLaserCharge(pointer) {
    if (!this.isLaserButton(pointer) || this.laserCharging) return;

    const cooldownRemaining = Math.max(0, this.laserCooldownUntil - this.time.now);
    if (cooldownRemaining > 0) {
      this.updateHud(`激光炮冷却中，还需 ${(cooldownRemaining / 1000).toFixed(1)} 秒。`);
      return;
    }

    this.laserCharging = true;
    this.laserChargeStartedAt = this.time.now;
    this.laserChargeRatio = 0;
    this.laserButton = this.getPointerButton(pointer);
    this.updateLaserChargeFeedback();
    AUDIO.startCharge();
    this.updateHud("激光炮开始蓄力。");
  }

  releaseLaserCharge(pointer) {
    if (!this.laserCharging) return;

    const button = this.getPointerButton(pointer);
    if ((button === 0 || button === 2) && button !== this.laserButton) return;

    const chargeMs = Math.max(0, this.time.now - this.laserChargeStartedAt);
    const chargeRatio = clamp(chargeMs / LASER_CONFIG.fullChargeMs, 0, 1);
    this.cancelLaserCharge();

    if (chargeMs < LASER_CONFIG.minChargeMs) {
      AUDIO.stopCharge();
      this.updateHud("激光炮蓄力不足。");
      return;
    }

    this.fireLaser(chargeRatio);
    this.laserCooldownUntil = this.time.now + LASER_CONFIG.cooldownMs;
  }

  cancelLaserCharge() {
    this.laserCharging = false;
    this.laserChargeStartedAt = 0;
    this.laserChargeRatio = 0;
    this.laserButton = null;
    this.setLaserChargeFeedbackVisible(false);
    AUDIO.stopCharge();
  }

  updateLaserCharge(time) {
    if (!this.laserCharging) return;
    this.laserChargeRatio = clamp((time - this.laserChargeStartedAt) / LASER_CONFIG.fullChargeMs, 0, 1);
    this.updateLaserChargeFeedback();
  }

  setLaserChargeFeedbackVisible(visible) {
    [
      this.laserChargeBack,
      this.laserChargeFill,
      this.laserChargeCore,
      this.laserChargeHalo,
      this.laserChargeText,
    ].forEach((part) => {
      if (part) part.setVisible(visible);
    });
  }

  updateLaserChargeFeedback() {
    if (!this.player?.active || !this.laserCharging) {
      this.setLaserChargeFeedbackVisible(false);
      return;
    }

    const ratio = clamp(this.laserChargeRatio, 0, 1);
    const meterWidth = LASER_CONFIG.meterWidth;
    const meterX = this.player.x;
    const meterY = Math.max(28, this.player.y - 68);
    const fillX = meterX - meterWidth / 2 + 4;
    const fillScale = Math.max(0.02, ratio);
    const pulse = 0.5 + Math.sin(this.time.now / 72) * 0.5;

    this.setLaserChargeFeedbackVisible(true);
    this.laserChargeBack.setPosition(meterX, meterY);
    this.laserChargeFill.setPosition(fillX, meterY);
    this.laserChargeFill.setScale(fillScale, 1);
    this.laserChargeFill.setFillStyle(ratio >= 0.98 ? 0xffffff : ratio >= 0.65 ? 0x38d7ff : 0xb98cff, 0.92);
    this.laserChargeCore.setPosition(fillX, meterY);
    this.laserChargeCore.setScale(fillScale, 1);
    this.laserChargeHalo.setPosition(this.player.x, this.player.y);
    this.laserChargeHalo.setScale(0.9 + ratio * 0.42 + pulse * 0.06);
    this.laserChargeHalo.setAlpha(0.12 + ratio * 0.2 + pulse * 0.08);
    this.laserChargeText.setPosition(meterX, meterY - 16);
    this.laserChargeText.setText(`${Math.round(ratio * 100)}%`);
  }

  fireLaser(chargeRatio) {
    if (!this.player?.active) return;
    AUDIO.playLaser(chargeRatio);

    const width = Phaser.Math.Linear(LASER_CONFIG.minWidth, LASER_CONFIG.maxWidth, chargeRatio);
    const damage = Math.round(LASER_CONFIG.baseDamage + LASER_CONFIG.maxBonusDamage * chargeRatio);
    const beamHeight = Math.max(32, this.player.y);
    const beamX = this.player.x;
    const beamY = beamHeight / 2;
    const outerBeam = this.add.rectangle(beamX, beamY, width, beamHeight, 0xb98cff, 0.42);
    const coreBeam = this.add.rectangle(beamX, beamY, Math.max(8, width * 0.34), beamHeight, 0xf7ffff, 0.86);
    outerBeam.setDepth(4);
    coreBeam.setDepth(5);

    this.tweens.add({
      targets: [outerBeam, coreBeam],
      alpha: 0,
      duration: 180,
      ease: "Quad.easeOut",
      onComplete: () => {
        outerBeam.destroy();
        coreBeam.destroy();
      },
    });
    this.cameras.main.shake(90, 0.004 + chargeRatio * 0.004);

    let hitCount = 0;
    [...this.enemyBullets.getChildren()].forEach((bullet) => {
      if (!bullet.active || bullet.y > this.player.y) return;
      if (Math.abs(bullet.x - beamX) <= width * 0.62 + 16) {
        bullet.destroy();
        hitCount += 1;
      }
    });

    [...this.enemies.getChildren()].forEach((enemy) => {
      if (!enemy.active || enemy.y > this.player.y + 24) return;
      const enemyPadding = enemy.isBoss ? 90 : 40;
      if (Math.abs(enemy.x - beamX) > width / 2 + enemyPadding) return;

      hitCount += 1;
      enemy.hp -= damage;
      enemy.setBlendMode(Phaser.BlendModes.ADD);
      this.explosions.emitParticleAt(enemy.x, enemy.y, enemy.isBoss ? 22 : 10);
      this.time.delayedCall(70, () => {
        if (enemy.active) enemy.setBlendMode(Phaser.BlendModes.NORMAL);
      });
      if (enemy.hp <= 0) {
        this.destroyEnemy(enemy);
      }
    });

    const chargeLabel = chargeRatio >= 0.98 ? "满载" : `${Math.round(chargeRatio * 100)}%`;
    this.updateHud(hitCount > 0 ? `${chargeLabel} 激光炮命中 ${hitCount} 个目标。` : `${chargeLabel} 激光炮已发射。`);
  }

  cleanupScene() {
    this.clearWaveTimers();
    this.scale.off("resize", this.handleResize, this);
    this.uiAbort?.abort();
    this.uiAbort = null;
  }

  startMission() {
    if (this.state === GAME_STATE.PLAYING) return;
    if (this.state === GAME_STATE.PAUSED) {
      this.resumeMission();
      return;
    }
    if (this.state === GAME_STATE.GAME_OVER || this.state === GAME_STATE.VICTORY) {
      this.restartMission(true);
      return;
    }

    AUDIO.unlock();
    this.state = GAME_STATE.PLAYING;
    this.time.paused = false;
    this.physics.world.resume();
    this.tweens.resumeAll();
    this.hideOverlay();
    this.updateHud("推进器点火，航道清空中。");
    this.spawnWave();
  }

  restartMission(autoStart = false) {
    this.autoStartAfterRestart = autoStart;
    this.cancelLaserCharge();
    this.clearWaveTimers();
    this.time.paused = false;
    this.physics.world.resume();
    this.tweens.resumeAll();
    this.scene.restart();
  }

  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.pauseMission();
      return;
    }
    if (this.state === GAME_STATE.PAUSED) {
      this.resumeMission();
    }
  }

  pauseMission() {
    if (this.state !== GAME_STATE.PLAYING) return;
    this.cancelLaserCharge();
    AUDIO.stopCharge();
    this.state = GAME_STATE.PAUSED;
    HUD.pauseButton.textContent = "▶";
    this.showOverlay("系统待命", "引擎保持热态，目标锁定未丢失。", "继续");
    this.updateHud("战术暂停。");
    this.physics.world.pause();
    this.tweens.pauseAll();
    this.time.paused = true;
  }

  resumeMission() {
    if (this.state !== GAME_STATE.PAUSED) return;
    AUDIO.unlock();
    this.state = GAME_STATE.PLAYING;
    this.time.paused = false;
    this.physics.world.resume();
    this.tweens.resumeAll();
    HUD.pauseButton.textContent = "II";
    this.hideOverlay();
    this.updateHud("航道重新接管。");
  }

  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
      return;
    }
    this.scale.startFullscreen();
  }

  toggleAudio() {
    AUDIO.unlock();
    const enabled = AUDIO.toggle();
    HUD.audioButton.textContent = enabled ? "♪" : "×";
    HUD.audioButton.classList.toggle("is-muted", !enabled);
    HUD.audioButton.setAttribute("aria-label", enabled ? "声音开关" : "声音已关闭");
    HUD.audioButton.setAttribute("title", enabled ? "声音开关" : "声音已关闭");
    this.updateHud(enabled ? "音频系统上线。" : "音频系统静默。");
  }

  getDifficultyConfig() {
    return DIFFICULTY_MODES[this.difficulty] || DIFFICULTY_MODES.normal;
  }

  setDifficulty(difficulty) {
    if (!DIFFICULTY_MODES[difficulty]) return;
    this.difficulty = difficulty;
    saveDifficulty(difficulty);
    this.updateDifficultyUi();
    const config = this.getDifficultyConfig();
    const suffix = this.state === GAME_STATE.PLAYING ? "后续刷敌立即采用。" : "本局将采用。";
    this.updateHud(`难度切换为${config.label}，${suffix}`);
  }

  updateDifficultyUi() {
    const activeDifficulty = this.difficulty || "normal";
    HUD.difficultyOptions?.querySelectorAll("button[data-difficulty]").forEach((button) => {
      const isActive = button.dataset.difficulty === activeDifficulty;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  getProgressIndex() {
    return (this.wave - 1) * LEVEL_CONFIG.wavesPerLevel + this.levelWave;
  }

  showOverlay(title, copy, action) {
    HUD.overlayTitle.textContent = title;
    HUD.overlayCopy.textContent = copy;
    HUD.primaryAction.textContent = action;
    HUD.overlay.classList.remove("is-hidden");
  }

  hideOverlay() {
    HUD.overlay.classList.add("is-hidden");
    HUD.primaryAction.textContent = "启动";
  }

  spawnWave() {
    if (this.state !== GAME_STATE.PLAYING) return;

    this.clearWaveTimers();
    this.waveActive = true;
    this.waveHadDamage = false;
    const progressIndex = this.getProgressIndex();
    const isBossWave = this.levelWave === LEVEL_CONFIG.bossWave;
    if (isBossWave) {
      this.pendingSpawns = 0;
      this.spawnBoss();
      this.updateHud(`第 ${this.wave}/${LEVEL_CONFIG.maxLevel} 关第 ${this.levelWave}/${LEVEL_CONFIG.wavesPerLevel} 波，Boss 进入火控范围。`);
      return;
    }

    const difficulty = this.getDifficultyConfig();
    const enemyCount = Math.min(38, 5 + this.wave + this.levelWave + Math.floor(progressIndex / 7) + difficulty.enemyCountBonus);
    this.pendingSpawns = enemyCount;
    for (let index = 0; index < enemyCount; index += 1) {
      const timer = this.time.delayedCall(index * 220, () => {
        this.spawnTimers = this.spawnTimers.filter((spawnTimer) => spawnTimer !== timer);
        this.pendingSpawns = Math.max(0, this.pendingSpawns - 1);
        if (this.state !== GAME_STATE.PLAYING) return;
        const type =
          progressIndex >= 12 && (index % 6 === 3 || (progressIndex >= 42 && index % 7 === 5))
            ? "interceptor"
            : index % 5 === 4 || (progressIndex >= 25 && index % 4 === 2)
              ? "heavy"
              : "scout";
        this.spawnEnemy(type, index);
      });
      this.spawnTimers.push(timer);
    }

    this.updateHud(`第 ${this.wave}/${LEVEL_CONFIG.maxLevel} 关第 ${this.levelWave}/${LEVEL_CONFIG.wavesPerLevel} 波接敌。`);
  }

  spawnEnemy(typeName, index) {
    const type = ENEMY_TYPES[typeName];
    const difficulty = this.getDifficultyConfig();
    const progressIndex = this.getProgressIndex();
    const xStep = this.bounds.width / 7;
    const spawnX = xStep + (index % 6) * xStep + Phaser.Math.Between(-22, 22);
    const enemy = this.enemies.create(spawnX, -52, type.key);
    enemy.isEnemy = true;
    enemy.enemyType = typeName;
    enemy.hp = Math.ceil((type.hp + Math.floor(progressIndex / 8)) * difficulty.hpMultiplier);
    enemy.scoreValue = type.score;
    enemy.fireRate = Math.max(360, (type.fireRate - progressIndex * 12) * difficulty.fireRateMultiplier);
    enemy.nextShotAt = this.time.now + Phaser.Math.Between(600, 1800);
    enemy.drift = Phaser.Math.FloatBetween(0.6, 1.65);
    enemy.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    enemy.setScale(type.scale);
    enemy.setTint(type.tint);
    enemy.setVelocityY((type.speed + progressIndex * (typeName === "interceptor" ? 1.8 : 1.25)) * difficulty.speedMultiplier);
    enemy.setCircle(36, 10, 10);
  }

  spawnBoss() {
    const difficulty = this.getDifficultyConfig();
    const progressIndex = this.getProgressIndex();
    const boss = this.enemies.create(this.bounds.width / 2, -126, "boss");
    boss.isEnemy = true;
    boss.isBoss = true;
    boss.hp = Math.ceil((82 + this.wave * 24 + progressIndex * 2.2) * difficulty.hpMultiplier);
    boss.maxHp = boss.hp;
    boss.scoreValue = 2800 + this.wave * 260;
    boss.fireRate = Math.max(300, (1120 - progressIndex * 7) * difficulty.fireRateMultiplier);
    boss.baseFireRate = boss.fireRate;
    boss.bossPhaseIndex = 0;
    boss.nextShotAt = this.time.now + 900;
    boss.setScale(0.95);
    boss.setVelocity(0, 42);
    boss.setCircle(78, 28, 30);
    this.boss = boss;

    this.tweens.add({
      targets: boss,
      x: {
        from: Math.max(120, this.bounds.width * 0.24),
        to: Math.min(this.bounds.width - 120, this.bounds.width * 0.76),
      },
      duration: 2800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  update(time, delta) {
    this.updateStars(delta);
    this.updatePlayer(delta);

    if (this.state !== GAME_STATE.PLAYING) return;

    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.pauseMission();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
      this.restartMission(true);
      return;
    }

    this.updateCombo(time);
    this.weaponLevel = 1 + this.weaponUpgradeLevel;
    this.updateLaserCharge(time);
    this.updateDashEffects(time);
    this.updateDrones(time, delta);
    this.updateEnemies(time, delta);
    this.updateProjectiles();
    this.updatePowerUps(delta);
    this.firePlayerWeapon(time);
    this.fireDroneWeapons(time);
    this.checkWaveClear();
    this.updateHud();
  }

  updateStars(delta) {
    const dt = delta / 1000;
    for (const star of [...this.starsFar, ...this.starsNear]) {
      star.y += star.speed * dt;
      if (star.y > this.bounds.height + 6) {
        star.x = Phaser.Math.Between(0, this.bounds.width);
        star.y = -6;
      }
    }
  }

  updatePlayer(delta) {
    if (!this.player) return;

    const isDashing = this.dashActiveUntil > this.time.now;
    const baseSpeed = 330 + (this.isOverdriveActive() ? OVERDRIVE_CONFIG.speedBonus : 0);
    const speed = isDashing ? baseSpeed * DASH_CONFIG.speedMultiplier : baseSpeed;
    let vx = 0;
    let vy = 0;

    if (this.state === GAME_STATE.PLAYING) {
      if (this.cursors.left.isDown || this.keys.left.isDown) vx -= speed;
      if (this.cursors.right.isDown || this.keys.right.isDown) vx += speed;
      if (this.cursors.up.isDown || this.keys.up.isDown) vy -= speed;
      if (this.cursors.down.isDown || this.keys.down.isDown) vy += speed;
    }

    this.player.setVelocity(vx, vy);

    if (this.pointerTarget && this.state === GAME_STATE.PLAYING && vx === 0 && vy === 0) {
      const blend = Math.min(1, delta / 115);
      this.player.x = Phaser.Math.Linear(this.player.x, this.pointerTarget.x, blend);
      this.player.y = Phaser.Math.Linear(this.player.y, this.pointerTarget.y, blend);
    }

    this.player.x = clamp(this.player.x, 42, this.bounds.width - 42);
    this.player.y = clamp(this.player.y, this.bounds.height * 0.42, this.bounds.height - 42);
    this.playerAura.setPosition(this.player.x, this.player.y);
    this.player.setAlpha(this.invulnerableUntil > this.time.now ? 0.58 + Math.sin(this.time.now / 58) * 0.22 : 1);
    const overdriveActive = this.isOverdriveActive();
    this.playerAura.setAlpha(
      isDashing
        ? 0.38 + Math.sin(this.time.now / 42) * 0.1
        : overdriveActive
          ? 0.34 + Math.sin(this.time.now / 56) * 0.1
          : this.shield > 0
            ? 0.25 + Math.sin(this.time.now / 120) * 0.08
            : 0.08
    );
    this.playerAura.setRadius(isDashing ? 66 : overdriveActive ? 60 : this.shield > 0 ? 52 : 42);
  }

  useDash() {
    if (this.state !== GAME_STATE.PLAYING || !this.player?.active) return;

    const cooldownRemaining = Math.max(0, this.dashCooldownUntil - this.time.now);
    if (cooldownRemaining > 0) {
      this.updateHud(`相位冲刺冷却中，还需 ${(cooldownRemaining / 1000).toFixed(1)} 秒。`);
      return;
    }

    this.cancelLaserCharge();
    AUDIO.playDash();
    this.dashActiveUntil = this.time.now + DASH_CONFIG.activeMs;
    this.dashCooldownUntil = this.time.now + DASH_CONFIG.cooldownMs;
    this.invulnerableUntil = Math.max(this.invulnerableUntil, this.dashActiveUntil + 160);

    const clearedBullets = this.clearEnemyBulletsNearPlayer(DASH_CONFIG.bulletClearRadius);

    const ring = this.add.circle(this.player.x, this.player.y, 24, 0x64f2a4, 0.1);
    ring.setStrokeStyle(2, 0x38d7ff, 0.76);
    ring.setDepth(6);
    this.tweens.add({
      targets: ring,
      radius: DASH_CONFIG.bulletClearRadius,
      alpha: 0,
      duration: 260,
      ease: "Quad.easeOut",
      onComplete: () => ring.destroy(),
    });

    this.cameras.main.shake(70, 0.003);
    this.addScore(clearedBullets * 12);
    this.updateHud(clearedBullets > 0 ? `相位冲刺启动，清除近身弹体 ${clearedBullets} 枚。` : "相位冲刺启动。");
  }

  updateDashEffects(time) {
    if (this.dashActiveUntil <= time || !this.player?.active) return;
    if (time - this.lastDashTrailAt < 58) return;

    this.lastDashTrailAt = time;
    const afterimage = this.add.image(this.player.x, this.player.y, "player");
    afterimage.setScale(this.player.scaleX);
    afterimage.setAlpha(0.26);
    afterimage.setTint(0x64f2a4);
    afterimage.setDepth(1.8);
    this.tweens.add({
      targets: afterimage,
      alpha: 0,
      scaleX: this.player.scaleX * 1.08,
      scaleY: this.player.scaleY * 1.08,
      duration: 220,
      ease: "Quad.easeOut",
      onComplete: () => afterimage.destroy(),
    });
  }

  updateDrones(time, delta) {
    if (!this.player?.active || !this.drones?.length) return;

    const active = this.droneUntil > time && this.droneLevel > 0;
    const blend = Math.min(1, delta / 140);
    this.drones.forEach((drone) => {
      const droneActive = active && drone.slotIndex < this.droneLevel;
      const targetX = this.player.x + drone.offsetX;
      const targetY = this.player.y + drone.offsetY + Math.sin(time / 180 + drone.side + drone.slotIndex) * 7;
      drone.setActive(droneActive);
      drone.setVisible(droneActive);
      drone.setAlpha(droneActive ? 0.86 : 0);
      drone.x = Phaser.Math.Linear(drone.x, clamp(targetX, 30, this.bounds.width - 30), blend);
      drone.y = Phaser.Math.Linear(drone.y, clamp(targetY, this.bounds.height * 0.42, this.bounds.height - 30), blend);
      drone.rotation = Math.sin(time / 220 + drone.side + drone.slotIndex) * 0.12;
    });
  }

  updateEnemies(time, delta) {
    const dt = delta / 1000;
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      if (!enemy.isBoss) {
        if (enemy.enemyType === "interceptor" && this.player?.active) {
          const lead = clamp(this.player.x - enemy.x, -95, 95);
          enemy.x += lead * dt * 0.72 + Math.sin(time / 360 + enemy.phase) * 24 * dt;
        } else {
          enemy.x += Math.sin(time / 520 + enemy.phase) * enemy.drift * 42 * dt;
        }
        if (enemy.y > this.bounds.height + 92) {
          enemy.destroy();
          return;
        }
      } else if (enemy.y > 110) {
        enemy.setVelocityY(0);
        this.updateBossPhase(enemy);
      }

      if (this.state === GAME_STATE.PLAYING && time >= enemy.nextShotAt) {
        this.fireEnemyWeapon(enemy);
        enemy.nextShotAt = time + enemy.fireRate + Phaser.Math.Between(-180, 260);
      }
    });
  }

  updateBossPhase(boss) {
    if (!boss?.active || !boss.maxHp) return;

    const hpRatio = clamp(boss.hp / boss.maxHp, 0, 1);
    let nextPhaseIndex = 0;
    for (let index = 1; index < BOSS_PHASES.length; index += 1) {
      if (hpRatio <= BOSS_PHASES[index].threshold) nextPhaseIndex = index;
    }

    if (nextPhaseIndex === boss.bossPhaseIndex) return;

    boss.bossPhaseIndex = nextPhaseIndex;
    const phase = BOSS_PHASES[nextPhaseIndex];
    boss.fireRate = Math.max(220, boss.baseFireRate * phase.fireRateMultiplier);
    boss.setTint(phase.tint);
    this.explosions.emitParticleAt(boss.x, boss.y, 42);
    this.cameras.main.shake(120, 0.004 + nextPhaseIndex * 0.001);

    const pulse = this.add.circle(boss.x, boss.y, 64, phase.tint, 0.12);
    pulse.setStrokeStyle(3, phase.tint, 0.68);
    pulse.setDepth(5);
    this.tweens.add({
      targets: pulse,
      radius: 168,
      alpha: 0,
      duration: 520,
      ease: "Quad.easeOut",
      onComplete: () => pulse.destroy(),
    });

    this.updateHud(`Boss 阶段变化：${phase.label}，火力正在增强。`);
  }

  updateProjectiles() {
    this.playerBullets.getChildren().forEach((bullet) => {
      if (bullet.y < -36) bullet.destroy();
    });
    this.enemyBullets.getChildren().forEach((bullet) => {
      this.checkGrazeReward(bullet);
      if (bullet.y > this.bounds.height + 36 || bullet.x < -36 || bullet.x > this.bounds.width + 36) {
        bullet.destroy();
      }
    });
  }

  checkGrazeReward(bullet) {
    if (!bullet.active) return;
    if (bullet.grazed || this.state !== GAME_STATE.PLAYING || !this.player?.active) return;
    if (this.invulnerableUntil > this.time.now) return;

    const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, this.player.x, this.player.y);
    if (distance < GRAZE_CONFIG.minDistance || distance > GRAZE_CONFIG.radius) return;

    bullet.grazed = true;
    bullet.setTint(0xf7ffff);
    this.grazeCount += 1;
    this.addOverdriveCharge(OVERDRIVE_CONFIG.grazeCharge);
    this.addScore(GRAZE_CONFIG.score * this.getDifficultyConfig().scoreMultiplier);

    const shieldRewarded = this.grazeCount % GRAZE_CONFIG.shieldEvery === 0;
    if (shieldRewarded) {
      this.shield = clamp(this.shield + GRAZE_CONFIG.shieldReward, 0, this.maxShield);
    }

    this.showGrazeText(bullet.x, bullet.y, shieldRewarded);
    if (shieldRewarded || this.time.now - this.lastGrazeNoticeAt > 900) {
      this.lastGrazeNoticeAt = this.time.now;
      this.updateHud(shieldRewarded ? "精准擦弹，护盾回充。" : "近距擦弹，获得额外分数。");
    }
    this.checkMissionObjectives();
  }

  showGrazeText(x, y, shieldRewarded) {
    const text = this.add.text(x, y, shieldRewarded ? "+护盾" : "+擦弹", {
      color: shieldRewarded ? "#64f2a4" : "#f7ffff",
      fontFamily: "Inter, Microsoft YaHei, sans-serif",
      fontSize: "13px",
      fontStyle: "900",
      stroke: "#071018",
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(7);

    this.tweens.add({
      targets: text,
      y: y - 28,
      alpha: 0,
      duration: 520,
      ease: "Quad.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  updatePowerUps(delta) {
    const dt = delta / 1000;
    this.powerUps.getChildren().forEach((power) => {
      power.rotation += dt * 2.4;
      if (this.player?.active) {
        const distance = Phaser.Math.Distance.Between(power.x, power.y, this.player.x, this.player.y);
        if (distance <= POWER_MAGNET_CONFIG.radius) {
          const angle = Phaser.Math.Angle.Between(power.x, power.y, this.player.x, this.player.y);
          const pull = 1 - clamp(distance / POWER_MAGNET_CONFIG.radius, 0, 1);
          const speed = Phaser.Math.Linear(POWER_MAGNET_CONFIG.minSpeed, POWER_MAGNET_CONFIG.maxSpeed, pull);
          power.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        } else {
          power.setVelocity(0, 118);
        }
      }

      if (power.label) {
        power.label.setPosition(power.x, power.y + 34);
        power.label.setAlpha(power.y > 10 ? 0.82 : 0);
      }

      if (power.y > this.bounds.height + 48) this.destroyPower(power);
    });
  }

  firePlayerWeapon(time) {
    const overdriveActive = this.isOverdriveActive();
    const interval = Math.max(62, (168 - this.weaponUpgradeLevel * 18) * (overdriveActive ? OVERDRIVE_CONFIG.fireRateMultiplier : 1));
    if (time - this.lastShotAt < interval) return;
    this.lastShotAt = time;
    AUDIO.playShot();

    const shotPatterns = {
      1: [0],
      2: [-14, 14],
      3: [-18, 0, 18],
      4: [-24, -8, 8, 24],
      5: [-30, -18, -6, 6, 18, 30],
    };
    const effectiveWeaponLevel = Math.min(this.weaponLevel + (overdriveActive ? 1 : 0), POWER_LIMITS.weaponMaxLevel);
    const shots = shotPatterns[effectiveWeaponLevel] || shotPatterns[1];
    shots.forEach((offset, index) => {
      const bullet = this.playerBullets.getFirstDead(false) || this.playerBullets.create(0, 0, "playerShot");
      if (!bullet) return;
      bullet.isPlayerShot = true;
      bullet.enableBody(true, this.player.x + offset, this.player.y - 34, true, true);
      const centerIndex = (shots.length - 1) / 2;
      bullet.setScale(Math.abs(index - centerIndex) < 0.6 ? 0.74 : 0.58);
      bullet.setVelocity(offset * 4.6, -580 - this.weaponUpgradeLevel * 18);
      bullet.setCircle(12, 10, 10);
      bullet.damage = 1 + this.weaponUpgradeLevel * 0.18 + (overdriveActive ? OVERDRIVE_CONFIG.damageBonus : 0);
      if (overdriveActive) {
        bullet.setTint(0xfff2a6);
      } else {
        bullet.clearTint();
      }
      bullet.setDepth(2);
    });
  }

  fireDroneWeapons(time) {
    const interval = Math.max(150, 290 - this.droneLevel * 28);
    if (this.droneUntil <= time || this.droneLevel <= 0 || time - this.lastDroneShotAt < interval) return;
    this.lastDroneShotAt = time;
    AUDIO.playDroneShot();

    this.drones.forEach((drone) => {
      if (!drone.active) return;
      const bullet = this.playerBullets.getFirstDead(false) || this.playerBullets.create(0, 0, "playerShot");
      if (!bullet) return;
      bullet.isPlayerShot = true;
      bullet.enableBody(true, drone.x, drone.y - 22, true, true);
      bullet.setScale(0.5);
      bullet.setVelocity(drone.side * 22, -520);
      bullet.setCircle(12, 10, 10);
      bullet.damage = 0.55 + this.droneLevel * 0.08;
      bullet.setTint(0x64f2a4);
      bullet.setDepth(2);
    });
  }

  useBomb() {
    if (this.state !== GAME_STATE.PLAYING) return;
    if (this.bombs <= 0) {
      this.updateHud("脉冲炸弹库存为空。");
      return;
    }

    this.bombs -= 1;
    this.cancelLaserCharge();
    AUDIO.playBomb();
    const wave = this.add.circle(this.player.x, this.player.y, 32, 0x38d7ff, 0.16);
    wave.setStrokeStyle(3, 0xf7ffff, 0.78);
    wave.setDepth(6);
    this.tweens.add({
      targets: wave,
      radius: Math.max(this.bounds.width, this.bounds.height),
      alpha: 0,
      duration: 420,
      ease: "Quad.easeOut",
      onComplete: () => wave.destroy(),
    });

    const clearedBullets = this.enemyBullets.countActive(true);
    this.enemyBullets.clear(true, true);
    let hitCount = 0;
    [...this.enemies.getChildren()].forEach((enemy) => {
      if (!enemy.active) return;
      hitCount += 1;
      enemy.hp -= enemy.isBoss ? 24 : 8;
      enemy.setBlendMode(Phaser.BlendModes.ADD);
      this.explosions.emitParticleAt(enemy.x, enemy.y, enemy.isBoss ? 34 : 18);
      this.time.delayedCall(90, () => {
        if (enemy.active) enemy.setBlendMode(Phaser.BlendModes.NORMAL);
      });
      if (enemy.hp <= 0) {
        this.destroyEnemy(enemy, { allowDrop: false });
      }
    });

    this.cameras.main.shake(180, 0.008);
    this.addScore(clearedBullets * 18);
    this.updateHud(`脉冲炸弹释放，压制 ${hitCount} 个目标并清除 ${clearedBullets} 枚弹体。`);
  }

  fireEnemyWeapon(enemy) {
    AUDIO.playEnemyShot();
    const bossPhase = enemy.isBoss ? BOSS_PHASES[enemy.bossPhaseIndex] || BOSS_PHASES[0] : null;
    const spread = bossPhase?.spread || [0];
    const shotCount = spread.length;
    for (let i = 0; i < shotCount; i += 1) {
      const bullet = this.enemyBullets.getFirstDead(false) || this.enemyBullets.create(0, 0, "enemyShot");
      if (!bullet) return;
      bullet.isEnemyShot = true;
      bullet.grazed = false;
      bullet.enableBody(true, enemy.x, enemy.y + 38, true, true);
      bullet.setScale(enemy.isBoss ? 0.74 : 0.58);
      if (enemy.enemyType === "interceptor" && this.player?.active) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const speed = 235 + this.wave * 10;
        bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        bullet.rotation = angle + Math.PI / 2;
        bullet.setTint(0x9ef7ff);
      } else {
        bullet.setVelocity(spread[i], enemy.isBoss ? bossPhase.bulletSpeed + this.wave * 8 : 260 + this.wave * 12);
        if (enemy.isBoss) {
          bullet.setTint(bossPhase.tint);
        } else {
          bullet.clearTint();
        }
      }
      bullet.setCircle(12, 10, 10);
      bullet.setDepth(2);
    }
  }

  hitEnemy(firstObject, secondObject) {
    const bullet = firstObject?.isPlayerShot ? firstObject : secondObject?.isPlayerShot ? secondObject : null;
    const enemy = firstObject?.isEnemy ? firstObject : secondObject?.isEnemy ? secondObject : null;
    if (!bullet || !enemy) return;
    if (!bullet.active || !enemy.active) return;
    bullet.destroy();
    enemy.hp -= bullet.damage || 1;
    enemy.setBlendMode(Phaser.BlendModes.ADD);
    this.time.delayedCall(40, () => {
      if (enemy.active) enemy.setBlendMode(Phaser.BlendModes.NORMAL);
    });

    if (enemy.hp > 0) return;
    this.destroyEnemy(enemy);
  }

  destroyEnemy(enemy, options = {}) {
    const allowDrop = options.allowDrop !== false;
    this.tweens.killTweensOf(enemy);
    AUDIO.playExplosion(enemy.isBoss);
    const scoreResult = this.awardEnemyScore(enemy.scoreValue || 100);
    const guaranteedSupply = this.recordKill(enemy, allowDrop);
    this.explosions.emitParticleAt(enemy.x, enemy.y, enemy.isBoss ? 66 : 24);
    let statusMessage = enemy.isBoss ? "旗舰击毁，轨道门仍在运转。" : "目标消失。";

    if (allowDrop && enemy.isBoss) {
      this.dropPower(enemy.x, enemy.y, "shield");
      this.dropPower(enemy.x + 38, enemy.y + 12, "weapon");
      this.dropPower(enemy.x - 38, enemy.y + 12, "repair");
      this.dropPower(enemy.x, enemy.y - 28, "drone");
      this.boss = null;
    } else if (allowDrop) {
      this.dropPower(enemy.x, enemy.y, this.pickPowerType());
      if (guaranteedSupply) {
        this.dropPower(enemy.x + 28, enemy.y + 10, this.pickPowerType());
        statusMessage = "目标掉落补给，额外战斗补给已投放。";
      }
    }

    if (scoreResult.rewardMessage) {
      statusMessage = guaranteedSupply
        ? `${scoreResult.rewardMessage} 额外战斗补给已投放。`
        : scoreResult.rewardMessage;
    }

    enemy.destroy();
    this.updateHud(statusMessage);
    this.checkMissionObjectives();
  }

  pickPowerType() {
    const roll = Phaser.Math.Between(1, 100);
    if (roll <= 28) return "weapon";
    if (roll <= 54) return "shield";
    if (roll <= 70) return "repair";
    if (roll <= 84) return "pulse";
    if (roll <= 94) return "drone";
    return "bomb";
  }

  dropPower(x, y, type) {
    const config = POWER_TYPES[type] || POWER_TYPES.shield;
    const power = this.powerUps.create(x, y, "powerCore");
    power.isPowerUp = true;
    power.powerType = type;
    power.collected = false;
    power.setScale(config.scale);
    power.setTint(config.tint);
    power.setVelocity(0, 118);
    power.setCircle(24, 8, 8);
    power.label = this.add.text(x, y + 34, POWER_LABELS[type] || "补给", {
      color: "#f7ffff",
      fontFamily: "Inter, Microsoft YaHei, sans-serif",
      fontSize: "12px",
      fontStyle: "800",
      backgroundColor: "rgba(6, 9, 13, 0.58)",
      padding: {
        x: 5,
        y: 2,
      },
    });
    power.label.setOrigin(0.5);
    power.label.setDepth(4);
  }

  destroyPower(power) {
    power?.label?.destroy();
    power?.destroy();
  }

  collectPower(firstObject, secondObject) {
    const power = firstObject?.isPowerUp ? firstObject : secondObject?.isPowerUp ? secondObject : null;
    if (!power || !power.active || power.collected) return;

    power.collected = true;
    AUDIO.playPower();
    const powerX = power.x;
    const powerY = power.y;
    power.disableBody(true, true);

    if (power.powerType === "weapon") {
      this.weaponBoostUntil = RUN_PERMANENT;
      if (this.weaponUpgradeLevel < POWER_LIMITS.weaponMaxLevel - 1) {
        this.weaponUpgradeLevel += 1;
        this.weaponLevel = 1 + this.weaponUpgradeLevel;
        this.updateHud(`武器核心同步，火力阵列提升至 Lv.${this.weaponLevel}/${POWER_LIMITS.weaponMaxLevel}。`);
      } else {
        this.weaponLevel = POWER_LIMITS.weaponMaxLevel;
        this.addScore(280);
        this.updateHud("火力阵列已达上限，冗余能量转入得分。");
      }
    } else if (power.powerType === "shield") {
      if (this.shield >= this.maxShield && this.maxShield < POWER_LIMITS.shieldMax) {
        this.maxShield = Math.min(POWER_LIMITS.shieldMax, this.maxShield + 17);
        this.shield = this.maxShield;
        this.updateHud(`护盾电容扩容至 ${this.maxShield}/${POWER_LIMITS.shieldMax}。`);
      } else {
        this.shield = clamp(this.shield + 32, 0, this.maxShield);
        this.updateHud("护盾电容补足。");
      }
    } else if (power.powerType === "repair") {
      if (this.lives < this.maxLives) {
        this.lives += 1;
        this.updateHud("维修单元接入，生命维持增强。");
      } else if (this.maxLives < POWER_LIMITS.maxLives) {
        this.maxLives += 1;
        this.lives = this.maxLives;
        this.updateHud(`装甲上限提升至 ${this.maxLives}/${POWER_LIMITS.maxLives}。`);
      } else {
        this.shield = clamp(this.shield + 24, 0, this.maxShield);
        this.updateHud("维修冗余转入护盾电容。");
      }
    } else if (power.powerType === "pulse") {
      this.triggerPulse(powerX, powerY);
    } else if (power.powerType === "drone") {
      this.droneUntil = RUN_PERMANENT;
      if (this.droneLevel < POWER_LIMITS.droneMaxLevel) {
        this.droneLevel += 1;
        this.updateHud(`无人僚机编队扩展至 Lv.${this.droneLevel}/${POWER_LIMITS.droneMaxLevel}。`);
      } else {
        this.addScore(280);
        this.updateHud("无人僚机编队已达上限，冗余模块转入得分。");
      }
    } else if (power.powerType === "bomb") {
      this.bombs = clamp(this.bombs + 1, 0, this.maxBombs);
      this.updateHud("脉冲炸弹补给入舱。");
    }
    this.addScore(120);
    this.explosions.emitParticleAt(powerX, powerY, 16);
    this.destroyPower(power);
  }

  triggerPulse(x, y) {
    const clearedBullets = this.enemyBullets.countActive(true);
    this.enemyBullets.clear(true, true);
    this.explosions.emitParticleAt(x, y, 72);

    [...this.enemies.getChildren()].forEach((enemy) => {
      if (!enemy.active) return;
      enemy.hp -= enemy.isBoss ? 14 : 4;
      enemy.setBlendMode(Phaser.BlendModes.ADD);
      this.time.delayedCall(80, () => {
        if (enemy.active) enemy.setBlendMode(Phaser.BlendModes.NORMAL);
      });
      if (enemy.hp <= 0) {
        this.destroyEnemy(enemy, { allowDrop: false });
      }
    });

    this.updateHud(clearedBullets > 0 ? `脉冲释放，清除了 ${clearedBullets} 枚弹体。` : "脉冲释放，航道短暂净空。");
  }

  hitPlayer(firstObject, secondObject) {
    const bullet = firstObject?.isEnemyShot ? firstObject : secondObject?.isEnemyShot ? secondObject : null;
    const player = firstObject?.isPlayer ? firstObject : secondObject?.isPlayer ? secondObject : null;
    if (!bullet || !player) return;
    if (!bullet.active || this.state !== GAME_STATE.PLAYING) return;
    bullet.destroy();
    if (this.invulnerableUntil > this.time.now) return;
    this.damagePlayer(22);
  }

  enemyRammedPlayer(firstObject, secondObject) {
    const enemy = firstObject?.isEnemy ? firstObject : secondObject?.isEnemy ? secondObject : null;
    const player = firstObject?.isPlayer ? firstObject : secondObject?.isPlayer ? secondObject : null;
    if (!enemy || !player) return;
    if (!enemy.active || this.state !== GAME_STATE.PLAYING) return;
    this.destroyEnemy(enemy);
    this.damagePlayer(32);
  }

  damagePlayer(amount) {
    if (this.invulnerableUntil > this.time.now) return;

    this.waveHadDamage = true;
    this.resetCombo();
    AUDIO.playHit();

    const shieldBeforeHit = this.shield;
    let shieldBroken = false;
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
      if (shieldBeforeHit > 0 && this.shield <= 0) {
        this.triggerShieldBreak();
        shieldBroken = true;
      }
    }

    this.cameras.main.shake(130, 0.006);
    this.explosions.emitParticleAt(this.player.x, this.player.y, 20);

    if (amount <= 0) {
      if (!shieldBroken) this.updateHud("护盾承受冲击。");
      return;
    }

    this.lives -= 1;
    this.invulnerableUntil = this.time.now + 1300;
    this.player.setTint(0xff9aa9);
    this.time.delayedCall(130, () => {
      if (this.player.active) this.player.clearTint();
    });

    if (this.lives <= 0) {
      this.endMission(false);
      return;
    }
    this.updateHud(shieldBroken ? "护盾破裂，装甲受损，生命维持在线。" : "装甲受损，生命维持在线。");
  }

  triggerShieldBreak() {
    if (!this.player?.active) return;

    const clearedBullets = this.clearEnemyBulletsNearPlayer(SHIELD_BREAK_CONFIG.clearRadius);
    this.invulnerableUntil = Math.max(this.invulnerableUntil, this.time.now + SHIELD_BREAK_CONFIG.invulnerableMs);
    this.addScore(clearedBullets * SHIELD_BREAK_CONFIG.scorePerBullet);

    const ring = this.add.circle(this.player.x, this.player.y, 34, 0x64f2a4, 0.12);
    ring.setStrokeStyle(3, 0xf7ffff, 0.76);
    ring.setDepth(6);
    this.tweens.add({
      targets: ring,
      radius: SHIELD_BREAK_CONFIG.clearRadius,
      alpha: 0,
      duration: 360,
      ease: "Quad.easeOut",
      onComplete: () => ring.destroy(),
    });

    this.cameras.main.shake(110, 0.005);
    this.updateHud(clearedBullets > 0 ? `护盾破裂，清除近身弹体 ${clearedBullets} 枚。` : "护盾破裂，短暂无敌启动。");
  }

  clearEnemyBulletsNearPlayer(radius) {
    if (!this.player?.active) return 0;

    let clearedBullets = 0;
    [...this.enemyBullets.getChildren()].forEach((bullet) => {
      if (!bullet.active) return;
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, bullet.x, bullet.y);
      if (distance > radius) return;
      bullet.destroy();
      clearedBullets += 1;
    });
    return clearedBullets;
  }

  checkWaveClear() {
    if (!this.waveActive || this.pendingSpawns > 0 || this.enemies.countActive(true) > 0) return;

    this.waveActive = false;
    const flawlessMessage = this.awardFlawlessWaveBonus();
    if (this.wave >= LEVEL_CONFIG.maxLevel && this.levelWave >= LEVEL_CONFIG.wavesPerLevel) {
      this.endMission(true);
      return;
    }

    if (this.levelWave >= LEVEL_CONFIG.wavesPerLevel) {
      this.wave += 1;
      this.levelWave = 1;
      this.addScore(700 + this.wave * 90);
      this.updateHud(`${flawlessMessage}${flawlessMessage ? " " : ""}第 ${this.wave - 1} 关完成，准备第 ${this.wave}/${LEVEL_CONFIG.maxLevel} 关。`);
    } else {
      this.levelWave += 1;
      this.addScore(120 + this.levelWave * 18 + this.wave * 35);
      this.updateHud(`${flawlessMessage}${flawlessMessage ? " " : ""}航道暂时清空，准备第 ${this.wave}/${LEVEL_CONFIG.maxLevel} 关第 ${this.levelWave}/${LEVEL_CONFIG.wavesPerLevel} 波。`);
    }
    this.nextWaveTimer = this.time.delayedCall(1150, () => {
      this.nextWaveTimer = null;
      this.spawnWave();
    });
  }

  awardFlawlessWaveBonus() {
    if (this.waveHadDamage) return "";

    const isBossWave = this.levelWave === LEVEL_CONFIG.bossWave;
    const score = isBossWave ? FLAWLESS_WAVE_CONFIG.bossScore : FLAWLESS_WAVE_CONFIG.score;
    const shield = isBossWave ? FLAWLESS_WAVE_CONFIG.bossShield : FLAWLESS_WAVE_CONFIG.shield;
    const overdrive = isBossWave ? FLAWLESS_WAVE_CONFIG.bossOverdriveCharge : FLAWLESS_WAVE_CONFIG.overdriveCharge;

    this.addScore(score + this.wave * 18 + this.levelWave * 8);
    this.shield = clamp(this.shield + shield, 0, this.maxShield);
    this.addOverdriveCharge(overdrive);
    this.showComboRewardText(isBossWave ? "完美击破" : "完美清波");
    return isBossWave ? "Boss 完美击破，护盾与超载回充。" : "完美清波，护盾与超载回充。";
  }

  endMission(victory) {
    if (this.state === GAME_STATE.GAME_OVER || this.state === GAME_STATE.VICTORY) return;
    this.cancelLaserCharge();
    AUDIO.playMissionEnd(victory);
    this.clearWaveTimers();
    this.state = victory ? GAME_STATE.VICTORY : GAME_STATE.GAME_OVER;
    const grade = this.getRunGrade();
    const profileUpdated = this.updateProfile(grade);
    this.time.paused = false;
    this.physics.world.pause();
    this.tweens.pauseAll();
    this.enemyBullets.clear(true, true);
    this.playerBullets.clear(true, true);
    [...this.powerUps.getChildren()].forEach((power) => this.destroyPower(power));
    this.showOverlay(
      victory ? "轨道门安全" : "通讯中断",
      victory
        ? `评级 ${grade}，${this.getDifficultyConfig().label}难度，最终得分 ${this.score}，击坠 ${this.killCount}，擦弹 ${this.grazeCount}，最高连击 ${this.maxCombo}。${profileUpdated ? " 档案已刷新。" : ""}`
        : `评级 ${grade}，${this.getDifficultyConfig().label}难度，最终得分 ${this.score}，击坠 ${this.killCount}，擦弹 ${this.grazeCount}，最高连击 ${this.maxCombo}。${profileUpdated ? " 档案已刷新。" : ""}`,
      "再来一局"
    );
    this.updateHud(victory ? "任务完成。" : "任务失败。");
  }

  getRunGrade() {
    const score = this.score + this.killCount * 45 + this.grazeCount * 28 + this.maxCombo * 90 + (this.lives > 0 ? this.lives * 260 : 0);
    if (score >= 18000 || (this.wave >= LEVEL_CONFIG.maxLevel && this.levelWave >= LEVEL_CONFIG.wavesPerLevel && this.maxCombo >= 28)) return "S";
    if (score >= 12500 || this.maxCombo >= 22) return "A";
    if (score >= 8200 || this.maxCombo >= 15) return "B";
    if (score >= 4200 || this.killCount >= 24) return "C";
    return "D";
  }

  updateProfile(grade) {
    const nextProfile = {
      bestGrade:
        (GRADE_RANK[grade] || 0) > (GRADE_RANK[this.profile.bestGrade] || 0) ? grade : this.profile.bestGrade,
      bestLevel: Math.max(this.profile.bestLevel || 0, this.wave),
      bestKills: Math.max(this.profile.bestKills || 0, this.killCount),
      bestCombo: Math.max(this.profile.bestCombo || 0, this.maxCombo),
    };
    const changed =
      nextProfile.bestGrade !== this.profile.bestGrade ||
      nextProfile.bestLevel !== this.profile.bestLevel ||
      nextProfile.bestKills !== this.profile.bestKills ||
      nextProfile.bestCombo !== this.profile.bestCombo;
    this.profile = nextProfile;
    if (changed) saveProfile(nextProfile);
    return changed;
  }

  getObjectiveProgress(objective) {
    if (objective.key === "kills") return this.killCount;
    if (objective.key === "combo") return this.maxCombo;
    if (objective.key === "graze") return this.grazeCount;
    return 0;
  }

  checkMissionObjectives() {
    MISSION_OBJECTIVES.forEach((objective) => {
      if (this.completedObjectives[objective.key]) return;
      if (this.getObjectiveProgress(objective) < objective.target) return;

      this.completedObjectives[objective.key] = true;
      this.applyMissionObjectiveReward(objective);
    });
  }

  applyMissionObjectiveReward(objective) {
    AUDIO.playPower();
    if (objective.score) this.addScore(objective.score);
    if (objective.shield) this.shield = clamp(this.shield + objective.shield, 0, this.maxShield);
    if (objective.bombs) this.bombs = clamp(this.bombs + objective.bombs, 0, this.maxBombs);

    if (objective.weaponUpgrade) {
      this.weaponBoostUntil = RUN_PERMANENT;
      if (this.weaponUpgradeLevel < POWER_LIMITS.weaponMaxLevel - 1) {
        this.weaponUpgradeLevel += objective.weaponUpgrade;
        this.weaponUpgradeLevel = Math.min(this.weaponUpgradeLevel, POWER_LIMITS.weaponMaxLevel - 1);
        this.weaponLevel = 1 + this.weaponUpgradeLevel;
      }
    }

    this.showComboRewardText(objective.rewardLabel);
    this.updateHud(`战术目标完成：${objective.label} ${objective.target}，奖励 ${objective.rewardLabel}。`);
  }

  updateMissionObjectivesHud() {
    if (!HUD.objectiveList) return;

    const hudKey = MISSION_OBJECTIVES.map((objective) => {
      const progress = Math.min(objective.target, this.getObjectiveProgress(objective));
      return `${objective.key}:${progress}:${this.completedObjectives[objective.key] ? 1 : 0}`;
    }).join("|");
    if (hudKey === this.objectiveHudKey) return;
    this.objectiveHudKey = hudKey;

    HUD.objectiveList.replaceChildren(
      ...MISSION_OBJECTIVES.map((objective) => {
        const progress = Math.min(objective.target, this.getObjectiveProgress(objective));
        const complete = Boolean(this.completedObjectives[objective.key]);
        const item = document.createElement("div");
        item.className = `objective-item${complete ? " is-complete" : ""}`;

        const label = document.createElement("span");
        label.textContent = objective.label;

        const value = document.createElement("strong");
        value.textContent = complete ? "完成" : `${progress}/${objective.target}`;

        const reward = document.createElement("em");
        reward.textContent = objective.rewardLabel;

        item.append(label, value, reward);
        return item;
      })
    );
  }

  clearWaveTimers() {
    this.spawnTimers.forEach((timer) => timer.remove(false));
    this.spawnTimers = [];
    this.nextWaveTimer?.remove(false);
    this.nextWaveTimer = null;
    this.pendingSpawns = 0;
  }

  updateHud(message) {
    HUD.score.textContent = String(this.score);
    HUD.best.textContent = String(this.bestScore);
    HUD.wave.textContent = `${this.wave}/${LEVEL_CONFIG.maxLevel}`;
    HUD.levelWave.textContent = `${this.levelWave}/${LEVEL_CONFIG.wavesPerLevel}`;
    HUD.combo.textContent = this.combo > 0 ? `${this.combo}/${this.comboMultiplier.toFixed(2)}x` : "0";
    HUD.lives.textContent = `${Math.max(0, this.lives)}/${this.maxLives}`;
    HUD.shield.textContent = `${Math.round(this.shield)}/${this.maxShield}`;
    HUD.bombs.textContent = String(Math.max(0, this.bombs));
    HUD.kills.textContent = String(this.killCount);
    HUD.graze.textContent = String(this.grazeCount);
    HUD.profile.textContent = `${this.profile.bestGrade}/${this.profile.bestLevel}`;
    HUD.supplyFill.style.width = `${Math.round(clamp(this.supplyCharge / SUPPLY_CONFIG.killsPerDrop, 0, 1) * 100)}%`;
    HUD.supplyLabel.textContent = `${this.supplyCharge}/${SUPPLY_CONFIG.killsPerDrop}`;
    this.updateMissionObjectivesHud();

    const boostPermanent = this.weaponBoostUntil === RUN_PERMANENT;
    const boostRemaining = boostPermanent ? RUN_PERMANENT : Math.max(0, this.weaponBoostUntil - this.time.now);
    const boostRatio = boostPermanent ? this.weaponLevel / POWER_LIMITS.weaponMaxLevel : clamp(boostRemaining / 8500, 0, 1);
    HUD.boostFill.style.width = `${Math.round(boostRatio * 100)}%`;
    HUD.boostLabel.textContent = boostPermanent
      ? `Lv.${this.weaponLevel}/${POWER_LIMITS.weaponMaxLevel}`
      : boostRemaining > 0
        ? `${(boostRemaining / 1000).toFixed(1)}s`
        : "待命";

    const laserCooldownRemaining = Math.max(0, this.laserCooldownUntil - this.time.now);
    HUD.laserRow?.classList.toggle("is-charging", this.laserCharging);
    HUD.laserRow?.classList.toggle("is-cooling", !this.laserCharging && laserCooldownRemaining > 0);
    if (this.laserCharging) {
      HUD.laserFill.style.width = `${Math.round(this.laserChargeRatio * 100)}%`;
      HUD.laserLabel.textContent = `${Math.round(this.laserChargeRatio * 100)}%`;
    } else if (laserCooldownRemaining > 0) {
      const cooldownProgress = 1 - laserCooldownRemaining / LASER_CONFIG.cooldownMs;
      HUD.laserFill.style.width = `${Math.round(clamp(cooldownProgress, 0, 1) * 100)}%`;
      HUD.laserLabel.textContent = `${(laserCooldownRemaining / 1000).toFixed(1)}s`;
    } else {
      HUD.laserFill.style.width = "100%";
      HUD.laserLabel.textContent = "待命";
    }

    const dashActiveRemaining = Math.max(0, this.dashActiveUntil - this.time.now);
    const dashCooldownRemaining = Math.max(0, this.dashCooldownUntil - this.time.now);
    HUD.dashRow?.classList.toggle("is-active", dashActiveRemaining > 0);
    HUD.dashRow?.classList.toggle("is-cooling", dashActiveRemaining <= 0 && dashCooldownRemaining > 0);
    if (dashActiveRemaining > 0) {
      HUD.dashFill.style.width = `${Math.round(clamp(dashActiveRemaining / DASH_CONFIG.activeMs, 0, 1) * 100)}%`;
      HUD.dashLabel.textContent = "相位";
    } else if (dashCooldownRemaining > 0) {
      const dashProgress = 1 - dashCooldownRemaining / DASH_CONFIG.cooldownMs;
      HUD.dashFill.style.width = `${Math.round(clamp(dashProgress, 0, 1) * 100)}%`;
      HUD.dashLabel.textContent = `${(dashCooldownRemaining / 1000).toFixed(1)}s`;
    } else {
      HUD.dashFill.style.width = "100%";
      HUD.dashLabel.textContent = "待命";
    }

    const overdriveRemaining = Math.max(0, this.overdriveUntil - this.time.now);
    const overdriveActive = overdriveRemaining > 0;
    HUD.overdriveRow?.classList.toggle("is-active", overdriveActive);
    HUD.overdriveButton?.classList.toggle("is-ready", !overdriveActive && this.overdriveCharge >= OVERDRIVE_CONFIG.maxCharge);
    HUD.overdriveButton?.classList.toggle("is-active", overdriveActive);
    if (overdriveActive) {
      HUD.overdriveFill.style.width = `${Math.round(clamp(overdriveRemaining / OVERDRIVE_CONFIG.activeMs, 0, 1) * 100)}%`;
      HUD.overdriveLabel.textContent = `${(overdriveRemaining / 1000).toFixed(1)}s`;
    } else {
      const overdriveRatio = clamp(this.overdriveCharge / OVERDRIVE_CONFIG.maxCharge, 0, 1);
      HUD.overdriveFill.style.width = `${Math.round(overdriveRatio * 100)}%`;
      HUD.overdriveLabel.textContent = overdriveRatio >= 1 ? "就绪" : `${Math.round(overdriveRatio * 100)}%`;
    }

    const dronePermanent = this.droneUntil === RUN_PERMANENT;
    const droneRemaining = dronePermanent ? RUN_PERMANENT : Math.max(0, this.droneUntil - this.time.now);
    const droneRatio = dronePermanent ? this.droneLevel / POWER_LIMITS.droneMaxLevel : clamp(droneRemaining / 12000, 0, 1);
    HUD.droneFill.style.width = `${Math.round(droneRatio * 100)}%`;
    HUD.droneLabel.textContent = dronePermanent
      ? `Lv.${this.droneLevel}/${POWER_LIMITS.droneMaxLevel}`
      : droneRemaining > 0
        ? `${(droneRemaining / 1000).toFixed(1)}s`
        : "待命";

    if (this.boss?.active && this.boss.maxHp > 0) {
      const bossRatio = clamp(this.boss.hp / this.boss.maxHp, 0, 1);
      const bossPhase = BOSS_PHASES[this.boss.bossPhaseIndex] || BOSS_PHASES[0];
      HUD.bossPanel.hidden = false;
      HUD.bossFill.style.width = `${Math.round(bossRatio * 100)}%`;
      HUD.bossLabel.textContent = `${bossPhase.label} ${Math.ceil(bossRatio * 100)}%`;
    } else {
      HUD.bossPanel.hidden = true;
      HUD.bossFill.style.width = "0%";
      HUD.bossLabel.textContent = "0%";
    }

    const difficultyThreat = this.difficulty === "nightmare" ? 0.22 : this.difficulty === "veteran" ? 0.12 : 0;
    const totalWaves = LEVEL_CONFIG.maxLevel * LEVEL_CONFIG.wavesPerLevel;
    const threat = clamp((this.getProgressIndex() - 1) / Math.max(1, totalWaves - 1) + difficultyThreat, 0, 1);
    HUD.threatFill.style.width = `${Math.max(18, Math.round(threat * 100))}%`;
    HUD.threatLabel.textContent = threat > 0.72 ? "高" : threat > 0.38 ? "中" : "低";

    if (message) HUD.feed.textContent = message;
  }

  handleResize(size) {
    this.bounds.width = size.width;
    this.bounds.height = size.height;
    this.physics.world.setBounds(0, 0, size.width, size.height);
    if (this.player) {
      this.player.x = clamp(this.player.x, 42, size.width - 42);
      this.player.y = clamp(this.player.y, size.height * 0.42, size.height - 42);
    }
  }
}

const game = new Phaser.Game({
  type: Phaser.CANVAS,
  parent: "game-root",
  backgroundColor: "#06090d",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: 960,
    height: 640,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: StarwingScene,
});

window.starwing = game;
