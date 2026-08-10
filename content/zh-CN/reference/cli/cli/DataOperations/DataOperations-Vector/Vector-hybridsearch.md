---
title: "hybrid-search | Cloud"
slug: /cli/cli/Vector-hybridsearch
sidebar_label: "hybrid-search"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用多个向量和重排序执行混合搜索。 | Cloud"
type: docx
token: EiCXdUuf2oTB3HxiL20clnSPn8g
sidebar_position: 3
keywords: 
  - 自然语言处理搜索
  - 幻觉 大语言模型
  - 多模态搜索
  - 向量搜索算法
  - zilliz
  - zilliz cloud
  - cloud
  - hybrid-search
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# hybrid-search

此操作使用多个向量和重排序执行混合搜索。

## 说明\{#description}

在许多应用中，可以使用丰富的信息集来搜索某个对象，例如标题和描述；也可以使用多种模态进行搜索，例如文本、图像和音频。Zilliz Cloud 通过支持跨多个向量字段搜索并同时执行多个近似最近邻（ANN）搜索来实现这一点。如果您想同时搜索文本和图像、描述同一对象的多个文本字段，或者结合稠密向量与稀疏向量来提升搜索质量，多向量混合搜索会特别有用。

混合搜索主要有两种，分别是：

- 稀疏-稠密向量搜索

- 多模态向量搜索

有关详细信息，请参阅 [多向量混合搜索](/docs/hybrid-search)。

## 概要\{#synopsis}

```bash
zilliz vector hybrid-search
--collection <value>
--search <value>
--rerank <value>
[--limit <value>]
[--output-fields <value>]
[--database <value>]
[--partition <value>]
[--offset <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--search** (*array*) -

    **[必需]**

    表示以 JSON 数组形式提供的搜索请求（除非提供 --body）。除非提供 `--body`，否则此项必需。

    该 JSON 数组应符合以下 Schema。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "search parameters",
        "type": "array",
        "items": {
            "description": "Search parameter for a vector field.",
            "type": "object",
            "properties": {
                "data": {
                    "type": "array",
                    "items": {
                        "type": "number",
                        "description": "A vector embedding",
                        "format": "float32"
                    },
                    "description": "A list of vector embeddings. Zilliz Cloud searches for the most similar vector embeddings to the specified ones."
                },
                "annsField": {
                    "type": "string",
                    "description": "The name of the vector field."
                },
                "filter": {
                    "type": "string",
                    "description": "A boolean expression filter."
                },
                "groupingField": {
                    "type": "string",
                    "description": "The name of the field that serve as the aggregation criteria."
                },
                "metricType": {
                    "type": "string",
                    "description": "The name of the metric type that applies to the current search. The value should be the same as the metric type of the target collection.",
                    "enum": [
                        "L2",
                        "IP",
                        "COSINE"
                    ],
                    "default": "COSINE"
                },
                "limit": {
                    "type": "integer",
                    "description": "The number of entities to return."
                },
                "offset": {
                    "type": "integer",
                    "description": "The number of entities to skip in the returned entities."
                },
                "ignoreGrowing": {
                    "type": "boolean",
                    "description": "Whether to ignore the entities found in the growing segments."
                },
                "params": {
                    "description": "Extra search parameters.",
                    "type": "object",
                    "properties": {
                        "radius": {
                            "type": "number",
                            "format": "float64",
                            "description": "Determines the threshold of least similarity. When setting metric_type to L2, ensure that this value is greater than that of range_filter. Otherwise, this value should be lower than that of range_filter. "
                        },
                        "range_filter": {
                            "type": "number",
                            "format": "float64",
                            "description": "Refines the search to vectors within a specific similarity range. When setting metric_type to IP or COSINE, ensure that this value is greater than that of radius. Otherwise, this value should be lower than that of radius. "
                        }
                    }
                }
            },
            "required": [
                "data",
                "annsField",
                "filter",
                "groupingField",
                "limit",
                "offset",
                "ignoreGrowing"
            ]
        },
        "description": "The search parameters"
    }
    ```

