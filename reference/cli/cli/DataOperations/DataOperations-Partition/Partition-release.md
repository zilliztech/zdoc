---
title: "release | Cloud"
slug: /cli/cli/Partition-release
sidebar_label: "release"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation releases partitions from memory. | Cloud"
type: docx
token: XpaudNsR2o3MRoxTbAMcj4tEn1w
sidebar_position: 7
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - release
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# release

This operation releases partitions from memory.

## Synopsis\{#synopsis}

```bash
zilliz partition release [OPTIONS]
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
zilliz partition release --collection my_collection --names '["p1", "p2"]'
```
