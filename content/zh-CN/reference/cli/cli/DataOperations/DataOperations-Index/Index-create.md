---
title: "create | Cloud"
slug: /cli/cli/Index-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在集合字段上创建索引。 | Cloud"
type: docx
token: BUnSd1445oFLBxxHWfYc8UpmnXe
sidebar_position: 1
keywords: 
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
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

此操作会在集合字段上创建索引。

## 描述\{#description}

为了免去您调优索引设置的工作，Zilliz Cloud 通过一种名为 AUTOINDEX 的自适应索引类型来处理索引调优。通过调整 [index build levels](/docs/tune-index-build-level) 和 [recall rate](/docs/tune-recall-rate)，您可以轻松优化搜索性能和精度。

对于标量字段，您可以根据字段类型设置索引类型。有关字段类型与适用索引类型的映射关系，请参见 [Index Scalar Fields](/docs/index-scalar-fields#overview)。

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

    **[REQUIRED]**

    指定集合名称。

- **--database** (*string*) -

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--body** (*json*) -

    指定原始 JSON 请求体（或 `file://path`）。

    该 JSON 应符合以下 schema。具体示例请参见 [Create Collection](/reference/restful/create-collection-v2)。

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
