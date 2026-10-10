/**
 * Algorithm Comparison & Benchmark Engine
 * Evaluates performance, timing, throughput, and entropy for all 8 ciphers.
 */

const BenchmarkEngine = {
  // Calculate Shannon Entropy: H(X) = - sum( p(x) * log2(p(x)) )
  calculateEntropy: (text) => {
    if (!text || text.length === 0) return 0;
    const freqs = {};
    for (let char of text) {
      freqs[char] = (freqs[char] || 0) + 1;
    }
    let entropy = 0;
    const len = text.length;
    for (let char in freqs) {
      const p = freqs[char] / len;
      entropy -= p * Math.log2(p);
    }
    return parseFloat(entropy.toFixed(3));
  },

  // Benchmark Config Suite
  runComparison: (sampleText) => {
    const text = sampleText && sampleText.trim().length > 0 ? sampleText : 'NETWORK SECURITY AND CRYPTOGRAPHY TOOLKIT BENCHMARK TEST';

    const testCases = [
      { id: 'caesar', name: 'Caesar Cipher', category: 'Substitution', runEnc: (t) => window.CryptoEngine.Caesar.encrypt(t, 5), runDec: (c) => window.CryptoEngine.Caesar.decrypt(c, 5) },
      { id: 'mono', name: 'Monoalphabetic Cipher', category: 'Substitution', runEnc: (t) => window.CryptoEngine.Monoalphabetic.encrypt(t, 'QWERTYUIOPASDFGHJKLZXCVBNM'), runDec: (c) => window.CryptoEngine.Monoalphabetic.decrypt(c, 'QWERTYUIOPASDFGHJKLZXCVBNM') },
      { id: 'playfair', name: 'Playfair Cipher', category: 'Substitution', runEnc: (t) => window.CryptoEngine.Playfair.encrypt(t, 'MONARCHY'), runDec: (c) => window.CryptoEngine.Playfair.decrypt(c, 'MONARCHY') },
      { id: 'hill', name: 'Hill Cipher (2x2)', category: 'Substitution', runEnc: (t) => window.CryptoEngine.Hill.encrypt(t, '5,8,17,3'), runDec: (c) => window.CryptoEngine.Hill.decrypt(c, '5,8,17,3') },
      { id: 'vigenere', name: 'Vigenère Cipher', category: 'Polyalphabetic', runEnc: (t) => window.CryptoEngine.Vigenere.encrypt(t, 'KEYWORD'), runDec: (c) => window.CryptoEngine.Vigenere.decrypt(c, 'KEYWORD') },
      { id: 'otp', name: 'One-Time Pad', category: 'Polyalphabetic', runEnc: (t) => {
          const k = window.CryptoEngine.OneTimePad.generateRandomKey(t.length * 2);
          return window.CryptoEngine.OneTimePad.encrypt(t, k);
        }, runDec: (c) => c }, // Simulated OTP
      { id: 'railfence', name: 'Rail Fence Cipher', category: 'Transposition', runEnc: (t) => window.CryptoEngine.RailFence.encrypt(t, 3), runDec: (c) => window.CryptoEngine.RailFence.decrypt(c, 3) },
      { id: 'columnar', name: 'Columnar Transposition', category: 'Transposition', runEnc: (t) => window.CryptoEngine.ColumnarTransposition.encrypt(t, 'CIPHER'), runDec: (c) => window.CryptoEngine.ColumnarTransposition.decrypt(c, 'CIPHER') }
    ];

    const results = [];

    for (let tc of testCases) {
      let encTime = 0;
      let decTime = 0;
      let ciphertext = '';
      let decryptedText = '';
      let status = 'Success';
      let errorMsg = null;

      try {
        // Measure Encryption Time (averaged over iterations for precision)
        const iterations = 50;
        const t0 = performance.now();
        for (let i = 0; i < iterations; i++) {
          ciphertext = tc.runEnc(text);
        }
        const t1 = performance.now();
        encTime = (t1 - t0) / iterations; // avg ms per run

        // Measure Decryption Time
        const t2 = performance.now();
        for (let i = 0; i < iterations; i++) {
          decryptedText = tc.runDec(ciphertext);
        }
        const t3 = performance.now();
        decTime = (t3 - t2) / iterations;

      } catch (err) {
        status = 'Error';
        errorMsg = err.message;
      }

      const entropy = BenchmarkEngine.calculateEntropy(ciphertext);
      const charsPerSec = encTime > 0 ? Math.round((text.length / encTime) * 1000) : 0;

      results.push({
        id: tc.id,
        name: tc.name,
        category: tc.category,
        encTimeMs: parseFloat(encTime.toFixed(4)),
        decTimeMs: parseFloat(decTime.toFixed(4)),
        ciphertextSample: ciphertext.substring(0, 30) + (ciphertext.length > 30 ? '...' : ''),
        entropy,
        charsPerSec,
        status,
        errorMsg
      });
    }

    return results;
  }
};

window.BenchmarkEngine = BenchmarkEngine;
