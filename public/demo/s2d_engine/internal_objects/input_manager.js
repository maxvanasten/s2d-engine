import { GameObject } from "../utils/game_object.js";

const input_manager = new GameObject("INTERNAL_input_manager");

// Input manager should always update
input_manager.flags.ALWAYS_UPDATE = true;

// Check if a key is down
input_manager.is_key_down = (self, key) => {
  return self.keymap[key];
}

input_manager.init = (core, self) => {
  self.keymap = {};
  self.actions = [];
  // Handle game losing focus
  window.addEventListener("blur", () => {
    self.keymap = {};
  });

  // Add event listeners for input events
  window.addEventListener("keydown", (event) => {
    event.preventDefault();
    self.keymap[event.key] = true;
  });
  window.addEventListener("keyup", (event) => {
    event.preventDefault();
    self.keymap[event.key] = false;
  });
}

// Loop over all actions and check if the key is down, if it is, call the actions while_key_down function
input_manager.update = (core, self, delta) => {
  self.actions.forEach((action) => {
    if (self.is_key_down(self, action.key)) {
      action.while_key_down(core, action.self);
    }
  })
}

export default input_manager;