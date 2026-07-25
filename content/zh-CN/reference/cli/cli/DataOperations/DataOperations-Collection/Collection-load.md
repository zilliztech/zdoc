---
displayed_sidbar: cliSidebar
title: "load | Cloud"
slug: /cli/cli/Collection-load
sidebar_label: "load"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation loads a collection into memory for search. | Cloud"
type: docx
token: Q577dSJWeoSb23xarfmcmMeqncg
sidebar_position: 10
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - load
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# load

This operation loads a collection into memory for search.

## Synopsis

```bash
zilliz collection load
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options

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
zilliz collection load --name my_collection
```
