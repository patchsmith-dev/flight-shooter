/* global Phaser */

const HUD = {
  score: document.getElementById("scoreValue"),
  wave: document.getElementById("waveValue"),
  lives: document.getElementById("livesValue"),
  shield: document.getElementById("shieldValue"),
  threatLabel: document.getElementById("threatLabel"),
  threatFill: document.getElementById("threatFill"),
  feed: document.getElementById("feedText"),
  overlay: document.getElementById("screenOverlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayCopy: document.getElementById("overlayCopy"),
  primaryAction: document.getElementById("primaryAction"),
  pauseButton: document.getElementById("pauseButton"),
  restartButton: document.getElementById("restartButton"),
  fullscreenButton: document.getElementById("fullscreenButton"),
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
};

const clamp = Phaser.Math.Clamp;

class StarwingScene extends Phaser.Scene {
  constructor() {
    super("starwing");
    this.state = GAME_STATE.READY;
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.shield = 0;
    this.weaponLevel = 1;
    this.weaponBoostUntil = 0;
    this.invulnerableUntil = 0;
    this.lastShotAt = 0;
    this.waveActive = false;
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
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      fire: Phaser.Input.Keyboard.KeyCodes.SPACE,
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
    HUD.restartButton.addEventListener("click", () => this.restartMission(true), options);
    HUD.fullscreenButton.addEventListener("click", () => this.toggleFullscreen(), options);
  }

  resetGameState() {
    this.state = GAME_STATE.READY;
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.shield = 0;
    this.weaponLevel = 1;
    this.weaponBoostUntil = 0;
    this.invulnerableUntil = 0;
    this.lastShotAt = 0;
    this.waveActive = false;
    this.pendingSpawns = 0;
    this.spawnTimers = [];
    this.nextWaveTimer = null;
    this.pointerTarget = null;
    this.boss = null;
  }

  resetRuntimeState() {
    this.time.paused = false;
    this.physics.world.resume();
    this.tweens.resumeAll();
    HUD.pauseButton.textContent = "II";
    this.showOverlay(READY_OVERLAY.title, READY_OVERLAY.copy, READY_OVERLAY.action);
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
    const isBossWave = this.wave % 4 === 0;
    if (isBossWave) {
      this.pendingSpawns = 0;
      this.spawnBoss();
      this.updateHud(`第 ${this.wave} 波，旗舰进入火控范围。`);
      return;
    }

    const enemyCount = Math.min(22, 7 + this.wave * 2);
    this.pendingSpawns = enemyCount;
    for (let index = 0; index < enemyCount; index += 1) {
      const timer = this.time.delayedCall(index * 220, () => {
        this.spawnTimers = this.spawnTimers.filter((spawnTimer) => spawnTimer !== timer);
        this.pendingSpawns = Math.max(0, this.pendingSpawns - 1);
        if (this.state !== GAME_STATE.PLAYING) return;
        const type = index % 5 === 4 || (this.wave > 5 && index % 4 === 2) ? "heavy" : "scout";
        this.spawnEnemy(type, index);
      });
      this.spawnTimers.push(timer);
    }

    this.updateHud(`第 ${this.wave} 波接敌。`);
  }

  spawnEnemy(typeName, index) {
    const type = ENEMY_TYPES[typeName];
    const xStep = this.bounds.width / 7;
    const spawnX = xStep + (index % 6) * xStep + Phaser.Math.Between(-22, 22);
    const enemy = this.enemies.create(spawnX, -52, type.key);
    enemy.isEnemy = true;
    enemy.enemyType = typeName;
    enemy.hp = type.hp + Math.floor(this.wave / 3);
    enemy.scoreValue = type.score;
    enemy.fireRate = Math.max(820, type.fireRate - this.wave * 72);
    enemy.nextShotAt = this.time.now + Phaser.Math.Between(600, 1800);
    enemy.drift = Phaser.Math.FloatBetween(0.6, 1.65);
    enemy.phase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    enemy.setScale(type.scale);
    enemy.setTint(type.tint);
    enemy.setVelocityY(type.speed + this.wave * 8);
    enemy.setCircle(36, 10, 10);
  }

  spawnBoss() {
    const boss = this.enemies.create(this.bounds.width / 2, -126, "boss");
    boss.isEnemy = true;
    boss.isBoss = true;
    boss.hp = 58 + this.wave * 14;
    boss.maxHp = boss.hp;
    boss.scoreValue = 2600 + this.wave * 180;
    boss.fireRate = Math.max(520, 1050 - this.wave * 52);
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

    const isBoosted = this.weaponBoostUntil > time;
    this.weaponLevel = isBoosted ? 3 : 1;
    this.updateEnemies(time, delta);
    this.updateProjectiles();
    this.updatePowerUps(delta);
    this.firePlayerWeapon(time);
    this.checkWaveClear();
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

    const speed = 330;
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
    this.playerAura.setAlpha(this.shield > 0 ? 0.25 + Math.sin(this.time.now / 120) * 0.08 : 0.08);
    this.playerAura.setRadius(this.shield > 0 ? 52 : 42);
  }

  updateEnemies(time, delta) {
    const dt = delta / 1000;
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      if (!enemy.isBoss) {
        enemy.x += Math.sin(time / 520 + enemy.phase) * enemy.drift * 42 * dt;
        if (enemy.y > this.bounds.height + 92) {
          enemy.destroy();
          return;
        }
      } else if (enemy.y > 110) {
        enemy.setVelocityY(0);
      }

      if (this.state === GAME_STATE.PLAYING && time >= enemy.nextShotAt) {
        this.fireEnemyWeapon(enemy);
        enemy.nextShotAt = time + enemy.fireRate + Phaser.Math.Between(-180, 260);
      }
    });
  }

  updateProjectiles() {
    this.playerBullets.getChildren().forEach((bullet) => {
      if (bullet.y < -36) bullet.destroy();
    });
    this.enemyBullets.getChildren().forEach((bullet) => {
      if (bullet.y > this.bounds.height + 36 || bullet.x < -36 || bullet.x > this.bounds.width + 36) {
        bullet.destroy();
      }
    });
  }

  updatePowerUps(delta) {
    const dt = delta / 1000;
    this.powerUps.getChildren().forEach((power) => {
      power.rotation += dt * 2.4;
      if (power.y > this.bounds.height + 40) power.destroy();
    });
  }

  firePlayerWeapon(time) {
    const interval = this.weaponLevel > 1 ? 112 : 168;
    if (time - this.lastShotAt < interval) return;
    this.lastShotAt = time;

    const shots = this.weaponLevel > 1 ? [-13, 0, 13] : [0];
    shots.forEach((offset, index) => {
      const bullet = this.playerBullets.getFirstDead(false) || this.playerBullets.create(0, 0, "playerShot");
      if (!bullet) return;
      bullet.isPlayerShot = true;
      bullet.enableBody(true, this.player.x + offset, this.player.y - 34, true, true);
      bullet.setScale(index === 1 || shots.length === 1 ? 0.72 : 0.62);
      bullet.setVelocity(offset * 5, -580);
      bullet.setCircle(12, 10, 10);
      bullet.damage = shots.length > 1 ? 1.2 : 1;
      bullet.setDepth(2);
    });
  }

  fireEnemyWeapon(enemy) {
    const shotCount = enemy.isBoss ? 5 : 1;
    const spread = enemy.isBoss ? [-210, -105, 0, 105, 210] : [0];
    for (let i = 0; i < shotCount; i += 1) {
      const bullet = this.enemyBullets.getFirstDead(false) || this.enemyBullets.create(0, 0, "enemyShot");
      if (!bullet) return;
      bullet.isEnemyShot = true;
      bullet.enableBody(true, enemy.x, enemy.y + 38, true, true);
      bullet.setScale(enemy.isBoss ? 0.74 : 0.58);
      bullet.setVelocity(spread[i], enemy.isBoss ? 240 : 260 + this.wave * 12);
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

  destroyEnemy(enemy) {
    this.tweens.killTweensOf(enemy);
    this.score += enemy.scoreValue || 100;
    this.explosions.emitParticleAt(enemy.x, enemy.y, enemy.isBoss ? 66 : 24);

    if (enemy.isBoss) {
      this.dropPower(enemy.x, enemy.y, "shield");
      this.dropPower(enemy.x + 38, enemy.y + 12, "weapon");
      this.boss = null;
    } else if (Phaser.Math.Between(1, 100) <= 16) {
      this.dropPower(enemy.x, enemy.y, Phaser.Math.Between(0, 1) ? "weapon" : "shield");
    }

    enemy.destroy();
    this.updateHud(enemy.isBoss ? "旗舰击毁，轨道门仍在运转。" : "目标消失。");
  }

  dropPower(x, y, type) {
    const power = this.powerUps.create(x, y, "powerCore");
    power.isPowerUp = true;
    power.powerType = type;
    power.collected = false;
    power.setScale(type === "weapon" ? 0.62 : 0.68);
    power.setTint(type === "weapon" ? 0xffd166 : 0x64f2a4);
    power.setVelocity(0, 118);
    power.setCircle(24, 8, 8);
  }

  collectPower(firstObject, secondObject) {
    const power = firstObject?.isPowerUp ? firstObject : secondObject?.isPowerUp ? secondObject : null;
    if (!power || !power.active || power.collected) return;

    power.collected = true;
    const powerX = power.x;
    const powerY = power.y;
    power.disableBody(true, true);

    if (power.powerType === "weapon") {
      this.weaponBoostUntil = this.time.now + 8500;
      this.updateHud("武器核心同步，火力阵列展开。");
    } else {
      this.shield = clamp(this.shield + 32, 0, 99);
      this.updateHud("护盾电容补足。");
    }
    this.score += 120;
    this.explosions.emitParticleAt(powerX, powerY, 16);
    power.destroy();
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

    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
    }

    this.cameras.main.shake(130, 0.006);
    this.explosions.emitParticleAt(this.player.x, this.player.y, 20);

    if (amount <= 0) {
      this.updateHud("护盾承受冲击。");
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
    this.updateHud("装甲受损，生命维持在线。");
  }

  checkWaveClear() {
    if (!this.waveActive || this.pendingSpawns > 0 || this.enemies.countActive(true) > 0) return;

    this.waveActive = false;
    if (this.wave >= 8) {
      this.endMission(true);
      return;
    }

    this.wave += 1;
    this.updateHud(`航道暂时清空，准备第 ${this.wave} 波。`);
    this.nextWaveTimer = this.time.delayedCall(1150, () => {
      this.nextWaveTimer = null;
      this.spawnWave();
    });
  }

  endMission(victory) {
    if (this.state === GAME_STATE.GAME_OVER || this.state === GAME_STATE.VICTORY) return;
    this.clearWaveTimers();
    this.state = victory ? GAME_STATE.VICTORY : GAME_STATE.GAME_OVER;
    this.time.paused = false;
    this.physics.world.pause();
    this.tweens.pauseAll();
    this.enemyBullets.clear(true, true);
    this.playerBullets.clear(true, true);
    this.powerUps.clear(true, true);
    this.showOverlay(
      victory ? "轨道门安全" : "通讯中断",
      victory ? `最终得分 ${this.score}，星港进入夜航模式。` : `最终得分 ${this.score}，救援信标已发出。`,
      "再来一局"
    );
    this.updateHud(victory ? "任务完成。" : "任务失败。");
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
    HUD.wave.textContent = String(this.wave);
    HUD.lives.textContent = String(Math.max(0, this.lives));
    HUD.shield.textContent = String(Math.round(this.shield));

    const threat = clamp((this.wave - 1) / 7, 0, 1);
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
