---
displayed_sidbar: cliSidebar
title: "get-load-state | Cloud"
slug: /cli/cli/Collection-getloadstate
sidebar_label: "get-load-state"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets collection load state. | Cloud"
type: docx
token: RnRTdshwloBzIFx5rLHcFTm2nVh
sidebar_position: 6
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - get-load-state
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# get-load-state

This operation gets collection load state.

## Synopsis

```bash
zilliz collection get-load-state
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

- **--partition-names** (*array*) -

    Indicates the partition names to check their load state. You can chain up this option with different partition names.

## Example

```bash
zilliz collection get-load-state --name my_collection
```
