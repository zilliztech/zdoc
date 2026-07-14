---
title: "create | Cloud"
slug: /cli/cli/Database-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は新しいデータベースを作成します。（Dedicated のみ） | Cloud"
type: docx
token: DaK3dvUJpoKOLTxy1iRc4YZAnjf
sidebar_position: 1
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似性検索
  - マルチモーダル RAG
  - zilliz
  - zilliz cloud
  - cloud
  - 作成
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作は新しいデータベースを作成します。（Dedicated のみ）

## Description\{#description}

Zilliz Cloud では、データベースはデータを整理および管理するための論理単位として機能します。データセキュリティを強化し、マルチテナンシーをサポートするために、複数のデータベースを作成して、異なるアプリケーションやテナントのデータを論理的に分離できます。たとえば、ユーザー A のデータを保存するためのデータベースを 1 つ作成し、ユーザー B のために別のデータベースを作成できます。

<Admonition type="info" icon="📘" title="注意">

このコマンドは Dedicated クラスターに適用されます。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz database create
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--body <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[必須]**

    データベース名を指定します。 

    値は 255 文字以内の英数字の文字列で、**アンダースコア (_) または英字で始まる**必要があります。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

- **--body** (*json*) -

    生の JSON ボディ（または `file://path`）を指定します。

    JSON は次のスキーマに一致する必要があります。具体例については、[Create Database](/reference/restful/create-database-v2) を参照してください。

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

## Example\{#example}

```bash
zilliz database create --name my_database
```
