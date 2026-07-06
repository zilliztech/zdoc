---
title: "enable | Cloud"
slug: /cli/cli/Alert-enable
sidebar_label: "enable"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation enables an alert rule. | Cloud"
type: docx
token: MLrJdT9TdojvcJxhauic8s9anBf
sidebar_position: 4
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - enable
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# enable

This operation enables an alert rule.

## Description\{#description}

Only enabled alert rules apply. You can run this command to enable the specified alert rules as needed.

## Synopsis\{#synopsis}

```bash
zilliz alert enable
--id <value>
[--project-id <value>]
[--output <json | table | text>]
```

## Options\{#options}

- **--id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the alert rule to enable, such as `alert-xxxxx`. To get an exhaustive list of existing alert rules, run `zilliz alert list`.

- **--project-id** (*string*) -

    Indicates the project ID if you expect to select an alert rule from a list.

    If a project is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values: 

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz alert enable --id xxxx
```
