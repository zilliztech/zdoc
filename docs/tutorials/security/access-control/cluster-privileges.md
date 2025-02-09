---
title: "Privileges | Cloud"
slug: /cluster-privileges
sidebar_label: "Privileges"
beta: FALSE
notebook: FALSE
description: "A privilege refers to the permission of specific operations on certain Zilliz Cloud resources such as clusters, databases, and collections. Privileges are assigned to roles, which are then granted to users, defining the operations users can perform on the resources. An example of a privilege could be the permission to insert data into a collection named `collection01`. | Cloud"
type: origin
token: NitBwKVzzi0hXBkjdDFcfwRsngb
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - privileges
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index

---

import Admonition from '@theme/Admonition';


# Privileges

A privilege refers to the permission of specific operations on certain Zilliz Cloud resources such as clusters, databases, and collections. Privileges are assigned to roles, which are then granted to users, defining the operations users can perform on the resources. An example of a privilege could be the permission to insert data into a collection named `collection_01`. 

A **privilege group** is a combination of individual privileges. You can create a privilege group of commonly used privileges to simplify the role granting process. For ease-of-use, Zilliz Cloud provides a total of 9 built-in privilege groups on the collection, database, and cluster level.

The following figure illustrates the different granting process of privileges and a privilege group.

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](/img/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

This topic details the built-in privilege groups and privileges that are available in Zilliz Cloud. 

## Built-in privilege groups{#built-in-privilege-groups}

Zilliz Cloud offers a total of 9 built-in privilege groups on the collection, database, and cluster level that you can directly select when [creating roles](./cluster-roles). 

<Admonition type="info" icon="📘" title="Notes">

<p>The three levels of built-in privilege groups do not have a cascading relationship. Setting a privilege group at the cluster level does not automatically set permissions for all databases and collections under that instance. Privileges at the database and collection levels need to be set manually.</p>

</Admonition>

### Collection level privilege groups{#collection-level-privilege-groups}

- **CollectionReadOnly (COLL_RO)**: includes privileges to read collection data

- **CollectionReadWrite (COLL_RW)**: includes privileges to read and write collection data

- **CollectionAdmin (COLL_ADMIN)**: includes privileges to read and write collection data and manage collections.

The table below lists the specific privileges included in the three built-in privilege groups at the collection level:

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>CollectionReadOnly</strong></p></th>
     <th><p><strong>CollectionReadWrite</strong></p></th>
     <th><p><strong>CollectionAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

### Database level privilege groups{#database-level-privilege-groups}

- **DatabaseReadOnly (DB_RO)**: includes privileges to read database data

- **DatabaseReadWrite (DB_RW)**: includes privileges to read and write database data

- **DatabaseAdmin (DB_Admin)**: includes privileges to read and write database data and manage databases.

The table below lists the specific privileges included in the three built-in privilege groups at the database level:

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>DatabaseReadOnly</strong></p></th>
     <th><p><strong>DatabaseReadWrite</strong></p></th>
     <th><p><strong>DatabaseAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

### Cluster level privilege groups{#cluster-level-privilege-groups}

- **ClusterReadOnly (Cluster_RO)**: includes privileges to read instnace data

- **ClusterReadWrite (Cluster_RW)**: includes privileges to read and write instance data

- **ClusterAdmin (Cluster_Admin)**: includes privileges to read and write instance data and manage instances.

The table below lists the specific privileges included in the three built-in privilege groups at the cluster level:

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>ClusterReadOnly</strong></p></th>
     <th><p><strong>ClusterReadWrite</strong></p></th>
     <th><p><strong>ClusterAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnership</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

## All privileges{#all-privileges}

The followings are all the privileges available on Zilliz Cloud. 

If you need to create your own privilege group with the privileges listed below or create custom roles with privileges, please [contact us](http://support.zilliz.com).

### Database privileges{#database-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>View all databases in the current instance</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>View the details of a database</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>Create a database</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>Drop a database</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>Modify the properties of a database</p></td>
   </tr>
</table>

### Collection privileges{#collection-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>Check the status of the collection flush operation</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>Check the load status of a collection</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>Check the loading progress of a collection</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>View all collections with collection privileges</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>View all aliases of a collection</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>View the details of a collection</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>View the details of an alias</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>Obtain the statistics of a collection (eg. The number of entities in a collection)</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>Create a collection</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>Drop a collection</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>Load a collection</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>Release a collection</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>Persist all entities in a collection to a sealed segment. Any entity inserted after the flush operation will be stored in a new segment.</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>Manually trigger compaction</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>Rename a collection</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>Create an alias for a collection</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>Drop the alias of a collection</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>Flush all collections in a database</p></td>
   </tr>
</table>

### Partition privileges{#partition-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>Check whether a partition exists</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>View all partitions in a collection</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>Create a partition</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>Drop a partition</p></td>
   </tr>
</table>

### Index privileges{#index-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>View the details of an index</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>Create an index</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>Drop an index</p></td>
   </tr>
</table>

### Resource management privileges{#resource-management-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>Achieve load balance</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>Create a resource group</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>Drop a resource group</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>Update a resource group</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>View the details of a resource group</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>View all resource groups of the current instance</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>Transfer nodes between resource groups</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>Transfer replicas between resource groups</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>Create a backup for all RBAC related operations in the current instance</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>Restore a backup of all RBAC related operations in the current instance</p></td>
   </tr>
</table>

### Entity privileges{#entity-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>Conduct a query</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>Conduct a search</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>Insert entities</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>Delete entities</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>Upsert entities</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>Bulk insert or import entities</p></td>
   </tr>
</table>

### RBAC privileges{#rbac-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>CreateOwnership</p></td>
     <td><p>Create a user or a role</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>Update the password of a user</p></td>
   </tr>
   <tr>
     <td><p>DropOwnership</p></td>
     <td><p>Drop a user password or a role</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnership</p></td>
     <td><p>View all users that are granted a specific role</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnership</p></td>
     <td><p>Manage a user or a role or grant a role to a user</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>View all roles granted to a user</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>Create a privilege group</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>Drop a privilege group</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>View all privilege groups in the current instance</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>Add privileges to or remove privileges from a privilege group</p></td>
   </tr>
</table>

