---
slug: /manage-cluster-credentials
sidebar_position: 2
---



# Manage Cluster Credentials

When interacting with Zilliz Cloud, you need to provide cluster credentials to verify your identity, and Zilliz Cloud uses the credentials to authenticate and authorize your requests.

A credential consists of a username and its corresponding password. For example, when connecting to a cluster on Zilliz Cloud, you must provide a pair of username and password that has access permissions. If your credential does not show you are authorized to connect to the cluster, Zilliz Cloud denies your request.

When you create a cluster, Zilliz Cloud creates a default user named `db_admin`, with the password specified by the cluster creator. User `db_admin` is granted the `admin` privileges, indicating that the user has permission to access all resources and perform all operations at the cluster level.

This topic describes how to manage cluster credentials.

:::info Notes

Currently, only dedicated clusters support using a pair of username and password for the connection. Regarding serverless clusters, you can connect to them by using API keys. For more information, see [Cluster Types Explained](./cluster-types-explained) and [Manage API Keys](./manage-api-keys).

:::

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud. For information on how to register an account, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You are the owner of the organization or project where you want to manage credentials. For more information on roles and permissions, see [Roles & Privileges](./roles-privileges).

- A dedicated cluster has been created in the project where you want to manage credentials. For information on how to create a dedicated cluster, see [Create Cluster](./create-cluster).

## Work with the Zilliz Cloud console{#work-with-the-zilliz-cloud-console}

To manage cluster credentials in the console, follow these steps:

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization and project where you want to manage cluster credentials.

1. In the left-side navigation pane of the project homepage, click **Clusters**. The secondary navigation tree appears on the left.

1. Click the name of the target cluster to view its details.

1. On the **Users** tab, perform the following operations as needed to manage users and credentials: 
    - Add a user
        It would be better to note down the username and password as they will be necessary for establishing a connection to the cluster.

        1. Click **+ User** in the upper-right corner.

        1. In the **Add User** dialog box, specify **User Name** and **Password Authentication** and click **Add**.

    - Reset a user password
        1. In the list of users, find the user for whom you want to reset its password.

        1. Click the More icon in the **Actions** column and select **Reset Password** from the drop-down list.

        1. In the **Reset Password** dialog box, specify **Current Password**, **New Password**, and **Confirm New Password** and click **Confirm**.

    - Drop a user
        Dropping a user permanently deletes the user and its associated data. This operation cannot be undone. Please make sure you have backed up your data and confirmed that you want to drop the user before proceeding.

        1. In the list of users, find the user you want to drop.

        1. Click the More icon in the **Actions** column and select **Drop** from the drop-down list.

        1. In the dialog box that appears, enter the username to confirm your operation.

## Connect to a cluster using a credential{#connect-to-a-cluster-using-a-credential}

Once a user is added to a cluster, you can connect to the cluster using the username and its password.

Assume that `user1` with password `milvus@123` has been added to a cluster. The following sample code shows how to connect to the cluster as `user1`:

```python
from pymilvus import connections

connections.connect(
  alias="default", 
  uri='', #  Public endpoint obtained from Zilliz Cloud
  secure=True,
  user='user1', # Username
  password='milvus@123' # Password
)
```

## Related topics{#related-topics}

- [Manage API Keys](./manage-api-keys) 

- [Set up Whitelist](./set-up-whitelist) 

- [Set up a Private Link](./set-up-a-private-link) 
