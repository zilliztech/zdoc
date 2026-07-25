---
displayed_sidbar: cliSidebar
title: "describe | Cloud"
slug: /cli/cli/Backup-describe
sidebar_label: "describe"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets details of a backup. | Cloud"
type: docx
token: TrNZd8OCnocoj0x7imqcrEiJnKh
sidebar_position: 3
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# describe

This operation gets details of a backup.

## Description

In Zilliz Cloud, a backup is a copy of your data that enables you to restore the entire cluster or specific collections in the event of data loss or system failure.

You can run this command to get the details of a backup.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Synposis

```bash
zilliz backup describe
--cluster-id <value>
--backup-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates a cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--backup-id** (*string*) -

    **[REQUIRED]**

    Indicates a backup ID, which is similar to `backupx-xxxxx`.

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

## Example

```bash
zilliz backup describe \
--cluster-id in01-xxxx \
--backup-id backup-xxxx
```
