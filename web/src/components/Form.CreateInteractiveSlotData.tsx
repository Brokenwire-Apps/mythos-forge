import { noOp } from "../utils";
import {
  Fieldset,
  FormRow,
  Hint,
  Input,
  Label,
  Legend,
  Select,
  Textarea
} from "components/Forms/Form";
import {
  ExplorationTemplateEvent,
  SlotAction,
  SlotInteractionChoice,
  SlotInteractionData,
  explorationTemplateActions
} from "utils/types";
import { GlobalExploration } from "state";
import { Accent, Selectable } from "./Common/Containers";
import MatIcon from "./Common/MatIcon";
import Button, { RoundButton, WideButton } from "./Forms/Button";
import { Fragment, useMemo, useState } from "react";
import styled from "styled-components";
import {
  DIFFICULTY,
  DIFFICULTY_NAMES,
  playerAttributes
} from "state/explorations.player";
import { newActionData } from "routes/ExplorationBuilder.Helpers";

export type SlotDataFormProps = {
  /** Nesting depth */
  depth?: number;
  /** User-event (click or drag) */
  event: ExplorationTemplateEvent;
  /** Action triggered by event */
  action: SlotAction;
  /** Any data required to perform action */
  value?: SlotInteractionData;
  /** Notify parent on change */
  onChange?: (data?: SlotInteractionData) => void;
  /** Notify parent on change */
  onRemove?: () => void;
};

const Container = styled(FormRow)`
  .form--interactive-slot-data {
    .form--interactive-slot-data {
      border-left: 1px dashed ${({ theme }) => theme.colors.accent};
      margin-bottom: 0.4rem;
      padding-bottom: 0.4rem;
      padding-left: 0.4rem;
    }

    &.slide-out-up {
      position: absolute;
      pointer-events: none;
    }
  }
`;

const MAX_DEPTH = 4;
const supported = [
  SlotAction.NAV_SCENE,
  SlotAction.NAV_EXPLORATION,
  SlotAction.SHOW_TEXT,
  SlotAction.CHOICE,
  SlotAction.CHECK_ATTR
];

