---
displayed_sidbar: cliSidebar
title: "release | Cloud"
slug: /cli/cli/Partition-release
sidebar_label: "release"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation releases partitions from memory. | Cloud"
type: docx
token: Oy2NdZ5FroKJOPxzFyNcL3SDnyf
sidebar_position: 7
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - release
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# release

This operation releases partitions from memory.

## Synopsis

```bash
zilliz partition release [OPTIONS]
```

## Options

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

## Example

```bash
zilliz partition release --collection my_collection --names '["p1", "p2"]'
```
