import ApplyReplace from './ApplyReplace';
import ReviewList from './ReviewList';
import UnReplace from './UnReplace';

const applyReplaceMenuConf = {
  key: 'applyReplace',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  factory() {
    return new ApplyReplace();
  },
};

const unReplaceMenuConf = {
  key: 'unReplace',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  factory() {
    return new UnReplace();
  },
};

const reviewListMenuConf = {
  key: 'reviewList',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  factory() {
    return new ReviewList();
  },
};

export {applyReplaceMenuConf, unReplaceMenuConf, reviewListMenuConf};
