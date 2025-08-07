import type {Text} from 'slate';

export type InspectElement = {
  type: 'inspect';
  reason: string;
  target: string;
  source: string;
  level: string;
  children: Text[];
};
