/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Generates procedural canvas textures for high-detail horror atmosphere without external asset lag
export class TextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  public static getWoodPlanks(): THREE.CanvasTexture {
    if (this.cache.has('wood')) return this.cache.get('wood')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark aged wood base
    ctx.fillStyle = '#22150c';
    ctx.fillRect(0, 0, 512, 512);

    const plankCount = 8;
    const plankHeight = 512 / plankCount;

    for (let i = 0; i < plankCount; i++) {
      const y = i * plankHeight;
      const shade = 28 + Math.floor(Math.random() * 12);
      ctx.fillStyle = `rgb(${shade + 8}, ${shade - 4}, ${shade - 14})`;
      ctx.fillRect(0, y, 512, plankHeight - 2);

      // Wood grain lines
      ctx.strokeStyle = `rgba(10, 5, 2, 0.45)`;
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 14; g++) {
        ctx.beginPath();
        const startY = y + Math.random() * plankHeight;
        ctx.moveTo(0, startY);
        ctx.bezierCurveTo(128, startY + (Math.random() * 8 - 4), 384, startY + (Math.random() * 8 - 4), 512, startY);
        ctx.stroke();
      }

      // Plank gap shadow
      ctx.fillStyle = '#0a0604';
      ctx.fillRect(0, y + plankHeight - 3, 512, 3);

