/**
 * Theory & Educational Knowledge Base
 * Contains mathematical details, history, examples, and security notes for all 8 ciphers.
 */

const TheoryData = {
  ciphers: {
    caesar: {
      name: "Caesar Cipher",
      category: "Substitution Cipher (Monoalphabetic)",
      inventor: "Julius Caesar (100 BC – 44 BC)",
      formulaEnc: "C = (P + K) mod 26",
      formulaDec: "P = (C - K + 26) mod 26",
      overview: "The Caesar Cipher is one of the earliest and simplest encryption techniques. It is a type of substitution cipher in which each letter in the plaintext is shifted by a fixed number of positions down the alphabet.",
      example: "Plaintext: 'NETWORK SECURITY', Key: K = 5. 'N' (13) + 5 = 18 ('S'). Output: 'SJYBTWP XJHZWNYD'.",
      strengths: "Extremely simple to understand and implement with minimal computational cost.",
      weakness: "Vulnerable to brute-force attack (only 25 possible keys) and letter frequency analysis (e.g. 'E' and 'T' retain high frequency).",
      cryptanalysis: "Frequency Analysis, Exhaustive Key Search."
    },

    monoalphabetic: {
      name: "Monoalphabetic Substitution Cipher",
      category: "Substitution Cipher",
      inventor: "Classical Arab Cryptanalysts (Al-Kindi, 9th Century)",
      formulaEnc: "C_i = KeyMap[P_i]",
      formulaDec: "P_i = ReverseKeyMap[C_i]",
      overview: "In a monoalphabetic substitution cipher, a fixed key alphabet of 26 letters replaces the standard A-Z alphabet throughout the entire message.",
      example: "Standard: ABCDEFGHIJKLMNOPQRSTUVWXYZ | Key: QWERTYUIOPASDFGHJKLZXCVBNM | 'HELLO' -> 'ITSSG'",
      strengths: "Large key space of 26! (approx 4.03 × 10²⁶ possible keys), rendering brute-force attacks infeasible.",
      weakness: "Preserves letter frequency characteristics of the plaintext language.",
      cryptanalysis: "Frequency analysis of single letters, digrams (TH, HE), and trigrams (THE, ING)."
    },

    playfair: {
      name: "Playfair Cipher",
      category: "Polygraphic Substitution Cipher (Digraph)",
      inventor: "Charles Wheatstone (1854), popularized by Lord Playfair",
      formulaEnc: "Uses 5x5 Key Matrix with digraph rules (Row Wrap, Col Wrap, Rectangle Swap)",
      formulaDec: "Reverse shift rules on 5x5 Matrix",
      overview: "The Playfair cipher encrypts pairs of letters (digraphs) instead of single letters, significantly flattening letter frequency distributions.",
      example: "Key: 'MONARCHY'. Grid created. Plaintext 'BALLOON' preprocessed to 'BA LX LO ON'. Encrypted using matrix lookup.",
      strengths: "Distroys single-letter frequency distribution. Was used for tactical military communications in WW1 and WW2.",
      weakness: "25x25 = 625 digraphs can still be broken with frequency analysis of digraphs if enough ciphertext is available.",
      cryptanalysis: "Digraph frequency analysis, known-plaintext pair search."
    },

    hill: {
      name: "Hill Cipher",
      category: "Polygraphic Substitution Cipher (Linear Algebra)",
      inventor: "Lester S. Hill (1929)",
      formulaEnc: "C = K · P (mod 26)",
      formulaDec: "P = K⁻¹ · C (mod 26), where K⁻¹ = det(K)⁻¹ · adj(K) (mod 26)",
      overview: "The Hill cipher applies linear algebra to cryptography. Plaintext characters are converted into n-element vectors and multiplied by an n×n key matrix modulo 26.",
      example: "2x2 Matrix K = [[5, 8], [17, 3]]. det(K) = (15 - 136) mod 26 = 9. gcd(9, 26) = 1. Valid key!",
      strengths: "Hides single-letter and digram frequencies; completely linear and mathematically elegant.",
      weakness: "Vulnerable to Known-Plaintext Attack using matrix inversion techniques.",
      cryptanalysis: "Known-Plaintext Attack using linear algebra systems of equations."
    },

    vigenere: {
      name: "Vigenère Cipher",
      category: "Polyalphabetic Substitution Cipher",
      inventor: "Giovan Battista Bellaso (1553) / Blaise de Vigenère",
      formulaEnc: "C_i = (P_i + K_(i mod |K|)) mod 26",
      formulaDec: "P_i = (C_i - K_(i mod |K|) + 26) mod 26",
      overview: "The Vigenère cipher uses a keyword to vary the shift for each character. A repeating key stream creates multiple cipher alphabets, confounding single-letter frequency analysis.",
      example: "Plaintext: 'ATTACKATDAWN', Key: 'LEMONLEMONLE' -> Ciphertext: 'LXFOPVEFRNHR'",
      strengths: "Resisted decryption for 300 years (known as 'le chiffre indéchiffrable').",
      weakness: "Periodic keyword repetition allows key length estimation via Kasiski Examination and Index of Coincidence.",
      cryptanalysis: "Kasiski Examination, Index of Coincidence test, Friedman Test."
    },

    otp: {
      name: "One-Time Pad (OTP) / Vernam Cipher",
      category: "Polyalphabetic Cipher (Perfect Secrecy)",
      inventor: "Gilbert Vernam & Joseph Mauborgne (1917)",
      formulaEnc: "C_i = (P_i + K_i) mod 26 (or C = P ⊕ K)",
      formulaDec: "P_i = (C_i - K_i + 26) mod 26 (or P = C ⊕ K)",
      overview: "The One-Time Pad is mathematically unbreakable if three conditions are met: (1) Key is truly random, (2) Key is at least as long as the plaintext, (3) Key is used strictly ONCE and never reused.",
      example: "Plaintext: 'SECRET', Key: 'XMCKL2' -> Ciphertext is mathematically independent of plaintext.",
      strengths: "Information-Theoretic Security (Perfect Secrecy proved by Claude Shannon).",
      weakness: "Key distribution and secure key generation at scale are extremely difficult.",
      cryptanalysis: "Unbreakable if rules are followed. Vulnerable only if keys are reused (Two-Time Pad attack)."
    },

    railfence: {
      name: "Rail Fence Cipher",
      category: "Transposition Cipher (Zigzag Route)",
      inventor: "Ancient Classical Cryptographers",
      formulaEnc: "Write plaintext diagonally down and up across N rail depth levels, then read row by row.",
      formulaDec: "Reconstruct rail trajectory, place ciphertext in marked slots, read along trajectory.",
      overview: "The Rail Fence cipher is a transposition cipher that rearranges character positions without altering the character identities.",
      example: "Plaintext: 'DEFEND THE EAST', Rails = 3. Trajectory zigzag creates 3 horizontal strings combined together.",
      strengths: "Changes spatial positions of characters, preserving letter counts.",
      weakness: "Preserves exact letter frequencies of plaintext (e.g. vowel counts stay identical). Easy to crack with rail-depth brute force.",
      cryptanalysis: "Rail depth trial decryption, anagramming."
    },

    columnar: {
      name: "Columnar Transposition Cipher",
      category: "Transposition Cipher (Grid Sorting)",
      inventor: "Classical Military Cryptographers",
      formulaEnc: "Write plaintext into matrix of key length columns. Read out columns according to alphabetical key rank.",
      formulaDec: "Calculate column lengths, fill matrix by sorted key column order, read out row by row.",
      overview: "In Columnar Transposition, text is written into a grid row by row and read out column by column based on a key word's alphabetical letter order.",
      example: "Key: 'GERMAN' -> Column order [2, 1, 6, 4, 3, 5]. Grid filled row by row, read out in order 1..6.",
      strengths: "Double columnar transposition provides strong diffusion.",
      weakness: "Letter frequencies are unaltered; vulnerable to multiple-ciphertext anagramming.",
      cryptanalysis: "Column alignment, anagramming, vowel distribution matching."
    }
  },

  projectReport: {
    title: "Design and Development of a Classical Cryptography Toolkit",
    author: "Mini Project Submission",
    objectives: [
      "Implement robust mathematical algorithms for 8 classical substitution and transposition ciphers.",
      "Develop an interactive, menu-driven web software application for real-time text encryption and decryption.",
      "Integrate interactive step-by-step visual matrix renderers for educational insight into cipher mechanics.",
      "Build utility modules for file encryption/decryption, performance benchmarking, and algorithm analysis."
    ],
    softwareRequirements: [
      "Operating System: Windows / macOS / Linux",
      "Runtime Environment: Modern Web Browser (Chrome, Firefox, Edge, Safari)",
      "Technologies: HTML5, CSS3 (Modern Glassmorphism Design System), JavaScript (ES6+ Modules)",
      "Performance Libraries: Web Crypto API & High-Resolution Timer (performance.now)"
    ]
  }
};

window.TheoryData = TheoryData;
