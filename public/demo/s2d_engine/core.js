import { Vector2D, Vector4D } from "./utils/vectors.js";

/**
 * @class Core
 * @description Core class for the engine.
 * 
 * @property {object} _main_canvas - Main canvas object.
 * @property { HTMLCanvasElement } _main_canvas.element - Main canvas element.
 * @property { CanvasRenderingContext2D } _main_canvas.context - Main canvas context.
 * @property { boolean } _main_canvas.fullscreen - Main canvas fullscreen.
 * 
 * @property {object[]} _objects - Objects array.
 */
export class Core {
  constructor() {
    this._main_canvas = {
      element: null,
      context: null,
      fullscreen: false
    };
    this._objects = [];
  }

  /**
   * @method _import_game
   * @memberof Core
   * @description Imports gamefiles.
   * @param {object} game 
   */
  _import_game = async (game) => {
    if (!game.objects) {
      console.error("[s2d-engine: _import_game] Game object is missing 'objects' property.");
    }

    // Import objects
    game.objects.map((object, index) => {
      this._objects.push(object);
    })
    // Import input events
    // Import ui connections
  }

  /**
   * @method _connect_canvas
   * @description Connects the canvas to the engine.
   * @memberof Core
   * @param {string} id 
   * @param {boolean} fullscreen 
   */
  _connect_canvas = (id, fullscreen) => {
    this._main_canvas = {
      element: document.getElementById(id),
      context: document.getElementById(id).getContext("2d"),
      fullscreen: fullscreen || false
    }
  }

  /**
   * @method _loop
   * @memberof Core
   * @description Main loop of the engine. Is in charge of selecting objects to be updated and/or rendered
   */
  _loop = () => {
    this._last_time = this._current_time || Date.now();
    this._current_time = Date.now();
    this._delta_time = this._current_time - this._last_time;

    // Select objects for rendering and updating
    this._update_queue = [];
    this._render_queue = [];
    this._objects.map((object, index) => {
      if (object.always_update) {
        this._add_to_update_queue(object.update);
      }
      if (object.always_render) {
        this._add_to_render_queue(object.render);
      }

      // If object is close enough, also add it to the render and update queue
      if (object.global_position && !object.always_update && !object.always_render) {
        const dist = object.global_position.distance_to(this._player_object.global_position);
        if (dist < 1000) {
          this._add_to_update_queue(object.update);
          this._add_to_render_queue(object.render);
        }
      }
    });

    this._update_objects(this._delta_time);
    this._render_objects();
  }

  /**
   * @method _start_game
   * @memberof Core
   * @description Starts the game loop.
   */
  _start_game = () => {
    requestAnimationFrame(this._loop);
  }

  /**
   * @method _add_to_update_queue
   * @memberof Core
   * @description Adds an object to the update queue.
   * @param {game_object} object 
   */
  _add_to_update_queue = (object) => {
    if (object.update) this._update_queue.push(object.update);
  }

  /**
   * @method _add_to_render_queue
   * @memberof Core
   * @description Adds an object to the render queue.
   * @param {game_object} object
  */
  _add_to_render_queue = (object) => {
    if (object.render) this._render_queue.push(object.render);
  }

  /**
   * @method _update_objects
   * @memberof Core
   * @description Updates all objects in the update queue according to delta time.
   * @param {number} delta 
   */
  _update_objects = (delta) => {
    this._updated_objects_count = 0;
    this._update_queue.map((update_function, index) => {
      update_function(delta);
      this._updated_objects_count++;
    })
  }

  /**
   * @method _render_objects
   * @memberof Core
   * @description Renders all objects in the render queue.
   */
  _render_objects = () => {
    this._rendered_objects_count = 0;
    this._render_queue.map((render_function, index) => {
      this._render_objects_count++;
      render_function(this._main_canvas.context);
    })
  }

}

/**
 * @method create_empty_object
 * @memberof Core
 * @description Creates an empty object.
 * @returns {game_object} empty_object
 */
export function create_empty_object() {
  return {
    identifier: "empty_object",

    always_update: false,
    always_render: false,

    global_position: Vector2D.ZERO,
    bounding_box: Vector4D.ZERO,

    init: (self) => { },
    update: (self, delta) => { },
    render: (self, context, position) => { }
  }
}