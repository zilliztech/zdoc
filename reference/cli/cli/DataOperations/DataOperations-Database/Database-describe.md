---
title: "describe | Cloud"
slug: /cli/cli/Database-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets details of a database. (Dedicated only) | Cloud"
type: docx
token: A8XSdcz0UoXHnyxHPcOcaLExn3o
sidebar_position: 2
keywords: 
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

This operation gets details of a database. (Dedicated only)

<Admonition type="info" icon="📘" title="Notes">

This command applies to Dedicated clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz database describe
--name <value>
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the database name.

- **--output, -o** (*string*) -

    ndicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when the output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example\{#example}

```bash
zilliz database describe --name my_database
```
