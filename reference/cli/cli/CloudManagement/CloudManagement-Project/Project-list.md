---
title: "list | Cloud"
slug: /cli/cli/Project-list
sidebar_key: cli/Project-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all projects. | Cloud"
type: docx
token: AMQEd3tO4o7CSSxZ51NcLA2AnVc
sidebar_position: 3
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists all projects.

## Synopsis\{#synopsis}

```bash
zilliz project list
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

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
zilliz project list
```
