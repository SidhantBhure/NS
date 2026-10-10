/**
 * Theory Hub & Comprehensive Educational Knowledge Base
 * Detailed documentation for all 8 ciphers:
 * principles, key formats, step-by-step encrypt/decrypt, examples,
 * common errors & fixes, and educational limitations.
 */

const TheoryData = {
  ciphers: {
    caesar: {
      id: "caesar",
      name: "Caesar Cipher",
      category: "Substitution Cipher (Monoalphabetic Shift)",
      history: "Used by Roman general Julius Caesar (c. 100 BC – 44 BC) for military communications across Roman provinces.",
      principle: "A monoalphabetic substitution cipher where every letter in the plaintext is shifted down the alphabet by a fixed integer key K. Non-alphabetic characters (spaces, punctuation, digits) and letter case are preserved.",
      keyFormat: "An integer shift value K (e.g. 1 to 25). Negative shifts or values greater than 26 wrap modulo 26.",
      formulaEnc: "C = (P + K) mod 26",
      formulaDec: "P = (C - K + 26) mod 26",
      encryptSteps: [
        "Take each character in the plaintext.",
        "If the character is an alphabet letter (A-Z or a-z), calculate its 0-indexed position (A=0, ..., Z=25).",
        "Add the shift key K and take result modulo 26.",
        "Convert back to letter preserving original uppercase or lowercase.",
        "Pass spaces, digits, and punctuation unchanged."
      ],
      decryptSteps: [
        "Take each character in the ciphertext.",
        "Subtract the shift key K from the letter index (or add -K mod 26).",
        "Convert back to the original letter."
      ],
      exampleInput: "NETWORK SECURITY 2026",
      exampleKey: "5",
      exampleOutput: "SJYBTWP XJHZWNYD 2026",
      commonErrors: [
        {
          error: "Non-integer shift entered (e.g. 'abc' or empty).",
          resolution: "Enter a valid positive or negative integer (e.g. 3, 5, 13)."
        },
        {
          error: "Assuming shift 26 or 0 changes the text.",
          resolution: "Shift of 0 or 26 results in identical plaintext (identity mapping)."
        }
      ],
      vulnerabilities: "Extremely weak against brute-force attacks (only 25 non-trivial keys exist) and letter frequency analysis (the letter 'E' in English still maps to the highest-frequency ciphertext character).",
      limitations: "Provides zero modern confidentiality. A modern computer breaks it in less than 1 millisecond."
    },

    mono: {
      id: "mono",
      name: "Monoalphabetic Substitution Cipher",
      category: "Substitution Cipher (Arbitrary Permutation)",
      history: "Developed in antiquity; systematically analyzed by 9th-century Arab mathematician Al-Kindi in 'Manuscript on Deciphering Cryptographic Messages'.",
      principle: "Replaces each letter of the standard 26-letter Latin alphabet with a unique corresponding letter from a shuffled 26-character key alphabet throughout the entire message.",
      keyFormat: "A 26-character string containing all English letters from A to Z exactly once without duplicates (e.g., 'QWERTYUIOPASDFGHJKLZXCVBNM').",
      formulaEnc: "C_i = KeyMap[P_i]",
      formulaDec: "P_i = ReverseKeyMap[C_i]",
      encryptSteps: [
        "Validate that the key contains exactly 26 distinct letters.",
        "For each plaintext letter, find its index in the standard alphabet 'A'-'Z'.",
        "Replace it with the letter at that index in the substitution key alphabet.",
        "Preserve letter case and leave spaces/punctuation untouched."
      ],
      decryptSteps: [
        "For each ciphertext letter, locate its position within the 26-character key.",
        "Replace it with the standard alphabet letter at that same position."
      ],
      exampleInput: "HELLO WORLD",
      exampleKey: "QWERTYUIOPASDFGHJKLZXCVBNM",
      exampleOutput: "ITSSG VGKSR",
      commonErrors: [
        {
          error: "Key length is not 26 (e.g. 25 characters).",
          resolution: "Ensure all 26 alphabet letters are included in the key."
        },
        {
          error: "Key contains duplicate letters (e.g. two 'E's).",
          resolution: "Use the 'Auto Key' button to generate a valid, duplicate-free random permutation."
        }
      ],
      vulnerabilities: "Vulnerable to single-letter frequency analysis (ETAOIN SHRDLU), digram analysis (TH, HE, IN), and trigram matching (THE, AND, ING).",
      limitations: "Large key space (26! ≈ 4.03 × 10²⁶) prevents brute-force, yet the structural frequency distribution of natural language completely gives away the mapping."
    },

    playfair: {
      id: "playfair",
      name: "Playfair Cipher",
      category: "Substitution Cipher (Digraphic Substitution)",
      history: "Invented by Charles Wheatstone in 1854; championed by Lyon Playfair. Used by British armed forces in the Boer War and World War I.",
      principle: "Encrypts pairs of letters (digraphs) using a 5×5 grid constructed from a keyword. Standard Playfair merges 'I' and 'J' into a single grid cell to fit 25 positions. Repeated letters in a pair are separated with a filler letter ('X' or 'Z').",
      keyFormat: "An alphabetic keyword (e.g., 'MONARCHY'). Duplicates in the keyword are removed, and the remaining 25 alphabet letters (omitting J) complete the 5×5 matrix.",
      formulaEnc: "Digraph rules: Same Row -> Shift Right; Same Col -> Shift Down; Rectangle -> Swap Column Corners",
      formulaDec: "Reverse rules: Same Row -> Shift Left; Same Col -> Shift Up; Rectangle -> Swap Column Corners",
      encryptSteps: [
        "Construct the 5×5 key matrix using the keyword followed by unused letters (omitting J / merging J with I).",
        "Preprocess plaintext: remove non-letters, convert J to I, split into digraph pairs.",
        "If a digraph has identical letters (e.g., 'LL'), insert filler 'X' (or 'Z' if letter is 'X') between them.",
        "If total letters is odd, pad the last letter with 'X'.",
        "For each pair: if in same row, replace with letters to immediate right (wrap); if same column, replace with letters below (wrap); if rectangle, replace each letter with letter on same row in opposite corner."
      ],
      decryptSteps: [
        "Break ciphertext into digraphs.",
        "Apply inverse matrix rules: move left in rows, move up in columns, swap corners in rectangles."
      ],
      exampleInput: "BALLOON",
      exampleKey: "MONARCHY",
      exampleOutput: "IBSUPMNZ",
      commonErrors: [
        {
          error: "Attempting to decrypt odd-length ciphertext.",
          resolution: "Playfair ciphertext must always have an even length because encryption operates on pairs."
        },
        {
          error: "Confusion regarding letter 'J'.",
          resolution: "In Playfair, 'J' is universally treated as 'I'. Both occupy the same grid cell."
        }
      ],
      vulnerabilities: "Digraph frequency analysis (676 digraph pairs can still be profiled given sufficient ciphertext), known-plaintext attacks.",
      limitations: "Was tactically viable before computers, but modern cryptanalysis breaks Playfair in seconds using frequency scoring."
    },

    hill: {
      id: "hill",
      name: "Hill Cipher",
      category: "Substitution Cipher (Polygraphic Linear Algebra)",
      history: "Invented by Lester S. Hill in 1929. The first classical polygraphic cipher that operated on more than three symbols simultaneously.",
      principle: "Transforms blocks of n letters represented as vectors by multiplying them with an n×n invertible key matrix modulo 26. In 2×2 Hill, plaintext pairs (P1, P2) are multiplied by matrix K to produce ciphertext pairs (C1, C2).",
      keyFormat: "4 integers representing the 2×2 matrix: k11, k12, k21, k22 (e.g., '5,8,17,3') or a 4-letter word (e.g., 'HILL'). Matrix determinant must satisfy gcd(det, 26) = 1.",
      formulaEnc: "C = K · P (mod 26)",
      formulaDec: "P = K⁻¹ · C (mod 26), where K⁻¹ = det(K)⁻¹ · adj(K) (mod 26)",
      encryptSteps: [
        "Parse key into 2×2 matrix K.",
        "Calculate determinant: det(K) = (k11·k22 - k12·k21) mod 26.",
        "Verify gcd(det, 26) = 1 (invertibility check).",
        "Normalize plaintext to A-Z (A=0, ..., Z=25). If odd length, pad with 'X'.",
        "For each letter pair [p1, p2]: c1 = (k11·p1 + k12·p2) mod 26; c2 = (k21·p1 + k22·p2) mod 26.",
        "Convert [c1, c2] back to letters."
      ],
      decryptSteps: [
        "Calculate modular inverse of determinant: det⁻¹ such that (det · det⁻¹) ≡ 1 mod 26.",
        "Calculate modular inverse matrix K⁻¹ = det⁻¹ · [[k22, -k12], [-k21, k11]] mod 26.",
        "Multiply each ciphertext vector by K⁻¹ modulo 26."
      ],
      exampleInput: "ACT",
      exampleKey: "5,8,17,3",
      exampleOutput: "QGTC (padded with X)",
      commonErrors: [
        {
          error: "Determinant shares a factor with 26 (e.g. det is even or divisible by 13).",
          resolution: "Choose matrix values where det is coprime to 26 (gcd(det, 26) == 1). Use the provided presets or auto-key."
        },
        {
          error: "Matrix determinant is 0.",
          resolution: "A singular matrix has no inverse and cannot decrypt ciphertext."
        }
      ],
      vulnerabilities: "Vulnerable to Known-Plaintext Attacks (KPA). Because matrix multiplication is completely linear, knowing just 2 pairs of plaintext-ciphertext blocks allows solving the key matrix via simple Gaussian elimination modulo 26.",
      limitations: "Lacks non-linearity (confusion). Modern block ciphers like AES use non-linear substitution boxes (S-Boxes) specifically to resist linear attacks."
    },

    vigenere: {
      id: "vigenere",
      name: "Vigenère Cipher",
      category: "Polyalphabetic Substitution Cipher",
      history: "Created by Giovan Battista Bellaso in 1553, later misattributed to Blaise de Vigenère. For over 300 years, it was believed to be unbreakable ('le chiffre indéchiffrable').",
      principle: "Uses a repeated keyword to create a shifting series of different Caesar ciphers across the message. Each letter of the keyword determines the shift value for the corresponding plaintext letter.",
      keyFormat: "An alphabetic string keyword (e.g., 'KEYWORD', 'SECRET'). Must contain at least one letter A-Z.",
      formulaEnc: "C_i = (P_i + K_(i mod |K|)) mod 26",
      formulaDec: "P_i = (C_i - K_(i mod |K|) + 26) mod 26",
      encryptSteps: [
        "Clean keyword to uppercase letters A-Z.",
        "Align repeated keyword letters against the alphabetic characters of the plaintext.",
        "For each letter: shift plaintext character forward by the numerical value of the matching key letter (A=0, B=1, ...).",
        "Preserve letter case, spaces, digits, and punctuation."
      ],
      decryptSteps: [
        "Align the keyword against ciphertext letters.",
        "Subtract key letter value from ciphertext letter modulo 26."
      ],
      exampleInput: "ATTACK AT DAWN",
      exampleKey: "LEMON",
      exampleOutput: "LXFOPV EF RNHR",
      commonErrors: [
        {
          error: "Key contains numbers or symbols only.",
          resolution: "Vigenère keys must contain alphabetic characters (A-Z)."
        },
        {
          error: "Empty key provided.",
          resolution: "Enter a valid keyword of length >= 1."
        }
      ],
      vulnerabilities: "Broken in 1863 by Friedrich Kasiski. Periodic keyword repetition produces repeating ciphertext patterns at multiples of key length (Kasiski Examination), followed by Index of Coincidence (IoC) testing.",
      limitations: "Periodic repetition betrays the key length, collapsing polyalphabetic security into multiple parallel monoalphabetic Caesar ciphers."
    },

    otp: {
      id: "otp",
      name: "One-Time Pad (OTP) / Vernam Cipher",
      category: "Polyalphabetic Cipher (Information-Theoretic Security)",
      history: "Invented by Gilbert Vernam and Joseph Mauborgne in 1917. Claude Shannon mathematically proved in 1949 that OTP provides 'Perfect Secrecy'.",
      principle: "A polyalphabetic cipher where the keystream is truly random, at least as long as the plaintext, and used strictly once. Each plaintext character is combined with its unique key character modulo 26 (or XOR in binary).",
      keyFormat: "A uniformly random sequence of letters with length greater than or equal to the plaintext letter count.",
      formulaEnc: "C_i = (P_i + K_i) mod 26 (or C = P ⊕ K in binary)",
      formulaDec: "P_i = (C_i - K_i + 26) mod 26 (or P = C ⊕ K)",
      encryptSteps: [
        "Generate or enter a truly random key equal in length to message letter count.",
        "Add plaintext character index to key character index modulo 26.",
        "Discard the key immediately after use (Never Reuse!)."
      ],
      decryptSteps: [
        "Use the exact same shared key sequence.",
        "Subtract key characters from ciphertext characters modulo 26."
      ],
      exampleInput: "SECRET OPERATION",
      exampleKey: "XMCKLPOI UYTREWQA",
      exampleOutput: "PQMTPI HIIKEXMK",
      commonErrors: [
        {
          error: "Key length is shorter than plaintext letter count.",
          resolution: "OTP strictly requires key length >= plaintext length. Use 'Auto Key' to generate equal length."
        },
        {
          error: "Key reuse (Two-Time Pad).",
          resolution: "Never encrypt two messages with the same key! C1 ⊕ C2 = P1 ⊕ P2 leaks both plaintexts."
        }
      ],
      vulnerabilities: "Cryptographically unbreakable IF AND ONLY IF all 4 Shannon rules are strictly observed. Vulnerable only if key generation is pseudorandom, keys are reused, or keys are intercepted in transit.",
      limitations: "Key distribution problem: transmitting a secret key as long as the message requires a secure channel — if you had one, you could just send the message itself!"
    },

    railfence: {
      id: "railfence",
      name: "Rail Fence Cipher",
      category: "Transposition Cipher (Zigzag Route)",
      history: "An ancient transposition technique used by Greek soldiers and American Civil War telegraphers to scramble message order.",
      principle: "A transposition cipher where plaintext characters are written diagonally downward and upward across N horizontal rails (rows) in a zigzag wave, then read row by row from top to bottom.",
      keyFormat: "An integer depth value N (number of rails), where N >= 2.",
      formulaEnc: "Trajectory bouncing between rail 0 and rail (N-1); read out rail-by-rail.",
      formulaDec: "Reconstruct zigzag matrix slots, fill ciphertext horizontally, read along bounce path.",
      encryptSteps: [
        "Validate depth N >= 2.",
        "Write characters diagonally down until hitting bottom rail, then bounce diagonally up until hitting top rail.",
        "Concatenate letters from Rail 1, then Rail 2, through Rail N to produce ciphertext."
      ],
      decryptSteps: [
        "Reconstruct the trajectory grid of length L and depth N, marking active rail slots with markers.",
        "Fill the ciphertext letters horizontally into the marked positions row by row.",
        "Traverse the zigzag path from left to right to reconstruct original text."
      ],
      exampleInput: "DEFEND THE EAST",
      exampleKey: "3",
      exampleOutput: "DNETEEDHESFNA T",
      commonErrors: [
        {
          error: "Rail count less than 2 (e.g. 1, 0, or negative).",
          resolution: "Rail count must be an integer >= 2."
        },
        {
          error: "Rail count greater than message length.",
          resolution: "Rail count should be smaller than message length for meaningful transposition."
        }
      ],
      vulnerabilities: "Letter frequencies are 100% unaltered (vowel and consonant distributions remain identical). Trivial to crack with brute-force trial decryption across small rail depths.",
      limitations: "Provides only permutation without diffusion or confusion; susceptible to anagramming attacks."
    },

    columnar: {
      id: "columnar",
      name: "Columnar Transposition Cipher",
      category: "Transposition Cipher (Grid Permutation)",
      history: "Extensively used in tactical field operations throughout World War I and World War II by German, British, and French code bureaus.",
      principle: "Plaintext is written horizontally into a grid of N columns row by row. Columns are then read out vertically in order determined by the alphabetical rank of the keyword letters or a specified numeric sequence.",
      keyFormat: "An alphabetic keyword (e.g., 'SECRET', 'BALLOON') or numeric column sequence (e.g., '3,1,4,2').",
      formulaEnc: "Row-by-row write, followed by sorted column-by-column read.",
      formulaDec: "Calculate column lengths, fill columns in key order, read out row-by-row.",
      encryptSteps: [
        "Determine number of columns N from keyword length.",
        "Sort keyword characters alphabetically to establish column reading rank (stable sort preserves left-to-right order for identical letters).",
        "Write plaintext into grid row by row.",
        "Read columns top-to-bottom in sorted keyword order."
      ],
      decryptSteps: [
        "Calculate heights of each column (accounting for incomplete final rows or padding).",
        "Fill characters into respective columns following the sorted key order.",
        "Read off matrix row by row to reconstruct plaintext."
      ],
      exampleInput: "NETWORKSECURITY",
      exampleKey: "SECRET",
      exampleOutput: "EETWYORKSRIN C U",
      commonErrors: [
        {
          error: "Empty keyword provided.",
          resolution: "Provide an alphabetic keyword (e.g. 'SECRET') or numeric sequence (e.g. '3,1,4,2')."
        },
        {
          error: "Incomplete final row misread.",
          resolution: "Use the built-in incomplete row handler or enable 'Pad with X' mode for fixed-width rectangles."
        }
      ],
      vulnerabilities: "Preserves exact letter frequencies of natural language. Broken via anagramming, column alignment, and matching expected digram frequencies (TH, ER, ON).",
      limitations: "Single columnar transposition offers poor diffusion. Double columnar transposition increases complexity but remains vulnerable to modern computerized attacks."
    }
  },

  educationalLimitations: {
    title: "Why Classical Ciphers Are Obsolete in Modern Cryptography",
    overview: "Classical ciphers played a foundational role in the evolution of information security, introducing the core concepts of substitution, transposition, key spaces, and modular arithmetic. However, in the context of modern cybersecurity, every classical cipher is completely broken.",
    keyReasons: [
      {
        concept: "Statistical Vulnerability & Frequency Analysis",
        detail: "Natural human languages possess distinct statistical fingerprints (e.g., in English, 'E' accounts for ~12.7% of letters, followed by 'T' and 'A'). Classical substitution ciphers either preserve these frequencies directly (Caesar, Monoalphabetic) or preserve higher-order digram/trigram frequencies (Playfair, Vigenère). Modern cryptanalysts use automated frequency scoring to crack them in milliseconds."
      },
      {
        concept: "Lack of Mathematical Confusion and Diffusion (Shannon's Principles)",
        detail: "Claude Shannon established that secure ciphers must achieve 'Confusion' (obscuring the relationship between the key and the ciphertext) and 'Diffusion' (spreading the influence of individual plaintext bits across the entire ciphertext). Classical ciphers lack diffusion: changing one character in Caesar or Vigenère changes exactly one character in the ciphertext, whereas in modern AES, changing 1 bit scrambles approximately 50% of the entire output block (the Avalanche Effect)."
      },
      {
        concept: "Small Key Spaces and Brute-Force Vulnerability",
        detail: "Classical key spaces are minuscule compared to modern standards. Caesar has only 25 non-trivial keys; Hill 2×2 has only ~157,248 invertible matrices; Rail Fence has N rails. Even monoalphabetic ciphers with 26! keys fall quickly to frequency heuristics. By contrast, AES-256 uses 2²⁵⁶ possible keys (approximately 1.15 × 10⁷⁷) — more than the number of atoms in the observable universe."
      },
      {
        concept: "Linearity and Known-Plaintext Vulnerability",
        detail: "Ciphers like Hill are entirely linear matrix equations. By intercepting a trivial amount of known plaintext and ciphertext, an adversary can set up linear systems of equations and solve for the key using basic Gaussian elimination. Modern ciphers utilize non-linear substitution layers (S-Boxes) specifically designed to resist linear and differential cryptanalysis."
      },
      {
        concept: "Key Distribution Dilemmas (The One-Time Pad Paradox)",
        detail: "While One-Time Pad provides information-theoretic perfect secrecy, it requires a secure pre-shared key of identical length to the plaintext. Distributing gigabytes of random keys securely across modern networks is practically impossible without asymmetric public-key cryptography (e.g., Diffie-Hellman, RSA, ECC)."
      }
    ]
  }
};

// Export globally
if (typeof window !== 'undefined') {
  window.TheoryData = TheoryData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TheoryData;
}
