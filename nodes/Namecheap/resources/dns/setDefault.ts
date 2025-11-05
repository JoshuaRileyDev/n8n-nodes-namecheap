import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDnsSetDefault = {
	operation: ['setDefault'],
	resource: ['dns'],
};

export const dnsSetDefaultDescription: INodeProperties[] = [
	{
		displayName: 'Domain Name',
		name: 'domainName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDnsSetDefault,
		},
		description: 'The domain name to set default Namecheap nameservers for (e.g., example.com)',
	},
];
