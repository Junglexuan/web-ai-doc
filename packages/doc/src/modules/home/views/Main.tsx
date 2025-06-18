import {DocumentHead, Link, connectStore} from '@elux/react-web';
import {Carousel} from 'antd';
import {FC, useEffect, useMemo, useState} from 'react';
import {GetClientRouter} from '@/Global';
import {PathPrefix} from '@/Global';
import DocAPI from '@/modules/doc/api';
import Wizard, {WizardFormData} from '@/modules/doc/views/Wizard';
import {useEvent} from '@/utils/tools';
import HomeAPI from '../api';
import {HotArticle, HotTemplate} from '../entity';
import styles from './index.module.less';
// 定义轮播图数据的枚举CarouselItems
const carouselItems = [
  {
    title: '',
    url: '/client/ad/home-banner1.png',
  },
];
// 定义最近创作的数量
const RECENT_CREATIONS_LIMIT = 4;

const Component: FC = () => {
  const [wizardData, setWizardData] = useState<WizardFormData>();
  const [hotArticleList, setHotArticleList] = useState<HotArticle[]>([]);
  const [hotTemplateList, setHotTemplateList] = useState<HotTemplate[]>([]);

  const getHotArticeList = useEvent(async () => {
    const _articleList = await HomeAPI.getHotArticleList(RECENT_CREATIONS_LIMIT);
    setHotArticleList(_articleList);
  });
  const getHotTemplateList = useEvent(async () => {
    const _templateList = await HomeAPI.getHotTemplateList();
    setHotTemplateList(_templateList);
  });

  const onCreateByTpl = useEvent((tplId: string, fields?: {[field: string]: string}) => {
    DocAPI.getDoc({id: tplId, render: 'tpl'}).then((tpl) => {
      DocAPI.createDoc({folder: '0', title: tpl.title, contents: ''}).then(async ({id}) => {
        window.sessionStorage.setItem('__temp_tpl__', JSON.stringify({id: tplId, fields}));
        GetClientRouter().push({url: `/admin/doc/item/edit/${id}?&tpl=${tpl.id}&__c=_dialog`}, 'window');
      });
    });
  });

  const onApplyTpl = useEvent((tplId: string) => {
    DocAPI.getTplFields(tplId).then((fields) => {
      if (fields.length) {
        setWizardData({tplId, fields});
      } else {
        onCreateByTpl(tplId);
      }
    });
  });

  const onWizardSubmit = useEvent(({__tplId, ...fields}: {__tplId: string; [field: string]: string}) => {
    setWizardData(undefined);
    onCreateByTpl(__tplId, fields);
  });

  const renderHotArticle = useMemo(() => {
    // 获取最近创作的项目
    return (
      <div className="recent-creations">
        {hotArticleList.map((item, index) => (
          <Link
            key={index}
            className="creation-item"
            title={item.title}
            to={`/admin/doc/item/edit/${item.id}`}
            action="push"
            target="window"
            cname="_dialog"
          >
            <div className="title" title={item.title}>
              {item.title}
            </div>
            <div className="content" title={item.levelPath}>
              {item.levelPath}
            </div>
          </Link>
        ))}
      </div>
    );
  }, [hotArticleList]);

  const renderHotTemplate = useMemo(() => {
    return (
      <div className="popular-creations">
        {hotTemplateList.map((item, index) => (
          <div key={index} className="creation-item" onClick={() => onApplyTpl(item.id)}>
            <div className="icon-title">
              <div className="icon">{item.title.charAt(0)}</div>
              <div className="title">{item.title}</div>
            </div>
            <div className="description" title={item.remark}>
              {item.remark}
            </div>
          </div>
        ))}
      </div>
    );
  }, [hotTemplateList, onApplyTpl]);

  const renderCarousel = useMemo(() => {
    //carouselItems
    return (
      <Carousel dots={true} dotPosition="bottom" autoplay={true} rootClassName={'carousel'}>
        {carouselItems.map((item, index) => (
          <div key={index} className={'carousel-item'}>
            <div style={{backgroundImage: `url(${PathPrefix + item.url})`}}></div>
          </div>
        ))}
      </Carousel>
    );
  }, []);

  useEffect(() => {
    getHotArticeList();
    getHotTemplateList();
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.root}>
        <DocumentHead title="首页" />
        {renderCarousel}
        <div className="title-box">最近创作</div>
        {renderHotArticle}
        <div className="title-box">热门创作类型</div>
        {renderHotTemplate}
      </div>
      {wizardData && <Wizard data={wizardData} onCancel={() => setWizardData(undefined)} onsubmit={onWizardSubmit} />}
    </div>
  );
};

export default connectStore()(Component);
