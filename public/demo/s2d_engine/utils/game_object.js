import { Vector2D, Vector4D } from "./vectors.js";

/**
 * @class GameObject
 * @description Base class for all game objects
 * @property {string} identifier - The identifier of the object
 * 
 * @property {boolean} _is_initialized - Whether or not the object is initialized, used in the main loop
 * 
 * @property {array} flags - Flags for the object
 * 
 * @property {Vector2D} global_position - The global position of the object
 * @property {Vector4D} bounding_box - The bounding box of the object
 * @property {Vector4D} collision_box - The collision box of the object
 * 
 * @property {number} render_layer - The render layer of the object, higher numbers are rendered on top of lower numbers
 */
export class GameObject {
  constructor(identifier) {
    this.identifier = identifier;

    this._is_initialized = false;

    this.flags = {
      ALWAYS_UPDATE: false,
      ALWAYS_RENDER: false,
      IS_PLAYER: false,
      USE_SPRITE: false,
    }

    this.global_position = Vector2D.ZERO();
    this.bounding_box = Vector4D.ZERO();
    this.collision_box = Vector4D.ZERO();

    this.render_layer = 0;
  }

  /**
   * @method init
   * @description Called when the object is initialized
   * @param {GameObject} self 
   * @memberof GameObject
   */
  init = (self) => {
  }

  /**
   * @method update
   * @description Called when the object is updated
   * @param {GameObject} self
   * @param {number} delta
   * @memberof GameObject
   */
  update = (self, delta) => {
  }

  /**
   * @method render
   * @description Called when the object is rendered
   * @param {GameObject} self 
   * @param {CanvasRenderingContext2D} context 
   * @param {Vector2D} position 
   * @memberof GameObject
   */
  render = (self, context, position) => {
  }
}