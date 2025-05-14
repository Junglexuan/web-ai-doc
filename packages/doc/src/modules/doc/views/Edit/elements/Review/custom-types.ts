type EmptyText = {
  text: '';
};

export type ReviewElement = {
  type: 'review';
  reason: string;
  target: string;
  source: string;
  children: EmptyText[];
};
