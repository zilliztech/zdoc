---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Index-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists indexes on a collection. | Cloud"
type: docx
token: ZMZRdgyNkojxQMxb0tvcTQ2PnBb
sidebar_position: 4
keywords: 
  - what are vector databases
  - vector databases comparison
  - Faiss
  - Video search
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists indexes on a collection.

## Usage

```bash
zilliz index list
--collection <value>
[--database <value>]
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

**OPTIONS:**

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the collection name.

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
zilliz index list --collection my_collection
```
