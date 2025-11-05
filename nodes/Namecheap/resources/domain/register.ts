import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDomainRegister = {
	operation: ['register'],
	resource: ['domain'],
};

export const domainRegisterDescription: INodeProperties[] = [
	{
		displayName: 'Domain Name',
		name: 'domainName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDomainRegister,
		},
		description: 'The domain name to register (e.g., example.com)',
		routing: {
			send: {
				type: 'query',
				property: 'DomainName',
			},
		},
	},
	{
		displayName: 'Years',
		name: 'years',
		type: 'number',
		default: 1,
		required: true,
		displayOptions: {
			show: showOnlyForDomainRegister,
		},
		description: 'Number of years to register the domain for',
		routing: {
			send: {
				type: 'query',
				property: 'Years',
			},
		},
	},
	{
		displayName: 'Registrant Contact',
		name: 'registrantContact',
		type: 'collection',
		placeholder: 'Add Contact Information',
		default: {},
		displayOptions: {
			show: showOnlyForDomainRegister,
		},
		options: [
			{
				displayName: 'Address 1',
				name: 'address1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Address 2',
				name: 'address2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: 'US',
				description: 'Two-letter country code (e.g., US, GB, CA)',
			},
			{
				displayName: 'Email Address',
				name: 'emailAddress',
				type: 'string',
				default: '',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Organization Name',
				name: 'organizationName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number in format +1.1234567890',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State/Province',
				name: 'stateProvince',
				type: 'string',
				default: '',
			},
		],
		routing: {
			send: {
				type: 'query',
				property:
					'={{Object.keys($value).reduce((acc, key) => { const capitalizedKey = "Registrant" + key.charAt(0).toUpperCase() + key.slice(1); acc[capitalizedKey] = $value[key]; return acc; }, {})}}',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForDomainRegister,
		},
		options: [
			{
				displayName: 'Add Free WhoisGuard',
				name: 'addFreeWhoisguard',
				type: 'boolean',
				default: true,
				description: 'Whether to add free WhoisGuard privacy protection',
				routing: {
					send: {
						type: 'query',
						property: 'AddFreeWhoisguard',
						value: '={{$value ? "yes" : "no"}}',
					},
				},
			},
			{
				displayName: 'Enable WhoisGuard',
				name: 'wgEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether to enable WhoisGuard privacy protection',
				routing: {
					send: {
						type: 'query',
						property: 'WGEnabled',
						value: '={{$value ? "yes" : "no"}}',
					},
				},
			},
			{
				displayName: 'Extended Attributes',
				name: 'extendedAttributes',
				type: 'string',
				default: '',
				description: 'Extended attributes for specific TLDs (in XML format)',
				routing: {
					send: {
						type: 'query',
						property: 'ExtendedAttributes',
					},
				},
			},
		],
	},
	{
		displayName: 'Nameservers',
		name: 'nameservers',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForDomainRegister,
		},
		description:
			'Comma-separated list of nameservers (e.g., ns1.example.com,ns2.example.com). Leave empty to use Namecheap default nameservers.',
		routing: {
			send: {
				type: 'query',
				property: 'Nameservers',
			},
		},
	},
];
