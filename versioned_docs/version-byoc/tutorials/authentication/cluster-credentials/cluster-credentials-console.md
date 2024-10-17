---
title: "Manage Cluster Credentials (Console) | BYOC"
slug: /cluster-credentials-console
sidebar_label: "Manage Cluster Credentials (Console)"
beta: FALSE
notebook: FALSE
description: "In Zilliz Cloud, a cluster credential consists of a username and password pair, utilized to authenticate and authorize your requests for cluster interaction. | BYOC"
type: origin
token: Ha8jwqxnniC8mDkXM4RcN4SFnKf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - console

---

import Admonition from '@theme/Admonition';


# Manage Cluster Credentials (Console)

In Zilliz Cloud, a cluster credential consists of a username and password pair, utilized to authenticate and authorize your requests for cluster interaction.

## Overview{#overview}

When setting up a cluster, Zilliz Cloud creates the default cluster user `db_admin` with the `Admin` role, granting full cluster access.

Beyond the default `db_admin` user, you can also add and manage additional cluster users, with various [built-in roles](./user-roles) for access control:

- `Admin`: Full control over the cluster and associated resources.

- `Read-Write`: Permission to read, write, and manage collections and indexes within the cluster.

- `Read-Only`: Viewing rights for most cluster resources, but no creation, modification, or deletion capabilities.

Explore [Cluster Built-in Roles](./user-roles) for details.

The Zilliz Cloud web UI provides a simplified and intuitive way of creating and managing user credentials.

## Add a cluster user{#add-a-cluster-user}

To add a cluster user, you must be an [Organization Owner](./user-roles#organization-roles) or a [Project Admin](./user-roles#project-roles).

<Admonition type="info" icon="📘" title="Notes">

<p>The password will not be displayed again, so it's crucial to note it down and securely store it in an appropriate location.</p>

</Admonition>

![add-cluster-user](/byoc/add-cluster-user.png)

Having added a cluster user, you can now connect to the cluster using its username and password. See [Connect to Cluster](./connect-to-cluster) to explore further details.

## Edit the role of a cluster user{#edit-the-role-of-a-cluster-user}

To edit the role of a cluster user, you must be an [Organization Owner](./user-roles#organization-roles) or a [Project Admin](./user-roles#project-roles).

![edit-cluster-user-role](/byoc/edit-cluster-user-role.png)

## Reset the password of a cluster user{#reset-the-password-of-a-cluster-user}

To reset the password of a cluster user, navigate to the cluster details page and access the **Users** tab.

<Admonition type="info" icon="📘" title="Notes">

<p>The password will not be displayed again, so it's crucial to note it down and securely store it in an appropriate location.</p>

</Admonition>

![reset-cluster-user-password](/byoc/reset-cluster-user-password.png)

## Drop a cluster user{#drop-a-cluster-user}

To drop a cluster user, you must be an [Organization Owner](./user-roles#organization-roles) or a [Project Admin](./user-roles#project-roles).

<Admonition type="info" icon="📘" title="Notes">

<p>The default user <strong>db_admin</strong> cannot be dropped.</p>

</Admonition>

![drop-cluster-user](/byoc/drop-cluster-user.png)

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [API Keys](./manage-api-keys)

