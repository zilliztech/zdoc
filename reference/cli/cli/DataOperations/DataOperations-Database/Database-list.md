---
title: "list | Cloud"
slug: /cli/cli/Database-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all databases. | Cloud"
type: docx
token: KiwWdLJ8houEeRxGECEcc3glnoh
sidebar_position: 4
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
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

This operation lists all databases.

<Admonition type="info" icon="📘" title="Notes">

This command applies to Dedicated clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz database list
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

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
zilliz database list
```
