import { Vector2D } from "../s2d_engine/utils/vectors.js";

const game = {
  internal_objects: [
    "input_manager",
    "tilemap_manager",
    "ui_manager"
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
        self.collision_box.width = 50;
        self.collision_box.height = 50;
        self.collision_box.x = -self.collision_box.width / 2;
        self.collision_box.y = -self.collision_box.height / 2;

        self.movement_vector = Vector2D.ZERO();
        self.speed = 300;

        self.firerate = 0.1;
        self.shot_timer = 0;

        self.max_health = 100;
        self.health = self.max_health;

        self.survival_time = 0;
      },
      render: (core, self, context, position) => {
        context.fillStyle = "#242424";
        context.fillRect(position.x - (self.max_health + 10), 50, (self.max_health * 2) + 20, 50);
        context.fillStyle = "green";
        context.fillRect(position.x - (self.max_health), 60, self.health * 2, 30);
      },
      update: (core, self, delta) => {
        const wave_manager = core._get_object_by_identifier("wave_manager")
        if (self.health <= 0) {
          alert("You died! Restarting game...");
          // Reset game
          core._get_objects_by_group("zombie").forEach((zombie) => {
            core._destroy_object(zombie.identifier);
          });
          core._get_objects_by_group("bullet").forEach((bullet) => {
            core._destroy_object(bullet.identifier);
          });
          self.health = self.max_health;
          const spawn_position = core._get_spawn_position(self.spawn_tile);
          self.global_position = Vector2D.from_x_and_y(spawn_position.x, spawn_position.y);

          wave_manager.wave = 0;
          wave_manager.wave_timer = wave_manager.wave_cooldown;

          self.survival_time = 0;
          return;
        }

        // Check ui elements
        // if (document.getElementById("s2d-health").innerHTML != self.health) document.getElementById("s2d-health").innerHTML = self.health;
        // if (document.getElementById("s2d-wave").innerHTML != wave_manager.wave) document.getElementById("s2d-wave").innerHTML = wave_manager.wave;
        // if (document.getElementById("s2d-time").innerHTML != self.survival_time) document.getElementById("s2d-time").innerHTML = self.survival_time.toFixed(2);

        document.getElementById("s2d-health").innerHTML = self.health;
        document.getElementById("s2d-wave").innerHTML = wave_manager.wave;
        document.getElementById("s2d-time").innerHTML = self.survival_time.toFixed(2);

        self.survival_time += delta;
        self.movement_vector = self.movement_vector.normalize()
        self.movement_vector = self.movement_vector.scale(self.speed * delta);
        let next_position = self.global_position.add(self.movement_vector);

        const tilemap_manager = core._get_object_by_identifier("INTERNAL_tilemap_manager");
        const collision = tilemap_manager.is_colliding(tilemap_manager, next_position, self.collision_box.height);

        if (!collision) self.global_position = next_position;
        self.movement_vector = Vector2D.ZERO();
      },

      actions: [
        {
          "type": "keyboard",
          "key": "w",
          "while_key_down": (core, self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.UP());
          }
        },
        {
          "type": "keyboard",
          "key": "a",
          "while_key_down": (core, self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.LEFT());
          }
        },
        {
          "type": "keyboard",
          "key": "s",
          "while_key_down": (core, self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.DOWN());
          }
        },
        {
          "type": "keyboard",
          "key": "d",
          "while_key_down": (core, self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.RIGHT());
          }
        },
        {
          "type": "mouse",
          "button": "left",
          "on_click": (core, self) => {
            self.shot_timer -= core._delta_time;
            if (self.shot_timer > 0) return;
            self.shot_timer = self.firerate;
            const mouse_position = core._get_mouse_position();
            const mouse_position_global = core._screen_to_global(mouse_position);
            const direction = mouse_position_global.subtract(self.global_position).normalize();
            core._spawn_object(create_bullet(self.global_position, direction));
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
        self.wave_timer = 0;
        self.wave_cooldown = 2;
      },
      update: (core, self, delta) => {
        const zombie_count = core._get_objects_by_group("zombie").length;

        document.getElementById("s2d-zombies").innerHTML = zombie_count;

        if (zombie_count == 0) {
          if (self.wave_timer <= 0) {
            self.wave_timer = self.wave_cooldown;
            self.wave++;
            for (let i = 0; i < self.wave; i++) {
              core._spawn_object(create_zombie(i));
            }
          } else {
            self.wave_timer -= delta;
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
      },
      {
        identifier: "wall",
        is_collider: true,
        map_color: {
          r: 255,
          g: 0,
          b: 255,
          a: 255
        },
        tileset_path: "game/assets/tilesets/wall.svg",
        tile_width: 16,
        tile_height: 16,
        tileset_width: 48,
        tileset_height: 48,
        tileset_columns: 3,
        tileset_rows: 3
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
      self.speed = Math.random() * 100 + 100;
      self.max_health = 100;
      self.health = self.max_health;

      self.attack_timer = 0;
      self.attack_cooldown = 1;

      self.attack_damage = 25;

      self.ui_width = 80;
      self.ui_height = 20;
    },
    update: (core, self, delta) => {
      self.attack_timer -= delta;
      if (self.attack_timer <= 0) {
        self.attack_timer = 0;
      }

      if (self.health <= 0) {
        core._destroy_object(self.identifier);
      }

      const player = core._get_object_by_identifier("player");
      const player_position = player.global_position;
      const zombie_position = self.global_position;

      const distance = self.global_position.distance(player_position);

      if (distance < 50) {
        if (self.attack_timer == 0) {
          player.health -= self.attack_damage;
          self.attack_timer = self.attack_cooldown;
        }
      }

      const movement_vector = player_position.subtract(zombie_position);
      self.global_position = self.global_position.add(movement_vector.normalize().scale(self.speed * delta));
    },
    render: (core, self, context, position) => {
      context.fillStyle = "#242424";
      context.fillRect(position.x - self.ui_width / 2, position.y - self.ui_width / 2, self.ui_width, self.ui_height);
      context.fillStyle = "green";
      context.fillRect((position.x - self.ui_width / 2) + 5, (position.y - self.ui_width / 2) + 5, self.health * ((self.ui_width - 10) * 0.01), self.ui_height - 10);
    }
  }
}

const create_bullet = (position, direction) => {
  return {
    identifier: `bullet_${generateRandomId()}`,
    group: "bullet",
    flags: ["ALWAYS_UPDATE"],
    global_position: { x: position.x, y: position.y },
    sprite: {
      image_path: "game/assets/bullet.svg",
      source_width: 16,
      source_height: 16,
      render_width: 10,
      render_height: 10
    },
    init: (core, self) => {
      self.speed = 1000;
      self.lifespan = 100;

      self.sprite_angle = direction.angle();
    },
    update: (core, self, delta) => {
      self.lifespan--;
      if (self.lifespan <= 0) {
        core._destroy_object(self.identifier);
      }
      self.global_position = self.global_position.add(direction.scale(self.speed * delta));

      const zombies = core._get_objects_by_group("zombie");
      zombies.forEach((zombie) => {
        if (self.global_position.distance(zombie.global_position) < 50) {
          zombie.health -= 10;
          core._destroy_object(self.identifier);
        }
      })
    },
  }
}

const generateRandomId = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let id = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }
  return id;
}


export default game;