/** @form Create or edit data for an `Interactive Slot` in an `Exploration` template */
const CreateInteractiveSlotDataForm = (props: SlotDataFormProps) => {
  const {
    value: data = {},
    onChange = noOp,
    onRemove = noOp,
    event,
    action,
    depth = 0
  } = props;
  const exState = GlobalExploration.getState();
  const { exploration, explorations = [], explorationScene } = exState;
  const localExplorations = explorations.filter(
    (e) => e.worldId === exploration?.worldId && e.id !== exploration?.id
  );
  const { Scenes = [] } = exploration || {};
  const { choices = [] } = data;
  const excludedAtDepth = new Set([SlotAction.CHOICE, SlotAction.CHECK_ATTR]);
  const actionsForDepth =
    depth < MAX_DEPTH - 1
      ? explorationTemplateActions
      : explorationTemplateActions.filter((a) => !excludedAtDepth.has(a));
  const otherScenes = Scenes.filter((s) => s.id !== explorationScene?.id);
  const [expanded, expand] = useState(supported.includes(action));
  const clearNavTarget = () => {
    onChange({ ...data, target: undefined, text: undefined });
  };
  const updateExplorationTarget = (target: number) => {
    if (!target || isNaN(target)) return clearNavTarget();
    const sc = localExplorations.find((s) => s.id === target);
    const text = sc?.title;
    onChange({ ...data, target, text });
  };
  const updateNavTarget = (target: number) => {
    if (!target || isNaN(target)) return clearNavTarget();
    const sc = otherScenes.find((s) => s.id === target);
    const text = sc?.title;
    onChange({ ...data, target, text });
  };
  const updateActionText = (text?: string) => onChange({ ...data, text });
  const updateActionTarget = (target?: number) => onChange({ ...data, target });
  const updateChoices = (ch: SlotInteractionChoice, i: number) => {
    const newChoices = [...choices];
    newChoices[i] = ch;
    onChange({ ...data, choices: newChoices });
  };
  const removeChoice = (ci: number) => {
    const newChoices = [...choices];
    newChoices.splice(ci, 1);
    onChange({ ...data, choices: newChoices });
  };
  const updateChoiceText = (t: string, ci: number) => {
    updateChoices({ ...choices[ci], text: t }, ci);
  };
  const updateChoiceAction = (a: SlotAction, ci: number) => {
    const oldAction = choices?.[ci];
    const next = oldAction?.action === a ? oldAction.data : newActionData(a);
    updateChoices({ ...choices[ci], action: a, data: next }, ci);
  };
  const updateChoiceData = (ci: number, d?: SlotInteractionData) => {
    updateChoices({ ...choices[ci], data: d }, ci);
  };
  const addDummyChoice = () => {
    const choice: SlotInteractionChoice = {
      text: "Enter text",
      action: SlotAction.NONE,
      data: {} as SlotInteractionData
    };
    onChange({ ...data, choices: [...choices, choice] });
  };
  const className = useMemo(() => {
    const anim = expanded ? "slide-in-down" : "slide-out-up";
    return `form--interactive-slot-data ${anim}`;
  }, [expanded]);
  const toggleExpanded = () => expand(!expanded);
  const Controls = (
    <FormRow columns="repeat(2, 1fr)" gap="0.5rem">
      <Button
        disabled={!supported.includes(action)}
        variant={"outlined"}
        type="button"
        size="sm"
        onClick={toggleExpanded}
      >
        <MatIcon icon={expanded ? "expand_less" : "expand_more"} />
        <Accent as="b">&nbsp;Show Options</Accent>
      </Button>
      <Button
        disabled={!supported.includes(action)}
        variant={"transparent"}
        className="error--text"
        type="button"
        size="sm"
        onClick={onRemove}
      >
        <MatIcon icon={"delete"} />
        &nbsp;Remove Action
      </Button>
    </FormRow>
  );

  return (
    <Container columns="1fr" gap="0.4rem">
      {!expanded && Controls}

      <span className={className}>
        <Fieldset>
          <Legend className="accent--text">
            <Selectable onClick={toggleExpanded}>
              {action}&nbsp;
              <span className="grey--text" style={{ fontSize: "smaller" }}>
                (hide)
              </span>
            </Selectable>
          </Legend>
          {action === SlotAction.NAV_SCENE && (
            <Label columns="auto">
              <span className="label flex">
                Navigate to a new&nbsp;<Accent as="b">Scene</Accent>:
              </span>
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
              <Hint>
                Navigate to a{" "}
                <Accent as="b">
                  new scene in the current <b>Exploration</b>
                </Accent>{" "}
                when you <Accent as="b">{event}</Accent> this slot.
              </Hint>
            </Label>
          )}

          {action === SlotAction.NAV_EXPLORATION && (
            <Label columns="auto">
              <span className="label flex">Go to Exploration:</span>
              <Select
                aria-invalid={!data.target}
                data={localExplorations}
                value={data?.target || ""}
                itemText={(s) => s.title}
                itemValue={(s) => s.id}
                emptyMessage="No other Explorations found!"
                placeholder="Select Exploration:"
                onChange={(s) => updateExplorationTarget(Number(s))}
              />
              <Hint>
                Navigate to a <Accent as="b">new Exploration</Accent> when you{" "}
                <Accent as="b">{event}</Accent> this slot.
              </Hint>
            </Label>
          )}

          {action === SlotAction.SHOW_TEXT && (
            <Label columns="auto">
              <span className="label flex">Enter text to show:</span>
              <Textarea
                aria-invalid={!data.text}
                value={data?.text || ""}
                placeholder="e.g. 'The walls look old and worn.'"
                onChange={({ target }) => updateActionText(target.value)}
              />
              <Hint>
                Show <Accent as="b">character dialogue</Accent> or an{" "}
                <Accent as="b">item description</Accent> when you{" "}
                <Accent as="b">{event}</Accent> this slot..
              </Hint>
            </Label>
          )}

          {[SlotAction.CHOICE, SlotAction.CHECK_ATTR].includes(action) && (
            <>
              {action === SlotAction.CHOICE && (
                <>
                  <Label columns="auto">
                    <span className="label flex">
                      Enter&nbsp;<Accent>Question</Accent>:
                    </span>
                    <Hint>Describe this action for the viewer.</Hint>
                    <Input
                      aria-invalid={!data.text}
                      value={data?.text || ""}
                      placeholder="e.g. 'What is red and blue and green all over?'"
                      onChange={({ target }) => updateActionText(target.value)}
                    />
                  </Label>

                  <Hint>
                    Give the player options to respond, and{" "}
                    <Accent>consequences</Accent> for each response.
                  </Hint>
                </>
              )}

              {action === SlotAction.CHECK_ATTR && (
                <>
                  <FormRow columns="repeat(2, 1fr)">
                    <Label columns="auto">
                      <span className="label flex">
                        Select&nbsp;<Accent>Attribute</Accent>:
                      </span>
                      <Hint>
                        Select a <Accent>user attribute</Accent> to check.
                      </Hint>

                      <Select
                        data={playerAttributes}
                        value={data?.text || ""}
                        itemText={(d) => d}
                        itemValue={(d) => d}
                        emptyMessage="No attributes loaded!"
                        placeholder="Select attribute:"
                        onChange={updateActionText}
                      />
                    </Label>

                    <Label columns="auto">
                      <span className="label flex">
                        Select&nbsp;<Accent>Difficulty</Accent>:
                      </span>
                      <Hint>
                        Select how <Accent>difficult</Accent> this will be for
                        the player.
                      </Hint>

                      <Select
                        data={DIFFICULTY_NAMES}
                        value={data?.target || ""}
                        itemText={(d) => d}
                        itemValue={(d: keyof typeof DIFFICULTY) =>
                          DIFFICULTY[d]
                        }
                        emptyMessage="No difficulties loaded!"
                        placeholder="Select difficulty:"
                        onChange={(t) =>
                          t ? updateActionTarget(Number(t)) : undefined
                        }
                      />
                    </Label>
                  </FormRow>

                  <Hint>
                    This will perform a <Accent as="b">dice roll</Accent>{" "}
                    against the player's attribute. Define what happens when the
                    roll <Accent as="b">succeeds</Accent> or{" "}
                    <Accent as="b">fails</Accent> below.
                  </Hint>
                </>
              )}

              {choices.length > 0 && <hr className="transparent" />}

              {choices.map((choice, i) => (
                <Fragment key={i}>
                  <FormRow columns="repeat(2, 1fr)" gap="0.6rem">
                    <Label columns="auto">
                      {action === SlotAction.CHECK_ATTR ? (
                        <span className="label flex">
                          Event&nbsp;<Accent>Outcome</Accent>:
                        </span>
                      ) : (
                        <span className="label flex">
                          Player&nbsp;<Accent>Response</Accent>:
                        </span>
                      )}
                      <Input
                        aria-invalid={!choice.text}
                        disabled={action === SlotAction.CHECK_ATTR}
                        value={choice.text || ""}
                        placeholder="e.g. 'A worried cat'"
                        onChange={({ target }) =>
                          updateChoiceText(target.value, i)
                        }
                      />
                    </Label>

                    <Label columns="auto">
                      <span className="label flex">
                        <MatIcon icon="filter_vintage" />
                        &nbsp;<Accent>Consequence</Accent>:
                      </span>

                      <Select
                        data={actionsForDepth}
                        value={choice.action || ""}
                        itemText={(d) => d}
                        itemValue={(d) => d}
                        emptyMessage="No actions loaded!"
                        placeholder="Select action:"
                        onChange={(a) => updateChoiceAction(a, i)}
                      />
                    </Label>
                  </FormRow>

                  {depth < MAX_DEPTH ? (
                    <CreateInteractiveSlotDataForm
                      event={ExplorationTemplateEvent.CLICK}
                      action={choice.action || SlotAction.NONE}
                      depth={depth + 1}
                      value={choice.data}
                      onChange={(d) => updateChoiceData(i, d)}
                      onRemove={() => removeChoice(i)}
                    />
                  ) : (
                    <Hint className="error--text">
                      <MatIcon icon="warning" />
                      &nbsp;Maximum depth reached.
                    </Hint>
                  )}
                </Fragment>
              ))}

              {action === SlotAction.CHOICE && (
                <Button
                  className="wide"
                  type="button"
                  size="sm"
                  onClick={addDummyChoice}
                >
                  <MatIcon icon="filter_vintage" />
                  Add response
                </Button>
              )}
            </>
          )}
        </Fieldset>
      </span>
    </Container>
  );
};

export default CreateInteractiveSlotDataForm;
