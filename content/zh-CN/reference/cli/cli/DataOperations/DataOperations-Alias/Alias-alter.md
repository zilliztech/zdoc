---
displayed_sidbar: cliSidebar
title: "alter | Cloud"
slug: /cli/cli/Alias-alter
sidebar_label: "alter"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation reassigns an alias to another collection. | Cloud"
type: docx
token: UTutdcqPLo4B2vxlHk1cAKunnOK
sidebar_position: 1
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - alter
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# alter

This operation reassigns an alias to another collection.

## Description

You can assign an alias to a collection and conduct searches/queries against the alias so that the associated collection responds. Use this command to change the collection associated with the specified alias.

Running this command without any prompts triggers a set of interactive prompts to help set it up.

## Synopsis

```bash
zilliz alias alter
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

    Indicates the new target collection.

- **--alias** (*string*) -

    **[REQUIRED]**

    Indicates the alias name to reassign.

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

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example

```bash
zilliz alias alter --collection new_collection --alias my_alias
```
