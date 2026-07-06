---
title: "list | Cloud"
slug: /cli/cli/Alert-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists alert rules for a project. | Cloud"
type: docx
token: DTiIdd5NBocV9JxsNHZcoUownwh
sidebar_position: 5
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
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

This operation lists alert rules for a project.

## Synopsis\{#synopsis}

```bash
zilliz alert list
[--project-id <value>]
[--page-size <value>]
[--page <value>]
[--output <json | table | text>]
```

## Options\{#options}

- **--project-id** (*string*) -

    Indicates the project ID, such as `proj-xxxxx`.

    If a project is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--page-size** (*integer*) -

    Indicates the number of items per page. The value defaults to **10**.

- **--page** (*integer*) -

    Indicates the page number. The value defaults to **1**.

- **--output, -o** (*string*) -

    Indicates the output format. Possible value:

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz alert list
```
