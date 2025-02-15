import { ChangeEvent, useEffect } from "react";
import { noOp } from "../utils";
import { Form, Hint, Input, Label, Legend } from "components/Forms/Form";
import { CreateTimelineData } from "graphql/requests/timelines.graphql";
import { useGlobalWorld } from "hooks/GlobalWorld";
import SelectParentWorld from "./SelectParentWorld";

export type CreateTimelineProps = {
  data?: Partial<CreateTimelineData>;
  onChange?: (data: Partial<CreateTimelineData>) => void;
};

/** Create or edit a `Timeline` */
const CreateTimelineForm = (props: CreateTimelineProps) => {
  const { data, onChange = noOp } = props;
  const { focusedWorld } = useGlobalWorld(["focusedWorld"]);
  const updateOrigin = (id: number | null) => {
    const worldId = id === null || isNaN(id) ? focusedWorld?.id : id;
    onChange({ ...data, worldId });
  };
  const updateName = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, name: e.target.value });
  };

  useEffect(() => {
    if (!data?.worldId && focusedWorld?.id) {
      updateOrigin(focusedWorld.id);
    }
  }, []);

  return (
    <Form>
      <Legend>
        {data?.id ? "Edit" : "New"}{" "}
        <span className="accent--text">Timeline</span>
      </Legend>
      <Hint>
        A <b>Timeline</b> is <b>a collection of unique events</b>. Use them to
        experiment with different historical backgrounds and outcomes for your
        characters.
      </Hint>

      {/* Name */}
      <Label direction="column">
        <span className="label required">Name</span>
        <Input
          placeholder="e.g. Utopian timeline"
          type="text"
          value={data?.name || ""}
          onChange={updateName}
        />
      </Label>
      <Hint>Enter a name for your timeline (e.g. "The Utopian one")</Hint>

      {/* Origin Universe/Realm */}
      <Label direction="column">
        <span className="label required">Timeline occurs in:</span>
        <SelectParentWorld
          placeholder="Select Timeline Target:"
          value={data?.worldId || ""}
          onChange={updateOrigin}
        />
      </Label>
      <Hint>
        Where will this happen? Select the <b>Universe</b> or <b>Realm</b> that
        will be the event-source for this timeline.
      </Hint>
    </Form>
  );
};

export default CreateTimelineForm;
