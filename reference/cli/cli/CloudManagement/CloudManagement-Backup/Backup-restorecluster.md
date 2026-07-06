---
title: "restore-cluster | Cloud"
slug: /cli/cli/Backup-restorecluster
sidebar_label: "restore-cluster"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "This operation restores a backup to a new cluster. | Cloud"
type: docx
token: XAhudiqXqoHS1zxSDqgcNY9anxb
sidebar_position: 7
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - restore-cluster
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# restore-cluster

This operation restores a backup to a new cluster.

## Description\{#description}

In Zilliz Cloud, a backup is a copy of your data that enables you to restore the entire cluster or specific collections in the event of data loss or system failure.

Restoring a cluster creates a new cluster and copies all backed-up collections to it. Running this command without options will trigger a set of interactive prompts.

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters.

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz backup restore-cluster
--cluster-id <value>
--backup-id <value>
--project-id <value>
--name <value>
--cu-size <value>
--collection-status <KEEP | RELEASE>
--restore-version-policy <LATEST | ORIGINAL>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the source cluster ID, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--backup-id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the backup to restore, which is similar to `backupx-xxxxx`.

- **--project-id** (*string*) -

    **[REQUIRED]**

    Indicates the target project ID, which is similar to `proj-xxxxx`

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the new cluster name.

- **--cu-size** (*integer*) -

    **[REQUIRED]**

    Indicates the compute units (CUs) for the new cluster.

    A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage. The concept of CU only applies to **Dedicated** clusters.

    - For a **Dedicated** cluster in a **Standard** project, the product of its CU size and the number of replicas must be less than or equal to 32.

    - For a **Dedicated** cluster in an **Enterprise** project, the product of its CU size and the number of replicas must be less than or equal to 1,024.

- **--collection-status** (*string*) -

    **[REQUIRED]**

    Indicates the collection state after restoration.

    Possible values: `KEEP` and `RELEASE`.

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

- **--restore-version-policy** (*string*) -

    Specifies the DB version restore policy. Possible values: `LATEST` and `ORIGINAL`.

## Example\{#example}

```bash
# Restore with collections loaded
zilliz backup restore-cluster --cluster-id in01-xxxx \
--backup-id backup-xxxx \
--project-id proj-xxxx \
--name restored \
--cu-size 1 \
--collection-status KEEP \
--restore-version-policy LATEST
```
