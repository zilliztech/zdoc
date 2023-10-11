---
slug: /set-up-whitelist
sidebar_position: 3
---



# Set up Whitelist

On Zilliz Cloud, whitelisting is a project-level security setting and applies to every cluster in a specific project. By setting up a whitelist, you can restrict access to clusters in your project to a small set of IP addresses. This helps reduce the possibility of malicious attacks.

This guide walks you through setting up a whitelist.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud. For information on how to register an account, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You are the owner of the organization or project in which you want to set up a whitelist. For information on roles and permissions, see [Roles & Privileges](./roles-privileges).

## Procedure{#procedure}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization and project in which you want to set up a whitelist.

1. In the left-side navigation pane, choose **Security** > **+ Add IP Address**.

1. In the dialog box that appears, specify **IP Address (CIDR)** and **Description**.
    The following table describes the fields.

    |  **Field**         |  **Description**                                                                                                                        |
    | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
    |  IP Address (CIDR) |  The IP addresses or CIDR block that you want to add to the whitelist. You can add up to 20 CIDR blocks. Example value: 192.168.1.1/20. |
    |  Description       |  The description of the whitelisted IP addresses or CIDR block.                                                                         |

1. Click **Add**.

:::info Notes

Zilliz Cloud allows access from all IP addresses if there is no entry in the whitelist. Once you add a CIDR block, only IP addresses in the CIDR block can access the cluster. If you add an all-zero entry (**0.0.0.0/0**), the effect is the same as having no entries in the whitelist.

:::

![whitelist-ip-access](/img/whitelist-ip-access.png)

## Related topics{#related-topics}

- [Manage API Keys](https://www.notion.so/Manage-API-Keys-9e136327da194cfc9f3b1840554298f1?pvs=21)

- [Manage Cluster Credentials](https://www.notion.so/Manage-Cluster-Credentials-562e60b054a64026b6f3e45ff6fe4338?pvs=21)

- [Set up a Private Link](https://www.notion.so/Set-up-a-Private-Link-099ca332eb354e5c9a43f24b875427f6?pvs=21)
