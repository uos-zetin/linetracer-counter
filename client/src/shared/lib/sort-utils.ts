interface HasCreatedAt {
  createdAt: Date;
}

export const sortByCreatedAtDesc = (a: HasCreatedAt, b: HasCreatedAt): number => {
  return b.createdAt.getTime() - a.createdAt.getTime();
};
