---
title: "upsert | Cloud"
slug: /cli/cli/Vector-upsert
sidebar_label: "upsert"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会对 Entity 执行 upsert。 | Cloud"
type: docx
token: PdMmdJQS6o1rVbxtD49cO62Onad
sidebar_position: 7
keywords: 
  - IVF
  - knn
  - 图像搜索
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - upsert
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# upsert

此操作会对 Entity 执行 upsert。

## 说明\{#description}

您可以运行此命令来插入新的 Entity 或更新现有 Entity，具体取决于 upsert 请求中提供的主键是否存在于 Collection 中。如果未找到该主键，则会执行插入操作；否则，将执行更新操作。

upsert 请求结合了插入和删除操作。当收到针对现有 Entity 的 `upsert` 请求时，Zilliz Cloud 会插入请求负载中的数据，同时删除数据中指定原始主键的现有 Entity。

您还可以在命令中包含 `--partial_update` 选项，使 upsert 请求以合并模式工作。这样，您就只需在请求负载中包含需要更新的字段。

## 概要\{#synopsis}

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

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--data** (*array*) -

    **[必需]**

    以 JSON 数组或 file://path.json. 的形式指定 Entity。除非提供了 `--body`，否则此项为必需。

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

- **--partition** (*string*) -

    表示 Partition 名称。

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

    表示用于筛选输出的 JMESPath 表达式。

- **--body** (*json*) -

    表示原始 JSON 请求体（或 `file://path`）。

    JSON 请求体应符合以下 Schema。

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

    表示是否启用部分更新。启用后，仅更新已提供的字段。

## 示例\{#example}

```bash
# Upsert with inline JSON
zilliz vector upsert --collection my_col --data '[{"id": 1, "vector": [0.1, 0.2, 0.3]}]'

# Upsert from a JSON file
zilliz vector upsert --collection my_col --data file:///path/to/data.json
```
