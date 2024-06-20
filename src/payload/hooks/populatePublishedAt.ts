import type { BeforeChangeHook } from 'payload/dist/collections/config/types'

export const populatePublishedAt: BeforeChangeHook = async ({ data, req, operation }) => {
  const newData = { ...data }

  if (operation === 'create') {
    // Kiểm tra và cập nhật authors nếu người dùng không phải là admin
    if (!req.user?.roles?.includes('admin')) {
      newData.authors = req.user.id
    }
  }

  if (operation === 'create' || operation === 'update') {
    const publishedAtDateTime = new Date(data.publishedAt)
    const currentDateTime = new Date()

    // Kiểm tra vai trò và cập nhật _status
    if (req.user?.roles?.includes('author')) {
      newData._status = 'pending'
    }

    if (publishedAtDateTime > currentDateTime) {
      newData._status = 'schedule'
    }

    // Cập nhật publishedAt nếu chưa có
    if (!newData.publishedAt) {
      newData.publishedAt = new Date()
    }

    // Kiểm tra và cập nhật meta.image nếu chưa có
    if (!newData.meta) {
      newData.meta = {}
    }

    if (!newData.meta.image && !newData.featuredImage) {
      newData.meta.image = newData.featuredImage
    }
    if (!newData.meta.title) {
      newData.meta.title = newData.title
    }
    if (!newData.meta.description) {
      if (newData.description && newData.description.length > 150) {
        newData.meta.description = newData.description.substring(0, 150)
      } else {
        newData.meta.description = newData.description
      }
    }

    console.log(newData)
    return newData
  }

  return data
}
