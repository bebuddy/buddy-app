export type FeedItem = {
  id: string;
  category: string;
  location: string;
  title: string;
  content: string;
  hasImage?: boolean;
};

export type ArticleRandomRes = {
  category: string;
  title: string;
  location: string;
  name?: string;
  birth_date?: string;   // "1970-01-01"
  imageUrlL?: string;
};