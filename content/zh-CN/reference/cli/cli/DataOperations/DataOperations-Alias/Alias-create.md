---
displayed_sidbar: cliSidebar
title: "create | Cloud"
slug: /cli/cli/Alias-create
sidebar_label: "create"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates an alias pointing to a collection. | Cloud"
type: docx
token: SclAd0NPBoMQ9Pxtg0vcQxK0n2f
sidebar_position: 2
keywords: 
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates an alias pointing to a collection.

## Description

You can assign an alias to a collection and conduct searches/queries against the alias so that the associated collection responds. Use this command to change the collection associated with the specified alias.

Running this command without any prompts triggers a set of interactive prompts to help set it up.

## Synopsis

```bash
zilliz alias create
--collection <value>
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options

- **--collection** (*string*) -

    **[REQUIRED]**

    Indicates the target collection name.

- **--alias** (*string*) -

    **[REQUIRED]**

    Indicates the alias name.

    The value should be an alphanumeric string of up to **255** characters, starting with an underscore (_) or a letter.

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

    Indicates the JMESPath expression to filter output.

## Example

```bash
zilliz alias create --collection my_collection --alias my_alias
```
