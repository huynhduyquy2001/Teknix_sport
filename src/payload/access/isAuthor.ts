import type { Access, FieldAccess } from 'payload/types'

import type { User } from '../payload-types'

export const isAuthor: Access<
  any, // eslint-disable-line @typescript-eslint/no-explicit-any
  User
> = ({ req: { user } }) => {
  // Return true or false based on if the user has an admin role
  return Boolean(user?.roles?.includes('author'))
}