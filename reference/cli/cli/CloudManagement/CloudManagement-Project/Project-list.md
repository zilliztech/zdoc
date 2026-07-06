---
title: "list | Cloud"
slug: /cli/cli/Project-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all projects. | Cloud"
type: docx
token: KZ5gdkIy0ojiWixSU0dc6C5KnEd
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
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
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
