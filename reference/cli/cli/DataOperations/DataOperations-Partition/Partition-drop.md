---
title: "drop | Cloud"
slug: /cli/cli/Partition-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a partition. | Cloud"
type: docx
token: DT7Jduvj2osqF0xVhwMcU2t7nmd
sidebar_position: 2
keywords: 
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

This operation drops a partition.

## Synopsis\{#synopsis}

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

## Options\{#options}

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

## Example\{#example}

```bash
zilliz partition drop --collection my_collection --partition my_partition
```
