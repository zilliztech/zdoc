---
title: "hybrid-search | Cloud"
slug: /cli/cli/Vector-hybridsearch
sidebar_label: "hybrid-search"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、複数の vector と reranking によるハイブリッド検索を実行します。 | Cloud"
type: docx
token: EiCXdUuf2oTB3HxiL20clnSPn8g
sidebar_position: 3
keywords: 
  - nlp search
  - llm のハルシネーション
  - マルチモーダル検索
  - vector 検索アルゴリズム
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

この操作は、複数の vector と reranking によるハイブリッド検索を実行します。

## Description\{#description}

多くのアプリケーションでは、オブジェクトはタイトルや説明といった豊富な情報セット、あるいはテキスト、画像、音声などの複数モダリティによって検索できます。Zilliz Cloud は、複数の vector field にまたがる検索を可能にし、複数の Approximate Nearest Neighbor (ANN) 検索を同時に実行することで、これをサポートします。マルチ vector ハイブリッド検索は、テキストと画像の両方、同じオブジェクトを説明する複数のテキスト field、あるいは dense と sparse の vector を検索して検索品質を向上させたい場合に特に有用です。

主なハイブリッド検索には次の 2 種類があります。

- Sparse-Dense Vector Search

- Multimodal Vector Search

詳細については、[Multi-Vector Hybrid Search](/docs/hybrid-search) を参照してください。

## Synopsis\{#synopsis}

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

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    collection 名を指定します。

- **--search** (*array*) -

    **[REQUIRED]**

    検索リクエストを JSON 配列として指定します（`--body` を使用しない場合）。`--body` が指定されていない場合は必須です。

    JSON 配列は次のスキーマに一致する必要があります。

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

    **[REQUIRED]**

    reranking 戦略を JSON として指定します（`--body` を使用しない場合）。`--body` が指定されていない場合は必須です。

    JSON オブジェクトは次のスキーマに一致する必要があります。

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

    返す結果の最大数を指定します。 

    デフォルト値は **10** で、`offset` との積は **16,384** 未満である必要があります。

- **--output-fields** (*array*) -

    返す field を JSON 配列として指定します。例: `'["title", "abstract"]'`。

- **--database** (*string*) -

    database 名を指定します。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値は次のとおりです。

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    出力が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングする JMESPath 式を指定します。

- **--body** (*json*) -

    生の JSON body（または `file://path`）を指定します。

    JSON オブジェクトは次のスキーマに一致する必要があります。

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

    検索対象とする partition 名のリストを指定します。

- **--offset** (*integer*) -

    一致結果を返す前にスキップする結果数を指定します。

    この値と `limit` の積は **16,384** 未満である必要があります。

## Example\{#example}

```bash
zilliz vector hybrid-search --collection my_col --body file://hybrid-search.json
```
