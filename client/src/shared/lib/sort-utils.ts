interface HasCreatedAt {
  createdAt: Date;
}

export const sortByCreatedAtAsc = (a: HasCreatedAt, b: HasCreatedAt): number => {
  return a.createdAt.getTime() - b.createdAt.getTime();
};

export const sortByCreatedAtDesc = (a: HasCreatedAt, b: HasCreatedAt): number => {
  return b.createdAt.getTime() - a.createdAt.getTime();
};
