---
displayed_sidbar: cliSidebar
title: "drop | Cloud"
slug: /cli/cli/Alias-drop
sidebar_label: "drop"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops an alias. | Cloud"
type: docx
token: KjCMddr4IoRPU6xGhe6c4v7qnTd
sidebar_position: 4
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

This operation drops an alias.

## Synopsis

```bash
zilliz alias drop
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## Options

- **--alias** (*string*) -

    **[REQUIRED]**

    Indicates the alias name to drop.

- **--database** (*string*) -

    Indicates the database name.

    If a cluster is configured using `zilliz context set`, the database it belongs automatically applies if this option is left unconfigured.

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

- **--yes, -y** (*boolean*) -

    Indicates whether to skip the confirmation prompt.

## Example

```bash
zilliz alias drop --alias my_alias
```
