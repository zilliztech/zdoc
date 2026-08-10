---
title: "describe | Cloud"
slug: /cli/cli/StorageIntegration-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作按 ID 描述存储集成，以便您检查其当前配置、状态和验证消息。 | Cloud"
type: docx
token: Ia7VdhmCgoO6R3xcWtIck7Tfndf
sidebar_position: 3
keywords: 
  - 音频搜索
  - 什么是语义搜索
  - Embedding 模型
  - 图像相似度搜索
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

此操作按 ID 描述存储集成，以便您检查其当前配置、状态和验证消息。

## 概要\{#synopsis}

```bash
zilliz storage-integration describe --integration-id <string>
```

**选项：**

- **--integration-id** (*string*) -

    **[必需]**

    指定存储集成 ID。

## 示例\{#example}

```bash
zilliz storage-integration describe --integration-id int-xxxxxxxx
```
