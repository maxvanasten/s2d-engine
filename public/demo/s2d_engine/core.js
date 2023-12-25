import { Vector2D, Vector4D } from "./utils/vectors.js";
import { GameObject } from "./utils/game_object.js";

// Internal objects
import input_manager from "./internal_objects/input_manager.js";
import tilemap_manager from "./internal_objects/tilemap_manager.js";

/**
 * @class Core
 * @description Core class for the engine.
 * 
 * @property { Object } _main_canvas - Main canvas object.
 * @property { HTMLCanvasElement } _main_canvas.element - Main canvas element.
 * @property { CanvasRenderingContext2D } _main_canvas.context - Main canvas context.
 * @property { boolean } _main_canvas.fullscreen - Main canvas fullscreen.
 * 
 * @property {GameObject[]} _objects - Objects array.
 * @property {string} _player_object_identifier - Identifier of the player object, is used for updating the camera position and determining wether or not objects will be updated and/or rendered.
 * 
 * @property {Vector2D} _camera_position - Camera position.
 * @property {Vector2D} _camera_offset - Camera offset, used for manipulating the camera
 * @property {Vector2D} _canvas_center - Center of the canvas.
 * 
 * @property {Object[]} _update_queue - Update queue.
 * @property {Object[]} _render_queue - Render queue.
 * 
 * @property {boolean} _out_of_focus - Whether or not the game is out of focus.
 */
export class Core {
  constructor() {
    this._main_canvas = {
      element: null,
      context: null,
      fullscreen: false
    };

    this.flags = {
      RENDER_COLLISION_BOXES: true
    }

    this._objects = [];
    this._player_object_identifier = null;

    this._camera_position = Vector2D.ZERO();
    this._camera_offset = Vector2D.ZERO();
    this._canvas_center = Vector2D.ZERO();

    this._update_queue = [];
    this._render_queue = [];

    this._out_of_focus = false;
  }

  /**
   * @method _import_game
   * @memberof Core
   * @description Imports objects, input events and ui connections from game.
   * @param {object} game 
   */
  _import_game = (game) => {
    // Check if game is valid
    if (!game.objects) {
      console.error("[s2d-engine: _import_game] Game object is missing 'objects' property.");
    }

    // Import internal objects
    if (game.internal_objects) {
      game.internal_objects.map((internal_object_name) => {
        switch (internal_object_name) {
          case "input_manager":
            input_manager.init(this, input_manager);
            input_manager._is_initialized = true;
            this._objects.push(input_manager);
            break;
          case "tilemap_manager":
            tilemap_manager.init(this, tilemap_manager, game.tilemap);
            tilemap_manager._is_initialized = true;
            this._objects.push(tilemap_manager);
            break;
          default:
            console.warn(`[s2d-engine: _import_game] Internal object '${internal_object_name}' not found.`);
            break;
        }
      })
    }

    // Import objects
    game.objects.map((raw_object, index) => {
      this._spawn_object(raw_object);
    })
  }

  /**
   * @method _spawn_object
   * @description Spawns a game object.
   * @memberof Core
   * @param {object} raw_object
   */
  _spawn_object = (raw_object) => {
    const parsed_object = this._parse_object(raw_object);
    this._objects.push(parsed_object);
  }

  _destroy_object = (identifier) => {
    const object = this._get_object_by_identifier(identifier);
    if (!object) {
      console.warn(`[s2d-engine: _destroy_object] Object with identifier '${identifier}' not found.`);
    } else {
      this._objects.splice(this._objects.indexOf(object), 1);
    }
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

    // Parse group
    if (raw_object.group) parsed_object.group = raw_object.group;

    // Parse global position and bounding box
    parsed_object.global_position = Vector2D.ZERO();
    if (raw_object.global_position) parsed_object.global_position = Vector2D.from_x_and_y(raw_object.global_position.x, raw_object.global_position.y);
    // parsed_object.bounding_box = Vector4D.from_x_and_y_and_width_and_height(raw_object.bounding_box.x, raw_object.
    // bounding_box.y, raw_object.bounding_box.width, raw_object.bounding_box.height);

    // Parse spawn_tile
    if (raw_object.spawn_tile) parsed_object.spawn_tile = raw_object.spawn_tile;

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
          type: action.type,
        }

