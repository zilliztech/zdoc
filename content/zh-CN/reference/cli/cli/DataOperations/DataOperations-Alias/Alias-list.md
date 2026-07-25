---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Alias-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all aliases. | Cloud"
type: docx
token: FAIsdc3inokLzNxYfpYcUwBznBb
sidebar_position: 5
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists all aliases.

## Synopsis

```bash
zilliz alias list [OPTIONS]
```

## Options

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

## Example

```bash
zilliz alias list --database default
```
