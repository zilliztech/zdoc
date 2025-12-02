---
title: "Set Up Console IP Allowlist | BYOC"
slug: /setup-console-ip-allowlist
sidebar_label: "Set Up Console IP Allowlist"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "By default, your organization’s web console is accessible from any IP address. To restrict access and enhance security, configure a console IP allowlist so that uses can access the web console only from specified addresses, such as the IP of your office network. | BYOC"
type: origin
token: E1BCwXVouiDrtpkWp5ecvdXHnAb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - network
  - security
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Set Up Console IP Allowlist

By default, your organization’s web console is accessible from any IP address. To restrict access and enhance security, configure a console IP allowlist so that uses can access the web console only from specified addresses, such as the IP of your office network.

The console IP allowlist applies only to the organization web console. It does not control access to project clusters.

## Limits\{#limits}

- You are an Organization Owner.

- You can only add a maximum of 100 IPs to the console allowlist.

## Add IP address\{#add-ip-address}

You can add an IPv4 address (eg. `192.168.0.0`) or a CIDR block (`192.168.0.0/24`) to the allowlist. 

It is recommended to add your current IP and frequently used IPs to avoid lockouts. 

<Admonition type="info" icon="📘" title="Notes">

<p><code>0.0.0.0/0</code> allows access from any IPs.</p>
<p>Updates to the console IP allowlist take effect within 30 seconds.</p>

</Admonition>

The following demo shows how to add an IP address to the allowlist. 

<Supademo id="cmi79l9ih4slqb7b4yi1x32r1?utm_source=link" title=""  />

## View IP address\{#view-ip-address}

After you configure the allowlist, you can review the IPs at any time.

The following demo shows how to view IP addresses in the allowlist.

<Supademo id="cmi79trxa4tbsb7b44fnxlgik?utm_source=link" title=""  />

## Delete IP address\{#delete-ip-address}

You can remove an IP or CIDR  entry to deny console access from that source. If you delete all entries, the console becomes accessible from any IP.

<Admonition type="info" icon="📘" title="Notes">

<p>Updates to the console IP allowlist take effect within 30 seconds.</p>

</Admonition>

The following demo shows how to delete an IP address from the allowlist.

<Supademo id="cmi79zr2500s6z20jewbtd5xb?utm_source=link" title=""  />

## FAQs\{#faqs}

1. **What can I do if I am locked out?**

    When you are locked out, you will see the screen below.

    ![YGKLbTmW7oYJkIxuyx2cf6cvnwh](/img/ygklbtmw7oyjkixuyx2cf6cvnwh.png "YGKLbTmW7oYJkIxuyx2cf6cvnwh")

    Please try the following recovery options:

    - Connect from a network whose IP is in the allowlist (e.g., office VPN).

    - Ask an Organization Owner who still has access to add your new IP.

    - If no owners can access the console, [contact support](http://support.zilliz.com) for assistance.

1. **What happens to currently signed-in users when I update the console IP allowlist?**

    Updates apply to new sign-ins. Existing sessions typically continue until they expire or the user signs out. To enforce the allowlist immediately, ask your organization users to log out and log back in.

1. **Does SSO or MFA bypass the console IP allowlist?**

    No. [SSO](./single-sign-on), [MFA](./multi-factor-auth) and organization console IP allowlists are separate controls. 

1. **Does the organization console IP allowlist affect cluster access?**

    No. The console IP allowlist only restricts access to the web console. 

1. **What if I am using dynamic IPs?**

    If your Internet service provider (ISP) rotates addresses, consider allowing a small CIDR (e.g., `/29` or `/28`) that covers your range.

