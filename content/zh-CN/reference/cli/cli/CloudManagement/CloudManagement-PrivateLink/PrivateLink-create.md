---
title: "create | Cloud"
slug: /cli/cli/PrivateLink-create
sidebar_label: "create"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建一个 PrivateLink 端点。| Cloud"
type: docx
token: GBdVd6bJ1o6VhRxgHxLcsFsVn2b
sidebar_position: 2
keywords: 
  - 音频搜索
  - 什么是语义搜索
  - Embedding model
  - 图像相似性搜索
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

此操作用于创建一个 PrivateLink 端点。

## 用法\{#usage}

```bash
zilliz privatelink create [OPTIONS]
```

**选项：**

- **--project-id** (*string*) -

    **[必需]**

    项目 ID。

- **--region-id** (*string*) -

    **[必需]**

    云区域。

- **--endpoint-id** (*string*) -

    **[必需]**

    VPC 端点 ID（例如 `vpce-xxxx`）。

- **--gcp-project-id** (*string*) -

    GCP 项目 ID（仅适用于 GCP）。

## 示例\{#example}

```bash
zilliz privatelink create --project-id proj-xxxx --region-id aws-us-east-1 --endpoint-id vpce-xxxx
```
