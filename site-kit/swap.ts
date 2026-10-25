// Cartridge swap: the house rule for links from one game's page to another game. The link goes
// home and tells the console to eject the current cartridge (the normal return) and then plug in
// the next one, which boots and presses its main button (A) by itself. client.ts reads ?next=.
export const swapHref = (base: string, from: string, to: string) => `${base}?play=${from}&next=${to}#console`;
