---
displayed_sidbar: cliSidebar
title: "drop | Cloud"
slug: /cli/cli/Collection-drop
sidebar_label: "drop"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops a collection. This action is irreversible. | Cloud"
type: docx
token: LnnEdA9w7opaYXx2vHOcxcxonMb
sidebar_position: 4
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

This operation drops a collection. This action is irreversible.

## Synopsis

```bash
zilliz collection drop
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## Options

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the collection name to drop.

- **--database** (*string*) -

    Indicates the database name.

    If a cluster is configured using `zilliz context set`, the database it belongs automatically applies if this option is left unconfigured.

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
zilliz collection drop --name my_collection
```
