import type {Text} from 'slate';

export type VariableElement = {
  type: 'variable';
  kind: string;
  source: string;
  info: string;
  field?: string;
  children: Text[];
};
