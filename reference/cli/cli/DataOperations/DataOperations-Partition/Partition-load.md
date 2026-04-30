---
title: "load | Cloud"
slug: /cli/cli/Partition-load
sidebar_key: cli/Partition-load
sidebar_label: "load"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation loads partitions into memory. | Cloud"
type: docx
token: VzoRdU4TloXwScxB2a5cOzFAnwc
sidebar_position: 6
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - load
  - cliv01
displayed_sidebar: cliSidebar

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
