import { Core } from "./s2d_engine/core.js";

import game from "./game/game.js";

const core = new Core();

core._import_game(game);
core._connect_canvas("game_canvas", true);
core._start_game();
