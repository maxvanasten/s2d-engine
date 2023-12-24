import { Tileset } from "./tileset.js";

/**
 * @class Tilemap
 * @description Tilemap class, holds all the information neccessary for the tilemap_manager to work
 * @property {string} map_path - The path to the tilemap image
 * @property {Image} map_image - The tilemap image
 * 
 * @property {Tileset[]} tilesets - The tilesets used in the tilemap
 * 
 * @property {boolean} map_image_loaded - Whether or not the map image is loaded
*/
export class Tilemap {
  constructor() {
    this.map_path = "";
    this.map_image = null;

    this.tilesets = [];

    this.map_image_loaded = false;
  }

  /**
   * @method are_tilesets_loaded
   * @description Checks if all the tilesets are loaded
   * @returns {boolean} Whether or not all the tilesets are loaded
   * @memberof Tilemap
   */
  are_tilesets_loaded = () => {
    for (let i = 0; i < this.tilesets.length; i++) {
      if (!this.tilesets[i].loaded) return false;
    }

    return true;
  }

  /**
   * @method add_tileset
   * @description Adds a tileset to the tilemap
   * @param {Tileset} tileset 
   * @memberof Tilemap
   */
  add_tileset = (tileset) => {
    this.tilesets.push(tileset);
  }

  /**
   * @method is_loaded
   * @description Checks if the tilemap is loaded
   * @returns {boolean} Whether or not the tilemap is loaded
   * @memberof Tilemap
   */
  is_loaded = () => {
    if (this.are_tilesets_loaded() && this.map_image_loaded) {
      return true;
    };
    return false;
  }

  /**
   * @method from_raw
   * @description Creates a tilemap from raw data
   * @param {JSON} raw_tilemap
   * @returns {Tilemap} The created tilemap
   * @memberof Tilemap
   */
  static from_raw = (raw_tilemap) => {
    const tilemap = new Tilemap();

    tilemap.map_path = raw_tilemap.map_path;
    tilemap.map_image = new Image();
    tilemap.map_image.src = raw_tilemap.map_path;

    tilemap.map_image.onload = () => {
      tilemap.map_image_loaded = true;
    }

    tilemap.map_width = raw_tilemap.map_width;
    tilemap.map_height = raw_tilemap.map_height;
    tilemap.scale = raw_tilemap.map_scale;

    tilemap.tile_width = raw_tilemap.tile_width;
    tilemap.tile_height = raw_tilemap.tile_height;

    for (let i = 0; i < raw_tilemap.tilesets.length; i++) {
      tilemap.add_tileset(Tileset.from_raw(raw_tilemap.tilesets[i]));
    }

    return tilemap;
  }
}