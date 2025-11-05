# n8n-nodes-namecheap

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node that provides integration with the [Namecheap API](https://www.namecheap.com/support/api/intro/). It lets you automate domain registration, DNS management, and nameserver configuration directly from your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Credentials](#credentials)
- [Operations](#operations)
  - [Domain Operations](#domain-operations)
  - [DNS Operations](#dns-operations)
- [Compatibility](#compatibility)
- [Usage Examples](#usage-examples)
- [Resources](#resources)
- [License](#license)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes Installation

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-namecheap` in the **Enter npm package name** field
4. Click **Install**

Alternatively, if you're self-hosting n8n:

```bash
npm install n8n-nodes-namecheap
```

## Prerequisites

Before using this node, you need:

1. A Namecheap account
2. API access enabled on your Namecheap account
3. Your API key from Namecheap
4. A whitelisted IP address for API access

### Enabling Namecheap API Access

1. Log in to your [Namecheap account](https://www.namecheap.com/)
2. Navigate to **Profile > Tools > API Access**
3. Enable API access
4. Whitelist your server's IP address
5. Copy your API key

**Note:** Namecheap offers a [Sandbox Environment](https://www.sandbox.namecheap.com/) for testing API calls without affecting real domains.

## Credentials

To use this node, you'll need to configure the **Namecheap API** credentials in n8n:

| Field            | Description                                                 | Required            |
| ---------------- | ----------------------------------------------------------- | ------------------- |
| **API User**     | Your Namecheap username                                     | Yes                 |
| **API Key**      | Your Namecheap API key from the API Access page             | Yes                 |
| **Username**     | Username for API commands (usually the same as API User)    | Yes                 |
| **Client IP**    | Your whitelisted IP address for API access                  | Yes                 |
| **Sandbox Mode** | Toggle to use the Namecheap sandbox environment for testing | No (default: false) |

### How to Add Credentials

1. In your n8n workflow, add the Namecheap node
2. Click on **Credential to connect with**
3. Select **Create New**
4. Enter your Namecheap API credentials
5. Click **Save**

## Operations

The Namecheap node supports two main resources: **Domain** and **DNS**.

### Domain Operations

Manage domain registrations and check domain availability.

#### Check Availability

Check if one or more domain names are available for registration.

**Parameters:**

- **Domain List** (required): Comma-separated list of domain names to check (e.g., `example.com,test.net,mysite.org`)

**Example Use Cases:**

- Bulk check domain availability before purchasing
- Validate domain names in automated workflows
- Find available domains based on keywords

**Response:** Returns availability status for each domain checked.

#### Register

Register a new domain name with Namecheap.

**Parameters:**

**Required:**

- **Domain Name**: The domain to register (e.g., `example.com`)
- **Years**: Number of years to register (1-10)

**Registrant Contact Information:**

- First Name
- Last Name
- Address 1
- Address 2
- City
- State/Province
- Postal Code
- Country (two-letter code, e.g., US, GB, CA)
- Phone (format: +1.1234567890)
- Email Address
- Organization Name

**Additional Fields:**

- **Add Free WhoisGuard**: Enable free WHOIS privacy protection (default: true)
- **Enable WhoisGuard**: Activate WhoisGuard privacy (default: true)
- **Extended Attributes**: XML formatted extended attributes for specific TLDs
- **Nameservers**: Comma-separated nameservers (e.g., `ns1.example.com,ns2.example.com`). Leave empty for Namecheap defaults.

**Example Use Cases:**

- Automate domain registration for new projects
- Register domains in bulk from a list
- Integrate domain registration with payment systems

### DNS Operations

Manage DNS records and nameserver configurations for your domains.

#### Get DNS Records

Retrieve all DNS host records for a domain.

**Parameters:**

- **Domain Name** (required): The domain to get records for (e.g., `example.com`)

**Returns:** List of all DNS records including A, CNAME, MX, TXT, and other record types with their values and TTLs.

**Example Use Cases:**

- Audit DNS configurations
- Backup DNS records
- Monitor DNS changes

#### Set DNS Records

Configure DNS host records for a domain.

**Parameters:**

- **Domain Name** (required): The domain to set records for
- **DNS Records**: Collection of DNS records to set
  - **Record Type**: A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, URL, URL301, FRAME
  - **Host Name**: Subdomain or `@` for root domain
  - **Address/Value**: IP address, domain name, or text value
  - **TTL**: Time to live in seconds (default: 1800, minimum: 60)
  - **MX Priority**: Priority for MX records (lower = higher priority, default: 10)
- **Email Type**: MX (custom), MXE (Namecheap email), or FWD (forwarding)

**Supported Record Types:**

- **A**: IPv4 address record
- **AAAA**: IPv6 address record
- **CNAME**: Canonical name record
- **MX**: Mail exchange record
- **TXT**: Text record (SPF, DKIM, verification, etc.)
- **NS**: Name server record
- **SRV**: Service record
- **CAA**: Certificate authority authorization
- **URL**: URL redirect
- **URL301**: Permanent redirect (301)
- **FRAME**: URL frame redirect

**Example Use Cases:**

- Point domain to web hosting
- Configure email services (MX records)
- Set up subdomains
- Add SPF/DKIM records for email authentication
- Configure CDN or load balancer records

#### Set Default Nameservers

Configure domain to use Namecheap's default nameservers.

**Parameters:**

- **Domain Name** (required): The domain to configure

**Example Use Cases:**

- Switch to Namecheap DNS management
- Reset nameserver configuration
- Use Namecheap's DNS for new domains

#### Set Custom Nameservers

Configure domain to use custom nameservers (e.g., for external DNS providers like Cloudflare, AWS Route 53).

**Parameters:**

- **Domain Name** (required): The domain to configure
- **Nameservers** (required): Comma-separated list of at least 2 nameservers (e.g., `ns1.cloudflare.com,ns2.cloudflare.com`)

**Example Use Cases:**

- Point domain to Cloudflare DNS
- Use AWS Route 53 for DNS management
- Configure nameservers for external DNS providers
- Set up DNS hosting with your own name servers

## Compatibility

- **n8n version**: 0.220.0 or higher
- **Tested with**: n8n 1.0+

## Usage Examples

### Example 1: Check Domain Availability and Register

Create a workflow that checks if a domain is available and automatically registers it if available.

1. **Manual Trigger** - Start the workflow
2. **Namecheap Node** - Check availability
   - Resource: Domain
   - Operation: Check Availability
   - Domain List: `{{$json.domainName}}`
3. **IF Node** - Check if available
4. **Namecheap Node** - Register domain if available
   - Resource: Domain
   - Operation: Register
   - Configure registrant details

### Example 2: Update DNS Records

Automatically update DNS records when deploying a new application.

1. **Webhook** - Receive deployment notification
2. **Namecheap Node** - Set DNS Records
   - Resource: DNS
   - Operation: Set DNS Records
   - Domain Name: `example.com`
   - Add A record pointing to new server IP

### Example 3: DNS Backup

Create a scheduled backup of all DNS records.

1. **Schedule Trigger** - Daily at midnight
2. **Namecheap Node** - Get DNS Records
   - Resource: DNS
   - Operation: Get DNS Records
   - Domain Name: `example.com`
3. **Write Binary File Node** - Save to backup location

### Example 4: Multi-Domain DNS Management

Update DNS records across multiple domains.

1. **Google Sheets** - Read list of domains
2. **Split In Batches** - Process in batches
3. **Namecheap Node** - Set DNS Records
   - Resource: DNS
   - Operation: Set DNS Records
   - Configure records for each domain

## API Response Format

The Namecheap API returns responses in XML format, which this node automatically parses into JSON for easy use in n8n workflows. The parsed response includes:

- **ApiResponse**: Root object containing all response data
- **Status**: Success or error status
- **CommandResponse**: The actual data returned by the operation
- **Errors**: Any errors encountered during the operation

## Limitations

- Namecheap API has rate limits - check their [API documentation](https://www.namecheap.com/support/api/intro/) for current limits
- Some TLDs require extended attributes for registration
- DNS changes may take time to propagate (typically 5-30 minutes)
- Sandbox environment may have limited functionality compared to production

## Troubleshooting

### Common Issues

**Issue**: "Authentication failed"

- **Solution**: Verify your API key, username, and that your IP is whitelisted in Namecheap

**Issue**: "Invalid domain format"

- **Solution**: Ensure domain names are in the format `example.com` (no http://, www, or trailing slashes)

**Issue**: "Minimum nameservers required"

- **Solution**: Custom nameservers require at least 2 nameservers

**Issue**: DNS changes not reflecting

- **Solution**: DNS propagation can take 5-30 minutes. Use a DNS checker tool to verify propagation.

## Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Namecheap API Documentation](https://www.namecheap.com/support/api/intro/)
- [Namecheap API Methods](https://www.namecheap.com/support/api/methods/)
- [Namecheap Sandbox Environment](https://www.sandbox.namecheap.com/)

## Version History

### 0.1.0

- Initial release
- Domain availability checking
- Domain registration
- DNS record management (Get, Set)
- Nameserver configuration (Default, Custom)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions:

- [Open an issue on GitHub](https://github.com/joshuarileydev/n8n-nodes-namecheap/issues)
- [n8n Community Forum](https://community.n8n.io/)

## Author

**Joshua Riley**

- Email: joshua@joshuariley.co.uk
- GitHub: [@joshuarileydev](https://github.com/joshuarileydev)

## License

[MIT](LICENSE.md)

## Disclaimer

This is a community-developed node and is not officially affiliated with or endorsed by Namecheap. Use at your own risk. Always test in the Namecheap sandbox environment before performing operations on production domains.
