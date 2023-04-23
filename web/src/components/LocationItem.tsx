import { APIData, UserRole, Location, World, Richness } from "utils/types";
import { noOp, requireAuthor } from "utils";
import {
  ItemGridContainer,
  ItemDescription,
  ItemName,
  MatIcon
} from "components/Common/Containers";
import { TallIcon } from "./ComponentIcons";
import ListView from "./Common/ListView";
import styled from "styled-components";
import { useMemo } from "react";
import { GlobalUser } from "state";

type LocationItemProps = {
  world: APIData<World>;
  location: APIData<Location>;
  childLocations?: APIData<Location>[];
  onEdit?: (w: APIData<Location>) => void;
  onSelect?: (w: APIData<Location>) => void;
  permissions?: UserRole;
};

const LocationContainer = styled(ItemGridContainer)`
  .child-locations {
    grid-column: 1 / -1;
    grid-row: 4 / 6;
  }
`;

const LocationItem = ({
  world,
  location,
  childLocations = [],
  onSelect = noOp,
  onEdit = noOp
}: LocationItemProps) => {
  const { public: isPublic } = world;
  const { id: authorId } = GlobalUser.getState();
  const isAuthor = location.authorId === authorId;
  const permissions: UserRole = isAuthor ? "Author" : "Reader";
  const iconClass = isPublic ? "icon success--text" : "icon error--text";
  const title = isPublic ? "Public Location" : "Private Location";
  const edit = requireAuthor(() => onEdit(location), permissions);
  const select = requireAuthor(() => onSelect(location), permissions);
  const icon = useMemo(() => {
    if (!isAuthor) return "lock";
    return location.parentLocationId ? "pin_drop" : "map";
  }, [location]);

  return (
    <LocationContainer onClick={select} permissions={permissions}>
      <TallIcon
        icon={icon}
        permissions={permissions}
        className={iconClass}
        title={title}
      />

      <ItemName permissions={permissions} onClick={edit}>
        {location.name}
        {permissions === "Author" && <MatIcon className="icon" icon="edit" />}
      </ItemName>
      <ItemDescription
        dangerouslySetInnerHTML={locationDescription(location, childLocations)}
      />

      {/* Child Locations */}
      {childLocations.length > 0 && (
        <ListView
          className="child-locations"
          data={childLocations}
          itemText={(l) => (
            <LocationItem
              world={world}
              location={l}
              onEdit={onEdit}
              onSelect={onSelect}
              permissions={permissions}
            />
          )}
        />
      )}
    </LocationContainer>
  );
};

export default LocationItem;

/* HELPER */

/** Describe a location by its qualities */
function locationDescription(location: Location, childLocations: Location[]) {
  const children = childLocations.length;
  const childCount = children
    ? ` (${children} ${children === 1 ? "place" : "places"})`
    : "";
  const toHTML = (str: string) => ({ __html: `${childCount} ${str}` });
  if (location.description !== "No description.")
    return toHTML(location.description);

  const abundance = (lbl: string, rch: Richness) => {
    switch (rch) {
      case "Abundant":
        return `abundant ${lbl}`;
      case "Sparse":
        return `no ${lbl}`;
      case "Adequate":
      default:
        return `normal ${lbl}`;
    }
  };

  const { climate, flora, fauna } = location;
  const sameFloraFauna = flora === fauna;
  const floraDescription = abundance("vegetation", flora);
  const climateDescription = `${climate} climate`;
  const floraFauna = sameFloraFauna
    ? `${floraDescription} and animals`
    : `${floraDescription} and ${fauna.toLowerCase()} wildlife`;

  return toHTML(`${climateDescription} with ${floraFauna}.`);
}
