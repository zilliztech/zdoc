---
title: "delete | Cloud"
slug: /cli/cli/Alert-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes an alert rule. | Cloud"
type: docx
token: L6dIdJaeGoNfmcxAXC2cW82znke
sidebar_position: 2
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

This operation deletes an alert rule.

## Description\{#description}

You can run this command to remove the specified alert rule once it is no longer needed. This operation is irreversible; exercise caution. To get an exhaustive list of existing alert rules, run `zilliz alert list`.

Running this command without any options triggers a set of interactive prompts to help you set it up.

## Synopsis\{#synopsis}

```bash
zilliz alert delete
--id <value>
[--project-id <value>]
[--output <json | table | text>]
[--yes]
```

## Options\{#options}

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

## Example\{#example}

```bash
zilliz alert delete
```
