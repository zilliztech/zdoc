---
title: "load | Cloud"
slug: /cli/cli/Partition-load
sidebar_label: "load"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation loads partitions into memory. | Cloud"
type: docx
token: GYyKdrbkvozJxVx6uGhcpMfonoe
sidebar_position: 6
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - load
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# load

This operation loads partitions into memory.

## Synopsis\{#synopsis}

```bash
zilliz partition load
--collection <value>
--names <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--names** (*array*) -

    **[REQUIRED]**

    Indicates the partition names as JSON array.

- **--database** (*string*) -

    Indicates the database name.

- **--output, -o** (*string*) -

    Indicates the output format. Choices: `json`, `table`, `text`, `yaml`, `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when the output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example\{#example}

```bash
zilliz partition load --collection my_collection --names '["p1", "p2"]'
```
