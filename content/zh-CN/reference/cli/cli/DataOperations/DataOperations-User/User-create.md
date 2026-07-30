---
displayed_sidbar: cliSidebar
title: "create | Cloud"
slug: /cli/cli/User-create
sidebar_label: "create"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a new database user. | Cloud"
type: docx
token: USPedjTNOo7vNTxeNiwctLAcnMb
sidebar_position: 1
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates a new database user.

## Description

In Zilliz Cloud, you can create cluster users and assign them cluster roles to define the privileges, achieving data security.

Upon creating a cluster, a default user named `db_admin` is automatically created. This user cannot be dropped. In addition to this default user, you can create more cluster users for fine-grained access control.

To manage cluster users, you must be an **Organization Owner** or a **Project Admin** or have a role with **Cluster_Admin** privileges.

<Admonition type="info" icon="📘" title="Notes">

<p>This command is available for Dedicated clusters only. You can run <code>zilliz context set</code> to switch among clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz user create
--user <value>
--password <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options

- **--user** (*string*) -

    **[REQUIRED]**

    Indicates the username.

    The value should be a string no more than **32** characters and starting **with an underscore (_) or a letter**.

- **--password** (*string*) -

    **[REQUIRED]**

    Indicates the password. 

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
zilliz user create --user my_user --password my_password
```
