---
title: "insert | Cloud"
slug: /cli/cli/Vector-insert
sidebar_label: "insert"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将 Entity 插入到 Collection 中。| Cloud"
type: docx
token: IyKzdBU2zoXcNUxvmhvcJCISnJe
sidebar_position: 4
keywords: 
  - AI 幻觉
  - AI Agent
  - 语义搜索
  - 异常检测
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

此操作将 Entity 插入到 Collection 中。

## 说明\{#description}

插入或 upsert 数据时，请确保数据结构与目标 Collection 的 Schema 匹配。您可以选择

## 概要\{#synopsis}

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

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--data** (*array*) -

    **[必需]**

    以 JSON 数组或 `file://path.json` 形式指定 Entity。除非提供了 `--body`，否则此项为必需。

    JSON 数组应符合以下 Schema：

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

    表示 Database 名称。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于过滤输出的 JMESPath 表达式。

- **--body** (*json*) -

    表示原始 JSON 请求体（或 `file://path`）。

    JSON 请求体应符合以下 Schema。

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

    表示要插入数据的 Partition 名称。

## 示例\{#example}

```bash
# Insert with inline JSON
zilliz vector insert --collection my_col --data '[{"id": 1, "vector": [0.1, 0.2, 0.3]}]'

# Insert from a JSON file
zilliz vector insert --collection my_col --data file:///path/to/data.json
```
