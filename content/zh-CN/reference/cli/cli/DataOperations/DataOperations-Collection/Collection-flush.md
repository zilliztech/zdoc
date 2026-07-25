---
displayed_sidbar: cliSidebar
title: "flush | Cloud"
slug: /cli/cli/Collection-flush
sidebar_label: "flush"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation flushes collection data to disk. | Cloud"
type: docx
token: R0FRdiaHuo4IElxDELmcyR90nLd
sidebar_position: 5
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - flush
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# flush

This operation flushes collection data to disk.

## Description

Running this command seals the current growing segments and saves them to disk. Manually running this command can produce a large number of small segments, which may affect search performance. 

You are advised to rely on Zilliz Cloud to flush data to disk rather than run this command manually.

## Usage

```bash
zilliz collection flush
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
zilliz collection flush --name my_collection
```
