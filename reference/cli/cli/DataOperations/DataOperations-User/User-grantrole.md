---
title: "grant-role | Cloud"
slug: /cli/cli/User-grantrole
sidebar_label: "grant-role"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants a role to a user. | Cloud"
type: docx
token: SvpmdXjkYo3LYTxt2ipcKhLFnZg
sidebar_position: 4
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - grant-role
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# grant-role

This operation grants a role to a user.

<Admonition type="info" icon="📘" title="Notes">

This command is available for Dedicated clusters only. You can run `zilliz context set` to switch among clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user grant-role
--user <value>
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    Indicates the username.

- **--role** (*string*) -

    **[REQUIRED]**

    Indicates the role name to grant.

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
zilliz user grant-role --user my_user --role admin
```
