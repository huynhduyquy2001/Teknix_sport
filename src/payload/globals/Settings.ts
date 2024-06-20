import type { GlobalConfig } from 'payload/types'

import { admins } from '../access/admins'

export const Settings: GlobalConfig = {
  slug: 'settings',
  typescript: {
    interface: 'General Settings',
  },
  graphQL: {
    name: 'Settings',
  },
  access: {
    read: () => true,
    update: admins,
  },
  fields: [
    // {
    //   name: 'postsPage',
    //   type: 'relationship',
    //   relationTo: 'pages',
    //   label: 'Posts page',
    // },
    // {
    //   name: 'projectsPage',
    //   type: 'relationship',
    //   relationTo: 'pages',
    //   label: 'Projects page',
    // },
    {
      name: 'siteTitle',
      type: 'text',
      label: 'Site Title',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
    },
    {
      name: 'siteIcon',
      type: 'group',
      label: 'Site Icon',
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: 'Site Icon',
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          label: 'Favicon',
        },
      ],
    },
    {
      name: 'visibleIndex',
      type: 'checkbox',
      label: 'Search engine visibility',
      admin: {
        description: 'It is up to search engine to honor this request.',
      },
    },
    {
      name: 'siteUrl',
      type: 'text',
      label: 'Site URL',
    },
    {
      name: 'homeURL',
      type: 'text',
      label: 'Home URL',
    },
    {
      name: 'adminEmail',
      type: 'email',
      label: 'Administration Email Address',
    },
    {
      name: 'membership',
      type: 'checkbox',
      label: 'Anyone can register',
    },
    {
      name: 'newUserDefaultRole',
      type: 'select',
      label: 'New User Default Role',
      options: [
        {
          label: 'Subscriber',
          value: 'subscriber',
        },
        {
          label: 'Contributor',
          value: 'contributor',
        },
        {
          label: 'Author',
          value: 'author',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Administrator',
          value: 'administrator',
        },
      ],
    },
    {
      name: 'siteLanguage',
      type: 'select',
      label: 'Site Language',
      options: [
        {
          label: 'English',
          value: 'en',
        },
        {
          label: 'Vietnamese',
          value: 'vi',
        },
        // Add more languages as needed
      ],
    },
    {
      name: 'timezone',
      type: 'text',
      label: 'Timezone',
    },
    {
      name: 'dateFormat',
      type: 'radio',
      label: 'Date Format',
      options: [
        {
          label: 'F j, Y',
          value: 'F j, Y',
        },
        {
          label: 'Y-m-d',
          value: 'Y-m-d',
        },
        {
          label: 'm/d/Y',
          value: 'm/d/Y',
        },
        {
          label: 'd/m/Y',
          value: 'd/m/Y',
        },
      ],
    },
    {
      name: 'timeFormat',
      type: 'radio',
      label: 'Time Format',
      options: [
        {
          label: 'g:i a',
          value: 'g_i_a',
        },
        {
          label: 'g:i A',
          value: 'g_i_A',
        },
        {
          label: 'H:i',
          value: 'H_i',
        },
      ],
    },
    {
      name: 'weekStartsOn',
      type: 'select',
      label: 'Week Starts On',
      options: [
        {
          label: 'Monday',
          value: '1',
        },
        {
          label: 'Tuesday',
          value: '2',
        },
        {
          label: 'Wednesday',
          value: '3',
        },
        {
          label: 'Thursday',
          value: '4',
        },
        {
          label: 'Friday',
          value: '5',
        },
        {
          label: 'Saturday',
          value: '6',
        },
        {
          label: 'Sunday',
          value: '0',
        },
      ],
      defaultValue: '1',
    },
  ],
}
