---
displayed_sidbar: cliSidebar
title: "search | Cloud"
slug: /cli/cli/Vector-search
sidebar_label: "search"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation searches for similar vectors. | Cloud"
type: docx
token: X82qdozLzoGYUaxyRE2cBIBRnff
sidebar_position: 6
keywords: 
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - search
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# search

This operation searches for similar vectors.

## Description

The ANN and k-Nearest Neighbors (kNN) search are the most common methods for vector similarity search. In a kNN search, you must compare all vectors in a vector space with the query vector carried in the search request before figuring out the most similar ones, which is time-consuming and resource-intensive.

ANN searches depend on pre-built indexes, and the search throughput, memory usage, and search correctness may vary with the index types you choose. You need to balance search performance and correctness.

To reduce the learning curve, Zilliz Cloud provides **AUTOINDEX**. With **AUTOINDEX**, Zilliz Cloud can analyze the data distribution within your collection while building the index and set the most optimized index parameters based on the analysis to strike a balance between search performance and correctness.

For details on AUTOINDEX and applicable metric types, refer to [AUTOINDEX Explained](/docs/autoindex-explained) and [Metric Types](/docs/search-metrics-explained).

## Synopsis

```bash
zilliz vector search
--collection <value>
--data <value>
--anns-field <value>
[--limit <value>]
[--filter <value>]
[--database <value>]
[--partition <value>]
[--offset <value>]
[--search-params <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--data** (*array*) -

    **[REQUIRED]**

    Indicates the query vectors as JSON array.

    The JSON array should match the following schema:

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "search data",
        "type": "array",
        "items": {
            "type": "array",
            "description": "A vector embedding, whose length should match the dimensionality of the target vector field.",
            "items": {
                "type": "number",
                "description": "A dimension value of the vector embedding"
            }
        }
    }
    ```

- **--anns-field** (*string*) -

    Indicates the vector field to search on.

- **--limit** (*integer*) -

    Indicates the max results to return.

    The value defaults to **10**, and its product with `offset` should be less than **16,384**.

- **--filter** (*string*) -

    Indicates the scalar filter expression.

- **--output-fields** (*array*) -

    Indicates the fields to return as JSON array.

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

- **--partition, -p** (*array*) -

    Indicates a list of partition names to search in. Searches all partitions if not specified.

- **--offset** (*integer*) -

    Indicates the number of results to skip before returning matches. Used for pagination with `--limit`.

    Its product with `limit` should be less than **16,384**.

- **--search-params** (*json*) -

    Indicates a JSON string of search parameters. For example, `{"metricType":"COSINE","params":{"level": 5}}`).

## Example

```bash
# Basic vector search
zilliz vector search --collection my_col --data '[[0.1, 0.2, 0.3]]' --limit 10

# Search with scalar filter
zilliz vector search --collection my_col --data '[[0.1, 0.2]]' --filter 'age > 18' --output-fields '["name", "age"]'
```
