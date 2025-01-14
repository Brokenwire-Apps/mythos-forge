import { objectType } from "nexus";

/** All `Character` fields we want to expose via GraphQL */
export const MFCharacter = objectType({
  name: "MFCharacter",
  description: "A significant actor in a `World`",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("name", { description: "Character name" });
    t.nonNull.string("description", { description: "Character description" });
    t.string("image");
    t.int("authorId", { description: "Author owner" });
    t.int("groupId", { description: "`Group` identifier id (optional)" });
    t.int("locationId", { description: "Character's `Location` id" });
    t.nonNull.int("worldId", { description: "Character's `World` id" });

    // Relationships
    t.field("World", { type: "MFWorld" });

    // List properties
    t.list.field("CharacterRelationship", { type: "MFCharacterRelationship" });
  }
});
