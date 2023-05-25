import D20, { DiceType } from "utils/d20";

export type ActivePlayer = {
  name?: string;
  hp: number;
  trait: PlayerTrait;
  description: string;
  type: PlayerType;
  attributes: PlayerAttributes;
};

/** Player classes that can be used to generate initial stats */
export enum PlayerType {
  /** Combat focus */
  Warrior = "Warrior", // +2 physical
  /** Magic/Technical specialist */
  Adept = "Adept", // +2 mental
  /** Adventurer (Warrior + Adept) */
  Explorer = "Explorer", // +1 physical, +1 mental
  /** Charisma/Social focus */
  Speaker = "Speaker" // +2 social
}

export type PlayerAttributes = {
  Physical: number;
  Social: number;
  Mental: number;
};

export type PlayerAttribute = keyof PlayerAttributes;
export const playerAttributes = Object.freeze([
  "Physical",
  "Social",
  "Mental"
]) as PlayerAttribute[];

export type PlayerTrait = { name: string; value: number };
export enum Physical {
  // Positive
  Strong = 2,
  Agile = 2,
  // Neutral
  Healthy = 1,
  Average = 0,
  // Negative
  Unhealthy = -2,
  Slow = -2
}

export enum Mental {
  // Positive
  Creative = 2,
  Intelligent = 2,
  // Neutral
  Curious = 1,
  Unremarkable = 0,
  // Negative
  Stupid = -2,
  Uncreative = -2
}

export enum Social {
  // Positive
  Empathetic = 2,
  Outgoing = 2,
  // Neutral
  Adequate = 0,
  Apathetic = -1,
  // Negative
  Shy = -2,
  Antisocial = -2
}

/** Create a new Player object for exploration */
export function createPlayer(type = randomStartingClass()): ActivePlayer {
  const trait = randomTrait(type);
  const attributes = modifyAttrsWithTrait(attrsForType(type), trait);
  const hp = startingHP(attributes, trait);
  const description = `${trait.name} ${type}`;
  return { hp, trait, type, description, attributes };
}

const random = (src: any[]) => src[Math.floor(Math.random() * src.length)];

export const ALL_TRAITS = {
  Strong: Physical.Strong,
  Agile: Physical.Agile,
  Healthy: Physical.Healthy,
  Average: Physical.Average,
  Unhealthy: Physical.Unhealthy,
  Slow: Physical.Slow,
  Creative: Mental.Creative,
  Intelligent: Mental.Intelligent,
  Curious: Mental.Curious,
  Unremarkable: Mental.Unremarkable,
  Stupid: Mental.Stupid,
  Uncreative: Mental.Uncreative,
  Empathetic: Social.Empathetic,
  Outgoing: Social.Outgoing,
  Adequate: Social.Adequate,
  Apathetic: Social.Apathetic,
  Shy: Social.Shy,
  Antisocial: Social.Antisocial
};
export type PlayerTraitName = keyof typeof ALL_TRAITS;
export const TRAIT_NAMES = Object.keys(ALL_TRAITS) as PlayerTraitName[];
const physicalTraits = [
  Physical.Strong,
  Physical.Agile,
  Physical.Healthy,
  Physical.Average,
  Physical.Unhealthy,
  Physical.Slow
];
const socialTraits = [
  Social.Empathetic,
  Social.Outgoing,
  Social.Adequate,
  Social.Apathetic,
  Social.Shy,
  Social.Antisocial
];
const mentalTraits = [
  Mental.Creative,
  Mental.Intelligent,
  Mental.Curious,
  Mental.Unremarkable,
  Mental.Stupid,
  Mental.Uncreative
];

/** Generate random trait for new player */
export function randomTrait(type = PlayerType.Warrior): PlayerTrait {
  switch (type) {
    case PlayerType.Adept: {
      const v = random(mentalTraits);
      return { name: Mental[v], value: v };
    }
    case PlayerType.Explorer: {
      const v = random([...mentalTraits, ...physicalTraits]);
      return { name: Physical[v] || Mental[v], value: v };
    }
    case PlayerType.Speaker: {
      const v = random(socialTraits);
      return { name: Social[v], value: v };
    }
    case PlayerType.Warrior:
    default: {
      const v = random(physicalTraits);
      return { name: Physical[v], value: v };
    }
  }
}

/** Random starting class */
export function randomStartingClass(): PlayerType {
  return random([
    PlayerType.Warrior,
    PlayerType.Adept,
    PlayerType.Explorer,
    PlayerType.Speaker
  ]) as PlayerType;
}

/** Generate starting HP for user */
export function startingHP(attrs: PlayerAttributes, t: PlayerTrait): number {
  const { Physical, Mental, Social } = attrs;
  const hp = Physical * 10 + Mental * 3 + Social * 5;
  return hp + t.value;
}

/** Generate starting attributes for a Player `Type` */
export function attrsForType(type: PlayerType): PlayerAttributes {
  switch (type) {
    case PlayerType.Warrior:
      return { Physical: 15, Mental: 4, Social: 2 };
    case PlayerType.Adept:
      return { Physical: 6, Mental: 12, Social: 3 };
    case PlayerType.Explorer:
      return { Physical: 9, Mental: 8, Social: 4 };
    case PlayerType.Speaker:
      return { Physical: 3, Mental: 6, Social: 12 };
    default: // an absolutely mediocre player (also an error)
      return { Physical: 7, Social: 7, Mental: 7 };
  }
}

function modifyAttrsWithTrait(
  a: PlayerAttributes,
  trait: PlayerTrait
): PlayerAttributes {
  const { name, value: v } = trait;
  if (name in Social) return { ...a, Social: a.Social + v };
  if (name in Mental) return { ...a, Mental: a.Mental + v };
  return { ...a, Physical: a.Physical + v };
}

/** Difficulty modifier for action */
export const DIFFICULTY = {
  // Routine: 0,
  Simple: 3,
  Standard: 6,
  Demanding: 9,
  Difficult: 12,
  Challenging: 15,
  Intimidating: 18,
  Formidable: 21,
  Heroic: 24,
  Immortal: 27,
  Impossible: 30
};

export type Difficulty = keyof typeof DIFFICULTY;
export const DIFFICULTY_NAMES = Object.keys(DIFFICULTY) as Difficulty[];

type RollOpts = {
  threshold: number;
  attribute: PlayerAttribute;
  player: ActivePlayer;
  notation?: string | DiceType;
};
/** Perform a roll against a threshold and return information about the roll */
export function rollForTarget(opts: RollOpts) {
  const { threshold = 0, attribute, player, notation = "3d10+2" } = opts;
  const { trait, attributes } = player;
  const attrVal = attributes[attribute];
  const difficulty = threshold + attrVal + -trait.value;
  const roll = D20.roll(notation) + trait.value;
  return {
    /** Whether roll succeeded or failed */
    pass: roll >= difficulty,
    /** How far the roll fell short of the target threshold (positive on fail) */
    diff: difficulty - roll,
    /** Roll value */
    roll
  };
}
