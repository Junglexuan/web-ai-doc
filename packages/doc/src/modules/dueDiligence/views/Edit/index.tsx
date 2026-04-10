import {DownOutlined, LoadingOutlined, PlusOutlined, UpOutlined} from '@ant-design/icons';
import {Button, Form, Input, Select, Space, Spin, Upload, message} from 'antd';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import agentCheckedIcon from '@/assets/agent/agent-checked.png';
import DueDiligenceAPI from '../../api';
import DocUploads from '../../components/DocUploads';
import IconSelect from '../../components/IconSelect';
import Questions from '../../components/Questions';
import TplSelect from '../../components/TplSelect';
import {DueConfigs, ListItem} from '../../entity';
import styles from './index.module.less';

const Component: FC<{
  configs: DueConfigs;
  data: Partial<ListItem>;
  onCancel: () => void;
  onSubmit: (data: ListItem) => void;
}> = ({configs, data, onCancel, onSubmit}) => {
  console.log(data);
  const [form] = Form.useForm();
  const [setting, setSetting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  // 初始化时处理已有的logo值
  useEffect(() => {
    if (data?.logo) {
      setUploadedImage(data.logo);
      setSelectedIcon(data.logo);
    }
  }, [data?.logo]);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('请上传图片文件');
      return false;
    }

    try {
      setUploading(true);
      message.loading({content: '图片上传中...', key: 'uploading'});
      const url = await DueDiligenceAPI.uploadFile(file);
      message.success({content: '上传成功', key: 'uploading'});
      setUploadedImage(url);
      setSelectedIcon(url);
      // 更新表单中的图标字段
      form.setFieldsValue({logo: url});
    } catch (error: any) {
      message.error({content: error.message || '图片上传失败', key: 'uploading'});
      console.error('图片上传失败:', error);
    } finally {
      setUploading(false);
    }

    return false; // 阻止默认上传行为
  };

  // 将图片转换为base64格式
  const imageToBase64 = async (imagePath: string): Promise<string> => {
    // 如果已经是base64格式，直接返回
    if (imagePath.startsWith('data:image')) {
      return imagePath;
    }

    try {
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
      // 将表单数据和图标信息传递给外部处理
      const formData = {
        ...data,
        logo: selectedIcon || uploadedImage || '',
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
          initialValues={{
            ...data,
            templateId: data?.template?.id ? String(data.template.id) : undefined,
            logo: data?.logo || '',
          }}
          form={form}
          onFinish={(values) => {
            console.log('values: ', values);
            handleCreateAgent(values);
          }}
        >
          <Form.Item name="name" label="尽调对象" rules={[{required: true}]}>
            <Input
              placeholder="请输入尽调对象名称"
              onChange={(e) => {
                let val = e.target.value;
                // 1. 限制最大长度 30
                if (val.length > 30) {
                  val = val.slice(0, 30);
                }
                // 2. 过滤特殊字符: \ | / ? * < > 、连续的点 .. 以及换行符
                val = val.replace(new RegExp('[\\\\|/?*<>]|\\.\\.|[\\r\\n]', 'g'), '');
                form.setFieldsValue({name: val});
              }}
            />
          </Form.Item>
          <Form.Item
            name="creditCode"
            label={
              <span>
                企业名称 /<br />
                信用代码
              </span>
            }
          >
            <Input placeholder="请输入企业名称或信用代码（选填）" />
          </Form.Item>
          <Form.Item name="templateId" label="选择模版" rules={[{required: true, message: '请选择模版'}]}>
            <Select
              placeholder="请选择模版"
              options={configs.template.list.map((item) => ({value: String(item.id), label: item.title}))}
              onChange={(val) => {
                const selectedTpl = configs.template.list.find((t) => String(t.id) === String(val));
                if (selectedTpl?.questionId) {
                  const qTpl = configs.questions.tpls.find((q) => String(q.value) === String(selectedTpl.questionId));
                  form.setFieldsValue({
                    questions: {
                      tpl: String(selectedTpl.questionId),
                      list: qTpl?.list || [],
                    },
                  });
                }
              }}
            />
          </Form.Item>
          {data.id && (
            <Form.Item name="logo" label="企业图标">
              <div className={styles.createAgentIcons}>
                <Upload accept="image/*" showUploadList={false} beforeUpload={handleFileUpload} className={styles.picture} disabled={uploading}>
                  <div className={styles.uploadIconBox}>
                    {uploading ? (
                      <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin />} />
                    ) : (
                      <>
                        {uploadedImage ? (
                          <>
                            <img src={uploadedImage} alt="企业图标" className={styles.uploadedImage} />
                            <div className={styles.uploadOverlay}>
                              <PlusOutlined />
                            </div>
                          </>
                        ) : (
                          <PlusOutlined style={{fontSize: '36px', color: '#85888F'}} />
                        )}
                      </>
                    )}
                  </div>
                  <div className={styles.uploadHint}>{uploading ? '正在上传...' : uploadedImage ? '点击更换图片' : '上传企业照片'}</div>
                </Upload>
              </div>
            </Form.Item>
          )}
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
