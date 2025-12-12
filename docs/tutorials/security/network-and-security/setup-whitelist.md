---
title: "Set up Cluster IP Allowlist | Cloud"
slug: /setup-whitelist
sidebar_label: "Set up Cluster IP Allowlist"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Cluster IP allowlist on Zilliz Cloud serves as a robust security layer at the project level, extending its benefits to every cluster within a specified project. By implementing an IP allowlist, you effectively narrow down access to your project’s clusters to a select group of IP addresses, substantially mitigating the risk of malicious attacks. | Cloud"
type: origin
token: FnS1wY0iuia4qgkMycVclZyHnOf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - whitelist
  - setup
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search

---

import Admonition from '@theme/Admonition';


# Set up Cluster IP Allowlist

Cluster IP allowlist on Zilliz Cloud serves as a robust security layer at the project level, extending its benefits to every cluster within a specified project. By implementing an IP allowlist, you effectively narrow down access to your project’s clusters to a select group of IP addresses, substantially mitigating the risk of malicious attacks.

## Before you start\{#before-you-start}

Ensure the following prerequisites are met before proceeding:

- You have signed up for Zilliz Cloud. For information on how to register an account, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You are the owner of the organization or project in which you want to set up a cluster IP allowlist. For information on roles and permissions, see [Manage Organization Users](./organization-users) and [Manage Project Users](./project-users).

## Procedure\{#procedure}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Navigate to the specific organization and project where the allowlist is to be configured.

1. In the left-side navigation pane, choose **Security** >  Cluster IP Allowlist**.

1. Click **Add IP Address**.

1. In the dialog box that appears, specify **IP Address (CIDR)** and **Description**.

    The following table describes the fields.

    <table>
       <tr>
         <th><p><strong>Field</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p>IP Address (CIDR)</p></td>
         <td><p>The IP addresses or CIDR block that you want to add to the allowlist. Up to 100 CIDR blocks are allowed. Example value: 192.168.1.1/20.</p></td>
       </tr>
       <tr>
         <td><p>Description</p></td>
         <td><p>The description of the IP addresses or CIDR block to add to the allowlist.</p></td>
       </tr>
    </table>

1. Click **Add**.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Without any entries in the allowlist, Zilliz Cloud allows access from any IP address.</p></li>
<li><p>Upon adding a CIDR block, cluster access is exclusively limited to the IP addresses within that block.</p></li>
<li><p>Adding 0.0.0.0/0 equates to having an empty allowlist.</p></li>
</ul>

</Admonition>

![whitelist-ip-access](https://zdoc-images.s3.us-west-2.amazonaws.com/whitelist-ip-access.png "whitelist-ip-access")

## Related topics\{#related-topics}

- [API Keys](./manage-api-keys)

- [Cluster Credentials (Console)](./cluster-credentials)

- [Set up a Private Link](./setup-a-private-link)

