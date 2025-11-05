import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDnsGetList = {
	operation: ['getList'],
	resource: ['dns'],
};

export const dnsGetListDescription: INodeProperties[] = [
	{
		displayName: 'Domain Name',
		name: 'domainName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDnsGetList,
		},
		description: 'The domain name to get DNS host records for (e.g., example.com)',
	},
];
