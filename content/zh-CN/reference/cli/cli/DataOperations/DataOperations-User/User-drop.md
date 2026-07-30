---
displayed_sidbar: cliSidebar
title: "drop | Cloud"
slug: /cli/cli/User-drop
sidebar_label: "drop"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops a database user. | Cloud"
type: docx
token: EXwwdyHGZopIv9xJ48dckYjanVc
sidebar_position: 3
keywords: 
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

This operation drops a database user.

<Admonition type="info" icon="📘" title="Notes">

<p>This command is available for Dedicated clusters only. You can run <code>zilliz context set</code> to switch among clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz user drop
--user <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--yes]
```

## Options

- **--user** (*string*) -

    **[REQUIRED]**

    Indicates the username to drop.

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

## Example

```bash
zilliz user drop --user my_user
```
