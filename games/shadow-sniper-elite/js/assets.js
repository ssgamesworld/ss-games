/**
 * SHADOW SNIPER ELITE - Vector Graphics & Target Generator
 * Generates:
 * 1. Rich Desert Canyon & Rooftop Outpost panoramic background
 * 2. High-detail Tactical Targets:
 *    - Bullseye Archery / Firing Range Targets
 *    - Enemy Rogue Mercenaries (Head, Torso, Weapon)
 *    - Moving Drones / Zip-lining Targets
 * 3. Scope Reticle & Mil-dot crosshairs
 * 4. Muzzle flash, bullet smoke puff, and blood/spark impact FX
 */

class SniperAssetGenerator {
  static createAllAssets(scene) {
    this.createScopeReticle(scene);
    this.createTargets(scene);
    this.createBackground(scene);
    this.createImpactFX(scene);
  }

  // 1. High-precision Mil-Dot Tactical Scope Reticle
  static createScopeReticle(scene) {
    const size = 320;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const cx = size / 2, cy = size / 2;

    // Outer vignette ring (Heavy dark border)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Scope Glass Tint
    const glassGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 140);
    glassGrad.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
    glassGrad.addColorStop(0.85, 'rgba(0, 240, 255, 0.15)');
    glassGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.fill();

    // Scope Outer Steel Bezel
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.stroke();

    // Reticle Crosshairs (Neon Cyan / Emerald)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;

    // Horizontal Line
    ctx.beginPath();
    ctx.moveTo(cx - 130, cy);
    ctx.lineTo(cx - 18, cy);
    ctx.moveTo(cx + 18, cy);
    ctx.lineTo(cx + 130, cy);

    // Vertical Line
    ctx.moveTo(cx, cy - 130);
    ctx.lineTo(cx, cy - 18);
    ctx.moveTo(cx, cy + 18);
    ctx.lineTo(cx, cy + 130);
    ctx.stroke();

    // Mil-Dots (Range estimation markers)
    ctx.fillStyle = '#00f0ff';
    const dots = [-90, -60, -30, 30, 60, 90];
    dots.forEach(d => {
      ctx.beginPath(); ctx.arc(cx + d, cy, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy + d, 2, 0, Math.PI * 2); ctx.fill();
    });

    // Center Red Aim Point
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    scene.textures.addCanvas('tactical_reticle', canvas);
  }

  // 2. Targets: Standing & Crouched Mercenaries + Archery Bullseye Boards
  static createTargets(scene) {
    // A. Rogue Mercenary (Width 44, Height 80)
    const mCanvas = document.createElement('canvas');
    mCanvas.width = 44;
    mCanvas.height = 80;
    const mctx = mCanvas.getContext('2d');

    const mcx = 22;

    // Torso / Body (Tactical Camo / Vest)
    mctx.fillStyle = '#1e293b';
    mctx.beginPath();
    mctx.roundRect(mcx - 12, 22, 24, 30, 4);
    mctx.fill();

    // Kevlar Vest
    mctx.fillStyle = '#0f172a';
    mctx.fillRect(mcx - 9, 25, 18, 22);

    // Legs
    mctx.fillStyle = '#334155';
    mctx.fillRect(mcx - 10, 52, 8, 28);
    mctx.fillRect(mcx + 2, 52, 8, 28);

    // Head (Critical Headshot Zone: y = 2 to 20)
    mctx.fillStyle = '#fed7aa'; // Face skin
    mctx.beginPath();
    mctx.arc(mcx, 12, 9, 0, Math.PI * 2);
    mctx.fill();

    // Red Terrorist Balaclava / Beret
    mctx.fillStyle = '#ef4444';
    mctx.beginPath();
    mctx.arc(mcx, 9, 9, Math.PI, Math.PI * 2);
    mctx.fill();
    mctx.fillRect(mcx - 9, 9, 18, 5);

    // Weapon held
    mctx.fillStyle = '#475569';
    mctx.fillRect(mcx - 18, 30, 24, 6);

    scene.textures.addCanvas('target_mercenary', mCanvas);

    // B. Classic Archery Bullseye Target Board
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 50;
    bCanvas.height = 50;
    const bctx = bCanvas.getContext('2d');
    const bcx = 25, bcy = 25;

    // Rings (White, Black, Blue, Red, Yellow 10-ring)
    const rings = [
      { r: 24, c: '#ffffff' },
      { r: 19, c: '#0f172a' },
      { r: 14, c: '#0284c7' },
      { r: 9,  c: '#ef4444' },
      { r: 4,  c: '#ffd700' }
    ];
    rings.forEach(ring => {
      bctx.fillStyle = ring.c;
      bctx.beginPath();
      bctx.arc(bcx, bcy, ring.r, 0, Math.PI * 2);
      bctx.fill();
    });

    scene.textures.addCanvas('target_bullseye', bCanvas);
  }

  // 3. Panoramic Canyon Outpost Background
  static createBackground(scene) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Desert Sunset Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 600);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(0.35, '#312e81');
    sky.addColorStop(0.65, '#991b1b');
    sky.addColorStop(1, '#ea580c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1200, 600);

    // Distant Canyon Cliffs Silhouettes
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(0, 600);
    ctx.lineTo(0, 360);
    ctx.lineTo(180, 280);
    ctx.lineTo(380, 410);
    ctx.lineTo(620, 260);
    ctx.lineTo(840, 390);
    ctx.lineTo(1050, 290);
    ctx.lineTo(1200, 380);
    ctx.lineTo(1200, 600);
    ctx.closePath();
    ctx.fill();

    // Watchtowers & Rooftop Outposts (Where targets spawn!)
    ctx.fillStyle = '#090d16';
    // Tower 1 (Left)
    ctx.fillRect(120, 240, 90, 360);
    ctx.fillRect(100, 230, 130, 14); // Balcony
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(100, 220, 130, 10); // Railing

    // Tower 2 (Middle Bridge)
    ctx.fillRect(480, 280, 160, 320);
    ctx.fillRect(450, 270, 220, 16);
    ctx.strokeRect(450, 258, 220, 12);

    // Tower 3 (Right High Fortress)
    ctx.fillRect(880, 220, 120, 380);
    ctx.fillRect(860, 210, 160, 16);
    ctx.strokeRect(860, 198, 160, 12);

    scene.textures.addCanvas('canyon_outpost_bg', canvas);
  }

  // 4. Bullet Impact & Headshot Sparks
  static createImpactFX(scene) {
    const spark = document.createElement('canvas');
    spark.width = 24;
    spark.height = 24;
    const ctx = spark.getContext('2d');
    const grad = ctx.createRadialGradient(12, 12, 1, 12, 12, 11);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#ffd700');
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(12, 12, 11, 0, Math.PI * 2);
    ctx.fill();
    scene.textures.addCanvas('impact_spark', spark);
  }
}
