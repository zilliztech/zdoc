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
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Set up Cluster IP Allowlist

Cluster IP allowlist on Zilliz Cloud serves as a robust security layer at the project level, extending its benefits to every cluster within a specified project. By implementing an IP allowlist, you effectively narrow down access to your project’s clusters to a select group of IP addresses, substantially mitigating the risk of malicious attacks.

## Before you start\{#before-you-start}

Ensure the following prerequisites are met before proceeding:

- You have signed up for Zilliz Cloud. For information on how to register an account, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You are the owner of the organization or project in which you want to set up a cluster IP allowlist. For information on roles and permissions, see [Manage Organization Users](./organization-users) and [Manage Project Users](./project-users).

## Procedure\{#procedure}

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Navigate to the specific organization and project where the allowlist is to be configured.

1. In the left-side navigation pane, choose **Security** >  Cluster IP Allowlist**.

1. Click **Add IP Address**.

1. In the dialog box that appears, specify **IP Address (CIDR)** and **Description**.

    The following table describes the fields.

    | **Field** | **Description** |
    | --- | --- |
    | IP Address (CIDR) | The IP addresses or CIDR block that you want to add to the allowlist. Up to 100 CIDR blocks are allowed. Example value: 192.168.1.1/20. |
    | Description | The description of the IP addresses or CIDR block to add to the allowlist. |

1. Click **Add**.

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- Without any entries in the allowlist, Zilliz Cloud allows access from any IP address.

- Upon adding a CIDR block, cluster access is exclusively limited to the IP addresses within that block.

- Adding 0.0.0.0/0 equates to having an empty allowlist.

</Admonition>

![whitelist-ip-access](https://zdoc-images.s3.us-west-2.amazonaws.com/whitelist-ip-access.png "whitelist-ip-access")

## Related topics\{#related-topics}

- [API Keys](./manage-api-keys)

- [Cluster Credentials (Console)](./cluster-credentials)

- [Set up a PrivateLink (AWS)](./setup-a-private-link-aws)

- [Set up a Private Service Connect (GCP)](./setup-a-private-link-gcp)

- [Set up a Private Link (Azure)](./setup-a-private-link-azure)

