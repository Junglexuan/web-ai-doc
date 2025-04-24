import {DocumentHead, Link, connectStore} from '@elux/react-web';
import {Carousel} from 'antd';
import {FC, useEffect, useMemo, useState} from 'react';
import {GetClientRouter} from '@/Global';
import DocAPI from '@/modules/doc/api';
import {message, useEvent} from '@/utils/tools';
import HomeAPI from '../api';
import {HotArticle, HotTemplate} from '../entity';
import styles from './index.module.less';
// 定义轮播图数据的枚举CarouselItems
const carouselItems = [
  {
    title: '第一张轮播图',
    url: '',
  },
  {
    title: '第二张轮播图',
    url: '',
  },
  {
    title: '第三张轮播图',
    url: '',
  },
  {
    title: '第四张轮播图',
    url: '',
  },
];
// 定义最近创作的数量
const RECENT_CREATIONS_LIMIT = 4;

const popularCreations = [
  {icon: 'path/to/icon1.png', title: '类型1', description: '这是类型1的描述，最多显示三行内容。'},
  {icon: 'path/to/icon2.png', title: '类型2', description: '这是类型2的描述，最多显示三行内容。'},
  {icon: 'path/to/icon1.png', title: '类型1', description: '这是类型1的描述，最多显示三行内容。'},
  {icon: 'path/to/icon2.png', title: '类型2', description: '这是类型2的描述，最多显示三行内容。'},
  {icon: 'path/to/icon1.png', title: '类型1', description: '这是类型1的描述，最多显示三行内容。'},
  {icon: 'path/to/icon2.png', title: '类型2', description: '这是类型2的描述，最多显示三行内容。'},
  // Add more items as needed
];

const Component: FC = () => {
  const [loading, setLoading] = useState<'create' | ''>('');
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
  const onCreateByTpl = useEvent(async (item: HotTemplate) => {
    setLoading('create');
    DocAPI.createDoc({folder: '0', title: item.name, contents: item.contents})
      .then(({id}) => {
        GetClientRouter().push({url: `/admin/doc/item/edit/${id}?__c=_dialog`}, 'window');
      })
      .catch((e) => {
        message.error(e + '');
      })
      .finally(() => setLoading(''));
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
          <div key={index} className="creation-item" onClick={() => onCreateByTpl(item)}>
            <div className="icon-title">
              <div className="icon">{item.name.charAt(0)}</div>
              <div className="title">{item.name}</div>
            </div>
            <div className="description" title={item.remark}>
              {item.remark}
            </div>
          </div>
        ))}
      </div>
    );
  }, [hotTemplateList, onCreateByTpl]);

  const renderCarousel = useMemo(() => {
    //carouselItems
    return (
      <Carousel dots={true} dotPosition="bottom" autoplay={true} rootClassName={'carousel'}>
        {carouselItems.map((Item, index) => (
          <div key={index} className={'carousel-item'}>
            <h3>轮播图一</h3>
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
    <div className={styles.root}>
      <DocumentHead title="首页" />
      {renderCarousel}
      <div className="title-box">最近创作</div>
      {renderHotArticle}
      <div className="title-box">热门创作类型</div>
      {renderHotTemplate}
    </div>
  );
};

export default connectStore()(Component);
