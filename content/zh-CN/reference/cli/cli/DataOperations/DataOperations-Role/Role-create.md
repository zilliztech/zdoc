---
displayed_sidbar: cliSidebar
title: "create | Cloud"
slug: /cli/cli/Role-create
sidebar_label: "create"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a new role. | Cloud"
type: docx
token: X0Vedq4MmoiEKKxmaVFca6J3nRe
sidebar_position: 1
keywords: 
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates a new role.

## Description

Zilliz Cloud offers cluster roles for you to implement access control at the cluster level. For details, read [Access Control Explained](/docs/access-control-overview).

<Admonition type="info" icon="📘" title="Notes">

<p>This command is available for Dedicated clusters only. You can run <code>zilliz context set</code> to switch among clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz role create
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
```

## Options

- **--role** (*string*) -

    **[REQUIRED]**

    Indicates the role name.

    The value should be a string of no more than **255** characters, starting **with an underscore (_) or a letter**.

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

- **--database** (*string*) -

    Indicates a database name. The value defaults to `default`.

## Example

```bash
zilliz role create --role my_role
```
