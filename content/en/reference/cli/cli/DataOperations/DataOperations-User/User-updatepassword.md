---
title: "update-password | Cloud"
slug: /cli/cli/User-updatepassword
sidebar_label: "update-password"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation updates the user password. | Cloud"
type: docx
token: AB6Hd6NHUoNLXIxgXywc3hmtnjc
sidebar_position: 7
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - update-password
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# update-password

This operation updates the user password.

<Admonition type="info" icon="📘" title="Notes">

This command is available for Dedicated clusters only. You can run `zilliz context set` to switch among clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user update-password
--user <value>
--password <value>
--new-password <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    Indicates the username.

- **--password** (*string*) -

    **[REQUIRED]**

    Indicates the current password.

- **--new-password** (*string*) -

    **[REQUIRED]**

    Indicates the new password.

    The password should be a string of at least **eight** characters that contains **two** types of the following options:

    - Uppercase letters (A-Z)

    - Lowercase letters (a-z)

    - Digits (0-9)

    - Special characters (`!`, `@`, `#`, etc.)

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
zilliz user update-password --user my_user --password old_pass --new-password new_pass
```
