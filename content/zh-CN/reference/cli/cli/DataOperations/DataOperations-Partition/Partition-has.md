---
displayed_sidbar: cliSidebar
title: "has | Cloud"
slug: /cli/cli/Partition-has
sidebar_label: "has"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation checks if a partition exists. | Cloud"
type: docx
token: KtkldxyCGoCmF8xsxYHcfRQZnCf
sidebar_position: 4
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - zilliz
  - zilliz cloud
  - cloud
  - has
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# has

This operation checks if a partition exists.

## Synopsis

```bash
zilliz partition has
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

    Indicates the output format. Choices: `json`, `table`, `text`, `yaml`, `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when the output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example

```bash
zilliz partition has --collection my_collection --partition my_partition
```
