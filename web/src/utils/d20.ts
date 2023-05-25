import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export type DiceType =
  | string
  | ("d4" | "d6" | "d20" | "2d4" | "2d6" | "2d20" | "4d4" | "4d6" | "2d8+2");

/**
 * This originally started as a rip-off of one JS library -- then I found
 * another one that didn't use Math.random() and was under 1MB. So I implemented
 * that instead.
 */
const D20 = {
  /**
   * Roll a number of dice and return the result.
   *
   * @param notation Type of dice to roll, can be represented in various formats:
   *               - a number (6, 12, 42)
   *               - dice syntax (d20, 4d6, 2d8+2)
   * @param verbose Whether or not all dice rolls should be returned as an array
   * @return Number|Array
   */
  roll: function _diceroll(notation: DiceType = "d20") {
    const roll = new DiceRoll(notation).roll();
    const dice = roll[0].rolls;
    return dice.reduce((a, d) => a + d.value, 0);
  },

  /**
   * Roll a number of dice and return the result as an array.
   *
   * @param dice Type of dice to roll, can be represented in various formats:
   *               - a number (6, 12, 42)
   *               - dice syntax (d20, 4d6, 2d8+2)
   * @return Array
   */
  verboseRoll: function _verboseRoll(d: DiceType = "d20") {
    const roll = new DiceRoll(d).roll();
    return roll[0].rolls.map((d) => d.value);
  }
};

export default D20;
