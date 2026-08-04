---
title: "delete | Cloud"
slug: /cli/cli/Alert-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一条告警规则。 | Cloud"
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

此操作会删除一条告警规则。

## 描述\{#description}

当不再需要指定的告警规则时，您可以运行此命令将其删除。此操作不可逆，请谨慎执行。要获取现有告警规则的完整列表，请运行 `zilliz alert list`。

在不带任何选项运行此命令时，将触发一组交互式提示，帮助您完成设置。

## 概要\{#synopsis}

```bash
zilliz alert delete
--id <value>
[--project-id <value>]
[--output <json | table | text>]
[--yes]
```

## 选项\{#options}

- **--id** (*string*) -

    **[必需]**

    指定要删除的告警规则的 ID，例如 `alert-xxxx`。要获取现有告警规则的完整列表，请运行 `zilliz alert list`。

- **--project-id** (*string*) -

    如果您希望从列表中选择告警规则，则指定项目的 ID，例如 `proj-xxxx`。

    如果已使用 `zilliz context set` 配置项目，则在未配置此选项时会自动应用该项目。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`。

- **--yes, -y** (*boolean*) -

    指定是否跳过确认提示。

## 示例\{#example}

```bash
zilliz alert delete
```
