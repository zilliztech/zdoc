---
displayed_sidbar: cliSidebar
title: "get | Cloud"
slug: /cli/cli/Vector-get
sidebar_label: "get"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets entities by primary key IDs. | Cloud"
type: docx
token: KwQLdb4UZo41g6xySjfcFtiCnl9
sidebar_position: 2
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - get
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# get

This operation gets entities by primary key IDs.

## Synopsis

```bash
zilliz vector get
--collection <value>
--id <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--id** (*array*) -

    **[REQUIRED]**

    Indicates the primary key IDs as JSON array, such as `'[1, 2, 3]'`.

- **--output-fields** (*array*) -

    Indicates the fields to return as JSON array, such as `'["title", "abstract"]'`.

- **--database** (*string*) -

    Indicates the database name.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

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
zilliz vector get --collection my_col --id '[1, 2, 3]'
```
