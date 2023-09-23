let buffer: Array<Array<bool>> = new Array<Array<bool>>();

export function draw(x: i32, y: i32): void {
  buffer[x][y] = 1;
}

export function read_display(): Array<Array<bool>> {
  return buffer;
}

export function init(): void {
  for (let x = 0; x < 10; x++) {
    buffer.push(new Array<bool>());
    for (let y = 0; y < 10; y++) {
      buffer[x][y] = false;
    }
  }
}

export { buffer };
