---
displayed_sidbar: cliSidebar
title: "get-stats | Cloud"
slug: /cli/cli/Collection-getstats
sidebar_label: "get-stats"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets collection statistics (row count, etc.). | Cloud"
type: docx
token: TS6mdq8Clo4yLNxzZvpcJOkanid
sidebar_position: 7
keywords: 
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - zilliz
  - zilliz cloud
  - cloud
  - get-stats
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# get-stats

This operation gets collection statistics (row count, etc.).

## Synopsis

```bash
zilliz collection get-stats
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--partition-names <value>]
```

## Options

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

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

## Example

```bash
zilliz collection get-stats --name my_collection
```
