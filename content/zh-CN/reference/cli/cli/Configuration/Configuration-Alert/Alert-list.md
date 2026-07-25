---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Alert-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists alert rules for a project. | Cloud"
type: docx
token: SflPdLKXsoY2iFxIiljcBiIfnKc
sidebar_position: 5
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists alert rules for a project.

## Synopsis

```bash
zilliz alert list
[--project-id <value>]
[--page-size <value>]
[--page <value>]
[--output <json | table | text>]
```

## Options

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

## Example

```bash
zilliz alert list
```
