---
title: "Database Explained | Cloud"
slug: /database-concept
sidebar_label: "Database Explained"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A database is a logical container for collections within a project. | Cloud"
type: origin
token: B7SFwbn76iUM06kkYzBcffE8nYf
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Database Explained

A database is a logical container for collections within a project. 

Zilliz Cloud supports two types of databases, depending on how they are hosted and accessed.

## Database in serving cluster\{#database-in-serving-cluster}

A cluster database is created in a specific serving cluster. When a serving cluster is created, a default cluster database is automatically created with it. You can create additional cluster databases in the same serving cluster as needed.

A cluster database has full access to all operations — DDL, DML (insert, upsert, delete), and DQL (search, query) — through the serving cluster endpoint.     

The lifecycle of a cluster database is tied to its serving cluster:

- If the serving cluster is **suspended**, all cluster databases and collections in it become unavailable until the cluster is resumed.

- If the serving cluster is **dropped**, all cluster databases and collections in it are deleted as well.

Cluster databases are suited for production workloads that require always-on, low-latency access to data.

The following diagram shows how projects, serving clusters, databases, and collections are organized.

```plaintext
Project                                                                                                                                                                                                   
   └── Serving Cluster                       
        ├── Database (default)                                                                                                                                                                   
        │    ├── Collection_01
        │    └── Collection_02                                                                                                                                                                              
        │                                                       
        └── Database
             ├── Collection_03                                                                                                                                                                              
             └── Collection_04
```

## Database in on-demand compute\{#database-in-on-demand-compute}

In addition to the cluster database, there is another type of project-level database that is not tied to any cluster. It is managed by the platform and does not require you to provision or maintain a cluster for it. You specify on-demand compute to perform query search on data in this type of database.

This type of databases support the following operations:

<table>
   <tr>
     <th><p><strong>Operations</strong></p></th>
     <th><p><strong>Supported</strong></p></th>
   </tr>
   <tr>
     <td><p>Create/drop database</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p>Create/drop collection</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p>Load/release collection</p></td>
     <td><p>No need</p></td>
   </tr>
   <tr>
     <td><p>Search, query</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>Yes</p><p>(Import is only supported for managed collections in on-demand compute databases. For details, see <a href="./external-collection-limits">External Collection Limits</a>.)</p></td>
   </tr>
   <tr>
     <td><p>Insert, upsert, delete</p></td>
     <td><p>No</p></td>
   </tr>
</table>

This type of database is suited for large-scale datasets with infrequent queries. 

```plaintext
Project
 ├── Serving Cluster 
 │    └── Database (default)
 │         ├── Collection_01 
 │         └── Collection_02                                                                                                                                                            
 │                                 
 └── Databases in on-demand compute
      ├── External_Collection_01     
      └── External_Collection_02
```

## Comparison\{#comparison}

The following table compares the 2 types of databases.

<table>
   <tr>
     <th></th>
     <th><p><strong>Database in Serving Cluster</strong></p></th>
     <th><p><strong>Database in On-Demand Compute</strong></p></th>
   </tr>
   <tr>
     <td><p>Best for</p></td>
     <td><p>Production workloads that require always-on, low-latency access to data.</p></td>
     <td><p>Large-scale datasets with bursty searches and queries.</p></td>
   </tr>
   <tr>
     <td><p>Hosted on</p></td>
     <td><p>User-created serving cluster</p></td>
     <td><p>Platform-managed</p></td>
   </tr>
   <tr>
     <td><p>Compute resource</p></td>
     <td><p>Served by the hosting serving cluster</p></td>
     <td><p>Served by a specified on-demand cluster</p></td>
   </tr>
   <tr>
     <td><p>Insert/upsert/delete</p></td>
     <td><p>Yes</p></td>
     <td><p>No</p></td>
   </tr>
   <tr>
     <td><p>Import/Truncate</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p>Search and query</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p>Lifecycle</p></td>
     <td><p>Tied to serving cluster</p></td>
     <td><p>Independent of any cluster</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Note">

<p>Use different connection endpoints for the two types of databases. For details, see <a href="./undefined">Connection Endpoints</a>.</p>

</Admonition>

## Next steps\{#next-steps}

- [Create an External Collection](./create-external-collection)

- [Create a Collection](./manage-collections-sdks)

