import { CollectionConfig } from 'payload/types';

const Partners: CollectionConfig = {
    slug: 'partners',
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true
        },
        {
            name: 'owner',
            type: 'relationship',
            relationTo: 'users',
            hasMany: false,
            required: true,
        },
        
        {
            type: 'tabs', // required
            tabs: [
                // required
                {
                    label: 'Information', // required
                    description: 'This will appear within the tab above the fields.',
                    fields: [
                        {
                            name: 'banner',
                            type: 'upload',
                            relationTo: 'media',
                        },
                        {
                            name: 'avatar',
                            type: 'upload',
                            relationTo: 'media',
                        },
                        {
                            name: 'description',
                            type: 'textarea',
                        },
                        {
                            name: 'location',
                            type: 'point',
                        },
                        {
                            name: 'openingTimeAt',
                            type: 'number',
                            admin: {width: '47%'}
                        },
                        {
                            name: 'closingTimeAt',
                            type: 'number',
                            admin: {width: '47%'}
                        },
                    ],
                },
                {
                    name: 'Type',
                    label: 'Type', // required
                    interfaceName: 'TabTwo', // optional (`name` must be present)
                    fields: [
                        // required
                        {
                            name: 'bussinessType', // accessible via tabTwo.numberField
                            type: 'select',
                            options: [
                                {
                                    label: 'Renter',
                                    value: 'renter',
                                },
                                {
                                    label: 'Seller',
                                    value: 'seller',
                                },
                            ],  
                            hasMany: true,
                            required: true,
                        },
                        {
                            name: 'bussinessObject', // accessible via tabTwo.numberField
                            type: 'select',
                            options: [
                                {
                                    label: 'Badminton',
                                    value: 'badminton',
                                },
                                {
                                    label: 'Basketball',
                                    value: 'basketball',
                                },
                                {
                                    label: 'Pickleball',
                                    value: 'pickleballl',
                                },
                                {
                                    label: 'Soccer',
                                    value: 'soccer',
                                },
                            ],  
                            hasMany: true,
                            required: true,
                        },
                    ],
                },
                {
                    name: 'courts',
                    label: 'Courts', // required
                    interfaceName: 'courts', // optional (`name` must be present)
                    fields: [
                        // required
                        {
                            name: 'court',
                            type: 'relationship',
                            relationTo: 'courts',
                            hasMany: true,
                        },
                    ],
                },
                {
                    name: 'products',
                    label: 'Products', // required
                    interfaceName: 'products', // optional (`name` must be present)
                    fields: [
                        // required
                        {
                            name: 'products',
                            type: 'relationship',
                            relationTo: 'products',
                            hasMany: true,
                        },
                    ],
                },
            ],
        },

        
        // {
        //     name: 'products',
        //     type: 'relationship',
        //     relationTo: 'products',
        //     hasMany: true,
        //     required: true,
        // },
        // {
        //     name: 'orders',
        //     type: 'relationship',
        //     relationTo: 'orders',
        //     hasMany: true,
        //     required: true,
        // },
    ],
};

export default Partners;