import ColourLineMenu from './ColourLineMenu';
import InsertLineMenu from './InsertLineMenu';
import WeightLineMenu from './WeightLineMenu';

const colourLineMenuConf = {
  key: 'lineColor',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  factory() {
    return new ColourLineMenu();
  },
};

const insertLineMenuConf = {
  key: 'line',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  factory() {
    return new InsertLineMenu();
  },
};

const weightLineMenuConf = {
  key: 'lineWeight',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  factory() {
    return new WeightLineMenu();
  },
};

export {insertLineMenuConf, colourLineMenuConf, weightLineMenuConf};
