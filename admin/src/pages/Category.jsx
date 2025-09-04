import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Image, Upload } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import toast from 'react-hot-toast'
import { categoryAPI } from '../api/category'
import { uploadAPI } from '../api/upload'
import { useMediaQuery } from 'react-responsive'

const Category = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [form] = Form.useForm()
  const isMobile = useMediaQuery({ maxWidth: 1024 })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        name: values.name,
        image: imageUrl || values.image
      }
      
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, submitData)
      } else {
        await categoryAPI.create(submitData)
      }
      fetchCategories()
      handleCancel()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleUpload = async (file) => {
    setUploading(true)
    const uploadPromise = uploadAPI.uploadImage(file)
    
    toast.promise(
      uploadPromise,
      {
        loading: 'Uploading image...',
        success: 'Image uploaded successfully!',
        error: (err) => err.message || 'Upload failed!'
      }
    )
    
    try {
      const uploadResult = await uploadPromise
      setImageUrl(uploadResult.url)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
    return false // Prevent default upload
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      toast.error('You can only upload JPG/PNG file!')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      toast.error('Image must smaller than 2MB!')
      return false
    }
    return true
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setImageUrl(category.image)
    form.setFieldsValue({
      name: category.name,
      image: category.image
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await categoryAPI.delete(id)
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setImageUrl('')
    form.resetFields()
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image, record) => (
        <Image
          width={50}
          height={50}
          src={image.startsWith('/uploads') ? `http://localhost:4020${image}` : image}
          alt={record.name}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    // {
    //   title: 'Timings',
    //   dataIndex: 'timing',
    //   key: 'timing',
    //   render: (timing) => timing?.length || 0,
    // },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
        <h2>Category Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Category
        </Button>
      </div>

      <div style={{
        width: '100%',
        overflowX: 'scroll',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        margin: '0 0.5rem'
      }}>
        <div style={{ minWidth: '700px' }}>
          <Table
            columns={columns}
            dataSource={categories}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={false}
            size="small"
          />
        </div>
      </div>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input category name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Image"
            name="image"
            rules={[{ required: true, message: 'Please upload an image!' }]}
          >
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={handleUpload}
              loading={uploading}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl.startsWith('/uploads') ? `http://localhost:4020${imageUrl}` : imageUrl}
                  alt="category"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  preview={false}
                />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>{uploading ? 'Uploading...' : 'Upload'}</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Category