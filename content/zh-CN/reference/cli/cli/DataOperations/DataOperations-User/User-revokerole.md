---
displayed_sidbar: cliSidebar
title: "revoke-role | Cloud"
slug: /cli/cli/User-revokerole
sidebar_label: "revoke-role"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation revokes a role from a user. | Cloud"
type: docx
token: Bp4sdXEoYoKuYtxs7WwcZBQFncb
sidebar_position: 6
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - revoke-role
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# revoke-role

This operation revokes a role from a user.

<Admonition type="info" icon="📘" title="Notes">

<p>This command is available for Dedicated clusters only. You can run <code>zilliz context set</code> to switch among clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz user revoke-role
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

    Indicates the role name to revoke.

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
zilliz user revoke-role --user my_user --role admin
```
