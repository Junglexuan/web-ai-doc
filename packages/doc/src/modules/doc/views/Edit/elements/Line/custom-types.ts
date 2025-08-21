type EmptyText = {
  text: '';
};

export type LineElement = {
  type: 'line';
  color: string;
  weight: string;
  children: EmptyText[];
};
