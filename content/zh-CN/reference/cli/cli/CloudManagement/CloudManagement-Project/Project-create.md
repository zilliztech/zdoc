---
displayed_sidbar: cliSidebar
title: "create | Cloud"
slug: /cli/cli/Project-create
sidebar_label: "create"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a new project. | Cloud"
type: docx
token: H6MXdWNhlo3b9lx70Z3ca3VXn2e
sidebar_position: 1
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates a new project.

## Synopsis

```bash
zilliz project create
--name <value>
--plan <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates a project name.

    The value should be a string of no more than **50** characters.

- **--plan** (*string*) -

    **[REQUIRED]**

    Indicates the subscription plan. 

    Possible values: 

    <exclude lang="zh-CN">

    - `Free`,

    - `Serverless`,

    - `Standard`,

    </exclude>

    - `Enterprise`.

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
zilliz project create --name my-project --plan Standard
```
