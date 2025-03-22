import React from 'react';

interface Props {
  value?: any;
  options?: {value: any; label: string}[];
}
const Component: React.FC<Props> = ({value, options}) => {
  let text: string = value === undefined ? '' : value + '';
  if (options) {
    const map = new Map(options.map((item) => [item.value, item.label]));
    const valueArr = Array.isArray(value) ? value : [value];
    text = valueArr.map((value) => map.get(value)).join(',');
  } else if (value && typeof value === 'object') {
    text = JSON.stringify(value);
  }
  return <span>{text || '-'}</span>;
};

export default React.memo(Component);
