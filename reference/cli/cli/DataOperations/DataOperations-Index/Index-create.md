---
title: "create | Cloud"
slug: /cli/cli/Index-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an index on a collection field. | Cloud"
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

This operation creates an index on a collection field.

## Description\{#description}

To save you the effort of tuning index settings, Zilliz Cloud handles index tuning with an auto-adaptive index type called AUTOINDEX. By tuning the [index build levels](/docs/tune-index-build-level) and [recall rate](/docs/tune-recall-rate), you can easily optimize search performance and precision.

For scalar fields, you can set index types according to the field types. For the mapping of field types to applicable index types, refer to [Index Scalar Fields](/docs/index-scalar-fields#overview).

## Synposis\{#synposis}

```bash
zilliz index create
--collection <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--body <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

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

    The JSON should match the following schema. For concrete examples, refer to [Create Collection](/reference/restful/create-collection-v2).

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

## Example\{#example}

```bash
zilliz index create --collection my_col --body '{"indexParams": [{"fieldName": "vector", "indexType": "AUTOINDEX"}]}'
```
