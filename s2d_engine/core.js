export class Core {
  constructor() {
    this._main_canvas = null;
    this._main_context = null;
  }

  _connect_canvas = (id) => {
    this._main_canvas = document.getElementById(id);
    this._main_context = this._main_canvas.getContext("2d");
  }
}