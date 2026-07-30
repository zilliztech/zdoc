---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Database-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all databases. | Cloud"
type: docx
token: HIdHdT6RMo4ETLxjQaecjwNWnhg
sidebar_position: 4
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists all databases.

<Admonition type="info" icon="📘" title="Notes">

<p>This command applies to Dedicated clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz database list
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options

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
zilliz database list
```
