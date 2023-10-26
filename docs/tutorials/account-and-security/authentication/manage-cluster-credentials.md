---
slug: /manage-cluster-credentials
beta: FALSE
notebook: FALSE
sidebar_position: 2
---



# Manage Cluster Credentials

In Zilliz Cloud, a cluster credential consists of a username and password pair, utilized to authenticate and authorize your requests for cluster interaction.

When setting up a cluster, Zilliz Cloud creates a default cluster user named `db_admin`, with a password set by the cluster creator. This user is endowed with `admin` privileges, granting full access to all cluster-level resources and operations.

When interacting with clusters, it's important to differentiate between cluster users and Zilliz Cloud account users. The former have access to Zilliz Cloud clusters, while the latter have access to the Zilliz Cloud platform itself.

Beyond the default `db_admin` user, Zilliz Cloud provides the ability to add and manage additional cluster users.

## Add a cluster user{#add-a-cluster-user}

To add a cluster user, you must be an [Organization Owner](./a-panorama-view#organization-roles) or a [Project Owner](./a-panorama-view#project-roles).

:::info Notes

The password will not be displayed again, so it's crucial to note it down and securely store it in an appropriate location.

:::

![add-cluster-user](/img/add-cluster-user.png)

## Reset the password of a cluster user{#reset-the-password-of-a-cluster-user}

To reset the password of a cluster user, navigate to the cluster details page and access the **Users** tab.

:::info Notes

The password will not be displayed again, so it's crucial to note it down and securely store it in an appropriate location.

:::

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
