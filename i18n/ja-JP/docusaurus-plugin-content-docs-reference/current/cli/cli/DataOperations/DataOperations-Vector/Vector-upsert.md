---
title: "upsert | Cloud"
slug: /cli/cli/Vector-upsert
sidebar_label: "upsert"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はエンティティを upsert します。 | Cloud"
type: docx
token: PdMmdJQS6o1rVbxtD49cO62Onad
sidebar_position: 7
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - upsert
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# upsert

この操作はエンティティを upsert します。

## Description\{#description}

You can run this command to either insert a new entity or update an existing one, depending on whether the primary key provided in the upsert request exists in the コレクション. If the primary key is not found, an insert operation occurs. Otherwise, an update operation will be performed.

upsert リクエストは insert と delete を組み合わせたものです。既存のエンティティに対する `upsert` リクエストを受信すると、Zilliz Cloud はリクエストペイロード内のデータを挿入すると同時に、データ内で指定された元の主キーを持つ既存のエンティティを削除します。

コマンドに `--partial_update` オプションを含めて、upsert リクエストをマージモードで動作させることもできます。これにより、リクエストペイロードには更新が必要なフィールドのみを含めることができます。

## Synopsis\{#synopsis}

```bash
zilliz vector upsert
--collection <value>
--data <value>
[--database <value>]
[--partition <value>]
[--partial-update]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--body <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the コレクション name.

- **--data** (*array*) -

    **[REQUIRED]**

    Indicates the entities as JSON array or file://path.json. Required unless `--body` is provided.

    JSON 配列は次のスキーマに一致する必要があります。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "insert data",
        "type": "array",
        "items": {
            "type": "object",
            "description": "A list of entities, each of which should match the schema of the target collection."
        }
    }
    ```

- **--partition** (*string*) -

    partition 名を示します。

- **--database** (*string*) -

    Indicates the データベース name.

- **--output, -o** (*string*) -

    出力形式を示します。使用可能な値:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを示します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を示します。

- **--body** (*json*) -

    生の JSON ボディ（または `file://path`）を示します。

    JSON ボディは次のスキーマに一致する必要があります。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "upsert data",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "dbName": {
                "type": "string",
                "description": "The name of the database."
            },
            "partitionName": {
                "type": "string",
                "description": "The name of the partition to which this operation applies."
            },
            "data": {
                "type": "array",
                "items": {
                    "type": "object",
                    "description": "A list of entities, each of which should match the schema of the target collection."
                }
            },
            "partialUpdate": {
                "type": "boolean",
                "description": "Whether to enable partial update. When enabled, only the provided fields are updated."
            }
        },
        "required": [
            "data"
        ]
    }
    ```

- **--partial-update** (*boolean*) -

    部分更新を有効にするかどうかを示します。有効にすると、指定されたフィールドのみが更新されます。

## Example\{#example}

```bash
# Upsert with inline JSON
zilliz vector upsert --collection my_col --data '[{"id": 1, "vector": [0.1, 0.2, 0.3]}]'

# Upsert from a JSON file
zilliz vector upsert --collection my_col --data file:///path/to/data.json
```
