---
displayed_sidbar: cliSidebar
title: "release | Cloud"
slug: /cli/cli/Collection-release
sidebar_label: "release"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation releases a collection from memory. | Cloud"
type: docx
token: Tl8cdrCCvoT8Six3cy0co3SDnjd
sidebar_position: 11
keywords: 
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - zilliz
  - zilliz cloud
  - cloud
  - release
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# release

This operation releases a collection from memory.

## Usage

```bash
zilliz collection release
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

**OPTIONS:**

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

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

## Example

```bash
zilliz collection release --name my_collection
```
