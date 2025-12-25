import {DownOutlined, PlusOutlined, UpOutlined} from '@ant-design/icons';
import {Button, Form, Input, Space, Upload, message} from 'antd';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import agentCheckedIcon from '@/assets/agent/agent-checked.png';
import DocUploads from '../../components/DocUploads';
import IconSelect from '../../components/IconSelect';
import Questions from '../../components/Questions';
import TplSelect from '../../components/TplSelect';
import {DueConfigs, ListItem} from '../../entity';
import styles from './index.module.less';

// 定义图标类型
export interface IconItem {
  id: number;
  path: string;
  relativePath: string;
}

const Component: FC<{
  configs: DueConfigs;
  data: Partial<ListItem>;
  lastSelectedIconIndex: number;
  onIconSelect: (index: number) => void;
  onCancel: () => void;
  onSubmit: (data: ListItem) => void;
}> = ({configs, data, lastSelectedIconIndex, onIconSelect, onCancel, onSubmit}) => {
  console.log(data);
  const [form] = Form.useForm();
  const [setting, setSetting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // 初始化时处理已有的logo值
  useEffect(() => {
    if (data?.logo) {
      // 判断是否是base64格式
      if (data.logo.startsWith('data:')) {
        setUploadedImage(data.logo);
        setSelectedIcon(data.logo);
      } else {
        // 相对路径，设置为选中的图标
        setSelectedIcon(data.logo);
      }
    }
  }, [data?.logo]);

  // 复用通用转换函数
  const convertImgToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('无效的图片文件'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };
  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('请上传图片文件');
      return false;
    }

    try {
      const imageUrl = await convertImgToBase64(file);
      console.log('imageUrl: handleFileUpload=', imageUrl);
      setUploadedImage(imageUrl);
      setSelectedIcon(imageUrl);
      // 上传图片时，将图标索引设置为特殊值（表示自定义图片）
      localStorage.setItem('lastSelectedIconIndex', 'custom');
      // 更新表单中的图标字段
      form.setFieldsValue({logo: imageUrl});
    } catch (error) {
      message.error('图片处理失败');
      console.error('图片处理失败:', error);
    }

    return false; // 阻止默认上传行为
  };

  const agentIcons = useMemo((): IconItem[] => {
    return Array.from({length: 5}, (_, index) => ({
      id: index + 1,
      path: require(`@/assets/agent/${index + 1}.png`),
      relativePath: `agent/${index + 1}.png`,
    }));
  }, []);

  const handleIconClick = (icon: IconItem) => {
    setSelectedIcon(icon.relativePath);
    // 通知父组件更新选择的图标索引
    onIconSelect(icon.id - 1);
    // 更新表单中的图标字段
    form.setFieldsValue({logo: icon.relativePath});
  };

  // 将图片转换为base64格式
  const imageToBase64 = async (imagePath: string): Promise<string> => {
    // 如果已经是base64格式，直接返回
    if (imagePath.startsWith('data:image')) {
      return imagePath;
    }

    try {
      // 查找对应的agentIcons对象
      const iconObj = agentIcons.find((icon) => icon.relativePath === imagePath);
      if (iconObj) {
        // 使用预加载的图片资源
        const response = await fetch(iconObj.path);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      // 对于其他相对路径，我们假设它们已经可以在项目中直接访问
      // 实际项目中，你可能需要将相对路径转换为绝对URL
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // 2. 将响应转换为Blob对象
      const blob = await response.blob();
      // 3. 使用FileReader将Blob转换为Base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('图片转换失败:', error);
      return '';
    }
  };

  const handleCreateAgent = async (data: any) => {
    try {
      let iconBase64 = '';

      // 优先处理选中的图标（包括新选择的图标）
      if (selectedIcon) {
        const iconObj = agentIcons.find((icon) => icon.relativePath === selectedIcon);
        if (iconObj) {
          // 确保将选中的图标转换为base64
          iconBase64 = await imageToBase64(selectedIcon);
        } else {
          // 处理上传的图片或非标准图标
          iconBase64 = selectedIcon.startsWith('data:') ? selectedIcon : await imageToBase64(selectedIcon);
        }
      }
      // 如果没有选中图标，再处理上传的图片
      else if (uploadedImage) {
        iconBase64 = uploadedImage;
      }

      // 将表单数据和图标信息传递给外部处理
      const formData = {
        ...data,
        logo: iconBase64,
      };

      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (error) {
      console.error('创建尽调失败:', error);
      message.error('操作失败，请重试');
    }
  };

  return (
    <div className={styles.root}>
      <div className="bd">
        <Form
          labelCol={{span: 5}}
          wrapperCol={{span: 18}}
          initialValues={{...data, logo: data?.logo || ''}}
          preserve={false}
          form={form}
          onFinish={(values) => {
            console.log('values: ', values);
            handleCreateAgent(values);
          }}
        >
          <Form.Item name="name" label="尽调对象" rules={[{required: true}]}>
            <Input maxLength={64} placeholder="请输入尽调对象名称" />
          </Form.Item>
          <Form.Item name="logo" label="企业图标">
            {/* <IconSelect /> */}
            <div className={styles.createAgentIcons}>
              <Upload accept="image/*" showUploadList={false} beforeUpload={handleFileUpload} className={styles.picture}>
                <div className={styles.uploadIconBox}>
                  <PlusOutlined style={{fontSize: '30px'}} color="#85888F" />
                </div>
              </Upload>
              {uploadedImage && (
                <div
                  className={`${styles.uploadedImageBox} ${selectedIcon === uploadedImage ? styles.active : ''}`}
                  onClick={() => setSelectedIcon(uploadedImage)}
                >
                  <img src={uploadedImage} alt="上传的图标" className={styles.uploadedImage} />
                  {selectedIcon === uploadedImage && <img src={agentCheckedIcon} alt="agent-checked" className={styles.agentChecked} />}
                </div>
              )}
              {agentIcons.map((item, index) => (
                <div
                  key={index}
                  className={selectedIcon === item.relativePath ? `${styles.createAgentAvatar} ${styles.active}` : styles.createAgentAvatar}
                >
                  <img src={item.path} alt={String(index + 1)} onClick={() => handleIconClick(item)} className={styles.agentAvatar} />
                  <img src={agentCheckedIcon} alt="agent-checked" className={styles.agentChecked} />
                </div>
              ))}
            </div>
          </Form.Item>
          {/* <Form.Item name="pathList" label="尽调资料" help={<div style={{margin: '5px 0 15px'}}>支持上传doc、docx、xlsx、pdf格式的文档</div>}>
            <DocUploads />
          </Form.Item>
          {!setting && (
            <Form.Item label={null}>
              <Button
                className="more"
                iconPosition="end"
                variant="outlined"
                color="primary"
                onClick={() => setSetting(!setting)}
                icon={<DownOutlined />}
              >
                更多配置
              </Button>
            </Form.Item>
          )} */}
          {setting && (
            <>
              <Form.Item label="问题清单" name="questions">
                <Questions configs={configs.questions} />
              </Form.Item>
              <Form.Item name="template" label="尽调报告模板">
                <TplSelect list={configs.template.list} />
              </Form.Item>
              {/* <Form.Item name="autoCreateFinalSheets" label={null} valuePropName="checked">
                <Checkbox>
                  <div className="auto-create">
                    <span>自动生成流动资金贷款测算表</span>
                    <Tooltip title="勾选后，在您每次上传新资料时系统将为您自动生成新的测算表">
                      <QuestionCircleFilled style={{color: '#D9D9D9', marginLeft: '3px'}} />
                    </Tooltip>
                  </div>
                </Checkbox>
              </Form.Item> */}
            </>
          )}
          {setting && (
            <Form.Item label={null}>
              <Button
                className="more"
                iconPosition="end"
                variant="outlined"
                color="primary"
                onClick={() => setSetting(!setting)}
                icon={<UpOutlined />}
              >
                收起配置
              </Button>
            </Form.Item>
          )}
        </Form>
      </div>
      <div className="ft">
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={() => form.submit()}>
            提交
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default memo(Component);
