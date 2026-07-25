---
displayed_sidbar: cliSidebar
title: "describe | Cloud"
slug: /cli/cli/Alias-describe
sidebar_label: "describe"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets details of an alias. | Cloud"
type: docx
token: Qnx9d72SIo9CzrxvmcFcMRconNu
sidebar_position: 3
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# describe

This operation gets details of an alias.

## Synopsis

```bash
zilliz alias describe
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options

- **--alias** (*string*) -

    **[REQUIRED]**

    Indicates the alias name.

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
zilliz alias describe --alias my_alias
```
