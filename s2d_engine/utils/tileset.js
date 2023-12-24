/**
 * @class Tileset
 * @description A singular tileset
 * 
 * @property {string} identifier - The identifier of the tileset
 * 
 * @property {object} map_color - The color of the tileset in the map image (r,g,b,a)
 * 
 * @property {string} tileset_path - The path to the tileset image
 * @property {Image} tileset_image - The tileset image
 * 
 * @property {number} tile_width - The width of a single tile
 * @property {number} tile_height - The height of a single tile
 * 
 * @property {number} tileset_width - The width of the tileset image
 * @property {number} tileset_height - The height of the tileset image
 * 
 * @property {number} tileset_columns - The amount of columns in the tileset image
 * @property {number} tileset_rows - The amount of rows in the tileset image
 * 
 */
export class Tileset {
  constructor(identifier) {
    this.identifier = identifier;

    this.map_color = {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    }

    this.tileset_path = "";
    this.tileset_image = null;

    this.tile_width = 0;
    this.tile_height = 0;

    this.tileset_width = 0;
    this.tileset_height = 0;

    this.tileset_columns = 0;
    this.tileset_rows = 0;

    this.loaded = false;
  }

  /**
   * @method from_raw
   * @description Creates a tileset from raw data
   * @param {JSON} raw_tileset 
   * @returns {Tileset} The created tileset
   * @memberof Tileset
   */
  static from_raw = (raw_tileset) => {
    const tileset = new Tileset(raw_tileset.identifier);

    tileset.map_color = raw_tileset.map_color;

    tileset.tileset_path = raw_tileset.tileset_path;
    tileset.tileset_image = new Image();
    tileset.tileset_image.src = raw_tileset.tileset_path;

    tileset.tileset_image.onload = () => {
      tileset.loaded = true;
    }

    tileset.tile_width = raw_tileset.tile_width;
    tileset.tile_height = raw_tileset.tile_height;

    tileset.tileset_width = raw_tileset.tileset_width;
    tileset.tileset_height = raw_tileset.tileset_height;

    tileset.tileset_columns = raw_tileset.tileset_columns;
    tileset.tileset_rows = raw_tileset.tileset_rows;

    return tileset;
  }
}