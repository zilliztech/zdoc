---
title: "insert | Cloud"
slug: /cli/cli/Vector-insert
sidebar_label: "insert"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将实体插入到集合中。 | Cloud"
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

此操作会将实体插入到集合中。

## Description\{#description}

在插入或 upsert 数据时，请确保数据结构与目标集合的 schema 匹配。你可以选择

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

    指定集合名称。

- **--data** (*array*) -

    **[REQUIRED]**

    指定实体，格式为 JSON 数组或 `file://path.json`。除非提供了 `--body`，否则此参数为必需。

    JSON 数组应符合以下 schema：

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

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

- **--body** (*json*) -

    指定原始 JSON 请求体（或 `file://path`）。

    JSON 请求体应符合以下 schema。

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

    指定要插入数据的分区名称。

## Example\{#example}

```bash
# Insert with inline JSON
zilliz vector insert --collection my_col --data '[{"id": 1, "vector": [0.1, 0.2, 0.3]}]'

# Insert from a JSON file
zilliz vector insert --collection my_col --data file:///path/to/data.json
```
