import {EyeOutlined} from '@ant-design/icons';
import {DocumentHead, connectStore} from '@elux/react-web';
import {Carousel, Empty} from 'antd';
import {FC, MouseEvent, useEffect, useMemo, useState} from 'react';
import {PathPrefix, SiteInfo} from '@/Global';
import DocAPI from '@/modules/doc/api';
import Preview from '@/modules/doc/views/Preview';
import Wizard, {WizardFormData} from '@/modules/doc/views/Wizard';
import {openArticle, useEvent} from '@/utils/tools';
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
const RECENT_CREATIONS_LIMIT = 5;

const Component: FC = () => {
  const [wizardData, setWizardData] = useState<WizardFormData>();
  const [hotArticleList, setHotArticleList] = useState<HotArticle[]>([]);
  const [hotTemplateList, setHotTemplateList] = useState<HotTemplate[]>([]);
  const [previewTpl, setPreviewTpl] = useState<HotTemplate>();

  const getHotArticeList = useEvent(async () => {
    const _articleList = await HomeAPI.getHotArticleList(RECENT_CREATIONS_LIMIT);
    setHotArticleList(_articleList);
  });
  const getHotTemplateList = useEvent(async () => {
    const _templateList = await HomeAPI.getHotTemplateList();
    setHotTemplateList(_templateList);
  });

  const onCreateByTpl = useEvent((tplId: string, fields?: {[field: string]: string}, knowledges?: string[], stand?: string, isContract?: boolean) => {
    DocAPI.getDoc(tplId).then((tpl) => {
      DocAPI.createDoc({folder: isContract ? '1' : '0', title: tpl.title, contents: ''}, 'doc').then(async ({id}) => {
        window.sessionStorage.setItem('__temp_tpl__', JSON.stringify({id: tplId, fields, knowledges, stand}));
        openArticle(`/admin/doc/item/edit/${id}?&tpl=${tpl.id}&__c=_dialog`);
      });
    });
  });

  const onApplyTpl = useEvent((tplId: string, isContract?: boolean) => {
    DocAPI.getTplFields(tplId).then((fields) => {
      setWizardData({tplId, fields, isContract});
    });
  });

  const onWizardSubmit = useEvent(
    (tplId: string, fields: {[field: string]: string}, knowledges: string[], standpoint: string, isContract?: boolean) => {
      setWizardData(undefined);
      onCreateByTpl(tplId, fields, knowledges, standpoint, isContract);
    }
  );

  const onShowDetail = useEvent((evt: MouseEvent, id: string) => {
    openArticle(`/admin/doc/item/edit/${id}?__c=_dialog`);
  });

  const renderHotArticle = useMemo(() => {
    // 获取最近创作的项目
    if (!hotArticleList.length) {
      return <Empty />;
    }
    return (
      <div className="recent-creations">
        {hotArticleList.map((item, index) => (
          <a key={index} className="creation-item" title={item.title} onClick={(e) => onShowDetail(e, item.id)}>
            <div className="title" title={item.title}>
              {item.title}
            </div>
            <div className="content" title={item.levelPath}>
              {item.levelPath}
            </div>
          </a>
        ))}
      </div>
    );
  }, [hotArticleList, onShowDetail]);

  const renderHotTemplate = useMemo(() => {
    return (
      <div className="popular-creations">
        {hotTemplateList.map((item, index) => (
          <div key={index} className="creation-item">
            <div className="icon-title">
              <div className={'icon' + (item.isShare && ` share`)}></div>
              <div className="title">{item.title}</div>
            </div>
            <div className="description" title={item.remark}>
              {item.remark}
            </div>
            <div className={'mask ' + styles.mask} title={item.remark}>
              <div className="ant-btn view" onClick={() => setPreviewTpl(item)}>
                <EyeOutlined />
              </div>
              <div
                className="ant-btn use"
                onClick={() => {
                  onApplyTpl(item.id, item.isContract);
                }}
              >
                立即使用
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [hotTemplateList, onApplyTpl]);

  const renderCarousel = useMemo(() => {
    //carouselItems
    return (
      <Carousel dots={false} dotPosition="bottom" autoplay={true} rootClassName={'carousel'}>
        {carouselItems.map((item, index) => (
          <div key={index}>
            <div className="carousel-item" style={{backgroundImage: `url(${PathPrefix + item.url})`}}></div>
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
        <DocumentHead title={'首页-' + SiteInfo.name} />
        {renderCarousel}
        <div className="title-box">最近创作</div>
        {renderHotArticle}
        <div className="title-box" style={{marginBottom: '10px'}}>
          热门创作类型
        </div>
        {renderHotTemplate}
      </div>
      {wizardData && <Wizard data={wizardData} onCancel={() => setWizardData(undefined)} onSubmit={onWizardSubmit} />}
      {previewTpl && (
        <Preview tplId={previewTpl.id} onCancel={() => setPreviewTpl(undefined)} onApply={() => onApplyTpl(previewTpl.id, previewTpl.isContract)} />
      )}
    </div>
  );
};

export default connectStore()(Component);
