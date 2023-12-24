/**
 * @class Vector2D
 * @description A 2D vector.
 * @property {number} x the x component of the vector
 * @property {number} y the y component of the vector
 */
export class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @method add
   * @memberof Vector2D
   * @description Adds two vectors.
   * @param {Vector2D} vector2d 
   */
  add = (vector2d) => {
    return new Vector2D(this.x + vector2d.x, this.y + vector2d.y);
  }

  /**
   * @method subtract
   * @memberof Vector2D
   * @description Subtracts two vectors.
   * @param {Vector2D} vector2d
   * @returns {Vector2D} vector2d
   */
  subtract = (vector2d) => {
    return new Vector2D(this.x - vector2d.x, this.y - vector2d.y);
  }

  /**
   * @method multiply
   * @memberof Vector2D
   * @description Multiplies two vectors.
   * @param {Vector2D} vector2d
   * @returns {Vector2D} vector2d
   */
  multiply = (vector2d) => {
    return new Vector2D(this.x * vector2d.x, this.y * vector2d.y);
  }

  /**
   * @method divide
   * @memberof Vector2D
   * @description Divides two vectors.
   * @param {Vector2D} vector2d
   * @returns {Vector2D} vector2d
   */
  divide = (vector2d) => {
    return new Vector2D(this.x / vector2d.x, this.y / vector2d.y);
  }

  /**
   * @method magnitude
   * @memberof Vector2D
   * @description Calculates the magnitude of a vector.
   * @returns {number} magnitude
   */
  magnitude = () => {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * @method normalize
   * @memberof Vector2D
   * @description Normalizes a vector.
   * @returns {Vector2D} vector2d
   */
  normalize = () => {
    return new Vector2D(this.x / this.magnitude(), this.y / this.magnitude());
  }

  /**
   * @method limit
   * @memberof Vector2D
   * @description Limits the magnitude of a vector.
   * @param {number} limit
   * @returns {Vector2D} vector2d
   */
  limit = (limit) => {
    if (this.magnitude() > limit) {
      return this.normalize().multiply(new Vector2D(limit, limit));
    }
    return this;
  }

  /**
   * @static ZERO
   * @memberof Vector2D
   * @description A zero vector.
   * @returns {Vector2D} vector2d
   */
  static ZERO = new Vector2D(0, 0);

  /**
   * @static LEFT
   * @memberof Vector2D
   * @description A left vector.
   * @returns {Vector2D} vector2d
   */
  static LEFT = new Vector2D(-1, 0);

  /**
   * @static RIGHT
   * @memberof Vector2D
   * @description A right vector.
   * @returns {Vector2D} vector2d
   */
  static RIGHT = new Vector2D(1, 0);

  /**
   * @static UP
   * @memberof Vector2D
   * @description An up vector.
   * @returns {Vector2D} vector2d
   */
  static UP = new Vector2D(0, -1);

  /**
   * @static DOWN
   * @memberof Vector2D
   * @description A down vector.
   * @returns {Vector2D} vector2d
   */
  static DOWN = new Vector2D(0, 1);

  /**
   * @static @method from_x_and_y
   * @memberof Vector2D
   * @description Creates a vector from x and y.
   * @param {number} x
   * @param {number} y
   * @returns {Vector2D} vector2d
   */
  static from_x_and_y = (x, y) => {
    return new Vector2D(x, y);
  }
}


/**
 * @class Vector4D
 * @description A 4D vector.
 * @property {number} x the x component of the vector
 * @property {number} y the y component of the vector
 * @property {number} width the width component of the vector
 * @property {number} height the height component of the vector
 */
export class Vector4D {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  static ZERO = new Vector4D(0, 0, 0, 0);

  /**
   * @method from_vector2d
   * @memberof Vector4D
   * @description Creates a 4D vector from a 2D vector.
   * @param {Vector2D} vector2d
   * @returns {Vector4D} vector4d
   */
  static from_vector2d = (vector2d) => {
    return new Vector4D(vector2d.x, vector2d.y, 0, 0);
  }

  /**
   * @method from_vector2d_and_size
   * @memberof Vector4D
   * @description Creates a 4D vector from a 2D vector and a size.
   * @param {Vector2D} vector2d
   * @param {Vector2D} size
   * @returns {Vector4D} vector4d
   */
  static from_vector2d_and_size = (vector2d, size) => {
    return new Vector4D(vector2d.x, vector2d.y, size.x, size.y);
  }

  /**
   * @method from_vector2d_and_width_and_height
   * @memberof Vector4D
   * @description Creates a 4D vector from a 2D vector, width and height.
   * @param {Vector2D} vector2d
   * @param {number} width
   * @param {number} height
   * @returns {Vector4D} vector4d
   */
  static from_vector2d_and_width_and_height = (vector2d, width, height) => {
    return new Vector4D(vector2d.x, vector2d.y, width, height);
  }

  /**
   * @method from_width_and_height
   * @memberof Vector4D
   * @description Creates a 4D vector from width and height.
   * @param {number} width
   * @param {number} height
   * @returns {Vector4D} vector4d
   */
  static from_width_and_height = (width, height) => {
    return new Vector4D(0, 0, width, height);
  }

  /**
   * @method from_size
   * @memberof Vector4D
   * @description Creates a 4D vector from a size.
   * @param {Vector2D} size
   * @returns {Vector4D} vector4d
   */
  static from_size = (size) => {
    return new Vector4D(0, 0, size.x, size.y);
  }
}