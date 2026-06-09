import React, { useMemo, useState } from 'react'
import { Button, Drawer, Empty, Form, Input, message, Modal, Space, Switch, Tag, Typography } from 'antd'
import { EditOutlined, EyeOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import TableComponent from '../TableComponent/TableComponent'
import * as UserService from '../../services/UserService'
import { useMutationHook } from '../../hooks/useMutationHook'
import {
  AdminUserPageGlobalStyle,
  DashboardShell,
  FilterBar,
  HeaderCard,
  HeaderDesc,
  HeaderTitle,
  StatCard,
  StatLabel,
  StatValue,
  StatsGrid,
  UserDetailGrid,
} from './Style'

const { Text, Title } = Typography

const parseToken = (rawToken) => {
  if (!rawToken) return ''
  try {
    return JSON.parse(rawToken)
  } catch (error) {
    return rawToken
  }
}

const AdminUserComponent = () => {
  const userState = useSelector((state) => state?.user)
  const [keyword, setKeyword] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  const accessToken = useMemo(() => {
    const tokenFromRedux = parseToken(userState?.access_token)
    if (tokenFromRedux) return tokenFromRedux
    const tokenFromStorage = localStorage.getItem('access_token')
    return parseToken(tokenFromStorage)
  }, [userState?.access_token])

  const queryUser = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => UserService.getAllUser(accessToken),
    enabled: Boolean(accessToken),
    retry: 2,
  })

  const users = useMemo(() => queryUser?.data?.data || [], [queryUser?.data?.data])

  const mutationUpdateUser = useMutationHook((payload) => {
    const { id, token, data } = payload
    return UserService.updateUser(id, token, data)
  })

  const stats = useMemo(() => {
    const total = users.length
    const totalAdmin = users.filter((item) => item?.isAdmin).length
    const totalCustomer = total - totalAdmin
    const verified = users.filter((item) => item?.isVerified).length
    return { total, totalAdmin, totalCustomer, verified }
  }, [users])

  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return users.filter((item) => {
      const searchableText = [item?.name, item?.email, item?.phone, item?.city]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchKeyword = !normalizedKeyword || searchableText.includes(normalizedKeyword)
      const matchRole = selectedRole === 'all' || (selectedRole === 'admin' ? item?.isAdmin : !item?.isAdmin)

      return matchKeyword && matchRole
    })
  }, [users, keyword, selectedRole])

  const dataTable = useMemo(() => {
    return filteredUsers.map((item, index) => ({
      ...item,
      key: item?._id || index,
      index: index + 1,
      location: [item?.address, item?.city].filter(Boolean).join(', '),
    }))
  }, [filteredUsers])

  const handleOpenDetail = (record) => {
    setSelectedUser(record)
    setIsDetailOpen(true)
  }

  const handleOpenEdit = (record) => {
    setEditingUser(record)
    form.setFieldsValue({
      name: record?.name || '',
      email: record?.email || '',
      phone: record?.phone || '',
      address: record?.address || '',
      city: record?.city || '',
      isAdmin: Boolean(record?.isAdmin),
    })
    setIsEditOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditOpen(false)
    setEditingUser(null)
    form.resetFields()
  }

  const handleUpdateUser = async () => {
    try {
      const values = await form.validateFields()
      if (!editingUser?._id || !accessToken) {
        message.error('Không đủ dữ liệu để cập nhật người dùng')
        return
      }

      const payload = {
        name: values.name?.trim(),
        phone: values.phone?.trim(),
        address: values.address?.trim(),
        city: values.city?.trim(),
        isAdmin: Boolean(values.isAdmin),
      }

      mutationUpdateUser.mutate(
        { id: editingUser._id, token: accessToken, data: payload },
        {
          onSuccess: (res) => {
            if (res?.status === 'OK') {
              message.success('Cập nhật người dùng thành công')
              handleCloseEdit()
              queryUser.refetch()

              if (selectedUser?._id === editingUser._id) {
                setSelectedUser((prev) => ({ ...prev, ...payload }))
              }
            } else {
              message.error(res?.message || 'Cập nhật thất bại')
            }
          },
          onError: () => {
            message.error('Có lỗi xảy ra khi cập nhật người dùng')
          },
        }
      )
    } catch (error) {
      // antd Form handles field-level errors.
    }
  }

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 70,
    },
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{record?.name || 'Chưa cập nhật'}</Text>
          <Text type="secondary">{record?.email || '---'}</Text>
        </Space>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (value) => value || '---',
    },
    {
      title: 'Khu vực',
      dataIndex: 'location',
      key: 'location',
      render: (value) => value || '---',
    },
    {
      title: 'Vai trò',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      width: 120,
      render: (isAdmin) => (
        <Tag className={isAdmin ? 'admin-user-role-tag admin' : 'admin-user-role-tag customer'}>
          {isAdmin ? 'Quản trị' : 'Khách hàng'}
        </Tag>
      ),
    },
    {
      title: 'Xác thực',
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: 120,
      render: (isVerified) => (
        <Tag className={isVerified ? 'admin-user-verify-tag verified' : 'admin-user-verify-tag pending'}>
          {isVerified ? 'Đã xác thực' : 'Chờ xác thực'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space wrap>
          <Button
            className="admin-user-detail-btn"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDetail(record)}
          >
            Xem chi tiết
          </Button>
          <Button
            className="admin-user-edit-btn"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          >
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <AdminUserPageGlobalStyle />
      <DashboardShell className="admin-user-page">
        <HeaderCard>
          <HeaderTitle>
            <UserOutlined /> Quản lý thông tin người dùng
          </HeaderTitle>
          <HeaderDesc>
            Giao diện quản trị trẻ trung, tối ưu thao tác tìm kiếm và kiểm tra thông tin chi tiết người dùng.
          </HeaderDesc>

          <StatsGrid>
            <StatCard>
              <StatLabel>Tổng tài khoản</StatLabel>
              <StatValue>{stats.total}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Quản trị viên</StatLabel>
              <StatValue>{stats.totalAdmin}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Khách hàng</StatLabel>
              <StatValue>{stats.totalCustomer}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Đã xác thực</StatLabel>
              <StatValue>{stats.verified}</StatValue>
            </StatCard>
          </StatsGrid>
        </HeaderCard>

        <FilterBar>
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, email, số điện thoại, thành phố..."
            className="admin-user-search-input"
            allowClear
          />
          <Space wrap>
            <Button
              className={selectedRole === 'all' ? 'admin-user-filter-btn active' : 'admin-user-filter-btn'}
              onClick={() => setSelectedRole('all')}
            >
              Tất cả
            </Button>
            <Button
              className={selectedRole === 'customer' ? 'admin-user-filter-btn active' : 'admin-user-filter-btn'}
              onClick={() => setSelectedRole('customer')}
            >
              Khách hàng
            </Button>
            <Button
              className={selectedRole === 'admin' ? 'admin-user-filter-btn active' : 'admin-user-filter-btn'}
              onClick={() => setSelectedRole('admin')}
            >
              Quản trị
            </Button>
            <Button
              className="admin-user-refresh-btn"
              icon={<ReloadOutlined />}
              onClick={() => queryUser.refetch()}
            >
              Làm mới
            </Button>
          </Space>
        </FilterBar>

        <div className="admin-user-table-wrap">
          {queryUser.isError ? (
            <Empty description="Không tải được danh sách người dùng" />
          ) : (
            <TableComponent
              columns={columns}
              data={dataTable}
              isPending={queryUser.isLoading || queryUser.isFetching}
              pagination={{
                pageSize: 8,
                showSizeChanger: true,
                pageSizeOptions: ['8', '12', '16'],
              }}
            />
          )}
        </div>
      </DashboardShell>

      <Drawer
        title="Thông tin chi tiết người dùng"
        placement="right"
        width={420}
        onClose={() => setIsDetailOpen(false)}
        open={isDetailOpen}
        className="admin-user-detail-drawer"
      >
        {selectedUser ? (
          <UserDetailGrid>
            <div className="admin-user-detail-item">
              <Text type="secondary">Họ tên</Text>
              <Title level={5}>{selectedUser?.name || 'Chưa cập nhật'}</Title>
            </div>
            <div className="admin-user-detail-item">
              <Text type="secondary">Email</Text>
              <Text>{selectedUser?.email || '---'}</Text>
            </div>
            <div className="admin-user-detail-item">
              <Text type="secondary">Số điện thoại</Text>
              <Text>{selectedUser?.phone || '---'}</Text>
            </div>
            <div className="admin-user-detail-item">
              <Text type="secondary">Địa chỉ</Text>
              <Text>{selectedUser?.address || '---'}</Text>
            </div>
            <div className="admin-user-detail-item">
              <Text type="secondary">Thành phố</Text>
              <Text>{selectedUser?.city || '---'}</Text>
            </div>
            <div className="admin-user-detail-item">
              <Text type="secondary">Vai trò</Text>
              <Tag className={selectedUser?.isAdmin ? 'admin-user-role-tag admin' : 'admin-user-role-tag customer'}>
                {selectedUser?.isAdmin ? 'Quản trị viên' : 'Khách hàng'}
              </Tag>
            </div>
            <div className="admin-user-detail-item">
              <Text type="secondary">Trạng thái xác thực</Text>
              <Tag className={selectedUser?.isVerified ? 'admin-user-verify-tag verified' : 'admin-user-verify-tag pending'}>
                {selectedUser?.isVerified ? 'Đã xác thực' : 'Chờ xác thực'}
              </Tag>
            </div>
            <div className="admin-user-detail-item">
              <Text type="secondary">Ngày tạo</Text>
              <Text>
                {selectedUser?.createdAt
                  ? new Date(selectedUser.createdAt).toLocaleString('vi-VN')
                  : '---'}
              </Text>
            </div>
          </UserDetailGrid>
        ) : (
          <Empty description="Chưa chọn người dùng" />
        )}
      </Drawer>

      <Modal
        title="Chỉnh sửa thông tin người dùng"
        open={isEditOpen}
        onCancel={handleCloseEdit}
        onOk={handleUpdateUser}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        centered
        className="admin-user-edit-modal"
        confirmLoading={mutationUpdateUser.isPending}
      >
        <Form form={form} layout="vertical" className="admin-user-edit-form">
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              {
                pattern: /^$|^[0-9+\-\s]{9,15}$/,
                message: 'Số điện thoại không hợp lệ',
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item label="Thành phố" name="city">
            <Input placeholder="Nhập thành phố" />
          </Form.Item>

          <Form.Item
            label="Quyền quản trị"
            name="isAdmin"
            valuePropName="checked"
            extra="Bật để cấp quyền admin, tắt để thu hồi quyền admin."
          >
            <Switch checkedChildren="Admin" unCheckedChildren="User" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default AdminUserComponent
