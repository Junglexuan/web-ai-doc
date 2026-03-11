import {Dispatch, Switch, connectStore} from '@elux/react-web';
import {FC} from 'react';
import ErrorPage from '@/components/ErrorPage';
import {APPState} from '@/Global';
import {CurRender, CurView, ItemDetail, ListItem, ListSearch, ListSummary} from '../entity';
import Item from './Item';
import Maintain from './Maintain';
import MyTemplate from './MyTemplate';
import Trace from './Trace';

export interface StoreProps {
  curView?: CurView;
  curRender?: CurRender;
  itemDetail?: ItemDetail;
  listSearch?: ListSearch;
  list?: ListItem[];
  listSummary?: ListSummary;
}

function mapStateToProps(appState: APPState): StoreProps {
  const {curView, curRender, itemDetail, list, listSearch, listSummary} = appState.dueDiligence!;
  return {curView, curRender, itemDetail, list, listSearch, listSummary};
}

const Component: FC<StoreProps & {dispatch: Dispatch}> = ({curView, curRender, itemDetail, listSearch, list, listSummary, dispatch}) => {
  console.log('itemDetail: ', itemDetail);
  return (
    <Switch elseView={<ErrorPage />}>
      {curView === 'list' &&
        curRender === 'maintain' &&
        (listSummary ? <Maintain dispatch={dispatch} listSearch={listSearch!} list={list!} listSummary={listSummary!} /> : <div></div>)}
      {curView === 'list' && curRender === 'tpl' && <MyTemplate dispatch={dispatch} />}
      {curView === 'list' && curRender === 'trace' && <Trace />}
      {curView === 'item' &&
        (itemDetail ? <Item itemDetail={itemDetail} dispatch={dispatch} /> : <div style={{background: '#fff', width: '100%', height: '100%'}}></div>)}
    </Switch>
  );
};

export default connectStore(mapStateToProps)(Component);
