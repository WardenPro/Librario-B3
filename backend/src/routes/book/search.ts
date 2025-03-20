import { app } from "../..";
import { db } from "../../app/config/database";
import { books } from "../../db/schema/book";
import { checkTokenMiddleware } from "../../app/middlewares/verify_jwt";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../app/utils/AppError";
import { and, eq, like, gte, lte, desc, asc, SQL, sql } from "drizzle-orm";

interface BookFilterParams {
    title?: string;
    author?: string;
    category?: string;
    publisher?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
}

app.get(
    "/books/search",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters: BookFilterParams = {
                title: req.query.title as string,
                author: req.query.author as string,
                category: req.query.category as string,
                publisher: req.query.publisher as string,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                sortBy: req.query.sortBy as string || "title",
                sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
                limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
                offset: req.query.offset ? parseInt(req.query.offset as string) : 0
            };

            const filterConditions: SQL[] = [];

            if (filters.title) {
                filterConditions.push(like(books.title, `%${filters.title}%`));
            }

            if (filters.author) {
                filterConditions.push(like(books.author, `%${filters.author}%`));
            }

            if (filters.category) {
                filterConditions.push(like(books.category, `%${filters.category}%`));
            }

            if (filters.publisher) {
                filterConditions.push(like(books.publisher, `%${filters.publisher}%`));
            }

            if (filters.startDate) {
                filterConditions.push(gte(books.publish_date, filters.startDate));
            }

            if (filters.endDate) {
                filterConditions.push(lte(books.publish_date, filters.endDate));
            }

            filterConditions.push(eq(books.is_removed, false));

            const whereCondition = and(...filterConditions);

            let orderByClause;
            
            if (filters.sortBy === "title") {
                orderByClause = filters.sortOrder === "desc" ? desc(books.title) : asc(books.title);
            } else if (filters.sortBy === "author") {
                orderByClause = filters.sortOrder === "desc" ? desc(books.author) : asc(books.author);
            } else if (filters.sortBy === "publisher") {
                orderByClause = filters.sortOrder === "desc" ? desc(books.publisher) : asc(books.publisher);
            } else if (filters.sortBy === "publish_date") {
                orderByClause = filters.sortOrder === "desc" ? desc(books.publish_date) : asc(books.publish_date);
            } else if (filters.sortBy === "category") {
                orderByClause = filters.sortOrder === "desc" ? desc(books.category) : asc(books.category);
            } else {
                orderByClause = asc(books.title);
            }

            const searchResults = await db
                .select()
                .from(books)
                .where(whereCondition)
                .orderBy(orderByClause)
                .limit(filters.limit || 20)
                .offset(filters.offset || 0);

            const countQuery = db
                .select({ count: sql`COUNT(*)`.mapWith(Number) })
                .from(books)
                .where(whereCondition);

            const [countResult] = await countQuery;
            const totalCount = countResult?.count || 0;

            res.status(200).json({
                data: searchResults,
                pagination: {
                    total: totalCount,
                    limit: filters.limit || 20,
                    offset: filters.offset || 0,
                    pages: Math.ceil(totalCount / (filters.limit || 20))
                }
            });
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while searching books", 500, error)
            );
        }
    }
);

app.get(
    "/books/categories",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await db
                .select({ category: books.category })
                .from(books)
                .where(eq(books.is_removed, false))
                .groupBy(books.category)
                .orderBy(asc(books.category));

            const categoryList = categories.map(item => item.category);
            
            res.status(200).json(categoryList);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while retrieving book categories", 500, error)
            );
        }
    }
);

app.get(
    "/books/publishers",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const publishers = await db
                .select({ publisher: books.publisher })
                .from(books)
                .where(eq(books.is_removed, false))
                .groupBy(books.publisher)
                .orderBy(asc(books.publisher));

            const publisherList = publishers.map(item => item.publisher);
            
            res.status(200).json(publisherList);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while retrieving book publishers", 500, error)
            );
        }
    }
);

app.get(
    "/books/authors",
    checkTokenMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authors = await db
                .select({ author: books.author })
                .from(books)
                .where(eq(books.is_removed, false))
                .groupBy(books.author)
                .orderBy(asc(books.author));

            const authorList = authors.map(item => item.author);
            
            res.status(200).json(authorList);
        } catch (error) {
            if (error instanceof AppError) return next(error);
            return next(
                new AppError("Error while retrieving book authors", 500, error)
            );
        }
    }
);