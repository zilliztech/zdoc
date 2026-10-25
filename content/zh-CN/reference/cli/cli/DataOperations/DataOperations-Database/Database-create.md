---
title: "create | Cloud"
slug: /cli/cli/Database-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个新的 Database。（仅 Dedicated） | Cloud"
type: docx
token: DaK3dvUJpoKOLTxy1iRc4YZAnjf
sidebar_position: 1
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - 多模态 RAG
  - zilliz
  - Zilliz Cloud
  - 云
  - create
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

此操作会创建一个新的 Database。（仅 Dedicated）

## 说明\{#description}

在 Zilliz Cloud 中，Database 是用于组织和管理数据的逻辑单元。为了增强数据安全性并支持多租户，您可以创建多个 Database，以逻辑方式隔离不同应用程序或租户的数据。例如，您创建一个 Database 来存储用户 A 的数据，并为用户 B 创建另一个 Database。

<Admonition type="info" title="Notes">

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

- **--name** （*string*） -

    **[必需]**

    指示 Database 名称。

    该值应为不超过 255 个字符的字母数字字符串，且以**下划线（_）或字母**开头。

- **--output, -o** （*string*） -

    指示输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** （*boolean*） -

    指示当输出设置为 `table` 或 `csv` 时是否省略标题行。

- **--query, -q** （*string*） -

    指示用于筛选输出的 JMESPath 表达式。

- **--body** （*json*） -

    指示原始 JSON 请求体（或 `file://path`）。

    JSON 应匹配以下 Schema。具体示例请参见 [创建 Database](/reference/restful/create-database-v2)。

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
