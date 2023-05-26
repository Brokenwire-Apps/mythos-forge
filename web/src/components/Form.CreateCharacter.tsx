import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { noOp } from "../utils";
import { UserRole } from "../utils/types";
import {
  Form,
  FormRow,
  Hint,
  Input,
  Label,
  Legend,
  Textarea
} from "components/Forms/Form";
import { CreateCharacterData } from "graphql/requests/characters.graphql";
import { useGlobalUser } from "hooks/GlobalUser";
import { GlobalCharacter, GlobalWorld } from "state";
import SelectParentWorld from "./SelectParentWorld";
import SelectParentLocation from "./SelectParentLocation";
import ImageUploader from "./Forms/ImageUploader";

export type CreateCharacterProps = {
  data?: Partial<CreateCharacterData>;
  onChange?: (data: Partial<CreateCharacterData>) => void;
  onImageFile?: (file?: File | null) => void;
};

const initialFormData = () => {
  const { focusedWorld, focusedLocation } = GlobalWorld.getState();
  const { focusedCharacter } = GlobalCharacter.getState();
  const { worldId: owid } = focusedCharacter || focusedLocation || {};
  const worldId = owid || focusedWorld?.id;
  const formData: Partial<CreateCharacterData> = { worldId };
  if (focusedCharacter) {
    formData.id = focusedCharacter.id;
    formData.authorId = focusedCharacter.authorId;
    formData.image = focusedCharacter.image;
    formData.description = focusedCharacter.description;
    formData.name = focusedCharacter.name;
    formData.locationId = focusedCharacter.locationId;
  }
  if (!formData.locationId && focusedLocation) {
    formData.locationId = focusedLocation.id;
  }
  return formData;
};

/** Create or edit a `Character` */
const CreateCharacterForm = (props: CreateCharacterProps) => {
  const { onChange = noOp, onImageFile = noOp } = props;
  const { id: userId } = useGlobalUser(["id"]);
  const data = initialFormData();
  const { authorId, id: charId } = data;
  const [formData, setFormData] = useState<Partial<CreateCharacterData>>(data);
  const role = useMemo<UserRole>(() => {
    return !charId || (authorId && userId === authorId) ? "Author" : "Reader";
  }, [userId, data]);
  const update = (updates: Partial<CreateCharacterData>) => {
    setFormData(updates);
    onChange(updates);
  };
  const onDescription = (d: string) => update({ ...formData, description: d });
  const onWorldId = (worldId?: number | null) =>
    update({ ...formData, worldId: worldId || undefined });
  const onLocationId = (locationId?: number | null) =>
    update({ ...formData, locationId: locationId || undefined });
  const onName = (e: ChangeEvent<HTMLInputElement>) => {
    update({ ...formData, name: e.target.value });
  };

  useEffect(() => {
    update(data);
  }, []);

  return (
    <Form>
      {formData.id && (
        <Legend>
          Edit <span className="accent--text">{formData.name}</span>
        </Legend>
      )}
      {role === "Reader" ? (
        <Hint>
          <b className="error--text">
            Editing disabled: you don't own this character.
          </b>
          <br />
          You can link any of your own characters to it, if they are in the same
          world.
          <hr />
        </Hint>
      ) : (
        <Hint>
          A <b>Character</b> is <b>a significant, recurring actor</b> in your
          story.{" "}
        </Hint>
      )}

      {/* Name */}
      <Label direction="column">
        <span className="label required">Character Name</span>
        <Input
          disabled={role === "Reader"}
          placeholder="Tog Omarai"
          type="text"
          value={formData.name || ""}
          onChange={onName}
        />
      </Label>

      {/* Origin Universe/Realm */}
      <Label direction="column">
        <span className="label required">
          Where is{" "}
          <span className="accent--text">
            {formData.name || "your character"}
          </span>{" "}
          from?
        </span>
        <Hint>
          Select the <b>Universe</b> or <b>Realm</b> of this character's origin.
        </Hint>

        <FormRow columns="repeat(2, 1fr)">
          <SelectParentWorld
            onChange={onWorldId}
            placeholder="Select a universe/realm:"
            value={formData.worldId || ""}
          />
          {formData.worldId && (
            <SelectParentLocation
              onChange={onLocationId}
              worldId={formData.worldId}
              value={formData.locationId || ""}
            />
          )}
        </FormRow>
      </Label>

      {/* Description */}
      <FormRow columns="3fr 1fr">
        <Label direction="column">
          <span className="label">Description</span>
          <Textarea
            disabled={role === "Reader"}
            rows={300}
            value={formData.description || ""}
            onChange={(e) => onDescription(e.target.value)}
          />
        </Label>
        <ImageUploader
          type="Character"
          src={data.image}
          onImageFile={onImageFile}
        />
      </FormRow>

      <Hint>Describe your character as a series of short writing-prompts.</Hint>
    </Form>
  );
};

export default CreateCharacterForm;
