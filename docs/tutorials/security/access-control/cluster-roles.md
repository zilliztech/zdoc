---
title: "Manage Cluster Roles (Console) | Cloud"
slug: /cluster-roles
sidebar_label: "Manage Cluster Roles (Console)"
beta: FALSE
notebook: FALSE
description: "A cluster role defines the privileges that a user has within the cluster. More specifically, the cluster role controls a cluster user's privileges on the cluster, database, and collection level. | Cloud"
type: origin
token: YHG0wCYxfiZILvkZ2VLclmvsn7g
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - roles
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database

---

import Admonition from '@theme/Admonition';


# Manage Cluster Roles (Console)

A cluster role defines the privileges that a user has within the cluster. More specifically, the cluster role controls a cluster user's privileges on the cluster, database, and collection level.

Zilliz Cloud provides two types of cluster roles: built-in roles and customs roles. 

To manage cluster roles, you must be an **Organization Owner** or a **Project Admin** or have a role with **Cluster_Admin** privileges.

## Built-in cluster roles{#built-in-cluster-roles}

Zilliz Cloud provides three built-in cluster roles with different privileges commonly needed in a vector database system. The built-in roles cannot be edited or dropped.

- **Admin**: A Cluster Admin role has full privileges to manage a cluster and all its resources (databases, collections).

    The following table lists the corresponding UI and API privileges of this role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>Manage the cluster properties (CU size, Replica count, auto-scale)</p></li><li><p>Manage collections and indexes</p></li><li><p>View cluster metrics</p></li><li><p>Manage cluster users and roles</p></li><li><p>Manage cluster backups</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">All collection operations</a></p></li><li><p><a href="/reference/restful/index-operations-v2">All index operations</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">All partition operations</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">All vector operations</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">All alias operations</a></p></li><li><p><a href="/reference/restful/role-operations-v2">All role operations</a></p></li><li><p><a href="/reference/restful/user-operations-v2">All user operations</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Write**: A Cluster Read-Write role has the privileges to view a cluster and manage all its resources (databases, collections).

    The following table lists the corresponding UI and API privileges of this role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>Manage collections and indexes</p></li><li><p>View cluster metrics</p></li><li><p>View cluster users and roles</p></li><li><p>View cluster backups</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">All collection operations</a></p></li><li><p><a href="/reference/restful/index-operations-v2">All index operations</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">All partition operations</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">All vector operations</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">All alias operations</a></p></li></ul></td>
       </tr>
    </table>

- **Read-Only**: A Cluster Read-Only role has the privileges to view a cluster and its resources (databases, collections).

    The following table lists the corresponding UI and API privileges of this role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>View collections and indexes</p></li><li><p>View cluster metrics</p></li><li><p>View cluster users and roles</p></li><li><p>View cluster backups</p></li></ul></td>
         <td><ul><li><p>Part of collection operations</p><ul><li><p><a href="/reference/restful/describe-collection-v2">Describe Collection</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">Get Collection Load State</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">Get Collection Stats</a></p></li><li><p><a href="/reference/restful/has-collection-v2">Has Collection</a></p></li><li><p><a href="/reference/restful/list-collections-v2">List Collections</a></p></li></ul></li><li><p>Part of index operations</p><ul><li><p><a href="/reference/restful/describe-index-v2">Describe Index</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">List Indexes</a></p></li></ul></li><li><p>Part of partition operations</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">Get Partition Statistics</a></p></li><li><p><a href="/reference/restful/has-partition-v2">Has Partition</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">List Partitions</a></p></li></ul></li><li><p>Part of alias operations</p><ul><li><p><a href="/reference/restful/describe-alias-v2">Describe Alias</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">List Aliases</a></p></li></ul></li></ul></td>
       </tr>
    </table>

## Custom cluster roles{#custom-cluster-roles}

Custom roles provide the flexibility to grant tailored privileges at the cluster, database, and collection levels, unlike built-in roles which offer predefined access. 

For collection-level access control, it is recommended to create custom roles.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is exclusively available to Dedicated clusters.</p>
<p>Currently, Zilliz Cloud only supports creating custom roles with built-in privilege groups. If you need to create custom roles with user-defined privileges and privilege groups, please <a href="http://support.zilliz.com">contact us</a>.</p>

</Admonition>

## Create a custom cluster role{#create-a-custom-cluster-role}

1. Navigate to the **Roles** tab of the target cluster. Click **+ Cluster Role**.

    ![add-cluster-role](/img/add-cluster-role.png)

1. Enter the role name.

1. Configure the privileges on the collection, database, and cluster level.  Select a privilege group and then select the target resource. 

    Zilliz Cloud provides 9 privilege groups in total: 

    - Collection Privilege Group: Admin (`COLL_ADMIN`), Read-Write (`COLL_RW`), Read-Only (`COLL_RO`)

    - Database Privilege Group: Admin (`DB_Admin`), Read-Write (`DB_RW`), Read-Only (`DB_RO`)

    - Cluster Privilege Group: Admin (`Cluster_Admin`), Read-Write (`Cluster_RW`), Read-Only (`Cluster_RO`)

    For details about the specific privileges in each privilege group, refer to [Privileges Explained](./cluster-privileges).

    <Admonition type="info" icon="📘" title="Notes">

    <p>The three levels of built-in privilege groups do not have a cascading relationship. Setting a privilege group at the instance level does not automatically set permissions for all databases and collections under that instance. Privileges at the database and collection levels need to be set manually.</p>

    </Admonition>

    If you need to create your own privilege group, please [contact us](http://support.zilliz.com).

    ![add-cluster-role-form](/img/add-cluster-role-form.png)

1. Click **Create**. Each cluster can have up to 20 custom cluster roles.

## Grant a role to a user{#grant-a-role-to-a-user}

Once a cluster role is created, you can grant it to users. Navigate to the Users tab, grant the role either when you [create a new cluster user](./cluster-users#create-a-cluster-user) or when you [edit the role of an existing cluster user](./cluster-users#edit-the-role-of-a-cluster-user).

![grant-role-to-user](/img/grant-role-to-user.png)

## Revoke a role from a user{#revoke-a-role-from-a-user}

When a cluster role is no longer fit for a user, you can revoke the role. Navigate to the Users tab, find the target user, and click [edit role](./cluster-users#edit-the-role-of-a-cluster-user). Select a different role in the dialog box. 

![revoke-role-from-user](/img/revoke-role-from-user.png)

## Edit a custom cluster role{#edit-a-custom-cluster-role}

You can adjust the privileges of a custom cluster role. The adjustment will be applied to all users who are granted this role.

![edit-custom-role](/img/edit-custom-role.png)

## Delete a custom cluster role{#delete-a-custom-cluster-role}

When a role is no longer necessary, you can delete a custom cluster role.

Roles that have been granted to users cannot be delete. You need to first identify the users who are granted the target role, and then assign them a different role. 

![delete-cluster-role](/img/delete-cluster-role.png)

