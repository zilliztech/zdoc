---
title: "list | Cloud"
slug: /cli/cli/Alias-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all aliases. | Cloud"
type: docx
token: L8PEdl4Dio11q5x4rPBc4OFZn8b
sidebar_position: 5
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
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

This operation lists all aliases.

## Synopsis\{#synopsis}

```bash
zilliz alias list [OPTIONS]
```

## Options\{#options}

- **--database** (*string*) -

    **[REQUIRED]**

    Indicates the database name.

    If a cluster is configured using `zilliz context set`, the database it belongs automatically applies if this option is left unconfigured.

- **--collection** (*string*) -

    Indicates the filter by collection name.

- **--output, -o** (*string*) -

    Indicates the output format. Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when the output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example\{#example}

```bash
zilliz alias list --database default
```
