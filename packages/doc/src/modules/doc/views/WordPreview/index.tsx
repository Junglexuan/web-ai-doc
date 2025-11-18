import {DocumentEditor} from '@onlyoffice/document-editor-react';
import {FC, memo} from 'react';

const onDocumentReady = function (event: any) {
  console.log('Document is loaded');
};

const onLoadComponentError = function (errorCode: number, errorDescription: string) {
  switch (errorCode) {
    case -1: // Unknown error loading component
      console.log(errorDescription);
      break;

    case -2: // Error load DocsAPI from http://documentserver/
      console.log(errorDescription);
      break;

    case -3: // DocsAPI is not defined
      console.log(errorDescription);
      break;
  }
};
interface Props {
  url: string;
}
const Component: FC<Props> = ({url}) => {
  return (
    <>
      <DocumentEditor
        id="docxEditor"
        documentServerUrl="http://113.44.121.105:9981/"
        config={{
          document: {
            fileType: 'docx',
            key: 'Khirz6zTPdfd7',
            title: 'Example Document Title.docx',
            url: 'http://113.44.121.105:9000/template/20251115/file1763172310210.docx',
          },
          documentType: 'word',
          editorConfig: {
            callbackUrl: 'http://113.44.121.105:4000/track?fileName=new.docx&userAddress=',
          },
          events: {
            onDocumentReady: onDocumentReady,
          },
        }}
        onLoadComponentError={onLoadComponentError}
      />
    </>
  );
};

export default memo(Component);
