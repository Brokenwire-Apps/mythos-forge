import manifest from "../../package.json";
import { UserRole } from "./types";

export * from "./constants.books";
export const APP_VERSION = manifest.version;
export const APP_VERSION_KEY = "appv";
export const API_BASE = "http://localhost:4001";
export const API_AUTH_ROUTE = `${API_BASE}/authenticated`;
export const API_DL_BOOK_ROUTE = `${API_BASE}/books/:bookId/download`;
export const API_PROMPT = `${API_BASE}/books/writing-prompt`;
export const GRAPHQL_URL = `${API_BASE}/graphql`;
export const USER_ROLES: UserRole[] = ["Author", "Reader"];
