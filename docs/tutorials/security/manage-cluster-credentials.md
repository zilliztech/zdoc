---
slug: /manage-cluster-credentials
beta: FALSE
notebook: FALSE
sidebar_position: 2
---



# Manage Cluster Credentials

On Zilliz Cloud, a cluster credential consists of a pair of username and password, which can be used to authenticate and authorize your requests to the cluster.

Cluster users are separate from Zilliz Cloud account users. Cluster users have access to Zilliz Cloud clusters, while account users have access to the Zilliz Cloud platform itself.

When setting up a cluster, Zilliz Cloud creates a default cluster user named `db_admin`, with the password specified by the cluster creator. `db_admin` is granted `admin` privileges, with full access to all cluster-level resources and operations.

In addition to the default cluster user `db_admin`, Zilliz Cloud allows you to add and manage cluster users.

## Add a cluster user{#add-a-cluster-user}

To add a cluster user, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

![add-cluster-user](/img/add-cluster-user.png)

## Reset the password of a cluster user{#reset-the-password-of-a-cluster-user}

To reset the password of a cluster user, navigate to the cluster details page and access the **Users** tab.

![reset-cluster-user-password](/img/reset-cluster-user-password.png)

## Drop a cluster user{#drop-a-cluster-user}

To drop a cluster user, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

:::info Notes

The default user **db_admin **cannot be dropped.

:::

![drop-cluster-user](/img/drop-cluster-user.png)

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Manage API Keys](./manage-api-keys) 

- [Set up Whitelist](./set-up-whitelist) 

- [Set up a Private Link](./set-up-a-private-link)
