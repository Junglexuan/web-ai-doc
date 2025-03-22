// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'dayjs';
import React from 'react';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

interface Props {
  date: string | number;
}
const Component: React.FC<Props> = ({date}) => {
  return <>{date ? moment(date).format(dateFormat) : ''}</>;
};

export default React.memo(Component);
