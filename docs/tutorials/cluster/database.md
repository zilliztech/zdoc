---
title: "Database | Cloud"
slug: /database
sidebar_label: "Database"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud introduces a database layer in between the clusters and collections, providing a more efficient way to manage and organize your data while supporting multi-tenancy. | Cloud"
type: origin
token: Z0oiwVpsliiW1zksnlFc3ZsVnxf
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm

---

import Admonition from '@theme/Admonition';


# Database

Zilliz Cloud introduces a **database** layer in between the clusters and collections, providing a more efficient way to manage and organize your data while supporting multi-tenancy.

## What is a database{#what-is-a-database}

In Zilliz Cloud, a database serves as a logical unit for organizing and managing data. To enhance data security and achieve multi-tenancy, you can create multiple databases to logically isolate data for different applications or tenants. For example, you create a database to store the data of user A and another database for user B.

The resources are structured in the following hierarchical order in Zilliz Cloud.

![KkS9wtS5IhcP9obYvc1cK10snfg](/img/KkS9wtS5IhcP9obYvc1cK10snfg.png)

It can be noted that the concept of database is only available to Dedicated clusters. Serverless and Free clusters do not have databases.

## Prerequisites{#prerequisites}

You need to have **Organization Owner** or **Project Admin** access to manage databases.

## Create database{#create-database}

Databases can only be created in Dedicated clusters. Upon the creation of a cluster, a default database will be created.

You can create up to 1,024 databases in a Dedicated cluster.

![create-database](/img/create-database.png)

You can also move created collections from one database to another. For more details, refer to [Manage Collections (Console)](./manage-collections-console#move-collection-to-another-database).

## Drop database{#drop-database}

Default databases cannot be dropped.

Before dropping a database, you need to drop all collections in the database first.

![drop-database](/img/drop-database.png)

