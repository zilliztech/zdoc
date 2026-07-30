---
title: "drop | Cloud"
slug: /cli/cli/Database-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a database. (Dedicated only) | Cloud"
type: docx
token: WjbrdMFuXoR2etxfpMdcmIebnCh
sidebar_position: 3
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

This operation drops a database. (Dedicated only)

<Admonition type="info" icon="📘" title="Notes">

This command applies to Dedicated clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz database drop
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

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

## Example\{#example}

```bash
zilliz database drop --name my_database
```
