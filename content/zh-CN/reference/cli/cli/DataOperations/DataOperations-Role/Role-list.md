---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Role-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all roles. | Cloud"
type: docx
token: RnVSdpa8Uog0ufxOa5Bc2LN2n9d
sidebar_position: 5
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists all roles.

<Admonition type="info" icon="📘" title="Notes">

<p>This command is available for Dedicated clusters only. You can run <code>zilliz context set</code> to switch among clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz role list
[--database <value>]
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

- **--database** (*string*) -

    Indicates a database name. The value defaults to `default`.

## Example

```bash
zilliz role list
```
