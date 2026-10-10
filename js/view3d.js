/**
 * 3D Interactive Cyber Engine
 * Handles 3D Card Tilt, 3D Canvas Cryptographic Cryptex/Rotor,
 * 3D Wireframe Telemetry Cube, and 3D Isometric Matrix transforms.
 */

const Crypto3D = {
  // =========================================================================
  // 1. CARD 3D TILT WITH DYNAMIC SPECULAR SHINE
  // =========================================================================
  initCardTilt: () => {
    const cards = document.querySelectorAll('.cyber-card, .stat-card, .quick-card, .output-box, .hero-banner');

    cards.forEach(card => {
      // Create glare element if not present
      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -((y - centerY) / centerY) * 9; // Max 9 deg
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;

        // Position specular glare
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(0, 242, 254, 0.22) 0%, rgba(168, 85, 247, 0.08) 40%, transparent 70%)`;
        glare.style.opacity = '1';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        glare.style.opacity = '0';
      });
    });
  },

  // =========================================================================
  // 2. 3D WIREFRAME CRYPTO CUBE (Telemetry Badge)
  // =========================================================================
  initTelemetryCube: (canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = 64);
    let height = (canvas.height = 64);

    let angleX = 0;
    let angleY = 0;
    let speed = 0.02;
    let pulseColor = '#00f2fe';

    // 3D Cube Vertices
    const size = 18;
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ].map(([x, y, z]) => [x * size, y * size, z * size]);

    // Cube Edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back
      [4, 5], [5, 6], [6, 7], [7, 4], // Front
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connectors
    ];

    function project([x, y, z]) {
      // Rotate Y
      const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotate X
      const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      // Perspective projection
      const fov = 120;
      const scale = fov / (fov + z2 + 60);
      return [x1 * scale + width / 2, y2 * scale + height / 2];
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      angleX += speed * 0.7;
      angleY += speed;

      const projected = vertices.map(project);

      // Draw edges with glowing neon stroke
      ctx.strokeStyle = pulseColor;
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 8;
      ctx.shadowColor = pulseColor;

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i][0], projected[i][1]);
        ctx.lineTo(projected[j][0], projected[j][1]);
        ctx.stroke();
      });

      // Draw glowing vertices
      ctx.fillStyle = '#ffffff';
      projected.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    }

    render();

    // Export pulse hook on cipher execution
    window.Crypto3D.pulseCube = (isSuccess) => {
      pulseColor = isSuccess ? '#00ff9d' : '#ff007f';
      speed = 0.08;
      setTimeout(() => {
        pulseColor = '#00f2fe';
        speed = 0.02;
      }, 800);
    };
  },

  // =========================================================================
  // 3. INTERACTIVE 3D CRYPTOGRAPHIC ROTOR / CRYPTEX (Canvas 3D)
  // =========================================================================
  initInteractiveCryptex: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    let canvas = container.querySelector('canvas.cryptex-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'cryptex-canvas';
      container.innerHTML = '';
      container.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = container.clientWidth || 480);
    let height = (canvas.height = 240);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.35;
    let rotY = 0.45;
    let autoRotate = true;

    // Rings specification: Outer (Plaintext), Middle (Rotor/Key), Inner (Ciphertext)
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numRings = 3;
    const ringRadii = [82, 60, 40];
    const ringColors = ['#00f2fe', '#a855f7', '#ff007f'];
    const ringTitles = ['PLAIN', 'ROTOR', 'CIPHER'];
    let currentShift = 5;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      autoRotate = false;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    });
    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    });

    function project3D(x, y, z) {
      // Rotate Y
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotate X
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      const fov = 350;
      const scale = fov / (fov + z2 + 200);
      return {
        x: x1 * scale + width / 2,
        y: y2 * scale + height / 2,
        z: z2,
        scale
      };
    }

    function renderCryptex() {
      ctx.clearRect(0, 0, width, height);

      if (autoRotate) {
        rotY += 0.006;
      }

      // Draw rings in 3D
      for (let rIdx = 0; rIdx < numRings; rIdx++) {
        const radius = ringRadii[rIdx];
        const color = ringColors[rIdx];
        const ringZOffset = (rIdx - 1) * 36; // Spaced horizontally along cylinder axis

        // Ring cylinder body
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.2) {
          const rx = Math.cos(a) * radius;
          const ry = Math.sin(a) * radius;
          const p = project3D(rx, ry, ringZOffset);
          if (a === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Letters placed radially along the ring
        const step = (Math.PI * 2) / 26;
        const ringShift = (rIdx === 2) ? currentShift : 0; // Shift cipher ring

        for (let i = 0; i < 26; i++) {
          const angle = i * step + (rIdx === 1 ? rotY * 0.5 : 0);
          const rx = Math.cos(angle) * radius;
          const ry = Math.sin(angle) * radius;
          const p = project3D(rx, ry, ringZOffset);

          // Only render letters facing the viewer (z > 0)
          if (p.z > -20) {
            const letter = alphabet[(i + ringShift) % 26];
            ctx.font = `bold ${Math.max(8, Math.round(11 * p.scale))}px 'JetBrains Mono', monospace`;
            ctx.fillStyle = p.z > 30 ? '#ffffff' : color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letter, p.x, p.y);
          }
        }

        // Draw ring label indicator
        const labelP = project3D(0, radius + 14, ringZOffset);
        if (labelP.z > -40) {
          ctx.font = `800 ${Math.max(7, Math.round(9 * labelP.scale))}px 'Inter', sans-serif`;
          ctx.fillStyle = color;
          ctx.fillText(ringTitles[rIdx], labelP.x, labelP.y);
        }
      }

      requestAnimationFrame(renderCryptex);
    }

    renderCryptex();

    // Hook to rotate rings when shift key changes in playground
    window.Crypto3D.setCryptexShift = (shift) => {
      currentShift = ((parseInt(shift, 10) % 26) + 26) % 26 || 0;
    };
  },

  // ==========================================
  // 4. 3D ISOMETRIC MATRIX VIEW TOGGLE
  // ==========================================
  toggleIsometricMatrix: (enable) => {
    const grids = document.querySelectorAll('.playfair-grid, .hill-matrices, .columnar-table');
    grids.forEach(g => {
      if (enable) {
        g.classList.add('isometric-3d');
      } else {
        g.classList.remove('isometric-3d');
      }
    });
  }
};

window.Crypto3D = Crypto3D;
