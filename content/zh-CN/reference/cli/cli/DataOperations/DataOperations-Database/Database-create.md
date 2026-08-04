---
title: "create | Cloud"
slug: /cli/cli/Database-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建一个新数据库。（仅 Dedicated）| Cloud"
type: docx
token: DaK3dvUJpoKOLTxy1iRc4YZAnjf
sidebar_position: 1
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

此操作用于创建一个新数据库。（仅 Dedicated）

## 描述\{#description}

在 Zilliz Cloud 中，数据库是用于组织和管理数据的逻辑单元。为了增强数据安全性并支持多租户，您可以创建多个数据库，从逻辑上为不同的应用程序或租户隔离数据。例如，您可以创建一个数据库来存储用户 A 的数据，再创建另一个数据库来存储用户 B 的数据。

<Admonition type="info" icon="📘" title="说明">

此命令适用于 Dedicated 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz database create
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--body <value>]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    指定数据库名称。 

    该值应为不超过 255 个字符的字母数字字符串，并且**以下划线 (_) 或字母开头**。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--body** (*json*) -

    指定原始 JSON 请求体（或 `file://path`）。

    JSON 应符合以下架构。有关具体示例，请参见[创建数据库](/reference/restful/create-database-v2)。

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

## 示例\{#example}

```bash
zilliz database create --name my_database
```
