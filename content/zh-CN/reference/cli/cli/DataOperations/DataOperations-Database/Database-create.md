---
displayed_sidbar: cliSidebar
title: "create | Cloud"
slug: /cli/cli/Database-create
sidebar_label: "create"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a new database. (Dedicated only) | Cloud"
type: docx
token: IKTjdZU2ioqYvbxGD08cp58In7c
sidebar_position: 1
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates a new database. (Dedicated only)

## Description

In Zilliz Cloud, a database serves as a logical unit for organizing and managing data. To enhance data security and support multi-tenancy, you can create multiple databases to isolate data for different applications or tenants logically. For example, you create a database to store user A's data and another database for user B.

<Admonition type="info" icon="📘" title="Notes">

<p>This command applies to Dedicated clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz database create
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--body <value>]
```

## Options

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the database name. 

    The value should be an alphanumeric string of no more than 255 characters , starting **with an underscore (_) or a letter**.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when the output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

- **--body** (*json*) -

    Indicates the raw JSON body (or `file://path`).

    The JSON should match the following schema. For concrete examples, refer to [Create Database](/reference/restful/create-database-v2).

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "create database",
        "dbName": {
            "type": "string",
            "description": "The name of the database which the collection belongs to. Setting this to a non-existing database results in an error."
        },
        "properties": {
            "type": "object",
            "description": "The properties of the new database in key-value pairs.",
            "properties": {
                "database.replica.number": {
                    "type": "integer",
                    "description": "The number of replicas for the new database."
                },
                "database.resource_groups": {
                    "type": "string",
                    "description": "The names of the resource groups associated with the new database in a common-separated list."
                },
                "database.diskQuota.mb": {
                    "type": "integer",
                    "description": "The maximum size of the disk space for the new database, in megabytes (MB)."
                },
                "database.max.collections": {
                    "type": "integer",
                    "description": "The maximum number of collections allowed in the new database."
                },
                "database.force.deny.writing": {
                    "type": "boolean",
                    "description": "Whether to force the new database to deny writing operations."
                },
                "database.force.deny.reading": {
                    "type": "boolean",
                    "description": "Whether to force the new database to deny reading operations."
                }
            }
        }
    }
    ```

## Example

```bash
zilliz database create --name my_database
```
