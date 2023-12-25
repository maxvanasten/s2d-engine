import { Vector2D } from "../s2d_engine/utils/vectors.js";

const game = {
  internal_objects: [
    "input_manager",
    "tilemap_manager"
  ],

  objects: [
    {
      identifier: "player",
      flags: ["ALWAYS_UPDATE", "ALWAYS_RENDER", "IS_PLAYER"],
      sprite: {
        image_path: "game/assets/player.svg",
        source_width: 16,
        source_height: 16,
        render_width: 50,
        render_height: 50
      },
      spawn_tile: "player_spawn",
      render_layer: 1,
      global_position: { x: 500, y: 1000 },
      bounding_box: { x: 0, y: 0, width: 100, height: 100 },
      collision_box: { x: -50, y: -50, width: 100, height: 100 },
      init: (core, self) => {
        self.collision_box.width = 75;
        self.collision_box.height = 75;
        self.collision_box.x = -self.collision_box.width / 2;
        self.collision_box.y = -self.collision_box.height / 2;

        self.movement_vector = Vector2D.ZERO();
        self.speed = 300;
      },
      render: (core, self, context, position) => {
      },
      update: (core, self, delta) => {
        self.movement_vector = self.movement_vector.normalize()
        self.movement_vector = self.movement_vector.scale(self.speed * delta);
        self.global_position = self.global_position.add(self.movement_vector);
        self.movement_vector = Vector2D.ZERO();
      },

      actions: [
        {
          "key": "w",
          "while_key_down": (core, self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.UP());
          }
        },
        {
          "key": "a",
          "while_key_down": (core, self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.LEFT());
          }
        },
        {
          "key": "s",
          "while_key_down": (core, self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.DOWN());
          }
        },
        {
          "key": "d",
          "while_key_down": (core, self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.RIGHT());
          }
        }
      ]
    },
    {
      identifier: "test_box",
      global_position: { x: 200, y: 200 },
      sprite: {
        image_path: "game/assets/box.svg",
        source_width: 16,
        source_height: 16,
        render_width: 50,
        render_height: 50
      },
      bounding_box: { x: 0, y: 0, width: 100, height: 100 },
      init: (core, self) => {
        self.width = self.bounding_box.width;
        self.height = self.bounding_box.height;
      },
      update: (core, self, delta) => {
      },
      render: (core, self, context, position) => {
        // context.fillStyle = "blue";
        // context.fillRect(position.x - self.width / 2, position.y - self.height / 2, self.width, self.height);
      },
    },
    {
      identifier: "wave_manager",
      flags: ["ALWAYS_UPDATE"],
      init: (core, self) => {
        self.wave = 0;
      },
      update: (core, self, delta) => {
        const zombie_count = core._get_objects_by_group("zombie").length;
        if (zombie_count == 0) {
          self.wave++;
          for (let i = 0; i < self.wave; i++) {
            core._spawn_object(create_zombie(i));
          }
        }
      }
    }
  ],

  tilemap: {
    map_path: "game/assets/maps/map_2.svg",

    map_width: 64,
    map_height: 64,
    map_scale: 4,

    tile_width: 16,
    tile_height: 16,

    tilesets: [
      {
        identifier: "soil",
        map_color: {
          r: 0,
          g: 255,
          b: 0,
          a: 255
        },
        tileset_path: "game/assets/tilesets/soil.svg",
        tile_width: 16,
        tile_height: 16,
        tileset_width: 48,
        tileset_height: 16,
        tileset_columns: 3,
        tileset_rows: 1
      },
      {
        identifier: "grass",
        map_color: {
          r: 255,
          g: 0,
          b: 0,
          a: 255
        },
        tileset_path: "game/assets/tilesets/grass.svg",
        tile_width: 16,
        tile_height: 16,
        tileset_width: 48,
        tileset_height: 16,
        tileset_columns: 3,
        tileset_rows: 1
      },
      {
        identifier: "player_spawn",
        map_color: {
          r: 0,
          g: 0,
          b: 255,
          a: 255
        },
        tileset_path: "game/assets/tilesets/player_spawn.svg",
        tile_width: 16,
        tile_height: 16,
        tileset_width: 16,
        tileset_height: 16,
        tileset_columns: 1,
        tileset_rows: 1
      },
      {
        identifier: "zombie_spawn",
        map_color: {
          r: 255,
          g: 255,
          b: 0,
          a: 255
        },
        tileset_path: "game/assets/tilesets/zombie_spawn.svg",
        tile_width: 16,
        tile_height: 16,
        tileset_width: 16,
        tileset_height: 16,
        tileset_columns: 1,
        tileset_rows: 1
      }
    ]
  },
}

const create_zombie = (identifier) => {
  return {
    identifier: `zombie_${identifier}`,
    group: "zombie",
    flags: ["ALWAYS_UPDATE"],
    global_position: { x: 0, y: 0 },
    spawn_tile: "zombie_spawn",
    sprite: {
      image_path: "game/assets/zombie.svg",
      source_width: 16,
      source_height: 16,
      render_width: 50,
      render_height: 50
    },
    init: (core, self) => {
      self.speed = Math.random() * 200 + 100;
    },
    update: (core, self, delta) => {
      const player = core._get_object_by_identifier("player");
      const player_position = player.global_position;
      const zombie_position = self.global_position;

      const distance = self.global_position.distance(player_position);

      const movement_vector = player_position.subtract(zombie_position);
      self.global_position = self.global_position.add(movement_vector.normalize().scale(self.speed * delta));

      if (distance < 50) {
        core._destroy_object(self.identifier);
      }
    },
  }
}

export default game;