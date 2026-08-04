---
title: "disable | Cloud"
slug: /cli/cli/Alert-disable
sidebar_label: "disable"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可禁用一条告警规则。 | Cloud"
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

此操作可禁用一条告警规则。

## 描述\{#description}

当暂时不需要某些告警规则时，您可以运行此命令来禁用指定的告警规则。被禁用的告警规则仍然存在，您可以在需要时重新启用其中任意一条。

## 概要\{#synopsis}

```bash
zilliz alert disable
--id <value>
[--project-id <value>]
[--output <json | table | text>]
```

## 选项\{#options}

- **--id** (*string*) -

    **[REQUIRED]**

    指定要禁用的告警规则 ID，例如 `alert-xxxx`。如需获取现有告警规则的完整列表，请运行 `zilliz alert list`。

- **--project-id** (*string*) -

    在从列表中选择告警规则时，指定项目 ID。

    如果已使用 `zilliz context set` 配置项目，则在未配置此选项时会自动应用该项目。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`，

    - `table`，

    - `text`。

## 示例\{#example}

```bash
zilliz alert disable --id xxx
```
