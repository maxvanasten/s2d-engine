import { Vector2D, Vector4D } from "./utils/vectors.js";
import { GameObject } from "./utils/game_object.js";


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
 * @property {GameObject[]} _objects - Objects array.
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

    // Import internal objects
    if (game.internal_objects) {
      game.internal_objects.map((internal_object_name) => {
        switch (internal_object_name) {
          case "input_manager":
            input_manager.init(input_manager);
            input_manager._is_initialized = true;
            this._objects.push(input_manager);
            break;
          default:
            console.warn(`[s2d-engine: _import_game] Internal object '${internal_object_name}' not found.`);
            break;
        }
      })
    }

    // Import objects
    game.objects.map((raw_object, index) => {
      const parsed_object = this._parse_object(raw_object);
      this._objects.push(parsed_object);
    })
    // Import input events
    // Import ui connections
  }

  /**
   * @method _parse_object
   * @description Parses a raw object into a game object.
   * @memberof Core
   * @param {object} raw_object 
   * @returns {GameObject} parsed_object 
   */
  _parse_object = (raw_object) => {
    // Create new game object
    const parsed_object = new GameObject(raw_object.identifier);

    // Parse flags
    if (raw_object.flags) {
      raw_object.flags.forEach((flag) => {
        // Set flags
        parsed_object.flags[flag] = true;
        // Set player object identifier
        if (flag == "IS_PLAYER") this._player_object_identifier = raw_object.identifier;
      })
    }

    // Parse sprite
    if (raw_object.sprite) {
      parsed_object.flags.USE_SPRITE = true;
      parsed_object.sprite = {
        image: new Image(),
        source_width: raw_object.sprite.width,
        source_height: raw_object.sprite.height,
        render_width: raw_object.sprite.render_width || raw_object.sprite.width,
        render_height: raw_object.sprite.render_height || raw_object.sprite.height,
      }
      parsed_object.sprite.image.src = raw_object.sprite.image_path;

      parsed_object.sprite.image.onload = () => {
        parsed_object.sprite.ready = true;
      }
    }

    // Parse collision box
    if (raw_object.collision_box) {
      parsed_object.collision_box = Vector4D.from_x_and_y_and_width_and_height(raw_object.collision_box.x, raw_object.
        collision_box.y, raw_object.collision_box.width, raw_object.collision_box.height);
    }

    // Parse global position and bounding box
    parsed_object.global_position = Vector2D.from_x_and_y(raw_object.global_position.x, raw_object.global_position.y);
    parsed_object.bounding_box = Vector4D.from_x_and_y_and_width_and_height(raw_object.bounding_box.x, raw_object.
      bounding_box.y, raw_object.bounding_box.width, raw_object.bounding_box.height);

    // Parse render layer
    if (raw_object.render_layer) parsed_object.render_layer = raw_object.render_layer;

    // Parse init, update and render functions
    if (raw_object.init) parsed_object.init = raw_object.init;
    if (raw_object.update) parsed_object.update = raw_object.update;
    if (raw_object.render) parsed_object.render = raw_object.render;

    // Parse actions
    if (raw_object.actions) {
      const input_manager = this._get_object_by_identifier("INTERNAL_input_manager");
      if (!input_manager) {
        console.warn("[s2d-engine: _parse_object] Input manager not found, but actions have been specified.");
      }
      raw_object.actions.forEach((action) => {
        const action_object = {
          self: parsed_object,
          key: action.key,
          while_key_down: action.while_key_down
        }
        input_manager.actions.push(action_object);
      })
    }

    return parsed_object
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




  }
}