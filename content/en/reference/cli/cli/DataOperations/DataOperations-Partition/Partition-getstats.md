---
title: "get-stats | Cloud"
slug: /cli/cli/Partition-getstats
sidebar_label: "get-stats"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets partition statistics. | Cloud"
type: docx
token: VEEzdJ5tyoaFVbxG6JvcDpULnMg
sidebar_position: 3
keywords: 
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database
  - zilliz
  - zilliz cloud
  - cloud
  - get-stats
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# get-stats

This operation gets partition statistics.

## Description\{#description}

The command returns the number of entities in the specified partition.

## Synopsis\{#synopsis}

```bash
zilliz partition get-stats
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

## Example\{#example}

```bash
zilliz partition get-stats --collection my_collection --partition my_partition
```
