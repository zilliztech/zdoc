---
displayed_sidbar: cliSidebar
title: "query | Cloud"
slug: /cli/cli/Vector-query
sidebar_label: "query"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation queries entities by scalar filter expression. | Cloud"
type: docx
token: BFfGdYH1aocKSjx2CLQce7C9nWo
sidebar_position: 5
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - query
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# query

This operation queries entities by scalar filter expression.

## Description

Zilliz Cloud provides a set of useful filtering operators to help you build filter expressions that meet your needs. For details, refer to [Filtering Overview](/docs/filtering-overview) and related pages.

## Synopsis

```bash
zilliz vector query
--collection <value>
--filter <value>
[--limit <value>]
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

- **--filter** (*string*) -

    **[REQUIRED]**

    Indicates the scalar filter expression.

- **--limit** (*integer*) -

    Indicates the max results to return. 

    The value defaults to **10**, and its product with `offset` should be less than **16,384**.

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

- **--offset** (*integer*) -

    Indicates the number of results to skip before returning matches. Used for pagination with `--limit`.

    Its product with `limit` should be less than **16,384**.

- **--partition, -p** (*array*) -

    Indicates a list of partition names to query from. Queries all partitions if not specified.

## Example

```bash
zilliz vector query --collection my_col --filter 'id > 100' --limit 10
```
