---
displayed_sidbar: cliSidebar
title: "start | Cloud"
slug: /cli/cli/Import-start
sidebar_label: "start"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation starts a data import job. | Cloud"
type: docx
token: EMBrd9PtWoNfh4xBseQcPzaOn2b
sidebar_position: 2
keywords: 
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - start
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# start

This operation starts a data import job.

## Description

To import data, ensure it is converted to the acceptable format. For details, refer to [Use BulkWriter](/docs/use-bulkwriter).

## Synopsis

```bash
zilliz import start
--cluster-id <value>
--collection <value>
[--output <value>]
[--query <value>]
[--no-header]
--body <value>
```

## Options

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the target cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the target collection name.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

- **--body** (*string*) -

    **[REQUIRED]**

    Indicates the request body, which should be a stringified JSON object containing multiple file paths, or a path to a single file or folder. For application storage options and format options, refer to [Storage Options](/docs/data-import-storage-options) and [Format Options](/docs/data-import-format-options).

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "data paths",
        "type": "array",
        "items": {
            "type": "array",
            "items": {
                "type": "string",
            }
        }
    }
    ```

## Example

```bash
# Import from S3
zilliz import start --cluster-id in01-xxxx --collection my_col --body '{"files": [["s3://bucket/data.json"]]}'

# Import using a JSON file
zilliz import start --cluster-id in01-xxxx --collection my_col --body file://import-spec.json
```
