import {FC, memo} from 'react';
import {SitesUrl} from '@/Global';

interface Props {
  url: string;
}

const Component: FC<Props> = ({url}) => {
  return <iframe style={{border: 'none', width: '100%', height: '100%'}} src={`${SitesUrl.preview}?url=${encodeURIComponent(btoa(url))}`} />;
};

export default memo(Component);
