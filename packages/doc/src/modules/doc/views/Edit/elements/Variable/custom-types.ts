type EmptyText = {
  text: '';
};

export type VariableElement = {
  type: 'variable';
  kind: string;
  source: string;
  info: string;
  children: EmptyText[];
};
