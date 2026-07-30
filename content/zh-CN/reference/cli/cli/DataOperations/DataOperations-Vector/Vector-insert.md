---
displayed_sidbar: cliSidebar
title: "insert | Cloud"
slug: /cli/cli/Vector-insert
sidebar_label: "insert"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation inserts entities into a collection. | Cloud"
type: docx
token: O4dddYwASo2Rx9xXi3Ccn9dcnSc
sidebar_position: 4
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - insert
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# insert

This operation inserts entities into a collection.

## Description

When inserting or upserting data, ensure the data structure matches the schema of the target collection. You can either

## Synopsis

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

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--data** (*array*) -

    **[REQUIRED]**

    Indicates the entities as JSON array or `file://path.json`. Required unless `--body` is provided.

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

    Indicates the name of the partition to insert data into.

## Example

```bash
# Insert with inline JSON
zilliz vector insert --collection my_col --data '[{"id": 1, "vector": [0.1, 0.2, 0.3]}]'

# Insert from a JSON file
zilliz vector insert --collection my_col --data file:///path/to/data.json
```
