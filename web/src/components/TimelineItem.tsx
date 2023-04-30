import styled from "styled-components";
import { APIData, UserRole, Timeline } from "utils/types";
import { requireAuthor, noOp } from "utils";
import {
  ItemDescription,
  ItemName,
  ItemLinkContainer,
  MatIcon
} from "components/Common/Containers";
import { Hint } from "components/Forms/Form";
import { TallIcon } from "./ComponentIcons";
import { Paths, insertId } from "routes";
import { TimelineItemEventIcon } from "./TimelineItem.EventIcon";

const TimelineWorld = styled(Hint)`
  ${({ theme }) => theme.mixins.lineclamp(1)};
  align-self: center;
  font-size: 0.72rem;
  grid-column: 3;
  grid-row: 1/3;
  text-align: right;
  text-transform: uppercase;
  width: 100%;
`;

type TimelineItemProps = {
  timeline: APIData<Timeline>;
  onEdit?: (w: APIData<Timeline>) => void;
  onSelect?: (w: APIData<Timeline>) => void;
  permissions?: UserRole;
};

/** @component A single `Timeline` created by a user */
const TimelineItem = ({
  timeline,
  onSelect = undefined,
  onEdit = noOp,
  permissions = "Reader"
}: TimelineItemProps) => {
  const { public: isPublic = false } = timeline.World || {};
  const colorClass = isPublic ? "success--text" : "grey--text";
  const title = `${isPublic ? "Public" : "Private"} Timeline`;
  const url = insertId(Paths.Timelines.Events.path, timeline.id);
  const edit = requireAuthor(() => onEdit(timeline), permissions);
  const select =
    onSelect &&
    (((e) => {
      e.stopPropagation();
      onSelect(timeline);
    }) as React.MouseEventHandler);
  const events = timeline.TimelineEvents || [];

  return (
    <ItemLinkContainer to={url} permissions={permissions}>
      <TallIcon
        icon={permissions === "Author" ? "timeline" : "lock"}
        permissions={permissions}
        className={`icon ${colorClass}`}
        title={title}
      />

      <ItemName permissions={permissions} onClick={edit}>
        {timeline.name}
        {permissions === "Author" && <MatIcon className="icon" icon="edit" />}
      </ItemName>
      <ItemDescription>
        {events.map((e, i) => (
          <TimelineItemEventIcon
            key={e.id}
            data={e}
            last={i === events.length - 1}
          />
        ))}
      </ItemDescription>
      <TimelineWorld
        className={colorClass}
        children={timelineDescription(timeline)}
      />
    </ItemLinkContainer>
  );
};

export default TimelineItem;

/* HELPER */

/** Describe a timeline by its qualities */
function timelineDescription(timeline: Timeline) {
  if (timeline.World) return timeline.World.name;
}
