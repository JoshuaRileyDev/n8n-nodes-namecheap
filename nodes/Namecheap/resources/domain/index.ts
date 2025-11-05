import type { INodeProperties } from 'n8n-workflow';
import { domainCheckAvailabilityDescription } from './checkAvailability';
import { domainRegisterDescription } from './register';

const showOnlyForDomain = {
	resource: ['domain'],
};

export const domainDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForDomain,
		},
		options: [
			{
				name: 'Check Availability',
				value: 'checkAvailability',
				action: 'Check domain availability',
				description: 'Check the availability of one or more domain names',
				routing: {
					request: {
						method: 'GET',
						url: '',
						qs: {
							Command: 'namecheap.domains.check',
						},
					},
				},
			},
			{
				name: 'Register',
				value: 'register',
				action: 'Register a domain',
				description: 'Register a new domain name',
				routing: {
					request: {
						method: 'POST',
						url: '',
						qs: {
							Command: 'namecheap.domains.create',
						},
					},
				},
			},
		],
		default: 'checkAvailability',
	},
	...domainCheckAvailabilityDescription,
	...domainRegisterDescription,
];
