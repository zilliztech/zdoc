---
displayed_sidbar: cliSidebar
title: "has | Cloud"
slug: /cli/cli/Collection-has
sidebar_label: "has"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation checks if a collection exists. | Cloud"
type: docx
token: B0Wld8SqbonTPHxqGTac4Sngnob
sidebar_position: 8
keywords: 
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - zilliz
  - zilliz cloud
  - cloud
  - has
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# has

This operation checks if a collection exists.

## Synopsis

```bash
zilliz collection has
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

**OPTIONS:**

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
zilliz collection has --name my_collection
```
