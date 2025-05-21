import type {Text} from 'slate';

export type ReviewElement = {
  type: 'review';
  reason: string;
  target: string;
  source: string;
  children: Text[];
};