      // Nails
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(24, y + plankHeight / 2, 3, 0, Math.PI * 2);
      ctx.arc(488, y + plankHeight / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grunge & blood spatter
    ctx.fillStyle = 'rgba(60, 10, 10, 0.18)';
    ctx.beginPath();
    ctx.arc(200, 320, 45, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.cache.set('wood', tex);
    return tex;
  }

  public static getWallpaper(theme: string = 'victorian'): THREE.CanvasTexture {
    const key = `wallpaper_${theme}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base faded wall
    ctx.fillStyle = theme === 'hospital' ? '#202a28' : '#1e161c';
    ctx.fillRect(0, 0, 512, 512);

    // Damask gothic repeating pattern
    ctx.strokeStyle = theme === 'hospital' ? '#141d1a' : '#2a1a24';
    ctx.lineWidth = 2;

    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      for (let y = 0; y <= 512; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - 14, y);
        ctx.lineTo(x + 14, y);
        ctx.moveTo(x, y - 14);
        ctx.lineTo(x, y + 14);
        ctx.stroke();
      }
    }

    // Water/mold stains & cracks
    ctx.strokeStyle = 'rgba(10, 8, 8, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 0);
    ctx.lineTo(140, 120);
    ctx.lineTo(130, 240);
    ctx.lineTo(180, 340);
    ctx.stroke();

    // Peeling gradient
    const peel = ctx.createLinearGradient(0, 0, 0, 512);
    peel.addColorStop(0, 'rgba(0,0,0,0.5)');
    peel.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    peel.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = peel;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, tex);
    return tex;
  }

  public static getStoneFloor(): THREE.CanvasTexture {
    if (this.cache.has('stone')) return this.cache.get('stone')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#161819';
    ctx.fillRect(0, 0, 512, 512);

    // Tiles
    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const shade = 18 + Math.floor(Math.random() * 10);
        ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 4})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Cracks
        if (Math.random() > 0.4) {
          ctx.strokeStyle = '#0a0b0c';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x + 10, y + 10);
          ctx.lineTo(x + tileSize - 15, y + tileSize - 20);
          ctx.stroke();
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.cache.set('stone', tex);
    return tex;
  }

  public static getOccultAltarTexture(): THREE.CanvasTexture {
    if (this.cache.has('altar')) return this.cache.get('altar')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#120a0a';
    ctx.fillRect(0, 0, 512, 512);

    // Pentagram & Runic Sigils
    ctx.strokeStyle = '#8b1818';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, 180, 0, Math.PI * 2);
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.stroke();

    // 5-pointed star
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = 256 + 180 * Math.cos(angle);
      const y = 256 + 180 * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Blood splatters
    ctx.fillStyle = 'rgba(180, 20, 20, 0.45)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        256 + (Math.random() * 200 - 100),
        256 + (Math.random() * 200 - 100),
        Math.random() * 14 + 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    this.cache.set('altar', tex);
    return tex;
  }

  public static getClockFaceTexture(): THREE.CanvasTexture {
    if (this.cache.has('clock_face')) return this.cache.get('clock_face')!;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#c8b693';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2b1c10';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#1c130b';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180 - Math.PI / 2;
      const x = 128 + 92 * Math.cos(angle);
      const y = 128 + 92 * Math.sin(angle);
      ctx.fillText(numerals[i], x, y);
    }

    const tex = new THREE.CanvasTexture(canvas);
    this.cache.set('clock_face', tex);
    return tex;
  }

  public static getPortraitPainting(type: 'family' | 'creepy' | 'lord' = 'lord'): THREE.CanvasTexture {
    const key = `portrait_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    // Ornate gold border
    ctx.fillStyle = '#4a3b1a';
    ctx.fillRect(0, 0, 256, 384);
    ctx.fillStyle = '#110d0a';
    ctx.fillRect(16, 16, 224, 352);

    // Eerie oil painting subject
    ctx.fillStyle = '#2d251f';
    ctx.beginPath();
    ctx.arc(128, 140, 50, 0, Math.PI * 2); // Head
    ctx.fill();

    // Body
    ctx.fillStyle = '#1c1713';
    ctx.beginPath();
    ctx.moveTo(60, 360);
    ctx.lineTo(196, 360);
    ctx.lineTo(170, 180);
    ctx.lineTo(86, 180);
    ctx.closePath();
    ctx.fill();

    // Creepy glowing eyes or scratch marks
    if (type === 'creepy') {
      ctx.fillStyle = '#ff2222';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(114, 136, 4, 0, Math.PI * 2);
      ctx.arc(142, 136, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Scratched out face
      ctx.strokeStyle = '#800';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(80, 100 + i * 20);
        ctx.lineTo(176, 160 + i * 15);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#a69279';
      ctx.beginPath();
      ctx.arc(116, 138, 3, 0, Math.PI * 2);
      ctx.arc(140, 138, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  public static getBookshelfTexture(): THREE.CanvasTexture {
    if (this.cache.has('bookshelf')) return this.cache.get('bookshelf')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Wood frame
    ctx.fillStyle = '#20140c';
    ctx.fillRect(0, 0, 512, 512);

    const shelfRows = 4;
    const rowHeight = 512 / shelfRows;
    const bookColors = ['#4a1515', '#162838', '#1c361c', '#422812', '#2d1e3d', '#332f1a', '#542020'];

    for (let r = 0; r < shelfRows; r++) {
      const y = r * rowHeight;
      // Shelf divider
      ctx.fillStyle = '#382215';
      ctx.fillRect(0, y + rowHeight - 12, 512, 12);

      // Books on shelf
      let curX = 14;
      while (curX < 490) {
        const bookW = 12 + Math.floor(Math.random() * 16);
        const bookH = rowHeight - 18 - Math.floor(Math.random() * 15);
        const col = bookColors[Math.floor(Math.random() * bookColors.length)];

        ctx.fillStyle = col;
        ctx.fillRect(curX, y + rowHeight - 12 - bookH, bookW, bookH);

        // Gold foil spine markings
        ctx.fillStyle = '#c2a649';
        ctx.fillRect(curX + 2, y + rowHeight - 12 - bookH + 10, bookW - 4, 3);
        ctx.fillRect(curX + 2, y + rowHeight - 12 - bookH + 20, bookW - 4, 2);

        curX += bookW + 2;
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    this.cache.set('bookshelf', tex);
    return tex;
  }
}
