---
title: "revoke-privilege | Cloud"
slug: /cli/cli/Role-revokeprivilege
sidebar_label: "revoke-privilege"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation revokes a privilege from a role. | Cloud"
type: docx
token: YXtHdG865oGg7IxwoZRcIJkQn8e
sidebar_position: 6
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - revoke-privilege
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# revoke-privilege

This operation revokes a privilege from a role.

<Admonition type="info" icon="📘" title="Notes">

This command is available for Dedicated clusters only.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role revoke-privilege
--role <value>
--object-type <Global | Collection | Database>
--object-name <value>
--privilege <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--role** (*string*) -

    **[REQUIRED]**

    Indicates the role name.

- **--object-type** (*string*) -

    **[REQUIRED]**

    Indicates the object type. Possible values:

    - `Global`,

    - `Collection`,

    - `Database`.

- **--object-name** (*string*) -

    **[REQUIRED]**

    Indicates the object name (or * for all).

- **--privilege** (*string*) -

    **[REQUIRED]**

    Indicates the privilege name.

- **--database** (*string*) -

    Indicates the database name.

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

## Example\{#example}

```bash
zilliz role revoke-privilege --role my_role --object-type Collection --object-name my_col --privilege Search
```
