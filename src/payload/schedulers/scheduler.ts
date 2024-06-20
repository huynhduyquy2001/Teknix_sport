// src/schedulers/scheduler.ts
import cron from 'node-cron'
import payload from 'payload'

export const scheduleJob = () => {
  cron.schedule('* * * * *', async () => {
    // Chạy mỗi phút
    try {
      const currentDateTime = new Date()
      const scheduledPosts = await payload.find({
        collection: 'posts',
        where: {
          _status: {
            equals: 'schedule',
          },
          publishedAt: {
            less_than_equal: currentDateTime.toISOString(), // Chuyển đổi thành ISO string
          },
        },
      })

      for (const post of scheduledPosts.docs) {
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: {
            _status: 'published',
          },
        })
      }

      console.log(`Checked and updated ${scheduledPosts.totalDocs} scheduled posts`)
    } catch (error) {
      console.error('Error updating scheduled posts:', error)
    }
  })
}
