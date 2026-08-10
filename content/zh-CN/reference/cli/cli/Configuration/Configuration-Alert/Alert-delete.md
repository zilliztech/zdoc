---
title: "删除 | Cloud"
slug: /cli/cli/Alert-delete
sidebar_label: "删除"
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
  - Milvus Database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - 删除
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# 删除

此操作会删除一条告警规则。

## 说明\{#description}

当不再需要指定的告警规则时，您可以运行此命令将其移除。此操作不可逆，请谨慎执行。要获取现有告警规则的完整列表，请运行 `zilliz alert list`。

运行此命令时如果不带任何选项，将触发一组交互式提示来帮助您完成设置。

## 语法\{#synopsis}

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

    指定要删除的告警规则 ID，例如 `alert-xxxx`。要获取现有告警规则的完整列表，请运行 `zilliz alert list`。

- **--project-id** (*string*) -

    如果您希望从列表中选择告警规则，则指定项目 ID，例如 `proj-xxxx`。

    如果已使用 `zilliz context set` 配置项目，则在未配置此选项时会自动应用该项目。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`，

    - `table`，

    - `text`。

- **--yes, -y** (*boolean*) -

    指定是否跳过确认提示。

## 示例\{#example}

```bash
zilliz alert delete
```
