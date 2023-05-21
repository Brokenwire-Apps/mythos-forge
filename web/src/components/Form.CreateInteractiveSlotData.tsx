import { noOp } from "../utils";
import { Hint, Input, Label, Select, Textarea } from "components/Forms/Form";
import {
  ExplorationTemplateEvent,
  SlotAction,
  SlotInteractionData
} from "utils/types";
import { GlobalExploration } from "state";
import { Accent } from "./Common/Containers";

export type SlotDataFormProps = {
  /** User-event (click or drag) */
  event: ExplorationTemplateEvent;
  /** Action triggered by event */
  action: SlotAction;
  /** Any data required to perform action */
  value?: SlotInteractionData;
  /** Notify parent on change */
  onChange?: (data: SlotInteractionData) => void;
};

/** @form Create or edit data for an `Interactive Slot` in an `Exploration` template */
const CreateInteractiveSlotDataForm = (props: SlotDataFormProps) => {
  const { value: data = {}, onChange = noOp, event, action } = props;
  const { exploration, explorationScene } = GlobalExploration.getState();
  const { Scenes = [] } = exploration || {};
  const otherScenes = Scenes.filter((s) => s.id !== explorationScene?.id);
  const clearNavTarget = () => {
    onChange({ ...data, target: undefined, text: undefined });
  };
  const updateNavTarget = (target: number) => {
    if (!target || isNaN(target)) return clearNavTarget();
    const sc = otherScenes.find((s) => s.id === target);
    const text = sc?.title;
    onChange({ ...data, target, text });
  };
  const updateActionText = (text?: string) => {
    onChange({ ...data, text });
  };

  return (
    <>
      {action === SlotAction.NAV_SCENE && (
        <Label columns="auto">
          <span className="label flex">Navigate to Scene:</span>
          <Hint>
            Navigate to a new scene when you <Accent as="b">{event}</Accent>{" "}
            this slot.
          </Hint>
          <Select
            aria-invalid={!data.target}
            data={otherScenes}
            value={data?.target || ""}
            itemText={(s) => s.title}
            itemValue={(s) => s.id}
            emptyMessage="No scenes loaded!"
            placeholder="Select target scene:"
            onChange={(s) => updateNavTarget(Number(s))}
          />
        </Label>
      )}

      {action === SlotAction.SHOW_TEXT && (
        <Label columns="auto">
          <span className="label flex">Enter text to show:</span>
          <Hint>
            Show character dialogue or an item description when you{" "}
            <Accent as="b">{event}</Accent> this slot..
          </Hint>
          <Textarea
            aria-invalid={!data.text}
            value={data?.text || ""}
            placeholder="e.g. 'The walls look old and worn.'"
            onChange={({ target }) => updateActionText(target.value)}
          />
        </Label>
      )}

      {action === SlotAction.CHOOSE && (
        <>
          <Label columns="auto">
            <span className="label flex">Enter Question:</span>
            <Hint>What will the player be asked?</Hint>
            <Input
              aria-invalid={!data.text}
              value={data?.text || ""}
              placeholder="e.g. 'What is red and blue and green all over?'"
              onChange={({ target }) => updateActionText(target.value)}
            />
          </Label>

          <Label columns="auto">
            <span className="label flex">Enter choices:</span>
            <Hint>
              Define how the player may respond, and consequences of each
              response. A consequence is an <Accent>action</Accent> like the one
              you are creating right now.
            </Hint>
            <Textarea
              aria-invalid={!data.text}
              value={data?.text || ""}
              placeholder="e.g. 'The walls look old and worn.'"
              // onChange={({ target }) => updateActionText(target.value)}
            />
          </Label>
        </>
      )}
    </>
  );
};

export default CreateInteractiveSlotDataForm;