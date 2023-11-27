---
slug: /docs/manage-cluster-credentials
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Manage Cluster Credentials

In Zilliz Cloud, a cluster credential consists of a username and password pair, utilized to authenticate and authorize your requests for cluster interaction.

## Overview{#overview}

When setting up a cluster, Zilliz Cloud creates the default cluster user `db_admin` with the `Admin` role, granting full cluster access.

Beyond the default `db_admin` user, you can also add and manage additional cluster users, with various [built-in roles](./undefined) for access control:

- `Admin`: Full control over the cluster and associated resources.

- `Read-Write`: Permission to read, write, and manage collections and indexes within the cluster.

- `Read-Only`: Viewing rights for most cluster resources, but no creation, modification, or deletion capabilities.

Explore [Cluster Built-in Roles](./undefined) for further details.

To manage cluster users, perform the following actions as needed:

- [Adding a cluster user](./manage-cluster-credentials#add-a-cluster-user)

- [Editing the role of a cluster user](./manage-cluster-credentials#edit-the-role-of-a-cluster-user)

- [Resetting the password of a cluster user](./manage-cluster-credentials#reset-the-password-of-a-cluster-user)

- [Dropping a cluster user](./manage-cluster-credentials#drop-a-cluster-user)

## Add a cluster user{#add-a-cluster-user}

To add a cluster user, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

<Admonition type="info" icon="📘" title="Notes">

The password will not be displayed again, so it's crucial to note it down and securely store it in an appropriate location.

</Admonition>

![add-cluster-user](/img/add-cluster-user.png)

Having added a cluster user, you can now connect to the cluster using its username and password. See [Connect to Cluster](./connect-to-cluster) to explore further details.

## Edit the role of a cluster user{#edit-the-role-of-a-cluster-user}

To edit the role of a cluster user, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

![edit-cluster-user-role](/img/edit-cluster-user-role.png)

## Reset the password of a cluster user{#reset-the-password-of-a-cluster-user}

To reset the password of a cluster user, navigate to the cluster details page and access the **Users** tab.

<Admonition type="info" icon="📘" title="Notes">

The password will not be displayed again, so it's crucial to note it down and securely store it in an appropriate location.

</Admonition>

![reset-cluster-user-password](/img/reset-cluster-user-password.png)

## Drop a cluster user{#drop-a-cluster-user}

To drop a cluster user, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

<Admonition type="info" icon="📘" title="Notes">

The default user **db_admin **cannot be dropped.

</Admonition>

![drop-cluster-user](/img/drop-cluster-user.png)

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Manage API Keys](./manage-api-keys) 

- [Set up Whitelist](./set-up-whitelist)

- [Set up a Private Link](./setup-a-private-link)

