import type { INodeProperties } from 'n8n-workflow';
import { dnsGetListDescription } from './getList';
import { dnsSetHostsDescription } from './setHosts';
import { dnsSetDefaultDescription } from './setDefault';
import { dnsSetCustomDescription } from './setCustom';

const showOnlyForDns = {
	resource: ['dns'],
};

export const dnsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForDns,
		},
		options: [
			{
				name: 'Get DNS Records',
				value: 'getList',
				action: 'Get DNS records for a domain',
				description: 'Retrieve DNS host records for a domain',
			},
			{
				name: 'Set DNS Records',
				value: 'setHosts',
				action: 'Set DNS records for a domain',
				description: 'Set DNS host records for a domain',
			},
			{
				name: 'Set Default Nameservers',
				value: 'setDefault',
				action: 'Set default nameservers',
				description: 'Set domain to use Namecheap default nameservers',
			},
			{
				name: 'Set Custom Nameservers',
				value: 'setCustom',
				action: 'Set custom nameservers',
				description: 'Set domain to use custom nameservers',
			},
		],
		default: 'getList',
	},
	...dnsGetListDescription,
	...dnsSetHostsDescription,
	...dnsSetDefaultDescription,
	...dnsSetCustomDescription,
];
