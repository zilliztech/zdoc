---
displayed_sidbar: cliSidebar
title: "get-stats | Cloud"
slug: /cli/cli/Partition-getstats
sidebar_label: "get-stats"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets partition statistics. | Cloud"
type: docx
token: R2iYdl0Hnous6rxl5KMccADVn1c
sidebar_position: 3
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - get-stats
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# get-stats

This operation gets partition statistics.

## Description

The command returns the number of entities in the specified partition.

## Synopsis

```bash
zilliz partition get-stats
--collection <value>
--partition <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--partition** (*string*) -

    **[REQUIRED]**

    Indicates the partition name.

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
zilliz partition get-stats --collection my_collection --partition my_partition
```
