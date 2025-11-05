import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDnsSetHosts = {
	operation: ['setHosts'],
	resource: ['dns'],
};

export const dnsSetHostsDescription: INodeProperties[] = [
	{
		displayName: 'Domain Name',
		name: 'domainName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDnsSetHosts,
		},
		description: 'The domain name to set DNS records for (e.g., example.com)',
	},
	{
		displayName: 'DNS Records',
		name: 'dnsRecords',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add DNS Record',
		},
		default: {},
		displayOptions: {
			show: showOnlyForDnsSetHosts,
		},
		description: 'DNS records to set for the domain',
		options: [
			{
				name: 'records',
				displayName: 'Record',
				values: [
					{
						displayName: 'Record Type',
						name: 'type',
						type: 'options',
						options: [
							{
								name: 'A',
								value: 'A',
								description: 'IPv4 address record',
							},
							{
								name: 'AAAA',
								value: 'AAAA',
								description: 'IPv6 address record',
							},
							{
								name: 'CNAME',
								value: 'CNAME',
								description: 'Canonical name record',
							},
							{
								name: 'MX',
								value: 'MX',
								description: 'Mail exchange record',
							},
							{
								name: 'TXT',
								value: 'TXT',
								description: 'Text record',
							},
							{
								name: 'NS',
								value: 'NS',
								description: 'Name server record',
							},
							{
								name: 'SRV',
								value: 'SRV',
								description: 'Service record',
							},
							{
								name: 'CAA',
								value: 'CAA',
								description: 'Certificate authority authorization',
							},
							{
								name: 'URL',
								value: 'URL',
								description: 'URL redirect record',
							},
							{
								name: 'URL301',
								value: 'URL301',
								description: 'Permanent URL redirect (301)',
							},
							{
								name: 'FRAME',
								value: 'FRAME',
								description: 'URL frame redirect',
							},
						],
						default: 'A',
						description: 'The type of DNS record',
					},
					{
						displayName: 'Host Name',
						name: 'hostName',
						type: 'string',
						default: '@',
						description: 'Sub-domain/host name or @ for the root domain',
					},
					{
						displayName: 'Address/Value',
						name: 'address',
						type: 'string',
						default: '',
						required: true,
						description: 'The value for the DNS record (IP address, domain name, text, etc.)',
					},
					{
						displayName: 'TTL',
						name: 'ttl',
						type: 'number',
						default: 1800,
						description: 'Time to live in seconds (minimum 60, default 1800)',
					},
					{
						displayName: 'MX Priority',
						name: 'mxPref',
						type: 'number',
						default: 10,
						displayOptions: {
							show: {
								type: ['MX'],
							},
						},
						description: 'Priority for MX records (lower number = higher priority)',
					},
				],
			},
		],
	},
	{
		displayName: 'Email Type',
		name: 'emailType',
		type: 'options',
		default: 'MXE',
		displayOptions: {
			show: showOnlyForDnsSetHosts,
		},
		options: [
			{
				name: 'MX',
				value: 'MX',
				description: 'Use custom MX records',
			},
			{
				name: 'MXE',
				value: 'MXE',
				description: 'Use Namecheap email service',
			},
			{
				name: 'FWD',
				value: 'FWD',
				description: 'Email forwarding',
			},
		],
		description: 'Email type for the domain',
	},
];
