---
title: "create | Cloud"
slug: /cli/cli/Index-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在 Collection 字段上创建索引。 | Cloud"
type: docx
token: BUnSd1445oFLBxxHWfYc8UpmnXe
sidebar_position: 1
keywords: 
  - 神经网络
  - 深度学习
  - 知识库
  - 自然语言处理
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

此操作会在 Collection 字段上创建索引。

## 说明\{#description}

为了免去您调整索引设置的工作量，Zilliz Cloud 使用名为 AUTOINDEX 的自适应索引类型来处理索引调优。通过调节 [索引构建级别](/docs/tune-index-build-level) 和 [召回率](/docs/tune-recall-rate)，您可以轻松优化搜索性能和精度。

对于标量字段，您可以根据字段类型设置索引类型。有关字段类型与适用索引类型的映射关系，请参见 [标量字段索引](/docs/index-scalar-fields#overview)。

## 概要\{#synposis}

```bash
zilliz index create
--collection <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--body <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示 Collection 名称。

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

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

- **--body** (*json*) -

    表示原始 JSON 正文（或 `file://path`）。

    JSON 应符合以下 Schema。有关具体示例，请参见 [创建 Collection](/reference/restful/create-collection-v2)。

    ```json
    {
        "type": "object",
        "properties": {
            "indexParams": {
                "type": "array",
                "items": {
                    "type": "object",
                    "description": "Index parameters for a specific field.",
                    "properties": {
                        "metricType": {
                            "type": "string",
                            "description": "The similarity metric type used to build the index. For more information, refer to [Similarity Metrics Explained](/docs/search-metrics-explained).",
                            "enum": [
                                "L2",
                                "IP",
                                "COSINE"
                            ],
                            "default": "COSINE"
                        },
                        "fieldName": {
                            "type": "string",
                            "description": "The name of the target field on which an index is to be created. The value should be a string of no more than 255 characters, starting with an underscore (_) or a letter."
                        },
                        "indexName": {
                            "type": "string",
                            "description": "The name of the index to create. The value defaults to the target field name. The value should be a string of no more than 255 characters, starting with an underscore (_) or a letter."
                        },
                        "params": {
                            "description": "The index type and related settings. In Zilliz Cloud, the value should always be `AUTOINDEX`.",
                            "type": "object",
                            "properties": {
                                "index_type": {
                                    "type": "string",
                                    "description": "The type of the index to create"
                                }
                            },
                            "required": [
                                "index_type"
                            ]
                        }
                    },
                    "required": [
                        "metricType",
                        "fieldName",
                        "indexName"
                    ]
                },
                "description": "The parameters that apply to the index-building process."
            }
        },
        "required": [
            "indexParams",
            "collectionName"
        ]
    }
    ```

## 示例\{#example}

```bash
zilliz index create --collection my_col --body '{"indexParams": [{"fieldName": "vector", "indexType": "AUTOINDEX"}]}'
```
