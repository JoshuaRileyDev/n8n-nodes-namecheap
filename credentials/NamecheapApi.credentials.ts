import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NamecheapApi implements ICredentialType {
	name = 'namecheapApi';

	displayName = 'Namecheap API';

	icon: Icon = { light: 'file:../icons/namecheap.svg', dark: 'file:../icons/namecheap.dark.svg' };

	documentationUrl = 'https://www.namecheap.com/support/api/intro/';

	properties: INodeProperties[] = [
		{
			displayName: 'API User',
			name: 'apiUser',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Namecheap username',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Namecheap API key',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: 'Username for API commands (usually same as API User)',
		},
		{
			displayName: 'Client IP',
			name: 'clientIp',
			type: 'string',
			default: '',
			required: true,
			description: 'Your whitelisted IP address for API access',
		},
		{
			displayName: 'Sandbox Mode',
			name: 'sandbox',
			type: 'boolean',
			default: false,
			description: 'Whether to use the Namecheap sandbox environment for testing',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				ApiUser: '={{$credentials.apiUser}}',
				ApiKey: '={{$credentials.apiKey}}',
				UserName: '={{$credentials.username}}',
				ClientIp: '={{$credentials.clientIp}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{$credentials.sandbox ? "https://api.sandbox.namecheap.com" : "https://api.namecheap.com"}}/xml.response',
			url: '',
			method: 'GET',
			qs: {
				Command: 'namecheap.users.getPricing',
				ProductType: 'DOMAIN',
			},
		},
	};
}
