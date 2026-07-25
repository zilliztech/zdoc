---
displayed_sidbar: cliSidebar
title: "drop | Cloud"
slug: /cli/cli/Database-drop
sidebar_label: "drop"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops a database. (Dedicated only) | Cloud"
type: docx
token: TB3Odp61soJUTnxuGb7cjA00nXf
sidebar_position: 3
keywords: 
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

This operation drops a database. (Dedicated only)

<Admonition type="info" icon="📘" title="Notes">

<p>This command applies to Dedicated clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz database drop
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the database name to drop.

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
zilliz database drop --name my_database
```
