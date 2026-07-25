---
displayed_sidbar: cliSidebar
title: "grant-role | Cloud"
slug: /cli/cli/User-grantrole
sidebar_label: "grant-role"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation grants a role to a user. | Cloud"
type: docx
token: Fz3JdZ0rSoNxuDxvR0TcIXl5nhh
sidebar_position: 4
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - grant-role
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# grant-role

This operation grants a role to a user.

<Admonition type="info" icon="📘" title="Notes">

<p>This command is available for Dedicated clusters only. You can run <code>zilliz context set</code> to switch among clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz user grant-role
--user <value>
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options

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

## Example

```bash
zilliz user grant-role --user my_user --role admin
```
