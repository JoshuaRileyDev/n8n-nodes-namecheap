import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type IExecuteFunctions,
	type INodeExecutionData,
	type IHttpRequestOptions,
	type IDataObject,
	ApplicationError,
} from 'n8n-workflow';
import { domainDescription } from './resources/domain';
import { dnsDescription } from './resources/dns';

// Simple XML to JSON parser without external dependencies
function parseXmlToJson(xml: string): Record<string, unknown> {
	// Remove XML declaration and normalize whitespace
	const cleanXml = xml.replace(/<\?xml[^?]*\?>/g, '').trim();

	function parseElement(xmlStr: string): Record<string, unknown> | string | null {
		xmlStr = xmlStr.trim();
		if (!xmlStr) return null;

		// Handle self-closing tags: <Tag attr="value" />
		const selfClosingMatch = xmlStr.match(/^<([^\s>]+)([^>]*?)\/>/);
		if (selfClosingMatch) {
			const attributes = selfClosingMatch[2];
			const obj: Record<string, unknown> = {};

			// Parse attributes
			if (attributes.trim()) {
				const attrMatches = attributes.matchAll(/(\w+)="([^"]*)"/g);
				for (const match of attrMatches) {
					obj[match[1]] = match[2];
				}
			}

			return Object.keys(obj).length > 0 ? obj : '';
		}

		// Handle regular tags: <Tag>content</Tag>
		const openTagMatch = xmlStr.match(/^<([^\s>]+)([^>]*)>/);
		if (!openTagMatch) return xmlStr;

		const tagName = openTagMatch[1];
		const attributes = openTagMatch[2];
		const closeTag = `</${tagName}>`;
		const closeIndex = xmlStr.lastIndexOf(closeTag);

		if (closeIndex === -1) return xmlStr;

		const innerContent = xmlStr.substring(openTagMatch[0].length, closeIndex).trim();
		const obj: Record<string, unknown> = {};

		// Parse attributes
		if (attributes.trim()) {
			const attrMatches = attributes.matchAll(/(\w+)="([^"]*)"/g);
			for (const match of attrMatches) {
				obj[match[1]] = match[2];
			}
		}

		// If no inner content, return just attributes or empty string
		if (!innerContent) {
			return Object.keys(obj).length > 0 ? obj : '';
		}

		// Check if content is pure text (no child elements)
		if (!innerContent.includes('<')) {
			if (Object.keys(obj).length > 0) {
				obj['_text'] = innerContent;
				return obj;
			}
			return innerContent;
		}

		// Parse child elements
		let position = 0;
		while (position < innerContent.length) {
			const remaining = innerContent.substring(position).trim();
			if (!remaining) break;

			// Check for self-closing tag
			const selfClosing = remaining.match(/^<([^\s>]+)([^>]*?)\/>/);
			if (selfClosing) {
				const childName = selfClosing[1];
				const childValue = parseElement(selfClosing[0]);

				if (obj[childName] !== undefined) {
					if (Array.isArray(obj[childName])) {
						(obj[childName] as unknown[]).push(childValue);
					} else {
						obj[childName] = [obj[childName], childValue];
					}
				} else {
					obj[childName] = childValue;
				}

				position +=
					innerContent.substring(position).indexOf(selfClosing[0]) + selfClosing[0].length;
				continue;
			}

			// Check for opening tag
			const openTag = remaining.match(/^<([^\s>]+)/);
			if (openTag) {
				const childName = openTag[1];
				const childClose = `</${childName}>`;
				const childCloseIndex = remaining.indexOf(childClose);

				if (childCloseIndex !== -1) {
					const childXml = remaining.substring(0, childCloseIndex + childClose.length);
					const childValue = parseElement(childXml);

					if (obj[childName] !== undefined) {
						if (Array.isArray(obj[childName])) {
							(obj[childName] as unknown[]).push(childValue);
						} else {
							obj[childName] = [obj[childName], childValue];
						}
					} else {
						obj[childName] = childValue;
					}

					position += innerContent.substring(position).indexOf(childXml) + childXml.length;
					continue;
				}
			}

			// Skip whitespace/text between tags
			const nextTag = remaining.indexOf('<');
			if (nextTag > 0) {
				const text = remaining.substring(0, nextTag).trim();
				if (text && !obj['_text']) {
					obj['_text'] = text;
				}
				position += innerContent.substring(position).indexOf(remaining) + nextTag;
			} else {
				break;
			}
		}

		return obj;
	}

	const result = parseElement(cleanXml);
	return result && typeof result === 'object' ? result : { response: result };
}

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
						name: 'DN',
						value: 'dns',
					},
				],
				default: 'domain',
			},
			...domainDescription,
			...dnsDescription,
		],
		usableAsTool: true,
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
						throw new ApplicationError('Invalid domain name format. Expected format: example.com');
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
							throw new ApplicationError('At least 2 nameservers are required');
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
				const xmlString = typeof response === 'string' ? response : JSON.stringify(response);
				const parsedData = parseXmlToJson(xmlString) as IDataObject;

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
