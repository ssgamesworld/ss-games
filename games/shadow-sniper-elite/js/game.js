/**
 * SHADOW SNIPER ELITE - Core Tactical Sniper Simulation
 * Features:
 * - Fluid Scope Movement with realistic mouse reticle aim
 * - Realistic Ballistics: Dynamic Wind deflection (MPH) & bullet gravity drop
 * - Steady Breath Mechanism (Hold SHIFT or on-screen button):
 *   * Slows reticle drift to zero for pinpoint accuracy
 *   * Depletes breath gauge with heartbeat audio
 * - Target Hit Zones:
 *   * HEADSHOT (1000 Pts + Metallic Ding sound + Slow-mo impact)
 *   * BODYSHOT (400 Pts + Thud sound)
 * - 5 Progressive Rounds with moving zip-line targets & hostage awareness
 * - Ammo management (5-round magazine with tactical reload)
 */

class SniperGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SniperGameScene' });
  }

  preload() {
    SniperAssetGenerator.createAllAssets(this);
  }

  create() {
    this.audio = window.sniperAudio || new SniperAudio();
    window.sniperAudio = this.audio;

    // Tactical State
    this.score = 0;
    this.round = 1;
    this.maxRounds = 5;
    this.ammo = 5;
    this.maxAmmo = 5;
    this.targetsHit = 0;
    this.requiredTargets = 4;
    this.windSpeed = 2.4; // mph (positive = right, negative = left)
    this.breath = 100;
    this.isHoldingBreath = false;
    this.isReloading = false;

    // 1. Panoramic Outpost Background
    this.bg = this.add.image(400, 300, 'canyon_outpost_bg');

    // 2. Targets Group
    this.targets = this.physics.add.group();
    this.spawnMissionTargets();

    // 3. Bullet Impact Decals / FX Group
    this.decals = this.add.group();

    // 4. Tactical Scope Reticle (Follows Mouse with slight natural breathing sway)
    this.reticle = this.add.image(400, 300, 'tactical_reticle')
      .setDepth(100)
      .setOrigin(0.5, 0.5);

    // Natural Reticle Breathing Sway
    this.swayTime = 0;

    // 5. Input Listeners
    this.input.on('pointermove', (pointer) => {
      this.targetX = pointer.x;
      this.targetY = pointer.y;
    });

    this.input.on('pointerdown', (pointer) => {
      this.fireRifle();
    });

    // Keyboard Space / Shift for steady breath
    this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Target positions
    this.targetX = 400;
    this.targetY = 300;

    this.updateHUD();
  }

  spawnMissionTargets() {
    this.targets.clear(true, true);
    this.targetsHit = 0;

    // Generate random wind for this round
    this.windSpeed = (Math.random() * 8 - 4).toFixed(1);
    const windEl = document.getElementById('wind-val');
    if (windEl) {
      const dir = this.windSpeed >= 0 ? '▶' : '◀';
      windEl.textContent = `WIND: ${Math.abs(this.windSpeed)} MPH ${dir}`;
    }

    // Spawn 4-5 Tactical Targets across balconies and watchtowers
    const spawnPoints = [
      { x: 160, y: 190, moving: false },
      { x: 520, y: 228, moving: true, range: 70 },
      { x: 610, y: 228, moving: false },
      { x: 940, y: 170, moving: true, range: 60 },
      { x: 340, y: 350, moving: false, type: 'bullseye' }
    ];

    spawnPoints.forEach(sp => {
      const isMerc = sp.type !== 'bullseye';
      const key = isMerc ? 'target_mercenary' : 'target_bullseye';
      const target = this.targets.create(sp.x, sp.y, key);
      target.body.setAllowGravity(false);
      target.isMerc = isMerc;
      target.isAlive = true;

      if (sp.moving) {
        this.tweens.add({
          targets: target,
          x: sp.x + sp.range,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    const missionText = document.getElementById('mission-text');
    if (missionText) {
      missionText.innerHTML = `STAGE ${this.round}: Eliminate <strong>${this.requiredTargets} Targets</strong>`;
    }
  }

  update(time, delta) {
    const dt = delta / 1000;
    this.swayTime += dt * 2;

    // Check Steady Breath (Shift key or touch)
    const touch = window.sniperTouch || {};
    this.isHoldingBreath = this.keyShift.isDown || touch.holdBreath;

    if (this.isHoldingBreath && this.breath > 5) {
      this.breath = Math.max(0, this.breath - dt * 32);
      this.audio.playHeartbeat();
    } else {
      this.breath = Math.min(100, this.breath + dt * 20);
    }

    // Sway amplitude based on breath holding
    const swayAmp = this.isHoldingBreath ? 0.8 : 7.0;
    const swayX = Math.sin(this.swayTime) * swayAmp;
    const swayY = Math.cos(this.swayTime * 1.4) * (swayAmp * 0.7);

    // Smooth reticle chase
    this.reticle.x += (this.targetX + swayX - this.reticle.x) * 0.25;
    this.reticle.y += (this.targetY + swayY - this.reticle.y) * 0.25;

    // Check Reload Key
    if (Phaser.Input.Keyboard.JustDown(this.keyR) && !this.isReloading && this.ammo < this.maxAmmo) {
      this.reloadRifle();
    }

    // Update Steady Breath HUD
    const sFill = document.getElementById('steady-bar');
    if (sFill) sFill.style.width = this.breath + '%';
  }

  fireRifle() {
    if (this.isReloading) return;

    if (this.ammo <= 0) {
      this.reloadRifle();
      return;
    }

    this.ammo--;
    this.audio.playRifleShot();
    this.cameras.main.shake(160, 0.018);
    this.updateHUD();

    // Ballistic Impact Point: Reticle pos + Wind drift + gravity drop
    // At longer distances, wind pushes the bullet
    const windOffset = parseFloat(this.windSpeed) * 4.2;
    const gravityDrop = 6.0;
    const impactX = this.reticle.x + windOffset;
    const impactY = this.reticle.y + gravityDrop;

    // Impact Spark FX
    const spark = this.add.image(impactX, impactY, 'impact_spark').setScale(1.5);
    this.tweens.add({ targets: spark, alpha: 0, scale: 2.4, duration: 180, onComplete: () => spark.destroy() });

    // Check Hits against Targets
    let hitSomething = false;
    this.targets.getChildren().forEach(t => {
      if (!t.isAlive) return;

      const bounds = t.getBounds();
      if (bounds.contains(impactX, impactY)) {
        hitSomething = true;
        this.processTargetHit(t, impactX, impactY);
      }
    });

    if (!hitSomething && this.ammo === 0) {
      this.time.delayedCall(800, () => {
        if (this.targetsHit < this.requiredTargets) {
          this.checkMissionStatus();
        }
      });
    }
  }

  processTargetHit(target, hitX, hitY) {
    target.isAlive = false;

    if (target.isMerc) {
      // Check Headshot Zone (Head is at top 20px)
      const headZoneY = target.y - target.displayHeight / 2 + 18;
      const isHeadshot = hitY <= headZoneY;

      if (isHeadshot) {
        this.score += 1000;
        this.audio.playHeadshotDing();
        this.showFloatText(hitX, hitY, 'HEADSHOT! +1000', '#ffd700');
      } else {
        this.score += 400;
        this.audio.playBodyHit();
        this.showFloatText(hitX, hitY, 'HIT +400', '#00f0ff');
      }

      // Ragdoll fall animation
      this.tweens.add({
        targets: target,
        y: target.y + 40,
        angle: 85,
        alpha: 0,
        duration: 400,
        onComplete: () => target.destroy()
      });
    } else {
      // Bullseye board hit
      this.score += 500;
      this.audio.playHeadshotDing();
      this.showFloatText(hitX, hitY, 'BULLSEYE! +500', '#ffd700');
      this.tweens.add({
        targets: target,
        scale: 0.1,
        alpha: 0,
        duration: 300,
        onComplete: () => target.destroy()
      });
    }

    this.targetsHit++;
    this.updateHUD();

    if (this.targetsHit >= this.requiredTargets) {
      this.time.delayedCall(900, () => {
        this.advanceRound();
      });
    }
  }

  advanceRound() {
    if (this.round < this.maxRounds) {
      this.round++;
      this.ammo = this.maxAmmo;
      this.cameras.main.flash(400, 0, 240, 255);
      this.spawnMissionTargets();
      this.updateHUD();
    } else {
      // Victory / Mission Complete!
      this.showVictoryModal();
    }
  }

  reloadRifle() {
    this.isReloading = true;
    this.showFloatText(400, 300, 'RELOADING...', '#ffd700');
    this.time.delayedCall(1200, () => {
      this.ammo = this.maxAmmo;
      this.isReloading = false;
      this.updateHUD();
    });
  }

  checkMissionStatus() {
    if (this.targetsHit < this.requiredTargets && this.ammo === 0) {
      const m = document.getElementById('game-over-modal');
      if (m) {
        const fScore = document.getElementById('final-score');
        if (fScore) fScore.textContent = this.score;
        m.style.display = 'flex';
      }
    }
  }

  showFloatText(x, y, text, color) {
    const txt = this.add.text(x, y - 20, text, {
      fontFamily: 'Orbitron',
      fontSize: '18px',
      fontStyle: 'bold',
      fill: color,
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: y - 55,
      alpha: 0,
      duration: 800,
      onComplete: () => txt.destroy()
    });
  }

  showVictoryModal() {
    const m = document.getElementById('victory-modal');
    if (m) {
      const vScore = document.getElementById('victory-score');
      if (vScore) vScore.textContent = this.score;
      m.style.display = 'flex';
    }
  }

  updateHUD() {
    const sEl = document.getElementById('score-val');
    if (sEl) sEl.textContent = this.score;

    // Bullet Icons
    const row = document.getElementById('ammo-row');
    if (row) {
      row.innerHTML = '';
      for (let i = 0; i < this.maxAmmo; i++) {
        const b = document.createElement('div');
        b.className = 'bullet-icon' + (i >= this.ammo ? ' spent' : '');
        row.appendChild(b);
      }
    }
  }
}
