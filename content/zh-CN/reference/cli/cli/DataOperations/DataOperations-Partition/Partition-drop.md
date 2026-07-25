---
displayed_sidbar: cliSidebar
title: "drop | Cloud"
slug: /cli/cli/Partition-drop
sidebar_label: "drop"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops a partition. | Cloud"
type: docx
token: NCJFd4Iz6oJM7uxVYzGcywmWnSe
sidebar_position: 2
keywords: 
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

This operation drops a partition.

## Synopsis

```bash
zilliz partition drop
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--partition** (*string*) -

    **[REQUIRED]**

    Indicates the partition name to drop.

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

- **--yes, -y** (*boolean*) -

    Indicates whether to skip the confirmation prompt.

## Example

```bash
zilliz partition drop --collection my_collection --partition my_partition
```
