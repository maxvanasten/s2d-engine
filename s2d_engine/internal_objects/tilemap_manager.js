import { GameObject } from "../utils/game_object.js";
import { Tilemap } from "../utils/tilemap.js";

const tilemap_manager = new GameObject("INTERNAL_tilemap_manager");

tilemap_manager.flags.ALWAYS_RENDER = true;
tilemap_manager.flags.ALWAYS_UPDATE = true;

tilemap_manager.ready = false;

tilemap_manager.is_loaded = (self) => {
  if (self.ready) return true;
  console.warn("Tilemap manager is not loaded yet!");

  // Wait for the tilemap to load
  if (self.tilemap.is_loaded()) {
    // Convert map image to tiles[]
    self.map = self.convert_map_image(self);

    // Create new canvas for rendering the map
    self.rendered_map = new OffscreenCanvas(self.tilemap.map_width * self.tilemap.tile_width * self.tilemap.scale, self.tilemap.map_height * self.tilemap.tile_height * self.tilemap.scale);
    const context = self.rendered_map.getContext("2d");

    // Loop over all tiles and render them
    self.map.forEach((tile) => {
      // Calculate destination position and width and height
      const destination_x = tile.x * self.tilemap.tile_width * self.tilemap.scale;
      const destination_y = tile.y * self.tilemap.tile_height * self.tilemap.scale;
      const destination_width = self.tilemap.tile_width * self.tilemap.scale;
      const destination_height = self.tilemap.tile_height * self.tilemap.scale;

      // If the tile has no tileset, render a white tile
      if (!tile.tileset) {
        context.fillStyle = "rgba(255,255,255,255)";
        context.fillRect(destination_x, destination_y, destination_width, destination_height);
      } else {
        const tileset = tile.tileset;

        // Get random tile from tileset
        const source_x = Math.floor(Math.random() * tileset.tileset_columns) * tileset.tile_width;
        const source_y = Math.floor(Math.random() * tileset.tileset_rows) * tileset.tile_height;

        // Draw tile to appropriate position
        context.drawImage(tileset.tileset_image, source_x, source_y, tileset.tile_width, tileset.tile_height, destination_x, destination_y, destination_width, destination_height);
      }
    })

    // Transfer the rendered map to an image bitmap
    self.rendered_map_image = self.rendered_map.transferToImageBitmap();
    // Set ready to true
    self.ready = true;
  }

  return false;
}

tilemap_manager.init = (self, raw_tilemap) => {
  // Parse tilemap
  self.tilemap = Tilemap.from_raw(raw_tilemap);
}

tilemap_manager.render = (self, context, position) => {
  if (self.is_loaded(self)) {
    context.drawImage(self.rendered_map_image, position.x, position.y);
  }
}

// Convert map image to tilemap
tilemap_manager.convert_map_image = (self) => {
  // Create canvas from map image for pixel retrieval
  const canvas = new OffscreenCanvas(self.tilemap.map_image.width, self.tilemap.map_image.height);
  canvas.width = self.tilemap.map_image.width;
  canvas.height = self.tilemap.map_image.height;
  const context = canvas.getContext("2d");
  context.drawImage(self.tilemap.map_image, 0, 0);

  // Get pixel data
  const data = context.getImageData(0, 0, self.tilemap.map_image.width, self.tilemap.map_image.height).data;

  const map = [];

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % self.tilemap.map_image.width;
    const y = Math.floor((i / 4) / self.tilemap.map_image.width);

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const tileset = self.pixeldata_to_tile(self, { r, g, b, a });

    map.push({
      x,
      y,
      tileset
    });
  }
  return map;
}

// Convert pixel values to tileset reference
tilemap_manager.pixeldata_to_tile = (self, pixeldata) => {
  let result = false;
  self.tilemap.tilesets.forEach((tileset) => {
    if (tileset.map_color.r === pixeldata.r && tileset.map_color.g === pixeldata.g && tileset.map_color.b === pixeldata.b && tileset.map_color.a === pixeldata.a) {
      result = tileset;
    }
  })
  return result;
}

export default tilemap_manager;