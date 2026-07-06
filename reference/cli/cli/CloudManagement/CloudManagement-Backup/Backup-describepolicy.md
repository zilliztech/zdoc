---
title: "describe-policy | Cloud"
slug: /cli/cli/Backup-describepolicy
sidebar_label: "describe-policy"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation describes the backup policy for a cluster. | Cloud"
type: docx
token: WcQadTMuCo9voCxPT86cxFzFnkf
sidebar_position: 4
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - describe-policy
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe-policy

This operation describes the backup policy for a cluster.

## Description\{#description}

Zilliz Cloud allows you to enable **automatic backups** for your clusters, helping ensure data recovery in case of unexpected issues. Automatic backups apply to the **entire cluster**—backing up individual collections automatically is not supported.

You can run this command to learn about the settings of the current automatic backup policies that apply to the specified cluster.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz backup describe-policy
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates a cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example\{#example}

```bash
zilliz backup describe-policy --cluster-id in01-xxxxxxxxxxxx
```
