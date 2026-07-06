---
title: "disable | Cloud"
slug: /cli/cli/Alert-disable
sidebar_label: "disable"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation disables an alert rule. | Cloud"
type: docx
token: AVX3dxX68oYAc1x06uVc7bgcnx1
sidebar_position: 3
keywords: 
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
  - zilliz
  - zilliz cloud
  - cloud
  - disable
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# disable

This operation disables an alert rule.

## Description\{#description}

You can run this command to disable the specified alert rules when they are temporarily not needed. The disabled alert rules still exist, and you can enable any of them as needed.

## Synopsis\{#synopsis}

```bash
zilliz alert disable
--id <value>
[--project-id <value>]
[--output <json | table | text>]
```

## Options\{#options}

- **--id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the alert rule to disable, such as `alert-xxxx`. To get an exhaustive list of existing alert rules, run `zilliz alert list`.

- **--project-id** (*string*) -

    Indicates the project ID when selecting an alert rule from a list.

    If a project is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values: 

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz alert disable --id xxx
```
