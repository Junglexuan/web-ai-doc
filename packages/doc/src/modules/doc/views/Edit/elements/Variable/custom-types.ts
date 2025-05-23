import type {Text} from 'slate';

export type VariableElement = {
  type: 'variable';
  kind: string;
  source: string;
  info: string;
  children: Text[];
};
