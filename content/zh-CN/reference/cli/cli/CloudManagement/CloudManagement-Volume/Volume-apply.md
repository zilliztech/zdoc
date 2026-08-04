---
title: "apply | Cloud"
slug: /cli/cli/Volume-apply
sidebar_label: "apply"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将卷应用（挂载）到项目。 | Cloud"
type: docx
token: VJ8cdV2uuoYAuMxrJAjcMmRknke
sidebar_position: 4
keywords: 
  - 什么是向量数据库
  - vectordb
  - 多模态向量数据库检索
  - 检索增强生成
  - zilliz
  - zilliz cloud
  - cloud
  - apply
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# apply

此操作会将卷应用（挂载）到项目。

## 用法\{#usage}

```bash
zilliz volume apply [OPTIONS]
```

**选项：**

- **--name** (*string*) -

    **[必填]**

    卷名称。

- **--project-id** (*string*) -

    要将该卷挂载到的项目 ID。

## 示例\{#example}

```bash
zilliz volume apply --name my-volume --project-id proj-xxxx
```
