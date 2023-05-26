import { ChangeEvent } from "react";
import { noOp } from "../utils";
import {
  Form,
  FormRow,
  Hint,
  Input,
  Label,
  Legend,
  RadioInput,
  RadioLabel,
  Textarea
} from "components/Forms/Form";
import { UpsertExplorationInput } from "graphql/requests/explorations.graphql";
import SelectParentWorld from "./SelectParentWorld";
import SelectParentLocation from "./SelectParentLocation";
import { WritingPrompt } from "./WritingPrompt";
import { Accent } from "./Common/Containers";
import ImageUploader from "./Forms/ImageUploader";

export type CreateExplorationProps = {
  data?: Partial<UpsertExplorationInput>;
  onChange?: (data: Partial<UpsertExplorationInput>) => void;
  onCoverImage?: (data: File | undefined) => void;
};

/** Create or edit an `Exploration` */
const CreateExplorationForm = (props: CreateExplorationProps) => {
  const { data, onChange = noOp, onCoverImage = noOp } = props;
  const updatePublic = (e: boolean) =>
    onChange({ ...data, public: e || false });
  const updateDescr = (d: string) => onChange({ ...data, description: d });
  const updateLocation = (i: number) => onChange({ ...data, locationId: i });
  const updatePrice = (price: number = 0.0) => onChange({ ...data, price });
  const updateWorld = (i: number | null) =>
    onChange({ ...data, worldId: i || undefined });
  const updateTitle = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, title: e.target.value });
  };

  return (
    <Form>
      {/* Name */}
      <Label direction="column">
        <span className="label required">
          Exploration <span className="accent--text">Title</span>
        </span>
        <Input
          placeholder="The Frigid Sands of North Omarai"
          type="text"
          value={data?.title || ""}
          onChange={updateTitle}
        />
      </Label>
      <Hint>Enter your exciting (or working) title here.</Hint>
      <hr />

      {/* Description */}
      <FormRow columns="3fr 1fr">
        <Label direction="column">
          <span className="label required">Summary</span>
          <Textarea
            rows={300}
            style={{ width: "100%" }}
            value={data?.description || ""}
            onChange={({ target }) => updateDescr(target.value)}
          />
          {!data?.description && (
            <WritingPrompt
              additionalData={data}
              buttonText="Get description ideas"
              onPrompt={updateDescr}
            />
          )}
        </Label>
        <ImageUploader src={data?.image} onImageFile={onCoverImage} />
      </FormRow>
      <Hint>
        <b>This is your publicly-visible summary</b>. You can enter prompts,
        ideas, or leave this blank until the Exploration is made public.
      </Hint>
      <hr />

      <FormRow columns="repeat(2,1fr)">
        {/* World */}
        <Label direction="column">
          <span className="label">
            <b className="accent--text">World</b>:
          </span>
          <SelectParentWorld
            placeholder="Select world:"
            value={data?.worldId || ""}
            onChange={updateWorld}
          />
        </Label>

        {/* Location */}
        {data?.worldId && (
          <Label direction="column">
            <span className="label">
              <b className="accent--text">Location</b>:
            </span>
            <SelectParentLocation
              worldId={data.worldId}
              value={data.locationId || ""}
              onChange={updateLocation}
            />
          </Label>
        )}
      </FormRow>
      <hr />

      {/* Public/Private | Free/Paid */}
      <FormRow columns="repeat(2, 1fr)">
        <Label direction="column">
          <span className="label">
            Is this <b className="accent--text">public</b>?
          </span>

          <FormRow>
            <RadioLabel>
              <span>Public</span>
              <RadioInput
                checked={data?.public || false}
                name="isPublic"
                onChange={() => updatePublic(true)}
              />
            </RadioLabel>
            <RadioLabel>
              <span>Private</span>
              <RadioInput
                checked={!data?.public}
                name="isPublic"
                onChange={() => updatePublic(false)}
              />
            </RadioLabel>
          </FormRow>
        </Label>

        {/* Free/Paid */}
        <Label direction="column">
          <span className="label">
            Exploration <b className="accent--text">Price</b>?
          </span>
          <Input
            placeholder="0.00"
            type="text"
            value={data?.price || ""}
            onChange={({ target }) => updatePrice(Number(target.value))}
          />
        </Label>
      </FormRow>
      {data?.public ? (
        <Hint>
          <b className="accent--text">Public:</b> Other users can access the{" "}
          exploration
        </Hint>
      ) : (
        <Hint>
          <b className="accent--text">Private:</b> only you can see this{" "}
          exploration
        </Hint>
      )}
      <Hint>
        Leave <b>price</b> blank to keep this <Accent>Exploration</Accent> free.
      </Hint>
    </Form>
  );
};

export default CreateExplorationForm;
