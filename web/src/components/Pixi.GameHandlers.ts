import { loadExploration } from "api/loadUserData";
import {
  GlobalExploration,
  convertAPISceneToTemplate,
  setGlobalExplorationScene,
  setGlobalSceneData,
  updateAsError,
  updateNotification
} from "state";
import { ActivePlayer, rollForTarget } from "state/explorations.player";
import {
  PlayerAttribute,
  PlayerTraitName,
  createPlayer
} from "state/explorations.player";
import { noOp } from "utils";
import {
  InteractiveSlot,
  SlotAction,
  SlotHandlerOpts,
  SlotInteractionData
} from "utils/types";

const gameInteractions = new Set([
  SlotAction.HIT_PLAYER,
  SlotAction.HIT_TARGET,
  SlotAction.CHECK_ATTR
]);

const sceneInteractions = new Set([
  SlotAction.NAV_EXPLORATION,
  SlotAction.NAV_SCENE,
  SlotAction.CHOICE,
  SlotAction.SHOW_TEXT
]);

/** Handle a click- or drag-event on a sprite  */
export function handleGameInteraction(opts: SlotHandlerOpts) {
  const { action, data = {}, name } = opts;
  const { exploration, player } = GlobalExploration.getState();
  const pName = player.name || player.description;
  const { Scenes } = exploration || { Scenes: [] };
  if (!player.hp) return updateAsError(`Your ${pName} is dead`, 1);

  switch (action) {
    case SlotAction.HIT_PLAYER:
    case SlotAction.HIT_TARGET: {
      // Pass this to a game handler, which can trigger GlobalExploration state updates
      return console.log("Unhandled attack action", opts);
    }

    case SlotAction.CHECK_ATTR: {
      const { text, target = 0, choices = [] } = data;
      const { roll, diff, pass } = rollForTarget({
        threshold: target,
        attribute: text as PlayerAttribute,
        player
      });
      const outcome = choices[pass ? 0 : 1];
      const challenge = `${roll} vs ${target} ${text}`;
      let d = `${pName} ${outcome.text} with ${challenge}`;
      if (outcome.text !== "Success") {
        // @TODO: use the action provided by the scene
        return GlobalExploration.multiple({
          player: { ...player, hp: Math.max(0, player.hp - diff) },
          sceneData: {
            data: { text: `You take ${diff} damage!` },
            name: `${action} ${outcome.text}`
          }
        });
      }

      // @TODO: use the action provided by the scene
      console.log(outcome);
      return updateNotification(d, 1);
    }

    default:
      console.log("Unknown game action", opts);
      break;
  }
}
