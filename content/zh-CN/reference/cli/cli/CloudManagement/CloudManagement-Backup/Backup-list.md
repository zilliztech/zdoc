---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Backup-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all backups. | Cloud"
type: docx
token: IO8UdHyHmotVsLx6D18cRBpYn8y
sidebar_position: 6
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists all backups.

## Description

In Zilliz Cloud, a backup is a copy of your data that enables you to restore the entire cluster or specific collections in the event of data loss or system failure.

When you run this command without any options, you will be asked whether to set additional options. The prompt defaults to yes and will guide you through option settings. If you enter N for the prompt, the command retrieves all backups.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters.</p>

</Admonition>

## Synopsis

```bash
zilliz backup list
[--project-id <value>]
[--cluster-id <value>]
[--creation-method <manual | auto>]
[--backup-type <CLUSTER | COLLECTION>]
[--page-size <value>]
[--page <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--all]
```

## Options

- **--project-id** (*string*) -

    Indicates a project ID as a filtering condition, which is similar to `proj-xxxxx`.

- **--cluster-id** (*string*) -

    Indicates a cluster ID as a filtering condition, which is similar to `inxx-xxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--creation-method** (*string*) -

    Indicates the creation method as a filtering condition. 

    Possible values are: `manual` and `auto`.

- **--backup-type** (*string*) -

    Indicates a backup type as a filtering condition.

    Possible values are `CLUSTER` and `COLLECTION`.

- **--page-size** (*integer*) -

    Indicates the items per page. The value defaults to **10**.

- **--page** (*integer*) -

    Indicates the page number. The value defaults to **1**.

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

- **--all, -a** (*boolean*) -

    Indicates whether to fetch all pages.

## Example

```bash
# List all backups
zilliz backup list

# List backups for a specific cluster
zilliz backup list --cluster-id in01-xxxxxxxxxxxx
```
