import createState from "@jackcom/raphsducks";
import { UserRole, NullableString } from "utils/types";

/**
 * Your global application state `instance`. Every property in `initialState`
 * will become a method the state `instance`, so e.g. to update `appsCount`, you
 * call `store.appsCount( number )`. You can create as many state instances as
 * you need.
 */
export const GlobalUser = createState({
  authenticated: false,
  initialized: false,
  loading: false,
  id: -1 as number,
  email: null as NullableString,
  error: null as NullableString,
  role: "Reader" as UserRole,
  lastSeen: ""
});

export type MicroUser = { id: number; email: string; role: UserRole };
export type GlobalUserInstance = ReturnType<typeof GlobalUser.getState>;
export type GlobalUserInstanceKey = keyof GlobalUserInstance;
