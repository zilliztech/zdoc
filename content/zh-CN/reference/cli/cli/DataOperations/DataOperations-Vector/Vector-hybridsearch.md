---
displayed_sidbar: cliSidebar
title: "hybrid-search | Cloud"
slug: /cli/cli/Vector-hybridsearch
sidebar_label: "hybrid-search"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation performs hybrid search with multiple vectors and reranking. | Cloud"
type: docx
token: YVendfgHUotdoxxNTkcc8XUMnxf
sidebar_position: 3
keywords: 
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - hybrid-search
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# hybrid-search

This operation performs hybrid search with multiple vectors and reranking.

## Description

In many applications, an object can be searched by a rich set of information, such as title and description, or with multiple modalities, such as text, images, and audio. Zilliz Cloud supports this by allowing searches across multiple vector fields and conducting several Approximate Nearest Neighbor (ANN) searches simultaneously. Multi-vector hybrid search is particularly useful if you want to search both text and images, multiple text fields that describe the same object, or dense and sparse vectors to improve search quality.

There are two major hybrid searches, and they are:

- Sparse-Dense Vector Search

- Multimodal Vector Search

For details, refer to [Multi-Vector Hybrid Search](/docs/hybrid-search).

## Synopsis

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

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--search** (*array*) -

    **[REQUIRED]**

    Indicates the search requests as JSON array (unless --body). Required unless `--body` is provided.

    The JSON array should match the following schema.

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

    Indicates the reranking strategy as JSON (unless --body). Required unless `--body` is provided.

    The JSON object should match the following schema.

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

    Indicates the max results to return. 

    The value defaults to **10**, and its product with the `offset` should be less than **16,384**.

- **--output-fields** (*array*) -

    Indicates the fields to return as JSON array, such as `'["title", "abstract"]'`.

- **--database** (*string*) -

    Indicates the database name.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when the output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

- **--body** (*json*) -

    Indicates a raw JSON body (or `file://path`).

    The JSON object should match the following schema.

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

    Indicates a list of partition names to search within.

- **--offset** (*integer*) -

    Indicates the number of results to skip before returning matches.

    The product of this value and `limit` should be less than **16,384**.

## Example

```bash
zilliz vector hybrid-search --collection my_col --body file://hybrid-search.json
```
