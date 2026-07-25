---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Import-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists import jobs for a cluster. | Cloud"
type: docx
token: PbE8dm28yo4rNzxrbIecQtMqnVq
sidebar_position: 1
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists import jobs for a cluster.

## Synopsis

```bash
zilliz import list
--cluster-id <value>
[--page-size <value>]
[--page <size>]
[--database <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates a cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--page-size** (*integer*) -

    Indicates the number of items per page. The value defaults to **10**.

- **--page** (*integer*) -

    Indicates the current page number. The value defaults to **1**.

- **--database** (*string*) -

    Indicates the name of a database in the specified cluster.

    If a database is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

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

## Example

```bash
zilliz import list --cluster-id in01-xxxxxxxxxxxx
```
