import {connectStore} from '@elux/react-web';
import {FC} from 'react';

const Component: FC = () => {
  return <div>home</div>;
};

export default connectStore()(Component);
