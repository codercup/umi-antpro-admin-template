import { addCircle, removeCircle, circle, updateCircle } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { Button, Drawer, message } from 'antd';
import React, { useRef, useState } from 'react';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.CircleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addCircle({ ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: Partial<API.CircleListItem>) => {
  const hide = message.loading('更新记录');
  try {
    await updateCircle({
      ...fields,
    });
    hide();
    message.success('更新成功！');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败，请重试！');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.CircleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeCircle({
      key: selectedRows.map((row) => row.id),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试！');
    return false;
  }
};

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建、编辑窗口的弹窗
   *  */
  const [modalOpen, handleModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.CircleListItem>();
  const [selectedRows, setSelectedRows] = useState<API.CircleListItem[]>([]);

  const columns: ProColumns<API.CircleListItem>[] = [
    {
      title: '圈子名',
      dataIndex: 'name',
      tip: '圈子名是唯一的',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '圈子描述',
      dataIndex: 'desc',
      valueType: 'textarea',
      hideInForm: true,
    },
    {
      title: '圈子头像',
      dataIndex: 'avatar',
      valueType: 'avatar',
      hideInForm: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleModalOpen(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.CircleListItem, API.PageParams>
        headerTitle="Enquiry form"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
              setCurrentRow(undefined);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={circle}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRows?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择
              <a style={{ fontWeight: 600 }}>{selectedRows.length}</a>项 &nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRows);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title="新建圈子"
        width="400px"
        open={modalOpen}
        onOpenChange={handleModalOpen}
        initialValues={currentRow}
        onFinish={async (value) => {
          let success = false;
          if (currentRow && currentRow.id) {
            value.id = currentRow.id;
            success = await handleUpdate(value as API.CircleListItem);
          } else {
            success = await handleAdd(value as API.CircleListItem);
          }
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '圈子名称不能为空',
            },
          ]}
          width="md"
          name="name"
          label="圈子名称"
        />
        <ProFormTextArea
          rules={[
            {
              required: true,
              message: '圈子描述不能为空',
            },
          ]}
          width="md"
          name="desc"
          label="圈子描述"
        />
        <ProFormUploadButton
          rules={[
            {
              required: true,
              message: '圈子头像不能少',
            },
          ]}
          name="avatar"
          label="圈子头像"
          max={1}
          fieldProps={{
            name: 'file',
            listType: 'picture-card',
          }}
          action="/upload.do"
          accept="image/*"
          extra="只能上传不超过10M的图片"
        />
      </ModalForm>

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.CircleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.CircleListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
