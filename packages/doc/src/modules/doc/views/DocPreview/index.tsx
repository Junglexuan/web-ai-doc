import {FC, memo} from 'react';

interface Props {
  content: string;
}

const Component: FC<Props> = ({content}) => {
  return <div className="w-editor-preview" style={{width: '80%', margin: 'auto'}} dangerouslySetInnerHTML={{__html: content}} />;
};

export default memo(Component);
