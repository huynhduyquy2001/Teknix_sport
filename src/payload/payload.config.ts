import path from 'path'

import { payloadCloud } from '@payloadcms/plugin-cloud'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import { buildConfig } from 'payload/config'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import Users from './collections/Users'
import TimeSlots from './collections/TimeSlots'
import Courts from './collections/Courts'
import Bookings from './collections/Bookings'
import Payments from './collections/Payments'
import Partners from './collections/Partners'
import { Media } from './collections/Media'
import PartnerSpecs from './collections/PartnerSpec'
import Products from './collections/Products'



export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: lexicalEditor({}),
  collections: [Users, TimeSlots, Courts, Bookings, Payments, Partners, Media, PartnerSpecs, Products],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [payloadCloud()],
  db: postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: process.env.DATABASE_URI,

    },
  }),
})
