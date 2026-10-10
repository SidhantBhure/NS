/**
 * Classical Cryptography Engine
 * Pure JS implementation of 8 classical ciphers + utility functions.
 */

const CryptoEngine = {
  // Helper: sanitize input to uppercase A-Z only
  cleanAlphabet: (text) => text.toUpperCase().replace(/[^A-Z]/g, ''),

  // Helper: GCD
  gcd: (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  },

  // Helper: Modular Multiplicative Inverse (mod 26)
  modInverse: (a, m = 26) => {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return null;
  },

  // ==========================================
  // 1. CAESAR CIPHER
  // ==========================================
  Caesar: {
    encrypt: (text, shift) => {
      shift = parseInt(shift, 10);
      if (isNaN(shift)) throw new Error('Shift key must be a valid integer.');
      shift = ((shift % 26) + 26) % 26;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const base = char >= 'a' ? 97 : 65;
        return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
      });
    },
    decrypt: (text, shift) => {
      shift = parseInt(shift, 10);
      if (isNaN(shift)) throw new Error('Shift key must be a valid integer.');
      return CryptoEngine.Caesar.encrypt(text, -shift);
    }
  },

  // ==========================================
  // 2. MONOALPHABETIC CIPHER
  // ==========================================
  Monoalphabetic: {
    generateRandomKey: () => {
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      for (let i = alpha.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [alpha[i], alpha[j]] = [alpha[j], alpha[i]];
      }
      return alpha.join('');
    },

    validateKey: (key) => {
      const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
      if (cleanKey.length !== 26) return false;
      const unique = new Set(cleanKey.split(''));
      return unique.size === 26;
    },

    encrypt: (text, key) => {
      const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
      if (!CryptoEngine.Monoalphabetic.validateKey(cleanKey)) {
        throw new Error('Key must contain exactly 26 unique letters (A-Z).');
      }
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const idx = alpha.indexOf(char.toUpperCase());
        const subChar = cleanKey[idx];
        return isLower ? subChar.toLowerCase() : subChar;
      });
    },

    decrypt: (text, key) => {
      const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
      if (!CryptoEngine.Monoalphabetic.validateKey(cleanKey)) {
        throw new Error('Key must contain exactly 26 unique letters (A-Z).');
      }
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const idx = cleanKey.indexOf(char.toUpperCase());
        const origChar = alpha[idx];
        return isLower ? origChar.toLowerCase() : origChar;
      });
    }
  },

  // ==========================================
  // 3. PLAYFAIR CIPHER
  // ==========================================
  Playfair: {
    generateMatrix: (keyword) => {
      const cleanKey = CryptoEngine.cleanAlphabet(keyword).replace(/J/g, 'I');
      const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // J omitted
      const matrixChars = [];
      const used = new Set();

      for (const ch of cleanKey) {
        if (!used.has(ch)) {
          used.add(ch);
          matrixChars.push(ch);
        }
      }
      for (const ch of alphabet) {
        if (!used.has(ch)) {
          used.add(ch);
          matrixChars.push(ch);
        }
      }

      const grid = [];
      for (let r = 0; r < 5; r++) {
        grid.push(matrixChars.slice(r * 5, r * 5 + 5));
      }
      return grid;
    },

    findPosition: (grid, letter) => {
      if (letter === 'J') letter = 'I';
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (grid[r][c] === letter) return { r, c };
        }
      }
      return null;
    },

    preprocessText: (text) => {
      let clean = CryptoEngine.cleanAlphabet(text).replace(/J/g, 'I');
      let result = '';
      let i = 0;
      while (i < clean.length) {
        let first = clean[i];
        let second = (i + 1 < clean.length) ? clean[i + 1] : null;

        if (!second) {
          result += first + 'X';
          i += 1;
        } else if (first === second) {
          result += first + 'X';
          i += 1;
        } else {
          result += first + second;
          i += 2;
        }
      }
      return result;
    },

    encrypt: (text, keyword) => {
      if (!keyword || CryptoEngine.cleanAlphabet(keyword).length === 0) {
        throw new Error('Playfair Cipher requires a keyword.');
      }
      const grid = CryptoEngine.Playfair.generateMatrix(keyword);
      const preprocessed = CryptoEngine.Playfair.preprocessText(text);
      let ciphertext = '';

      for (let i = 0; i < preprocessed.length; i += 2) {
        const p1 = CryptoEngine.Playfair.findPosition(grid, preprocessed[i]);
        const p2 = CryptoEngine.Playfair.findPosition(grid, preprocessed[i + 1]);

        if (p1.r === p2.r) {
          // Same row
          ciphertext += grid[p1.r][(p1.c + 1) % 5];
          ciphertext += grid[p2.r][(p2.c + 1) % 5];
        } else if (p1.c === p2.c) {
          // Same col
          ciphertext += grid[(p1.r + 1) % 5][p1.c];
          ciphertext += grid[(p2.r + 1) % 5][p2.c];
        } else {
          // Rectangle
          ciphertext += grid[p1.r][p2.c];
          ciphertext += grid[p2.r][p1.c];
        }
      }
      return ciphertext;
    },

    decrypt: (text, keyword) => {
      if (!keyword || CryptoEngine.cleanAlphabet(keyword).length === 0) {
        throw new Error('Playfair Cipher requires a keyword.');
      }
      const grid = CryptoEngine.Playfair.generateMatrix(keyword);
      const clean = CryptoEngine.cleanAlphabet(text).replace(/J/g, 'I');
      let plaintext = '';

      for (let i = 0; i < clean.length; i += 2) {
        const p1 = CryptoEngine.Playfair.findPosition(grid, clean[i]);
        const p2 = CryptoEngine.Playfair.findPosition(grid, clean[i + 1]);
        if (!p1 || !p2) continue;

        if (p1.r === p2.r) {
          // Same row
          plaintext += grid[p1.r][(p1.c + 4) % 5];
          plaintext += grid[p2.r][(p2.c + 4) % 5];
        } else if (p1.c === p2.c) {
          // Same col
          plaintext += grid[(p1.r + 4) % 5][p1.c];
          plaintext += grid[(p2.r + 4) % 5][p2.c];
        } else {
          // Rectangle
          plaintext += grid[p1.r][p2.c];
          plaintext += grid[p2.r][p1.c];
        }
      }
      return plaintext;
    }
  },

  // ==========================================
  // 4. HILL CIPHER (2x2 Matrix)
  // ==========================================
  Hill: {
    parseKeyMatrix: (keyStr) => {
      // Key can be 4 numbers comma-separated OR 4 letters
      const cleanStr = keyStr.trim();
      let nums = [];

      if (cleanStr.includes(',') || cleanStr.includes(' ')) {
        nums = cleanStr.split(/[\s,]+/).map(n => parseInt(n, 10));
      } else {
        const alphaKey = CryptoEngine.cleanAlphabet(cleanStr);
        nums = alphaKey.split('').map(ch => ch.charCodeAt(0) - 65);
      }

      if (nums.length !== 4 || nums.some(isNaN)) {
        throw new Error('Hill Cipher (2x2) requires 4 numbers or 4 letters as key (e.g. "HILL" or "5,8,17,3").');
      }

      const k11 = ((nums[0] % 26) + 26) % 26;
      const k12 = ((nums[1] % 26) + 26) % 26;
      const k21 = ((nums[2] % 26) + 26) % 26;
      const k22 = ((nums[3] % 26) + 26) % 26;

      const det = ((k11 * k22 - k12 * k21) % 26 + 26) % 26;
      const gcd = CryptoEngine.gcd(det, 26);

      if (gcd !== 1) {
        throw new Error(`Invalid Key Matrix! Determinant (${det}) must be coprime with 26. (gcd=${gcd}).`);
      }

      const detInv = CryptoEngine.modInverse(det, 26);
      return {
        matrix: [[k11, k12], [k21, k22]],
        det,
        detInv,
        invMatrix: [
          [((k22 * detInv) % 26 + 26) % 26, (((-k12) * detInv) % 26 + 26) % 26],
          [(((-k21) * detInv) % 26 + 26) % 26, ((k11 * detInv) % 26 + 26) % 26]
        ]
      };
    },

    encrypt: (text, keyStr) => {
      const keyInfo = CryptoEngine.Hill.parseKeyMatrix(keyStr);
      let clean = CryptoEngine.cleanAlphabet(text);
      if (clean.length % 2 !== 0) clean += 'X'; // Padding

      let result = '';
      for (let i = 0; i < clean.length; i += 2) {
        const p1 = clean.charCodeAt(i) - 65;
        const p2 = clean.charCodeAt(i + 1) - 65;

        const c1 = (keyInfo.matrix[0][0] * p1 + keyInfo.matrix[0][1] * p2) % 26;
        const c2 = (keyInfo.matrix[1][0] * p1 + keyInfo.matrix[1][1] * p2) % 26;

        result += String.fromCharCode(c1 + 65) + String.fromCharCode(c2 + 65);
      }
      return result;
    },

    decrypt: (text, keyStr) => {
      const keyInfo = CryptoEngine.Hill.parseKeyMatrix(keyStr);
      let clean = CryptoEngine.cleanAlphabet(text);
      if (clean.length % 2 !== 0) clean += 'X';

      let result = '';
      for (let i = 0; i < clean.length; i += 2) {
        const c1 = clean.charCodeAt(i) - 65;
        const c2 = clean.charCodeAt(i + 1) - 65;

        const p1 = (keyInfo.invMatrix[0][0] * c1 + keyInfo.invMatrix[0][1] * c2) % 26;
        const p2 = (keyInfo.invMatrix[1][0] * c1 + keyInfo.invMatrix[1][1] * c2) % 26;

        result += String.fromCharCode(p1 + 65) + String.fromCharCode(p2 + 65);
      }
      return result;
    }
  },

  // ==========================================
  // 5. VIGENÈRE CIPHER
  // ==========================================
  Vigenere: {
    encrypt: (text, key) => {
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      if (!cleanKey) throw new Error('Vigenère Cipher requires an alphabetic key.');

      let keyIdx = 0;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const base = isLower ? 97 : 65;
        const p = char.charCodeAt(0) - base;
        const k = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 65;
        keyIdx++;
        const c = (p + k) % 26;
        return String.fromCharCode(c + base);
      });
    },

    decrypt: (text, key) => {
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      if (!cleanKey) throw new Error('Vigenère Cipher requires an alphabetic key.');

      let keyIdx = 0;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const base = isLower ? 97 : 65;
        const c = char.charCodeAt(0) - base;
        const k = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 65;
        keyIdx++;
        const p = (c - k + 26) % 26;
        return String.fromCharCode(p + base);
      });
    }
  },

  // ==========================================
  // 6. ONE-TIME PAD (OTP)
  // ==========================================
  OneTimePad: {
    generateRandomKey: (length) => {
      let key = '';
      for (let i = 0; i < length; i++) {
        key += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
      }
      return key;
    },

    encrypt: (text, key) => {
      const cleanText = CryptoEngine.cleanAlphabet(text);
      const cleanKey = CryptoEngine.cleanAlphabet(key);

      if (cleanKey.length < cleanText.length) {
        throw new Error(`One-Time Pad key length (${cleanKey.length}) must be at least as long as clean text length (${cleanText.length}).`);
      }

      let ciphertext = '';
      for (let i = 0; i < cleanText.length; i++) {
        const p = cleanText.charCodeAt(i) - 65;
        const k = cleanKey.charCodeAt(i) - 65;
        const c = (p + k) % 26;
        ciphertext += String.fromCharCode(c + 65);
      }
      return ciphertext;
    },

    decrypt: (text, key) => {
      const cleanText = CryptoEngine.cleanAlphabet(text);
      const cleanKey = CryptoEngine.cleanAlphabet(key);

      if (cleanKey.length < cleanText.length) {
        throw new Error(`One-Time Pad key length (${cleanKey.length}) must be at least as long as ciphertext length (${cleanText.length}).`);
      }

      let plaintext = '';
      for (let i = 0; i < cleanText.length; i++) {
        const c = cleanText.charCodeAt(i) - 65;
        const k = cleanKey.charCodeAt(i) - 65;
        const p = (c - k + 26) % 26;
        plaintext += String.fromCharCode(p + 65);
      }
      return plaintext;
    }
  },

  // ==========================================
  // 7. RAIL FENCE CIPHER
  // ==========================================
  RailFence: {
    encrypt: (text, rails) => {
      const depth = parseInt(rails, 10);
      if (isNaN(depth) || depth < 2) throw new Error('Rail Fence requires at least 2 rails.');

      const matrix = Array.from({ length: depth }, () => []);
      let rail = 0;
      let direction = 1; // 1: down, -1: up

      for (let i = 0; i < text.length; i++) {
        matrix[rail].push(text[i]);
        rail += direction;
        if (rail === depth - 1 || rail === 0) direction *= -1;
      }

      return matrix.map(r => r.join('')).join('');
    },

    decrypt: (text, rails) => {
      const depth = parseInt(rails, 10);
      if (isNaN(depth) || depth < 2) throw new Error('Rail Fence requires at least 2 rails.');

      // Mark matrix positions
      const markMatrix = Array.from({ length: depth }, () => Array(text.length).fill(null));
      let rail = 0;
      let direction = 1;

      for (let i = 0; i < text.length; i++) {
        markMatrix[rail][i] = '*';
        rail += direction;
        if (rail === depth - 1 || rail === 0) direction *= -1;
      }

      // Fill in ciphertext characters
      let idx = 0;
      for (let r = 0; r < depth; r++) {
        for (let c = 0; c < text.length; c++) {
          if (markMatrix[r][c] === '*' && idx < text.length) {
            markMatrix[r][c] = text[idx++];
          }
        }
      }

      // Read along trajectory
      let result = '';
      rail = 0;
      direction = 1;
      for (let i = 0; i < text.length; i++) {
        result += markMatrix[rail][i];
        rail += direction;
        if (rail === depth - 1 || rail === 0) direction *= -1;
      }

      return result;
    }
  },

  // ==========================================
  // 8. COLUMNAR TRANSPOSITION CIPHER
  // ==========================================
  ColumnarTransposition: {
    getKeyOrder: (key) => {
      const cleanKey = key ? key.toString().trim() : '';
      if (!cleanKey) throw new Error('Columnar Transposition requires a keyword (e.g. "SECRET") or numeric column order (e.g. "3,1,4,2").');

      // Check if key is comma/space separated numeric order e.g. "3, 1, 4, 2" or "3 1 4 2"
      if (/^[\d\s,]+$/.test(cleanKey)) {
        const nums = cleanKey.split(/[\s,]+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        if (nums.length === 0) throw new Error('Column reading order must contain valid numbers.');
        const minVal = Math.min(...nums);
        // Map 1-indexed to 0-indexed column position:
        // e.g. [3, 1, 4, 2] -> [2, 0, 3, 1]
        return nums.map(n => minVal === 1 ? n - 1 : n);
      }

      // Keyword sorting (e.g. "SECRET")
      const cleanKeyStr = CryptoEngine.cleanAlphabet(cleanKey);
      if (!cleanKeyStr) throw new Error('Columnar Transposition requires a valid keyword or numeric column order.');

      const indexedKey = cleanKeyStr.split('').map((char, index) => ({ char, index }));
      indexedKey.sort((a, b) => a.char.localeCompare(b.char));

      const order = new Array(cleanKeyStr.length);
      indexedKey.forEach((item, rank) => {
        order[rank] = item.index;
      });
      return order;
    },

    encrypt: (text, key) => {
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      if (!cleanKey) throw new Error('Columnar Transposition requires a valid keyword.');

      const numCols = cleanKey.length;
      let cleanText = CryptoEngine.cleanAlphabet(text);
      if (cleanText.length === 0) return '';

      // Pad with 'X' to fill matrix completely
      const numRows = Math.ceil(cleanText.length / numCols);
      const paddedLength = numRows * numCols;
      while (cleanText.length < paddedLength) {
        cleanText += 'X';
      }

      // Order of columns to read
      const keyOrder = CryptoEngine.ColumnarTransposition.getKeyOrder(cleanKey);

      let ciphertext = '';
      for (let colIdx of keyOrder) {
        for (let r = 0; r < numRows; r++) {
          ciphertext += cleanText[r * numCols + colIdx];
        }
      }
      return ciphertext;
    },

    decrypt: (text, key) => {
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      if (!cleanKey) throw new Error('Columnar Transposition requires a valid keyword.');

      const cleanText = CryptoEngine.cleanAlphabet(text);
      const numCols = cleanKey.length;
      if (cleanText.length === 0) return '';

      const numRows = Math.ceil(cleanText.length / numCols);
      const keyOrder = CryptoEngine.ColumnarTransposition.getKeyOrder(cleanKey);

      const grid = Array.from({ length: numRows }, () => Array(numCols).fill(''));

      let textIdx = 0;
      for (let colIdx of keyOrder) {
        for (let r = 0; r < numRows; r++) {
          if (textIdx < cleanText.length) {
            grid[r][colIdx] = cleanText[textIdx++];
          }
        }
      }

      let plaintext = '';
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          plaintext += grid[r][c];
        }
      }
      return plaintext;
    }
  }
};

// Export for browser globally
window.CryptoEngine = CryptoEngine;
