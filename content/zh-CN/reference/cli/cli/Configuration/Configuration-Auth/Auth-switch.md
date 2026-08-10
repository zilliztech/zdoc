---
title: "switch | Cloud"
slug: /cli/cli/Auth-switch
sidebar_label: "switch"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会切换到其他组织。 | Cloud"
type: docx
token: WVn4dXc9FocqhRxmuwlcFcTynBg
sidebar_position: 4
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - zilliz
  - zilliz cloud
  - cloud
  - switch
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# switch

此操作会切换到其他组织。

**注意：**`zilliz auth switch` 是为向后兼容而保留的已弃用别名。在新脚本中，请使用顶层 `zilliz switch` 命令。

## 概要\{#synopsis}

```bash
zilliz auth switch <ORG_ID>
```

## 选项\{#options}

- **ORG_ID** (*string*) -

    表示此操作后在 `zilliz status` 结果中显示的组织 ID。如果未指定此项，将显示可选项。

    如果未指定此选项，将显示交互式选择列表供您选择。

## 示例\{#example}

```bash
zilliz auth switch
```