- **--rerank** (*object*) -

    **[必需]**

    表示以 JSON 形式提供的重排序策略（除非提供 --body）。除非提供 `--body`，否则此项必需。

    该 JSON 对象应符合以下 Schema。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "rerank parameters",
        "type": "object",
        "properties": {
            "strategy": {
                "type": "string",
                "description": "The name of the reranking strategy.",
                "enum": [
                    "rrf",
                    "weighted"
                ]
            },
            "params": {
                "type": "object",
                "properties": {
                    "k": {
                        "type": "integer",
                        "description": "A tunable constant in the RRF algorithm. This applies only when the strategy is set to `rrf`."
                    }
                },
                "description": "A set of parameters related to the specified strategy",
                "required": [
                    "k"
                ]
            }
        },
        "description": "The reranking strategy.",
        "required": [
            "params"
        ]
    }
    ```

- **--limit** (*integer*) -

    表示要返回的最大结果数。

    该值默认为 **10**，并且它与 `offset` 的乘积应小于 **16,384**。

- **--output-fields** (*array*) -

    表示要返回的字段，采用 JSON 数组形式，例如 `'["title", "abstract"]'`。

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

    该 JSON 对象应符合以下 Schema。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "hybrid search",
        "type": "object",
        "properties": {
            "dbName": {
                "type": "string",
                "description": "The name of the database."
            },
            "partitionNames": {
                "type": "array",
                "items": {
                    "type": "string",
                    "description": "A partition name."
                },
                "description": "The name of the partitions to which this operation applies. Setting this parameter indicates that the search is within the specified partitions. Otherwise, the search is across all partitions in the collection."
            },
            "search": {
                "type": "array",
                "items": {
                    "description": "Search parameter for a vector field.",
                    "type": "object",
                    "properties": {
                        "data": {
                            "type": "array",
                            "items": {
                                "type": "number",
                                "description": "A vector embedding",
                                "format": "float32"
                            },
                            "description": "A list of vector embeddings. Zilliz Cloud searches for the most similar vector embeddings to the specified ones."
                        },
                        "annsField": {
                            "type": "string",
                            "description": "The name of the vector field."
                        },
                        "filter": {
                            "type": "string",
                            "description": "A boolean expression filter."
                        },
                        "groupingField": {
                            "type": "string",
                            "description": "The name of the field that serves as the aggregation criteria."
                        },
                        "metricType": {
                            "type": "string",
                            "description": "The name of the metric type that applies to the current search. The value should be the same as the metric type of the target collection.",
                            "enum": [
                                "L2",
                                "IP",
                                "COSINE"
                            ],
                            "default": "COSINE"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "The number of entities to return."
                        },
                        "offset": {
                            "type": "integer",
                            "description": "The number of entities to skip in the returned entities."
                        },
                        "ignoreGrowing": {
                            "type": "boolean",
                            "description": "Whether to ignore the entities found in the growing segments."
                        },
                        "params": {
                            "description": "Extra search parameters.",
                            "type": "object",
                            "properties": {
                                "radius": {
                                    "type": "number",
                                    "format": "float64",
                                    "description": "Determines the threshold of least similarity. When setting metric_type to L2, ensure that this value is greater than that of range_filter. Otherwise, this value should be lower than that of range_filter. "
                                },
                                "range_filter": {
                                    "type": "number",
                                    "format": "float64",
                                    "description": "Refines the search to vectors within a specific similarity range. When setting metric_type to IP or COSINE, ensure that this value is greater than that of radius. Otherwise, this value should be lower than that of radius. "
                                }
                            }
                        }
                    },
                    "required": [
                        "data",
                        "annsField",
                        "filter",
                        "groupingField",
                        "limit",
                        "offset",
                        "ignoreGrowing"
                    ]
                },
                "description": "The search parameters"
            },
            "rerank": {
                "type": "object",
                "properties": {
                    "strategy": {
                        "type": "string",
                        "description": "The name of the reranking strategy.",
                        "enum": [
                            "rrf",
                            "weighted"
                        ]
                    },
                    "params": {
                        "type": "object",
                        "properties": {
                            "k": {
                                "type": "integer",
                                "description": "A tunable constant in the RRF algorithm. This applies only when the strategy is set to `rrf`."
                            }
                        },
                        "description": "A set of parameters related to the specified strategy",
                        "required": [
                            "k"
                        ]
                    }
                },
                "description": "The reranking strategy.",
                "required": [
                    "params"
                ]
            },
            "limit": {
                "type": "integer",
                "description": "The total number of entities to return.\nYou can use this parameter in combination with **offset** in **param** to enable pagination.\nThe sum of this value and **offset** in **param** should be less than 16,384. "
            },
            "groupSize": {
                "type": "integer",
                "description": "The number of entities to return for each group. This parameter is only valid when `groupingField` is specified."
            },
            "strictGroupSize": {
                "type": "boolean",
                "description": "Whether to return only the top k entities for each group. This parameter is only valid when `groupingField` is specified."
            },
            "outputFields": {
                "type": "array",
                "items": {
                    "type": "string",
                    "description": "A field name"
                },
                "description": "An array of fields to return along with the search results."
            },
            "consistencyLevel": {
                "type": "string",
                "description": "The consistency level of the search operation. The value should be the same as the consistency level of the target collection.",
                "enum": [
                    "Strong",
                    "Eventually",
                    "Bounded"
                ],
                "default": "Bounded"
            },
            "functionScore": {
                "type": "object",
                "description": "Function settings for the current search request.",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name of the function to apply."
                    },
                    "description": {
                        "type": "string",
                        "description": "The description of the function to apply."
                    },
                    "type": {
                        "type": "string",
                        "description": "The type of the function to apply.",
                        "enum": [
                            "BM25",
                            "TEXTEMBEDDING",
                            "RERANK"
                        ]
                    },
                    "inputFieldNames": {
                        "type": "array",
                        "description": "A list of scalar fields to use as input for the function.",
                        "items": {
                            "type": "string",
                            "description": "A scalar field to use as input for the function.",
                            "x-i18n": {
                                "zh-CN": {
                                    "description": "作为 Function 输入的一个标量字段名称。"
                                }
                            }
                        }
                    },
                    "outputFieldNames": {
                        "type": "array",
                        "description": "A list of vector fields to use as output for the function.",
                        "items": {
                            "type": "string",
                            "description": "A vector field to use as output for the function."
                        }                                           },
                    "params": {
                        "type": "object",
                        "description": "Extra parameters for the function in key-value pairs.",
                    }
                }
            }
        },
        "required": [
            "collectionName",
            "search"
        ]
    }
    ```

- **--partition, -p** (*array*) -

    表示要在其中搜索的 Partition 名称列表。

- **--offset** (*integer*) -

    表示在返回匹配结果之前要跳过的结果数量。

    该值与 `limit` 的乘积应小于 **16,384**。

## 示例\{#example}

```bash
zilliz vector hybrid-search --collection my_col --body file://hybrid-search.json
```
