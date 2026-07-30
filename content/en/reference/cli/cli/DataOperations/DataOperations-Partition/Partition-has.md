---
title: "has | Cloud"
slug: /cli/cli/Partition-has
sidebar_label: "has"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation checks if a partition exists. | Cloud"
type: docx
token: IQy0d491iojaTEx3teycfP3snCe
sidebar_position: 4
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - has
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# has

This operation checks if a partition exists.

## Synopsis\{#synopsis}

```bash
zilliz partition has
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--partition** (*string*) -

    **[REQUIRED]**

    Indicates the partition name.

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
zilliz partition has --collection my_collection --partition my_partition
```
