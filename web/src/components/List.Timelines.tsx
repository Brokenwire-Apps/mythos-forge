import styled from "styled-components";
import { Card, CardTitle } from "components/Common/Containers";
import { ButtonWithIcon } from "components/Forms/Button";
import ListView from "components/Common/ListView";
import TimelineItem from "components/TimelineItem";
import { useGlobalModal } from "hooks/GlobalModal";
import { APIData, Timeline } from "utils/types";
import { useGlobalUser } from "hooks/GlobalUser";
import { GlobalWorld } from "state";
import { SharedButtonProps } from "components/Forms/Button.Helpers";

const AddTimelineButton = styled(ButtonWithIcon)`
  align-self: end;
`;
const EmptyText = styled.p`
  font-style: oblique;
`;
const List = styled(ListView)`
  margin: ${({ theme }) => theme.sizes.md} 0;
`;

type TimelinesListProps = {
  timelines?: APIData<Timeline>[];
  focusedTimeline?: APIData<Timeline> | null;
  className?: string;
};

/** @component List of timelines */
const TimelinesList = (props: TimelinesListProps) => {
  const { timelines = [], className } = props;
  const { id: userId, authenticated } = useGlobalUser(["id", "authenticated"]);
  const { setGlobalModal, MODAL } = useGlobalModal();
  const onEditTimeline = (timeline: APIData<Timeline>) => {
    GlobalWorld.focusedTimeline(timeline);
    setGlobalModal(MODAL.MANAGE_TIMELINE);
  };
  const controls = (variant: SharedButtonProps["variant"] = "outlined") =>
    authenticated && (
      <AddTimelineButton
        size="lg"
        icon="timeline"
        text="Create New Timeline"
        variant={variant}
        onClick={() => setGlobalModal(MODAL.MANAGE_TIMELINE)}
      />
    );

  return (
    <>
      <Card className={className}>
        <CardTitle>Timelines</CardTitle>

        {/* Empty List message */}
        {!timelines.length && (
          <EmptyText>
            Before <b>Events</b> or even <b>Time</b> existed, there was only the{" "}
            <b>Creator</b>.
          </EmptyText>
        )}

        {/* List */}
        <List
          data={timelines}
          dummyFirstItem={timelines.length > 5 && controls("transparent")}
          dummyLastItem={controls()}
          itemText={(timeline: APIData<Timeline>) => (
            <TimelineItem
              timeline={timeline}
              onEdit={onEditTimeline}
              permissions={timeline.authorId === userId ? "Author" : "Reader"}
            />
          )}
        />
      </Card>
    </>
  );
};

export default TimelinesList;
