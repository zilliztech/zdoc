---
title: "启用 | Cloud"
slug: /cli/cli/Alert-enable
sidebar_label: "启用"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于启用告警规则。| Cloud"
type: docx
token: MLrJdT9TdojvcJxhauic8s9anBf
sidebar_position: 4
keywords: 
  - 开源向量 Database
  - 向量索引
  - 开源向量 Database
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - cloud
  - 启用
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# 启用

此操作用于启用告警规则。

## 说明\{#description}

只有已启用的告警规则才会生效。您可以根据需要运行此命令以启用指定的告警规则。

## 语法\{#synopsis}

```bash
zilliz alert enable
--id <value>
[--project-id <value>]
[--output <json | table | text>]
```

## 选项\{#options}

- **--id** (*string*) -

    **[必需]**

    表示要启用的告警规则 ID，例如 `alert-xxxxx`。要获取现有告警规则的完整列表，请运行 `zilliz alert list`。

- **--project-id** (*string*) -

    如果您希望从列表中选择告警规则，则表示项目 ID。

    如果使用 `zilliz context set` 配置了项目，则在未配置此选项时会自动生效。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`。

## 示例\{#example}

```bash
zilliz alert enable --id xxxx
```
