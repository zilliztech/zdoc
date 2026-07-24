---
title: "delete | Cloud"
slug: /cli/cli/Vector-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes entities by filter expression. | Cloud"
type: docx
token: NtaUdIxZBoupfkxG52lco4oZnzf
sidebar_position: 1
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

This operation deletes entities by filter expression.

## Description\{#description}

Zilliz Cloud provides a set of useful filtering operators to help you build filter expressions that meet your needs. For details, refer to [Filtering Overview](/docs/filtering-overview) and related pages.

## Synopsis\{#synopsis}

```bash
zilliz vector delete
--collection <value>
--filter <value>
[--partition <value>]
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## Options\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

- **--filter** (*string*) -

    **[REQUIRED]**

    Indicates the filter expression for entities to delete.

- **--partition** (*string*) -

    Indicates the partition name.

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

## Example\{#example}

```bash
zilliz vector delete --collection my_col --filter 'id in [1, 2, 3]'
```
