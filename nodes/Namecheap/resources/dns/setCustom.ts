import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDnsSetCustom = {
	operation: ['setCustom'],
	resource: ['dns'],
};

export const dnsSetCustomDescription: INodeProperties[] = [
	{
		displayName: 'Domain Name',
		name: 'domainName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDnsSetCustom,
		},
		description: 'The domain name to set custom nameservers for (e.g., example.com)',
	},
	{
		displayName: 'Nameservers',
		name: 'nameservers',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDnsSetCustom,
		},
		description:
			'Comma-separated list of nameservers (e.g., ns1.example.com,ns2.example.com). Must provide at least 2 nameservers.',
		placeholder: 'ns1.example.com,ns2.example.com',
	},
];
