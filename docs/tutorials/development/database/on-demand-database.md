---
title: "Database for On-Demand Search | Cloud"
slug: /on-demand-database
sidebar_label: "Database for On-Demand Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A database for on-demand search is a project-level database managed by Zilliz Cloud. It is not tied to a serving cluster. Use this page to create, view, and drop databases through a project endpoint. | Cloud"
type: origin
token: KTWtw4V6SiTpDMkeGMQc8lChn8b
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Database for On-Demand Search

A database for on-demand search is a project-level database managed by Zilliz Cloud. It is not tied to a serving cluster. Use this page to create, view, and drop databases through a project endpoint.

<Admonition type="info" icon="📘" title="Notes">

- This page is for project-level databases used by on-demand search. For databases hosted by serving clusters, see [Database in Serving Clusters](./database). For a comparison of database models, see [Database Explained](./database-concept).

- This feature is only available to Enterprise projects.

</Admonition>

## Before you begin\{#before-you-begin}

Ensure that:

- You have **Project Admin** access.

- You have the project endpoint, for example `<i>http</i>s://{project-id}.{region}.api.zillizcloud.com`.

- You have an API key with access to the project.

You can create up to 100 databases for on-demand search in each project.

## Supported operations\{#supported-operations}

| Operation | Supported |
| --- | --- |
| Create/drop database | Yes |
| Create/drop collection | Yes |
| Load/release collection | No need |
| Search/query | Yes |
| Import | Yes |
| Insert/upsert/delete | No |

All collections, including managed collections and external collections, in an on-demand database do not support dropping indexes.

## Create database\{#create-database}

This database is a project-level resource shared by on-demand compute in the project.

```plaintext
curl --request POST \
  --url "YOUR_PROJECT_ENDPOINT/v2/vectordb/databases/create" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database"
  }'
```

You can also create a database from the Zilliz Cloud console:

<Procedures>

1. Navigate to your project.

1. Click **On-demand**.

1. Click **Databases**.

1. Click **Create Database**.

1. Enter a database name.

1. Click **Create**.

</Procedures>

## View databases\{#view-databases}

```plaintext
curl --request POST \
  --url "YOUR_PROJECT_ENDPOINT/v2/vectordb/databases/list" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{}'
```

To view databases in the Zilliz Cloud console, navigate to your project, click **On-demand**, and then click **Databases**.

## Drop database\{#drop-database}

<Admonition type="danger" icon="🚧" title="Once you drop a database, it is removed immediately and cannot be recovered. This action cannot be undone.">

</Admonition>

Before dropping a database, drop all collections in the database first.

```plaintext
curl --request POST \
  --url "YOUR_PROJECT_ENDPOINT/v2/vectordb/databases/drop" \
  --header "Authorization: Bearer YOUR_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "dbName": "my_database"
  }'
```

To drop a database from the Zilliz Cloud console, navigate to your project, click **On-demand**, click **Databases**, and drop the target database.

## Next steps\{#next-steps}

- [Database Explained](./database-concept)

- [Database in Serving Clusters](./database)

