---
displayed_sidbar: cliSidebar
title: "drop | Cloud"
slug: /cli/cli/Role-drop
sidebar_label: "drop"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops a role. | Cloud"
type: docx
token: NLHNdWRtSobTj6xGRqTcUgqznQe
sidebar_position: 3
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

This operation drops a role.

<Admonition type="info" icon="📘" title="Notes">

<p>This command is available for Dedicated clusters only. You can run <code>zilliz context set</code> to switch among clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz role drop
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
[--yes]
```

## Options

- **--role** (*string*) -

    **[REQUIRED]**

    Indicates the role name to drop.

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

- **--yes, -y** (*boolean*) -

    Indicates whether to skip the confirmation prompt.

- **--database** (*string*) -

    Indicates a database name. The value defaults to `default`.

## Example

```bash
zilliz role drop --role my_role
```
