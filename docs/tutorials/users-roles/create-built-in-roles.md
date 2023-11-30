---
slug: /docs/create-built-in-roles
beta: FALSE
notebook: FALSE
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Cluster Built-in Roles

In the [organization and project](./a-panorama-view) hierarchy, Zilliz Cloud enables finer-grained access control at the cluster level. It features cluster built-in roles that delineate varied access levels within a Zilliz Cloud cluster.

## Cluster users and roles{#cluster-users-and-roles}

### Default user with `Admin` role{#default-user-with-admin-role}

Upon the creation of a cluster in Zilliz Cloud, a default cluster user, named `db_admin`, is established. Zilliz Cloud automatically generates the password for this user. Equipped with the `Admin` role, the `db_admin` user has full access to all cluster-level resources and operations.

<Admonition type="info" icon="📘" title="Notes">

The creator of the cluster is automatically assigned the `Admin` role.

</Admonition>

### Additional users with built-in roles{#additional-users-with-built-in-roles}

In addition to the default `db_admin` user, you can also add and manage extra cluster users, each with distinct built-in roles.

The system categorizes cluster built-in roles into the following types, each defining the extent of permissions for cluster users:

- `Admin`: Full control over the cluster and associated resources.

- `Read-Write`: Permission to read, write, and manage collections and indexes within the cluster.

- `Read-Only`: Viewing rights for most cluster resources, but no creation, modification, or deletion capabilities.

To manage cluster users with various roles, see [Manage Cluster Credentials](./manage-cluster-credentials).

<Admonition type="info" icon="📘" title="Notes">

- These built-in roles are only applicable to dedicated clusters. Serverless clusters support only the `Read-Write` role. For more information on cluster types, see [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

- If you encounter an error while using the built-in roles feature with a dedicated cluster, please [contact us](https://zilliz.com/contact-sales) for troubleshooting assistance.

</Admonition>

## Access levels of built-in roles{#access-levels-of-built-in-roles}

The table below outlines the permissions associated with each built-in role, delineating their capabilities in cluster operations.

### SDK functionality access{#sdk-functionality-access}

|  **API**                                                                 |  **Admin** |  **Read-Write ** |  **Read-Only** |
| ------------------------------------------------------------------------ | ---------- | ---------------- | -------------- |
|  **Authentication**                                                      |            |                  |                |
|  CreateCredential                                                        |  ✔︎        |  ✘               |  ✘             |
|  DeleteCredential                                                        |  ✔︎        |  ✘               |  ✘             |
|  ListCredUsers                                                           |  ✔︎        |  ✘               |  ✘             |
|  UpdateCredential                                                        |  ✔︎        |  ✘               |  ✘             |
|  **RBAC**                                                                |            |                  |                |
|  AddUserToRole                                                           |  ✔︎        |  ✘               |  ✘             |
|  SelectUser                                                              |  ✔︎        |  ✘               |  ✘             |
|  **Collection**                                                          |            |                  |                |
|  CreateCollection                                                        |  ✔︎        |  ✔︎              |  ✘             |
|  DropCollection                                                          |  ✔︎        |  ✔︎              |  ✘             |
|  DescribeCollection                                                      |  ✔︎        |  ✔︎              |  ✘             |
|  ShowCollections                                                         |  ✔︎        |  ✔︎              |  ✔︎            |
|  Load (Load, GetLoadState, LoadCollection, GetLoadingProgress)           |  ✔︎        |  ✔︎<br/> <br/>     |  ✔︎            |
|  ReleaseCollection                                                       |  ✔︎        |  ✔︎              |  ✘             |
|  Insert                                                                  |  ✔︎        |  ✔︎              |  ✘             |
|  Delete                                                                  |  ✔︎        |  ✔︎              |  ✘             |
|  Flush                                                                   |  ✔︎        |  ✔︎              |  ✘             |
|  GetFlushState                                                           |  ✔︎        |  ✔︎              |  ✘             |
|  Compact                                                                 |  ✔︎        |  ✘               |  ✘             |
|  GetStatistics (GetCollectionStatistics, GetStatistics)                  |  ✔︎        |  ✘               |  ✘             |
|  RenameCollection                                                        |  ✔︎        |  ✔︎              |  ✘             |
|  Upsert                                                                  |  ✔︎        |  ✔︎              |  ✘             |
|  **Index**                                                               |            |                  |                |
|  CreateIndex                                                             |  ✔︎        |  ✔︎              |  ✘             |
|  DropIndex                                                               |  ✔︎        |  ✔︎              |  ✘             |
|  DescribeIndex, GetIndexState, GetIndexBuildProgress, GetIndexStatistics |  ✔︎        |  ✔︎              |  ✔︎            |
|  **Partition**                                                           |            |                  |                |
|  CreatePartition                                                         |  ✔︎        |  ✔︎              |  ✘             |
|  DropPartition                                                           |  ✔︎        |  ✔︎              |  ✘             |
|  GetPartitionStatistics                                                  |  ✔︎        |  ✔︎              |  ✔︎            |
|  HasPartiotion                                                           |  ✔︎        |  ✔︎              |  ✔︎            |
|  LoadPartitions                                                          |  ✔︎        |  ✔︎              |  ✘             |
|  ReleasePartitions                                                       |  ✔︎        |  ✔︎              |  ✘             |
|  ShowPartitions                                                          |  ✔︎        |  ✔︎              |  ✔︎            |
|  **Search & Query**                                                      |            |                  |                |
|  Search                                                                  |  ✔︎        |  ✔︎              |  ✔︎            |
|  Query                                                                   |  ✔︎        |  ✔︎              |  ✔︎            |
|  **System**                                                              |            |                  |                |
|  GetVersion                                                              |  ✔︎        |  ✔︎              |  ✔︎            |
|  CheckHealth                                                             |  ✔︎        |  ✔︎              |  ✔︎            |

### RESTful API access{#restful-api-access}

|  **API**             |  **Admin** |  **Read-Write ** |  **Read-Only** |
| -------------------- | ---------- | ---------------- | -------------- |
|  Create Collection   |  ✔︎        |  ✔︎              |  ✘             |
|  Describe Collection |  ✔︎        |  ✔︎              |  ✔︎            |
|  Drop Collection     |  ✔︎        |  ✔︎              |  ✘             |
|  List Collections    |  ✔︎        |  ✔︎              |  ✔︎            |
|  Delete              |  ✔︎        |  ✔︎              |  ✘             |
|  Get                 |  ✔︎        |  ✔︎              |  ✔︎            |
|  Insert              |  ✔︎        |  ✔︎              |  ✘             |
|  Query               |  ✔︎        |  ✔︎              |  ✔︎            |
|  Upsert              |  ✔︎        |  ✔︎              |  ✘             |

## Related topics{#related-topics}

- [A Panorama View](./a-panorama-view)

- [Manage Organizations and Members](./manage-orgs-and-members)

- [Manage Projects and Collaborators](./manage-projects-and-collaborator)
