import { loadExploration } from "api/loadUserData";
import {
  GlobalExploration,
  convertAPISceneToTemplate,
  setGlobalExplorationScene,
  setGlobalSceneData,
  updateAsError
} from "state";
import { noOp } from "utils";
import { InteractiveSlot, SlotAction, SlotHandlerOpts } from "utils/types";
import { PlayerAttribute, rollForTarget } from "state/explorations.player";

type UpdateLayerOpts = {
  slot: InteractiveSlot;
  src: InteractiveSlot[];
  editing: boolean;
  onChange: (slot: InteractiveSlot[]) => void;
};

/** Notify a parent of updates to a Canvas Layer  */
export function updateLayer(opts: UpdateLayerOpts) {
  const { slot, src, editing = false, onChange = noOp } = opts;
  if (!editing) return;
  const { index = 1 } = slot;
  const updates = src.map((d) => (d.index === index ? slot : d));
  onChange(updates);
}

/** Handle a click- or drag-event on a sprite  */
export function handleSlotInteraction(opts: SlotHandlerOpts) {
  const { action, data = {}, name } = opts;
  const { exploration } = GlobalExploration.getState();
  const { Scenes } = exploration || { Scenes: [] };

  switch (action) {
    case SlotAction.NAV_SCENE: {
      // Navigate to a new scene
      const next = Scenes.find((d) => d.id === data.target);
      if (!next) return updateAsError("Scene not found");
      return setGlobalExplorationScene(convertAPISceneToTemplate(next));
    }
    case SlotAction.NAV_EXPLORATION: {
      // Fetch and load a new Exploration
      const id = data.target;
      if (!id) return updateAsError("Exploration not found");
      return loadExploration({ explorationId: id });
    }
    case SlotAction.CHOICE:
    case SlotAction.SHOW_TEXT: {
      // Store data globally so relevant components can access it
      return setGlobalSceneData({ name, data });
    }
    case SlotAction.CHECK_ATTR:
    case SlotAction.HIT_PLAYER:
    case SlotAction.HIT_TARGET: {
      // Pass this to a game handler, which can trigger GlobalExploration state updates
      return handleGameInteraction(opts);
    }
    default:
      console.log("Unhandled slot action", opts);
      break;
  }
}

const { CHECK_ATTR, HIT_PLAYER, HIT_TARGET } = SlotAction;

/** Handle a click- or drag-event on a sprite  */
export function handleGameInteraction(opts: SlotHandlerOpts): void {
  const { action, data = {}, name } = opts;
  const { exploration, player } = GlobalExploration.getState();
  const pName = player.name || player.description;
  const { Scenes } = exploration || { Scenes: [] };
  if (!player.hp) {
    updateAsError(`Your ${pName} is dead`, 1);
    return;
  }

  switch (action) {
    case HIT_PLAYER:
    case HIT_TARGET: {
      // Pass this to a game handler, which can trigger GlobalExploration state updates
      return console.log("Unhandled attack action", opts);
    }

    case CHECK_ATTR: {
      const { text, target = 0, choices = [] } = data;
      const { roll, diff, pass } = rollForTarget({
        threshold: target,
        attribute: text as PlayerAttribute,
        player
      });
      const outcomeKey = pass ? "Success" : "Failure";
      const outcome = choices.find((d) => d.text === outcomeKey);
      if (outcome?.action) {
        if ([HIT_PLAYER, HIT_TARGET].includes(outcome.action)) {
          const hitData = { action: outcome.action, target: diff };
          return handleGameInteraction({ name, action, data: hitData });
        }

        handleSlotInteraction({ name, action, ...outcome });
        return;
      }

      return GlobalExploration.sceneData({
        name: `Check ${text} ${outcomeKey}`,
        data: { text: `Player rolled ${roll}` }
      });
    }

    default:
      console.log("Unknown game action", opts);
      break;
  }
}
