export type Book = {
    id: number;
    title: string;
    author: string;
    ISBN_10: string | null;
    ISBN_13: string | null;
    description: string;
    printType: string;
    category: string;
    publisher: string;
    quantity: number;
    language: string;
    pageCount: number;
    publish_date: string;
    image_link: string | null;
  };
  
  export type Copy = {
    copy_id: number;
    state: string;
    is_reserved: boolean;
    is_claimed: boolean;
    book_id: number;
    review_condition: string[] | null;
  };
  
  export type Review = {
    id: number;
    book_id: number;
    user_id: number;
    description: string;
    note: number;
    user?: {
      first_name: string;
      last_name: string;
    };
  };
  
  export type Pagination = {
    total: number;
    page: number;
    itemsPerPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  
  export type User = {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };