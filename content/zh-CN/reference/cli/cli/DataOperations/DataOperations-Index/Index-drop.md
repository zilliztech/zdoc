---
displayed_sidbar: cliSidebar
title: "drop | Cloud"
slug: /cli/cli/Index-drop
sidebar_label: "drop"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops an index. | Cloud"
type: docx
token: OUnsdvdjxoz76OxI9hLcFWQrnug
sidebar_position: 3
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

This operation drops an index.

## Synopsis

```bash
zilliz index drop
--collection <value>
--index-name <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--yes]
```

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--index-name** (*string*) -

    **[REQUIRED]**

    Indicates the index name to drop.

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

- **--yes, -y** (*boolean*) -

    Indicates whether to skip the confirmation prompt.

## Example

```bash
zilliz index drop --collection my_collection --index-name my_index
```
