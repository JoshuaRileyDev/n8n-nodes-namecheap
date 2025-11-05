import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type IExecuteFunctions,
	type INodeExecutionData,
	type IHttpRequestOptions,
	type IDataObject,
} from 'n8n-workflow';
import { parseString } from 'xml2js';
import { domainDescription } from './resources/domain';
import { dnsDescription } from './resources/dns';

export class Namecheap implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Namecheap',
		name: 'namecheap',
		icon: { light: 'file:../../icons/namecheap.svg', dark: 'file:../../icons/namecheap.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Namecheap API for domain management',
		defaults: {
			name: 'Namecheap',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'namecheapApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Domain',
						value: 'domain',
					},
					{
						name: 'DNS',
						value: 'dns',
					},
				],
				default: 'domain',
			},
			...domainDescription,
			...dnsDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('namecheapApi');
		const sandbox = credentials.sandbox as boolean;
		const baseURL = sandbox
			? 'https://api.sandbox.namecheap.com/xml.response'
			: 'https://api.namecheap.com/xml.response';

		for (let i = 0; i < items.length; i++) {
			try {
				let command = '';
				const qs: IDataObject = {
					ApiUser: credentials.apiUser,
					ApiKey: credentials.apiKey,
					UserName: credentials.username,
					ClientIp: credentials.clientIp,
				};

				if (resource === 'domain') {
					if (operation === 'checkAvailability') {
						command = 'namecheap.domains.check';
						const domainList = this.getNodeParameter('domainList', i) as string;
						qs.DomainList = domainList;
					} else if (operation === 'register') {
						command = 'namecheap.domains.create';
						const domainName = this.getNodeParameter('domainName', i) as string;
						const years = this.getNodeParameter('years', i) as number;
						const registrantContact = this.getNodeParameter('registrantContact', i) as IDataObject;
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const nameservers = this.getNodeParameter('nameservers', i, '') as string;

						qs.DomainName = domainName;
						qs.Years = years;

						// Add registrant contact information
						for (const [key, value] of Object.entries(registrantContact)) {
							const capitalizedKey = 'Registrant' + key.charAt(0).toUpperCase() + key.slice(1);
							qs[capitalizedKey] = value;
						}

						// Add additional fields
						if (additionalFields.addFreeWhoisguard !== undefined) {
							qs.AddFreeWhoisguard = additionalFields.addFreeWhoisguard ? 'yes' : 'no';
						}
						if (additionalFields.wgEnabled !== undefined) {
							qs.WGEnabled = additionalFields.wgEnabled ? 'yes' : 'no';
						}
						if (additionalFields.extendedAttributes) {
							qs.ExtendedAttributes = additionalFields.extendedAttributes;
						}

						// Add nameservers if provided
						if (nameservers) {
							qs.Nameservers = nameservers;
						}
					}
				} else if (resource === 'dns') {
					const domainName = this.getNodeParameter('domainName', i) as string;

					// Parse domain name into SLD and TLD
					const domainParts = domainName.split('.');
					if (domainParts.length < 2) {
						throw new Error('Invalid domain name format. Expected format: example.com');
					}
					const tld = domainParts.pop();
					const sld = domainParts.join('.');

					qs.SLD = sld;
					qs.TLD = tld;

					if (operation === 'getList') {
						command = 'namecheap.domains.dns.getHosts';
					} else if (operation === 'setHosts') {
						command = 'namecheap.domains.dns.setHosts';
						const dnsRecordsData = this.getNodeParameter('dnsRecords', i) as IDataObject;
						const emailType = this.getNodeParameter('emailType', i, 'MXE') as string;

						qs.EmailType = emailType;

						// Process DNS records
						const records = (dnsRecordsData.records as IDataObject[]) || [];

						records.forEach((record, index) => {
							const recordIndex = index + 1;
							qs[`HostName${recordIndex}`] = record.hostName || '@';
							qs[`RecordType${recordIndex}`] = record.type;
							qs[`Address${recordIndex}`] = record.address;
							qs[`TTL${recordIndex}`] = record.ttl || 1800;

							// Add MX priority if it's an MX record
							if (record.type === 'MX') {
								qs[`MXPref${recordIndex}`] = record.mxPref || 10;
							}
						});
					} else if (operation === 'setDefault') {
						command = 'namecheap.domains.dns.setDefault';
					} else if (operation === 'setCustom') {
						command = 'namecheap.domains.dns.setCustom';
						const nameservers = this.getNodeParameter('nameservers', i) as string;

						// Split nameservers and add them as Nameservers parameter
						const nameserverList = nameservers
							.split(',')
							.map((ns) => ns.trim())
							.filter((ns) => ns);
						if (nameserverList.length < 2) {
							throw new Error('At least 2 nameservers are required');
						}

						qs.Nameservers = nameserverList.join(',');
					}
				}

				qs.Command = command;

				// Make the HTTP request
				const options: IHttpRequestOptions = {
					method: operation === 'register' ? 'POST' : 'GET',
					url: baseURL,
					qs,
				};

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'namecheapApi',
					options,
				);

				// Parse XML response to JSON
				const parsedData: any = await new Promise((resolve, reject) => {
					const xmlString = typeof response === 'string' ? response : JSON.stringify(response);
					parseString(xmlString, { explicitArray: false, mergeAttrs: true }, (err, result) => {
						if (err) {
							reject(err);
						} else {
							resolve(result);
						}
					});
				});

				returnData.push({
					json: parsedData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
