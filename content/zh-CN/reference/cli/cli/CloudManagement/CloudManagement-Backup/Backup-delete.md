---
displayed_sidbar: cliSidebar
title: "delete | Cloud"
slug: /cli/cli/Backup-delete
sidebar_label: "delete"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation deletes a backup. | Cloud"
type: docx
token: HXoRdtosOo9mFLxdKLic4telnWW
sidebar_position: 2
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# delete

This operation deletes a backup.

## Description

In Zilliz Cloud, a backup is a copy of your data that enables you to restore the entire cluster or specific collections in the event of data loss or system failure.

You can delete a backup if it is no longer needed. The deleted backup will immediately become unavailable. Please exercise with caution.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz backup delete 
--cluster-id <value>
--backup-id <value>
[--output <value>]
[--query <value>]
[--no-header]
[--yes]
```

## Options

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates a cluster ID, which is similar to `inxx-xxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--backup-id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the backup to delete, which is similar to `backupx-xxxxx`.

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

- **--yes, -y** (*boolean*) -

    Indicates whether to skip the interactive prompts.

## Example

```bash
zilliz backup delete \
--cluster-id in01-xxxx \
--backup-id backup-xxxx
```
