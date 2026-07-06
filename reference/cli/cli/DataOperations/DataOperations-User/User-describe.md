---
title: "describe | Cloud"
slug: /cli/cli/User-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets details of a user. | Cloud"
type: docx
token: ES6CdyFsgoXMEtxpLRAcrnZ3n9f
sidebar_position: 2
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

This operation gets details of a user.

<Admonition type="info" icon="📘" title="Notes">

This command is available for Dedicated clusters only. You can run `zilliz context set` to switch among clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user describe
--user <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    Indicates the username.

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
zilliz user describe --user my_user
```
