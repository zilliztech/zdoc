---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Volume-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all volumes in a project. | Cloud"
type: docx
token: FDjjdFVzxozhvhxU5tgc42utnZg
sidebar_position: 3
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists all volumes in a project.

## Synopsis

```bash
zilliz volume list
--project-id <value>
[--page-size <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

- **--project-id** (*string*) -

    **[REQUIRED]**

    Indicates a project ID.

    If a project is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--page-size** (*integer*) -

    Indicates the number of items per page. The value defaults to **10**.

- **--page** (*integer*) -

    Indicates the current page number. The value defaults to **1**.

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
zilliz volume list --project-id proj-xxxxxxxxxxxx
```
