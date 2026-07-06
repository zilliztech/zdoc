---
title: "list | Cloud"
slug: /cli/cli/Import-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists import jobs for a cluster. | Cloud"
type: docx
token: ObdhdVWTpogXQhx3A0YcdU2yntd
sidebar_position: 1
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

This operation lists import jobs for a cluster.

## Synopsis\{#synopsis}

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

## Options\{#options}

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

## Example\{#example}

```bash
zilliz import list --cluster-id in01-xxxxxxxxxxxx
```
