import { Vector2D } from "../s2d_engine/utils/vectors.js";

const game = {
  internal_objects: [
    "input_manager"
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
      render_layer: 1,
      global_position: { x: 0, y: 0 },
      bounding_box: { x: 0, y: 0, width: 100, height: 100 },
      collision_box: { x: -50, y: -50, width: 100, height: 100 },
      init: (self) => {
        self.collision_box.width = 75;
        self.collision_box.height = 75;
        self.collision_box.x = -self.collision_box.width / 2;
        self.collision_box.y = -self.collision_box.height / 2;

        self.movement_vector = Vector2D.ZERO();
        self.speed = 300;
      },
      render: (self, context, position) => {
      },
      update: (self, delta) => {
        self.movement_vector = self.movement_vector.normalize()
        self.movement_vector = self.movement_vector.scale(self.speed * delta);
        self.global_position = self.global_position.add(self.movement_vector);
        self.movement_vector = Vector2D.ZERO();
      },

      actions: [
        {
          "key": "w",
          "while_key_down": (self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.UP());
          }
        },
        {
          "key": "a",
          "while_key_down": (self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.LEFT());
          }
        },
        {
          "key": "s",
          "while_key_down": (self) => {
            self.movement_vector = self.movement_vector.add(Vector2D.DOWN());
          }
        },
        {
          "key": "d",
          "while_key_down": (self) => {
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
      init: (self) => {
        self.width = self.bounding_box.width;
        self.height = self.bounding_box.height;
      },
      update: (self, delta) => {
      },
      render: (self, context, position) => {
        // context.fillStyle = "blue";
        // context.fillRect(position.x - self.width / 2, position.y - self.height / 2, self.width, self.height);
      },
    }
  ]
}

export default game;