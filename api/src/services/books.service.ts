/**
 * @file Books.Service
 * @description Database helper service for `Book` model
 */
import { Prisma, Book } from "@prisma/client";
import { context } from "../graphql/context";
import { DateTime } from "luxon";

export type BookUpsertInput = Prisma.BookUpsertArgs["create"] &
  Prisma.BookUpsertArgs["update"] & { id?: Book["id"] };
type SearchBookInput = Partial<
  Pick<
    Book,
    | "title"
    | "authorId"
    | "description"
    | "free"
    | "public"
    | "genre"
    | "seriesId"
  >
> & { id?: Book["id"][]; published?: boolean };

const { Books, Chapters, Scenes } = context;

/** create or update `Book` record */
export async function upsertBook(book: BookUpsertInput) {
  const data = { ...book };
  const now = DateTime.now().toISO();
  data.created = book.created || now;
  data.lastUpdated = DateTime.now().toISO();

  return book.id
    ? Books.update({ data, where: { id: book.id } })
    : Books.create({ data });
}

/** create or update `Book` records */
export async function upsertBooks(books: BookUpsertInput[]) {
  return Promise.all(books.map(upsertBook));
}

/** find all `Book` records matching params */
export async function findAllBooks(filters: SearchBookInput) {
  const where: Prisma.BookWhereInput = { public: filters.public };
  where.OR = [];
  if (filters.id) where.id = { in: filters.id };
  if (filters.authorId) {
    where.OR.push(
      { public: true },
      { authorId: filters.authorId, public: false }
    );
  } else where.OR.push({ public: true });
  if (filters.seriesId) where.seriesId = filters.seriesId;
  if (filters.title) where.title = { contains: filters.title };
  if (filters.description)
    where.description = { contains: filters.description };

  if (filters.published) {
    where.publishDate = { lte: DateTime.now().toISO() };
  }

  if (filters.genre) {
    where.OR = [];
    where.OR.push({ genre: { contains: filters.genre } });
  }

  return Books.findMany({
    where,
    include: { Author: true, Chapters: { orderBy: { order: "asc" } } }
  });
}

/** find all published `Book` records matching params */
export async function findAllPublishedBooks(filters: SearchBookInput) {
  const where: Prisma.BookWhereInput = {};
  where.publishDate = { lte: DateTime.now().toISO() };
  if (filters.id) where.id = { in: filters.id };
  if (filters.seriesId) where.seriesId = filters.seriesId;
  if (filters.title) where.title = { contains: filters.title };
  if (filters.description)
    where.description = { contains: filters.description };

  if (filters.genre) {
    where.OR = [];
    where.OR.push({ genre: { contains: filters.genre } });
  }

  return Books.findMany({
    where,
    include: { Author: true, Chapters: { orderBy: { order: "asc" } } }
  });
}

/** find one `Book` record matching params */
export async function getBookById(id: Book["id"]) {
  return Books.findUnique({
    where: { id },
    include: {
      Author: true,
      Chapters: { include: { Scenes: true }, orderBy: { order: "asc" } }
    }
  });
}

/** delete one `Book` record matching params */
export async function deleteBookById(id: Book["id"]) {
  return Books.delete({
    where: { id },
    include: { Author: true, Chapters: true }
  });
}

/** Verify a `Book` record contains some content */
export async function checkBookHasContent(book: Book) {
  // require at least one chapter
  const chapters = await Chapters.findMany({
    where: { bookId: book.id },
    orderBy: { description: "asc" },
    take: 1
  });
  if (!chapters?.length) throw new Error("Book does not contain any chapters");

  // require at least one scene
  const scenes = await Scenes.findMany({
    where: { chapterId: chapters[0].id },
    take: 1
  });
  if (!scenes?.length) throw new Error("Book does not contain any scenes");
  return true;
}

/** Prep data for db insertion */
export function pruneBookData(book: any, i = 0) {
  const pruned = {
    id: book.id || undefined,
    order: book.order || i + 1,
    authorId: book.authorId || undefined,
    free: book.free || false,
    public: book.public || false,
    seriesId: book.seriesId || undefined,
    description: book.description || "No description",
    genre: book.genre || "No genre",
    title: book.title || "Untitled"
  };

  return pruned;
}