import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDomainCheck = {
	operation: ['checkAvailability'],
	resource: ['domain'],
};

export const domainCheckAvailabilityDescription: INodeProperties[] = [
	{
		displayName: 'Domain List',
		name: 'domainList',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDomainCheck,
		},
		description:
			'Comma-separated list of domain names to check availability (e.g., example.com,test.net,mysite.org)',
		routing: {
			send: {
				type: 'query',
				property: 'DomainList',
			},
		},
	},
];
