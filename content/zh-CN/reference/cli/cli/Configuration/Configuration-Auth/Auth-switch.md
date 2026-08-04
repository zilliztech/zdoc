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
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
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

**注意：** `zilliz auth switch` 是一个已弃用的别名，保留它是为了向后兼容。请在新脚本中使用顶级命令 `zilliz switch`。

## 概要\{#synopsis}

```bash
zilliz auth switch <ORG_ID>
```

## 选项\{#options}

- **ORG_ID** (*string*) -

    表示此操作完成后，在 `zilliz status` 结果中显示的组织 ID。如果未指定此项，将显示可供选择的列表。

    如果未指定此选项，将显示一个交互式选择列表供你选择。

## 示例\{#example}

```bash
zilliz auth switch
```
