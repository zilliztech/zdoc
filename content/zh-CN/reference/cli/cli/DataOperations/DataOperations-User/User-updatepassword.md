---
displayed_sidbar: cliSidebar
title: "update-password | Cloud"
slug: /cli/cli/User-updatepassword
sidebar_label: "update-password"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation updates the user password. | Cloud"
type: docx
token: CLzGdXUNzo2XaHxRvBYcaYSZnud
sidebar_position: 7
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - update-password
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# update-password

This operation updates the user password.

<Admonition type="info" icon="📘" title="Notes">

<p>This command is available for Dedicated clusters only. You can run <code>zilliz context set</code> to switch among clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz user update-password
--user <value>
--password <value>
--new-password <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options

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

## Example

```bash
zilliz user update-password --user my_user --password old_pass --new-password new_pass
```
