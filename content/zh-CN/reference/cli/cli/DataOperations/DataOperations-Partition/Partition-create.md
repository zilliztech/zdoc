---
displayed_sidbar: cliSidebar
title: "create | Cloud"
slug: /cli/cli/Partition-create
sidebar_label: "create"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a partition in a collection. | Cloud"
type: docx
token: UxAvdPDetoIl4mx5QB8cpeLynbh
sidebar_position: 1
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates a partition in a collection.

## Description

A partition is a subset of a collection. Each partition shares the same data structure with its parent collection but contains only a subset of the data in the collection.

When creating a collection, Zilliz Cloud also creates a partition named **default** in the collection. If you are not going to add any other partitions, all entities inserted into the collection go into the default partition, and all searches and queries are carried out within it.

You can add more partitions and insert entities into them based on certain criteria. Then you can restrict your searches and queries within certain partitions, improving search performance.

A collection can have up to 1,024 partitions.

## Synopsis

```bash
zilliz partition create
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

    Indicates a collection name.

- **--partition** (*string*) -

    **[REQUIRED]**

    Indicates the partition name.

    The value should be a string of no more than **255** characters, starting **with an underscore (_) or a letter**.

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
zilliz partition create --collection my_collection --partition my_partition
```
