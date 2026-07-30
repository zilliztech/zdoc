---
displayed_sidbar: cliSidebar
title: "delete | Cloud"
slug: /cli/cli/Alert-delete
sidebar_label: "delete"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation deletes an alert rule. | Cloud"
type: docx
token: RAZ5dMgFUoufLJxfmzvcInernmc
sidebar_position: 2
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# delete

This operation deletes an alert rule.

## Description

You can run this command to remove the specified alert rule once it is no longer needed. This operation is irreversible; exercise caution. To get an exhaustive list of existing alert rules, run `zilliz alert list`.

Running this command without any options triggers a set of interactive prompts to help you set it up.

## Synopsis

```bash
zilliz alert delete
--id <value>
[--project-id <value>]
[--output <json | table | text>]
[--yes]
```

## Options

- **--id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the alert rule to delete, such as `alert-xxxx`. To get an exhaustive list of existing alert rules, run `zilliz alert list`.

- **--project-id** (*string*) -

    Indicates the ID of a project if you expect to select alert rules from a list, such as `proj-xxxx`.

    If a project is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`.

- **--yes, -y** (*boolean*) -

    Indicates whether to skip the confirmation prompts.

## Example

```bash
zilliz alert delete
```
