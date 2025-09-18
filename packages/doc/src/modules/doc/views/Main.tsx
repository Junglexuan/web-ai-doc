import {Dispatch, Switch, connectStore} from '@elux/react-web';
import {FC} from 'react';
import ErrorPage from '@/components/ErrorPage';
import {APPState} from '@/Global';
import {CurRender, CurView, ItemDetail, ListItem, ListSearch, ListSummary} from '../entity';
import Conts from './Conts';
import Edit from './Edit';
import Favs from './Favs';
import Maintain from './Maintain';
import Recs from './Recs';
import Tpls from './Tpls';
import WordEdit from './WordEdit';

export interface StoreProps {
  curView?: CurView;
  curRender?: CurRender;
  itemDetail?: ItemDetail;
  listSearch?: ListSearch;
  list?: ListItem[];
  listSummary?: ListSummary;
}

function mapStateToProps(appState: APPState): StoreProps {
  const {curView, curRender, itemDetail, list, listSearch, listSummary} = appState.doc!;
  return {curView, curRender, itemDetail, list, listSearch, listSummary};
}

const Component: FC<StoreProps & {dispatch: Dispatch}> = ({curView, curRender, itemDetail, listSearch, list, listSummary, dispatch}) => {
  return (
    <Switch elseView={<ErrorPage />}>
      {curView === 'list' &&
        curRender === 'maintain' &&
        (listSummary ? <Maintain dispatch={dispatch} listSearch={listSearch!} list={list!} listSummary={listSummary!} /> : <div></div>)}
      {curView === 'list' &&
        curRender === 'favs' &&
        (listSummary ? <Favs dispatch={dispatch} listSearch={listSearch!} list={list!} listSummary={listSummary!} /> : <div></div>)}
      {curView === 'list' &&
        curRender === 'recs' &&
        (listSummary ? <Recs dispatch={dispatch} listSearch={listSearch!} list={list!} listSummary={listSummary!} /> : <div></div>)}
      {curView === 'list' &&
        curRender === 'tpls' &&
        (listSummary ? <Tpls dispatch={dispatch} listSearch={listSearch!} list={list!} listSummary={listSummary!} /> : <div></div>)}
      {curView === 'list' &&
        curRender === 'conts' &&
        (listSummary ? <Conts dispatch={dispatch} listSearch={listSearch!} list={list!} listSummary={listSummary!} /> : <div></div>)}
      {curView === 'item' &&
        (itemDetail ? itemDetail.format === '2' ? <WordEdit itemDetail={itemDetail} /> : <Edit itemDetail={itemDetail} /> : <div></div>)}
    </Switch>
  );
};

export default connectStore(mapStateToProps)(Component);
