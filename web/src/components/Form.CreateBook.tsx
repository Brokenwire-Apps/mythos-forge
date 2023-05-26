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
import { UpsertBookData } from "graphql/requests/books.graphql";
import LitCategory from "./Form.LitCategory";
import { WritingPrompt } from "./WritingPrompt";
import ImageUploader from "./Forms/ImageUploader";

export type CreateBookProps = {
  data?: Partial<UpsertBookData>;
  onChange?: (data: Partial<UpsertBookData>) => void;
  onCoverImage?: (data: File | undefined) => void;
};

/** Create or edit a `Book` */
const CreateBookForm = (props: CreateBookProps) => {
  const { data, onChange = noOp, onCoverImage = noOp } = props;
  const updatePublic = (e: boolean) =>
    onChange({ ...data, public: e || false });
  const updatePrice = (price = 0.0) => onChange({ ...data, price });
  const updateDescription = (description: string) => {
    onChange({ ...data, description });
  };
  const updateTitle = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, title: e.target.value });
  };

  return (
    <Form>
      {data?.id && (
        <>
          <Legend>
            Edit <b className="accent--text">{data.title}</b>
          </Legend>
          <hr />
        </>
      )}

      {/* Cover Image + Name */}

      {/* Name */}
      <Label direction="column">
        <span className="label required">
          Book <span className="accent--text">Title</span>
        </span>
        <Hint>Enter your exciting (or working) title here.</Hint>
        <Input
          placeholder="Omarai: Rise of the Reborn"
          type="text"
          value={data?.title || ""}
          onChange={updateTitle}
        />
      </Label>
      <hr />

      {/* Description */}
      <FormRow columns="3fr 1fr">
        <div>
          <Label direction="column">
            <span className="label required">Summary</span>
            <Hint>
              <b>This will become your publicly-visible summary</b>.
            </Hint>
            <Textarea
              rows={300}
              style={{ width: "100%" }}
              value={data?.description || ""}
              onChange={({ target }) => updateDescription(target.value)}
            />
          </Label>

          {!data?.description && (
            <WritingPrompt
              onPrompt={updateDescription}
              additionalData={{ ...data, type: "book" }}
              buttonText="Get description ideas"
            />
          )}
        </div>

        {/* Cover Image */}
        <ImageUploader src={data?.image} onImageFile={onCoverImage} />
      </FormRow>
      <hr />

      {/* Genre */}
      <LitCategory
        value={data}
        onChange={(details) => onChange({ ...data, ...details })}
      />
      <hr />

      {/* Public/Private | Free/Paid */}
      <FormRow columns="repeat(2, 1fr)">
        {/* Public/Private */}
        <Label direction="column">
          <span className="label required">
            Is this book <b className="accent--text">public</b>?
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
          <Hint>
            <b>Private</b> books won't appear in search results.
          </Hint>
        </Label>

        {/* Free/Paid */}
        <Label direction="column">
          <span className="label">
            Book <span className="accent--text">Price</span>
          </span>
          <Input
            placeholder="0.99"
            type="number"
            value={data?.price || ""}
            onChange={({ target }) => updatePrice(target.valueAsNumber)}
          />
          <Hint>Leave blank to keep the book free.</Hint>
        </Label>
      </FormRow>
    </Form>
  );
};

export default CreateBookForm;
