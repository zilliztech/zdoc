---
title: "create | Cloud"
slug: /cli/cli/Role-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a new role. | Cloud"
type: docx
token: V9xIdjMEMowIh2xVJUUcvir6nUf
sidebar_position: 1
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

This operation creates a new role.

## Description\{#description}

Zilliz Cloud offers cluster roles for you to implement access control at the cluster level. For details, read [Access Control Explained](/docs/access-control-overview).

<Admonition type="info" icon="📘" title="Notes">

This command is available for Dedicated clusters only. You can run `zilliz context set` to switch among clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz role create
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
```

## Options\{#options}

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

## Example\{#example}

```bash
zilliz role create --role my_role
```
