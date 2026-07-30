---
displayed_sidbar: cliSidebar
title: "export | Cloud"
slug: /cli/cli/Backup-export
sidebar_label: "export"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation exports a backup to external storage. | Cloud"
type: docx
token: A4XEdRBSZoBVotxjz8Bca39Dnbf
sidebar_position: 5
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - export
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# export

This operation exports a backup to external storage.

## Description

In Zilliz Cloud, a backup is a copy of your data that enables you to restore the entire cluster or specific collections in the event of data loss or system failure.

You can export backup files to an integrated storage service identified by its integration ID. This operation is asynchronous and will create a job. You can run [`zilliz job describe`](./Job-describe) to obtain the progress of the job.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Usage

```bash
zilliz backup export
--cluster-id <value>
--backup-id <value>
--integration-id <value>
[--directory <value>]
[--output <value>]
[--query <value>]
[--no-header]
```

**OPTIONS:**

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates a cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--backup-id** (*string*) -

    **[REQUIRED]**

    Indicates a backup ID, which is similar to `backupx-xxxxx`.

- **--integration-id** (*string*) -

    **[REQUIRED]**

    Indicates a storage integration ID, which is similar to `integ-xxxxx`.

- **--directory** (*string*) -

    Indicates the target directory in external storage.

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
zilliz backup export --cluster-id in01-xxxx \
--backup-id backup-xxxx \
--integration-id integ-xxxx
```