        switch (action.type) {
          case "keyboard":
            action_object.key = action.key;
            action_object.while_key_down = action.while_key_down;
            break;
          case "mouse":
            action_object.button = action.button;
            action_object.on_click = action.on_click;
            break;
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

  _get_mouse_position = () => {
    const mouse_position = {
      x: 0,
      y: 0
    }
    const input_manager = this._get_object_by_identifier("INTERNAL_input_manager");
    mouse_position.x = input_manager.mouse.x;
    mouse_position.y = input_manager.mouse.y;
    return Vector2D.from_x_and_y(mouse_position.x, mouse_position.y);
  }

  /**
   * @method _update_camera_position
   * @description Updates the camera position to the player object position.
   * @memberof Core
   */
  _update_camera_position = () => {
    const player_object = this._get_object_by_identifier(this._player_object_identifier);
    this._camera_position = player_object.global_position.subtract(this._canvas_center);
  }

  /**
   * @method _global_to_screen
   * @description Converts a global position to a screen position for rendering.
   * @memberof Core
   * @param {Vector2D} global_position 
   * @returns {Vector2D} screen_position
   */
  _global_to_screen = (global_position) => {
    const screen_position = global_position.subtract(this._camera_position);
    return screen_position;
  }

  _screen_to_global = (screen_position) => {
    const global_position = screen_position.add(this._camera_position);
    return global_position;
  }

  /**
   * @method _loop
   * @memberof Core
   * @description Main loop of the engine. Is in charge of selecting objects to be updated and/or rendered
   */
  _loop = () => {
    // Calculate delta time
    this._last_time = this._current_time || Date.now();
    this._current_time = Date.now();
    this._delta_time = (this._current_time - this._last_time) / 1000;

    // Only run if game is in focus
    if (!this._out_of_focus) {
      // If tilemap is being used, dont run game until tilemap is loaded
      const tilemap_manager = this._get_object_by_identifier("INTERNAL_tilemap_manager");
      if (tilemap_manager) {
        if (!tilemap_manager.is_loaded(tilemap_manager)) {
          requestAnimationFrame(this._loop);
          return;
        }
      }

      // Clear canvas
      this._main_canvas.context.clearRect(0, 0, this._main_canvas.element.width, this._main_canvas.element.height);

      // Clear update and render queues
      this._update_queue = [];
      this._render_queue = [];

      // Resize canvas if neccessary, also updates _canvas_center
      if (this._main_canvas.fullscreen) {
        if (this._main_canvas.element.width !== window.innerWidth) {
          this._main_canvas.element.width = window.innerWidth;
          this._canvas_center.x = window.innerWidth / 2;
        }
        if (this._main_canvas.element.height !== window.innerHeight) {
          this._main_canvas.element.height = window.innerHeight;
          this._canvas_center.y = window.innerHeight / 2;
        }
      }

      // Select objects for rendering and updating
      this._objects.map((object, index) => {
        // Keep track of wether or not the object has been updated/rendered
        let update_object = false;
        let render_object = false;
        // Check for always_update and always_render flags on object
        if (object.flags.ALWAYS_UPDATE) update_object = true;
        if (object.flags.ALWAYS_RENDER) render_object = true;
        // If object is close enough, render/update it
        if (object.global_position) {
          const player_object = this._get_object_by_identifier(this._player_object_identifier);
          const dist = object.global_position.distance(player_object.global_position);
          if (dist < 1000) {
            update_object = true;
            render_object = true;
          }
        }
        // Add object to update/render queue
        if (update_object) this._add_to_update_queue(object, object.update);
        if (render_object) this._add_to_render_queue(object, object.render);
      });

      // Update camera position
      // this._update_camera_position();

      // Update and render objects
      this._update_objects(this._delta_time);
      this._render_objects();
    }

    // Request next frame
    requestAnimationFrame(this._loop);
  }

  /**
   * @method _get_object_by_identifier
   * @description Returns an object by its identifier.
   * @memberof Core
   * @param {string} identifier 
   * @returns {game_object} object
   */
  _get_object_by_identifier = (identifier) => {
    let object = null;
    this._objects.map((object_, index) => {
      if (object_.identifier === identifier) {
        object = object_;
      }
    })
    return object;
  }

  _get_objects_by_identifier = (identifier) => {
    let objects = [];
    this._objects.map((object, index) => {
      if (object.identifier === identifier) {
        objects.push(object);
      }
    })
    return objects;
  }

  _get_objects_by_group = (group) => {
    let objects = [];
    this._objects.map((object, index) => {
      if (object.group === group) {
        objects.push(object);
      }
    })
    return objects;
  }

  /**
   * @method _start_game
   * @memberof Core
   * @description Starts the game loop.
   */
  _start_game = () => {
    // Add event listeners for window focus
    window.addEventListener("blur", () => {
      this._out_of_focus = true;
    })
    window.addEventListener("focus", () => {
      this._out_of_focus = false;
    })

    requestAnimationFrame(this._loop);
  }

  /**
   * @method _add_to_update_queue
   * @memberof Core
   * @description Adds an object to the update queue.
   * @param {GameObject} object the object to add to the update queue
   * @param {function} update_function The function to execute when object is updated
   */
  _add_to_update_queue = (object, update_function) => {
    const update_item = {
      self: object,
      update_function: update_function
    }
    this._update_queue.push(update_item);
  }

  /**
   * @method _add_to_render_queue
   * @memberof Core
   * @description Adds an object to the render queue.
   * @param {GameObject} object the object to add to the render queue
   * @param {function} render_function The function to execute when object is rendered
  */
  _add_to_render_queue = (object, render_function) => {
    const render_item = {
      self: object,
      render_function: render_function
    }
    this._render_queue.push(render_item);
  }

  /**
   * @method _update_objects
   * @memberof Core
   * @description Updates all objects in the update queue according to delta time.
   * @param {number} delta 
   */
  _update_objects = (delta) => {
    // Keep track of the amount of updated objects this frame
    this._updated_objects_count = 0;

    // Update objects
    this._update_queue.map((update_item, index) => {
      // If object hasn't been initialized, initialize it
      if (!update_item.self._is_initialized) {
        update_item.self.init(this, update_item.self);
        update_item.self._is_initialized = true;
      }

      // Check if object has a spawn tile and if so, handle it
      if (update_item.self.spawn_tile && !update_item.self.spawned) {
        const spawn_position = this._get_spawn_position(update_item.self.spawn_tile);
        update_item.self.global_position = Vector2D.from_x_and_y(spawn_position.x, spawn_position.y);
        update_item.self.spawned = true;
      }

      // Update object
      update_item.update_function(this, update_item.self, delta);

      // If object is player object, update camera position
      if (update_item.self.flags.IS_PLAYER) {
        this._update_camera_position();
      }

      // Keep track of the amount of updated objects this frame
      this._updated_objects_count++;
    })
  }

  _get_spawn_position = (tile_identifier) => {
    const tilemap_manager = this._get_object_by_identifier("INTERNAL_tilemap_manager");
    const tiles = tilemap_manager.get_tiles(tilemap_manager, tile_identifier);
    let spawn_position = {
      x: 0,
      y: 0
    }
    if (!tiles) {
      console.warn(`[s2d-engine: _update_objects] Spawn tile '${tile_identifier}' not found!`);
    } else {
      const tile = tiles[Math.floor(Math.random() * tiles.length)];
      spawn_position = tile.global_position;
    }
    return spawn_position;
  }

  _is_colliding = (cbox_1, cbox_2) => {
    console.log("Checking collision:");
    console.log(`cbox_1: ${cbox_1.x}, ${cbox_1.y}, ${cbox_1.width}, ${cbox_1.height}`);
    console.log(`cbox_2: ${cbox_2.x}, ${cbox_2.y}, ${cbox_2.width}, ${cbox_2.height}`);

    return (cbox_1.x - cbox_1.width / 2 < cbox_2.x + cbox_2.width / 2 &&
      cbox_1.x + cbox_1.width / 2 > cbox_2.x - cbox_2.width / 2 &&
      cbox_1.y - cbox_1.height / 2 < cbox_2.y + cbox_2.height / 2 &&
      cbox_1.y + cbox_1.height / 2 > cbox_2.y - cbox_2.height / 2);
  }

  /**
   * @method _render_objects
   * @memberof Core
   * @description Renders all objects in the render queue.
   */
  _render_objects = () => {
    // Keep track of the amount of rendered objects this frame
    this._rendered_objects_count = 0;

    // Sort render queue by render layer
    this._render_queue.sort((a, b) => {
      return a.self.render_layer - b.self.render_layer;
    })

    // Render objects
    this._render_queue.map((render_item, index) => {
      // Calculate screen position
      const screen_position = this._global_to_screen(render_item.self.global_position).floor();

      // Check if object uses sprite and if so, render sprite
      if (render_item.self.flags.USE_SPRITE && render_item.self.sprite.ready) {
        const sprite = render_item.self.sprite;
        const sprite_position = screen_position.subtract(Vector2D.from_x_and_y(sprite.render_width / 2, sprite.render_height / 2));

        // If object specifies sprite angle, rotate sprite
        // if (render_item.self.sprite.angle) {
        let angle = 0;

        if (render_item.self.sprite_angle) angle = render_item.self.sprite_angle;

        this._main_canvas.context.save();
        this._main_canvas.context.translate(screen_position.x, screen_position.y);
        this._main_canvas.context.rotate(angle);
        this._main_canvas.context.drawImage(sprite.image, -sprite.render_width / 2, -sprite.render_height / 2, sprite.render_width, sprite.render_height);
        this._main_canvas.context.restore();
        // } else

        // this._main_canvas.context.drawImage(sprite.image, sprite_position.x, sprite_position.y, sprite.render_width, sprite.render_height);
      }

      // Run custom render function
      render_item.render_function(this, render_item.self, this._main_canvas.context, screen_position);

      // Render collision box if neccessary
      if (this.flags.RENDER_COLLISION_BOXES && render_item.self.collision_box) {
        const collision_box = render_item.self.collision_box;
        this._main_canvas.context.fillStyle = "rgba(0, 0, 255, 0.3)";
        this._main_canvas.context.fillRect(screen_position.x + collision_box.x, screen_position.y + collision_box.y, collision_box.width, collision_box.height)
      }

      // Keep track of the amount of rendered objects this frame
      this._rendered_objects_count++;
    })
  }
}