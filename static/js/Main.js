
// window.onload = () => {
//     game = new Game();
//     net = new Net();
//     ui = new Ui();
// }
let game;
let net;
let ui;

import { Game } from "./Game.js";
import { Net } from "./Net.js";
import { Ui } from "./Ui.js";

window.onload = () => {
    game = new Game();
    net = new Net();
    ui = new Ui();
}

export { ui,net,game }