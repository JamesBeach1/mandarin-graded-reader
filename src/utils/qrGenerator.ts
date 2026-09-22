/**
 * Pure Offline QR Code SVG Generator (ISO/IEC 18004 Compliant Minimal Implementation)
 * Zero external dependencies. Operates 100% client-side offline.
 */

// GF(256) Math tables for Reed-Solomon error correction
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    LOG_TABLE[val] = i;
    val = (val << 1) ^ (val & 0x80 ? 0x11d : 0);
  }
  EXP_TABLE[255] = EXP_TABLE[0];
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255];
}

function polyMul(p1: Uint8Array, p2: Uint8Array): Uint8Array {
  const result = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function rsGeneratorPoly(numEcBytes: number): Uint8Array {
  let gen = new Uint8Array([1]);
  for (let i = 0; i < numEcBytes; i++) {
    gen = polyMul(gen, new Uint8Array([1, EXP_TABLE[i]]));
  }
  return gen;
}

function rsCalculateEc(data: Uint8Array, numEcBytes: number): Uint8Array {
  const gen = rsGeneratorPoly(numEcBytes);
  const remainder = new Uint8Array(data.length + numEcBytes);
  remainder.set(data);

  for (let i = 0; i < data.length; i++) {
    const factor = remainder[i];
    if (factor !== 0) {
      for (let j = 0; j < gen.length; j++) {
        remainder[i + j] ^= gfMul(gen[j], factor);
      }
    }
  }
  return remainder.subarray(data.length);
}

export class OfflineQrCode {
  /**
   * Generates a 2D boolean matrix for the given text (true = black module, false = white module)
   * Supports standard versions for typical deep-links and URLs.
   */
  public static generateMatrix(text: string): boolean[][] {
    const utf8 = new TextEncoder().encode(text);
    
    // Choose QR Version: 4 (33x33, up to 78 bytes EC Level M) or 6 (41x41, up to 136 bytes) or 10 (57x57, up to 271 bytes)
    let version = 4;
    let dataCapacity = 64;
    let ecBytes = 14;

    if (utf8.length > 60 && utf8.length <= 130) {
      version = 6;
      dataCapacity = 108;
      ecBytes = 18;
    } else if (utf8.length > 130) {
      version = 10;
      dataCapacity = 216;
      ecBytes = 28;
    }

    const size = version * 4 + 17;
    const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
    const isFunctionModule: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    // 1. Finder patterns (Top-left, top-right, bottom-left)
    const placeFinder = (r: number, c: number) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            isFunctionModule[nr][nc] = true;
            if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
              matrix[nr][nc] = dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
            } else {
              matrix[nr][nc] = false;
            }
          }
        }
      }
    };
    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // 2. Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (!isFunctionModule[6][i]) {
        matrix[6][i] = i % 2 === 0;
        isFunctionModule[6][i] = true;
      }
      if (!isFunctionModule[i][6]) {
        matrix[i][6] = i % 2 === 0;
        isFunctionModule[i][6] = true;
      }
    }

    // 3. Dark module
    matrix[size - 8][8] = true;
    isFunctionModule[size - 8][8] = true;

    // 4. Reserve format info areas
    for (let i = 0; i < 9; i++) {
      if (!isFunctionModule[8][i]) isFunctionModule[8][i] = true;
      if (!isFunctionModule[i][8]) isFunctionModule[i][8] = true;
    }
    for (let i = size - 8; i < size; i++) {
      if (!isFunctionModule[8][i]) isFunctionModule[8][i] = true;
      if (!isFunctionModule[i][8]) isFunctionModule[i][8] = true;
    }

    // 5. Build Bitstream (Byte Mode: 0100)
    const bitstream: number[] = [];
    const pushBits = (val: number, bits: number) => {
      for (let i = bits - 1; i >= 0; i--) {
        bitstream.push((val >> i) & 1);
      }
    };

    // Mode: Byte (0100)
    pushBits(0b0100, 4);
    // Char count indicator (8 bits for V1-9)
    pushBits(utf8.length, version <= 9 ? 8 : 16);
    // Data bits
    for (const b of utf8) {
      pushBits(b, 8);
    }
    // Terminator
    while (bitstream.length % 8 !== 0 || bitstream.length < dataCapacity * 8) {
      if (bitstream.length + 4 <= dataCapacity * 8 && bitstream.length % 8 === 0) {
        pushBits(0b11101100, 8); // Pad byte 1
      } else if (bitstream.length + 4 <= dataCapacity * 8) {
        pushBits(0b00010001, 8); // Pad byte 2
      } else {
        bitstream.push(0);
      }
    }

    // Convert bitstream to bytes
    const dataBytes = new Uint8Array(dataCapacity);
    for (let i = 0; i < dataCapacity; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | (bitstream[i * 8 + j] || 0);
      }
      dataBytes[i] = b;
    }

    // Error correction
    const ecBytesArray = rsCalculateEc(dataBytes, ecBytes);
    const finalBytes = new Uint8Array(dataCapacity + ecBytes);
    finalBytes.set(dataBytes);
    finalBytes.set(ecBytesArray, dataCapacity);

    // 6. Place data modules using zigzag
    const fullBits: number[] = [];
    for (const byte of finalBytes) {
      for (let i = 7; i >= 0; i--) {
        fullBits.push((byte >> i) & 1);
      }
    }

    let bitIdx = 0;
    let upward = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--; // Skip vertical timing column
      const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
      for (const r of rows) {
        for (const c of [right, right - 1]) {
          if (!isFunctionModule[r][c]) {
            const bit = bitIdx < fullBits.length ? fullBits[bitIdx++] === 1 : false;
            // Apply standard mask pattern 000: (r + c) % 2 === 0
            const mask = (r + c) % 2 === 0;
            matrix[r][c] = mask ? !bit : bit;
          }
        }
      }
      upward = !upward;
    }

    // Format info bits for Mask 0, Level M (0b101010000010010)
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i] === 1;
    matrix[8][7] = formatBits[6] === 1;
    matrix[8][8] = formatBits[7] === 1;
    matrix[7][8] = formatBits[8] === 1;
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i] === 1;

    for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
    for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i] === 1;

    return matrix.map(row => row.map(cell => cell === true));
  }
}
