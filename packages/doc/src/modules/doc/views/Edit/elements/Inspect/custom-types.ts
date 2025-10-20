import type {Text} from 'slate';

export type InspectElement = {
  type: 'inspect';
  raw: string;
  tag: string;
  ignore: string;
  children: Text[];
};
