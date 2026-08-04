---
title: "enable | Cloud"
slug: /cli/cli/Alert-enable
sidebar_label: "enable"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会启用一条告警规则。 | Cloud"
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

此操作会启用一条告警规则。

## 描述\{#description}

只有已启用的告警规则才会生效。您可以根据需要运行此命令以启用指定的告警规则。

## 概要\{#synopsis}

```bash
zilliz alert enable
--id <value>
[--project-id <value>]
[--output <json | table | text>]
```

## 选项\{#options}

- **--id** (*string*) -

    **[REQUIRED]**

    指定要启用的告警规则 ID，例如 `alert-xxxxx`。要获取现有告警规则的完整列表，请运行 `zilliz alert list`。

- **--project-id** (*string*) -

    如果您希望从列表中选择一条告警规则，请指定项目 ID。

    如果已使用 `zilliz context set` 配置项目，则在未配置此选项时会自动应用该项目。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`。

## 示例\{#example}

```bash
zilliz alert enable --id xxxx
```
