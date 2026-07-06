---
title: "list | Cloud"
slug: /cli/cli/Partition-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists partitions in a collection. | Cloud"
type: docx
token: QVxadXWKIo8YcHxZgD1c0F0VnXf
sidebar_position: 5
keywords: 
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

This operation lists partitions in a collection.

## Synopsis\{#synopsis}

```bash
zilliz partition list
--collection <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

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
zilliz partition list --collection my_collection
```
