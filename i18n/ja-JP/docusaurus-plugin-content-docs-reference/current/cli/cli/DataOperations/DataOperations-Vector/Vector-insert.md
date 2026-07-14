---
title: "insert | Cloud"
slug: /cli/cli/Vector-insert
sidebar_label: "insert"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は collection にエンティティを挿入します。 | Cloud"
type: docx
token: IyKzdBU2zoXcNUxvmhvcJCISnJe
sidebar_position: 4
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - insert
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# insert

この操作は collection にエンティティを挿入します。

## Description\{#description}

データを挿入または upsert する際は、データ構造が対象 collection のスキーマと一致していることを確認してください。次のいずれかを使用できます

## Synopsis\{#synopsis}

```bash
zilliz vector insert
--collection <value>
--data <value>
[--database <value>]
[--partition <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--body <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    collection 名を示します。

- **--data** (*array*) -

    **[REQUIRED]**

    JSON 配列または `file://path.json` としてエンティティを示します。`--body` が指定されていない限り必須です。

    JSON 配列は次のスキーマに一致している必要があります。

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

- **--database** (*string*) -

    database 名を示します。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値:

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

    JSON ボディは次のスキーマに一致している必要があります。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "insert data",
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
            }
        },
        "required": [
            "data"
        ]
    }
    ```

- **--partition, -p** (*string*) -

    データを挿入する partition の名前を示します。

## Example\{#example}

```bash
# Insert with inline JSON
zilliz vector insert --collection my_col --data '[{"id": 1, "vector": [0.1, 0.2, 0.3]}]'

# Insert from a JSON file
zilliz vector insert --collection my_col --data file:///path/to/data.json
```
