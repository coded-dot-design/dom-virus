// Game screenshots in site-kit/assets/shots (copied to /shots/ by site-kit/scripts/prepare.mjs): real
// play captures, used as page posters, share images and catalog art. Width × height, so the browser
// reserves the space before the image loads (no layout shift).
export const SHOTS: Record<string, [number, number]> = {
  'byte-runner.jpg': [1280, 720],
  'dom-battlefield.jpg': [1392, 656],
  'dom-battlefield-blitz.jpg': [1280, 800],
  'null-invaders.jpg': [1280, 720],
  'sherman-bytes.jpg': [1280, 720],
  'swarm-protocol.jpg': [1280, 720],
};
