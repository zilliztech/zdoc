---
slug: /docs/byoc/set-up-whitelist
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Set up Whitelist

Whitelisting on Zilliz Cloud serves as a robust security layer at the project level, extending its benefits to every cluster within a specified project. By implementing a whitelist, you effectively narrow down access to your project’s clusters to a select group of IP addresses, substantially mitigating the risk of malicious attacks.

## Before you start{#before-you-start}

Ensure the following prerequisites are met before proceeding:

- You are the owner of the organization or project in which you want to set up a whitelist. For information on roles and permissions, see [A Panorama View](./a-panorama-view).

## Procedure{#procedure}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Navigate to the specific organization and project where the whitelist is to be configured.

1. In the left-side navigation pane, choose **Security** > **+ Add IP Address**.

1. In the dialog box that appears, specify **IP Address (CIDR)** and **Description**.
    The following table describes the fields.

    |  **Field**         |  **Description**                                                                                                                        |
    | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
    |  IP Address (CIDR) |  The IP addresses or CIDR block that you want to add to the whitelist. Up to 20 CIDR blocks are allowed. Example value: 192.168.1.1/20. |
    |  Description       |  The description of the whitelisted IP addresses or CIDR block.                                                                         |

1. Click **Add**.

<Admonition type="info" icon="📘" title="Notes">

- Without any entries in the whitelist, Zilliz Cloud allows access from any IP address.

- Upon adding a CIDR block, cluster access is exclusively limited to the IP addresses within that block.

- Adding 0.0.0.0/0 equates to having an empty whitelist.

</Admonition>

![whitelist-ip-access](/byoc/whitelist-ip-access.png)

## Related topics{#related-topics}

- [Manage API Keys](./manage-api-keys)

- [Manage Cluster Credentials](./manage-cluster-credentials)

