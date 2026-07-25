---
displayed_sidbar: cliSidebar
title: "create | Cloud"
slug: /cli/cli/Collection-create
sidebar_label: "create"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a new collection. | Cloud"
type: docx
token: P5jpdMWcMoW2MMxMBtcczRjInYc
sidebar_position: 2
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates a new collection.

## Description

A collection is a two-dimensional table with fixed columns and variable rows. Each column represents a field, and each row represents an entity.

To create a collection, you need to prepare a schema and an optional set of index parameters. As a simple alternative, you can just set a dimensionality to create a collection with a vector field of the specified dimensionality and a primary key of the INT64 type.

A schema defines the data structure of a collection. Before creating a collection, you need to determine the schema design. A collection schema has a primary key, at least one vector field, and several scalar fields. 

To save you the effort of tuning index settings, Zilliz Cloud handles index tuning with an auto-adaptive index type called AUTOINDEX. By tuning the [index build levels](/docs/tune-index-build-level) and [recall rate](/docs/tune-recall-rate), you can easily optimize search performance and precision.

Running this command without any options triggers a set of interactive prompts to help you set it up. You can also attach a payload to specify the schema and index parameters manually.

## Synopsis

```bash
zilliz collection create
--name <value>
--dimension <value>
[--metric-type <value>]
[--id-type <value>]
[--auto-id <value>]
[--primary-field <value>]
[--vector-field <value>]
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--body <value>]
```

## Options

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the collection name. 

    The value should be an alphanumeric string of no more than **255** characters, starting **with an underscore (_) or a letter**.

- **--dimension** (*integer*) -

    **[REQUIRED]**

    Indicates the vector dimension. Required unless `--body` is provided.

    The value should be a positive integer between **0** and **32768**.

- **--metric-type** (*string*) -

    Indicates the distance metric. The value defaults to `COSINE`. Possible values:

    - `COSINE`,

    - `L2`,

    - `IP`,

    - `JACCARD`,

    - `HAMMING`.

- **--id-type** (*string*) -

    Indicates the primary key type. Possible values:

    - `Int64`,

    - `VarChar`.

- **--auto-id** (*boolean*) -

    Indicates the auto-generated primary key.

- **--primary-field** (*string*) -

    Indicates the primary key field name. 

    The value should be a string of no more than **255** characters, a string **with an underscore (_) or a letter**.

- **--vector-field** (*string*) -

    Indicates the vector field name.

    The value should be a string of no more than **255** characters, a string **with an underscore (_) or a letter**.

- **--database** (*string*) -

    Indicates the database name.

    If a cluster is configured using `zilliz context set`, the database it belongs automatically applies if this option is left unconfigured.

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

    Indicates the raw JSON body (or `file://path`).

    The JSON should match the following schema. For concrete examples, refer to [Create Collection](/reference/restful/create-collection-v2).

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "custom setup",
        "type": "object",
        "properties": {
            "dbName": {
                "type": "string"
            },
            "collectionName": {
                "type": "string"
            },
            "schema": {
                "type": "object",
                "properties": {
                    "autoID": {
                        "type": "string"
                    },
                    "enableDynamicField": {
                        "type": "string"
                    },
                    "fields": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": "object",
                                "properties": {
                                    "fieldName": {
                                        "type": "string"
                                    },
                                    "dataType": {
                                        "type": "string",
                                        "enum": [
                                            "Bool",
                                            "Int8",
                                            "Int16",
                                            "Int32",
                                            "Int64",
                                            "Float",
                                            "Double",
                                            "VarChar",
                                            "Array",
                                            "Json",
                                            "Geometry",
                                            "BinaryVector",
                                            "FloatVector",
                                            "Float16Vector",
                                            "BFloat16Vector",
                                            "SparseFloatVector",
                                            "Int8Vector"
                                        ]
                                    },
                                    "elementDataType": {
                                        "type": "string",
                                        "enum": [
                                            "Bool",
                                            "Int8",
                                            "Int16",
                                            "Int32",
                                            "Int64",
                                            "Float",
                                            "Double",
                                            "VarChar"
                                        ]
                                    },
                                    "nullable": {
                                        "type": "boolean"
                                    },
                                    "defaultValue": {
                                        "type": "string"
                                    },
                                    "isPrimary": {
                                        "type": "boolean"
                                    },
                                    "isPartitionKey": {
                                        "type": "boolean"
                                    },
                                    "isClusteringKey": {
                                        "type": "boolean"
                                    },
                                    "elementTypeParams": {
                                        "type": "object",                   
                                        "properties": {
                                            "max_length": {
                                                "type": "integer"
                                            },
                                            "dim": {
                                                "type": "integer"
                                            },
                                            "max_capacity": {
                                                "type": "integer"
                                            }
                                        }
                                    }
                                },
                                "required": [
                                    "fieldName",
                                    "dataType"
                                ]   
                            }
                        }
                    },
                    "functions": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string"
                                    },
                                    "description": {
                                        "type": "string"
                                    },
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "FunctionType.BM25",
                                            "FunctionType.TEXTEMBEDDING",
                                            "FunctionType.RERANK"
                                        ]
                                    },
                                    "inputFieldNames": {
                                        "type": "array",
                                        "items": {
                                            "type": "string"
                                        }
                                    },
                                    "outputFieldNames": {
                                        "type": "array",
                                        "items": {
                                            "type": "string"
                                        }
                                    },
                                    "params": {
                                        "type": "object"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "indexParams": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": "object",
                        "properties": {
                            "metricType": {
                                "type": "string",
                                "enum": [
                                    "L2",
                                    "IP",
                                    "COSINE",
                                    "JACCARD",
                                    "HAMMING"
                                ],
                                "default": "COSINE"
                            },
                            "fieldName": {
                                "type": "string"
                            },
                            "indexName": {
                                "type": "string"
                            },
                            "params": {
                                "type": "object",
                                "properties": {
                                    "index_type": {
                                        "type": "string"
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
                    }
    
                }
            },
            "params": {
                "type": "object",
                "properties": {
                    "type": "object",
                    "properties": {
                        "consistencyLevel": {
                            "type": "string",
                            "enum": [
                                "Strong",
                                "Eventually",
                                "Bounded"
                            ],
                            "default": "Bounded"
                        },
                        "partitionsNum": {
                            "type": "integer"
                        },
                        "ttlSeconds": {
                            "type": "integer"
                        },
                        "partitionKeyIsolation": {
                            "type": "boolean",
                            "default": false
                        },
                        "mmap_enabled": {
                            "type": "boolean"
                        }
                    }               
                }
            },
            "description": {
                "type": "string"
            }
        }
    }
    ```

- **--description** (*string*) -

    Indicates the description of the collection.

## Example

```bash
# Quick create with defaults (COSINE metric, auto schema)
zilliz collection create --name my_collection --dimension 768

# Create with L2 metric and VarChar primary key
zilliz collection create --name my_collection --dimension 768 --metric-type L2 --id-type VarChar

# Create with full schema via JSON body
zilliz collection create --name my_collection --body file://schema.json
```
