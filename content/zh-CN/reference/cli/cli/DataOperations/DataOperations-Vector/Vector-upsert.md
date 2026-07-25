---
displayed_sidbar: cliSidebar
title: "upsert | Cloud"
slug: /cli/cli/Vector-upsert
sidebar_label: "upsert"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation upserts entities. | Cloud"
type: docx
token: PLojdlFoioPDSEx6vKpcsmevnTf
sidebar_position: 7
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - upsert
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# upsert

This operation upserts entities.

## Description

You can run this command to either insert a new entity or update an existing one, depending on whether the primary key provided in the upsert request exists in the collection. If the primary key is not found, an insert operation occurs. Otherwise, an update operation will be performed.

An upsert request combines an insert and a delete. When an `upsert` request for an existing entity is received, Zilliz Cloud inserts the data in the request payload and, at the same time, deletes the existing entity with the original primary key specified in the data.

You can also include the `--partial_update` option in the command to make an upsert request work in merge mode. This allows you to include only the fields that need updating in the request payload.

## Synopsis

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

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--data** (*array*) -

    **[REQUIRED]**

    Indicates the entities as JSON array or file://path.json. Required unless `--body` is provided.

    The JSON array should match the following schema:

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

    Indicates the partition name.

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

    The JSON body should match the following schema.

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

    Indicates whether to enable partial updates. When enabled, only the provided fields are updated.

## Example

```bash
# Upsert with inline JSON
zilliz vector upsert --collection my_col --data '[{"id": 1, "vector": [0.1, 0.2, 0.3]}]'

# Upsert from a JSON file
zilliz vector upsert --collection my_col --data file:///path/to/data.json
```
