import ApplyReplace from './ApplyReplace';
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

export {applyReplaceMenuConf, unReplaceMenuConf};
