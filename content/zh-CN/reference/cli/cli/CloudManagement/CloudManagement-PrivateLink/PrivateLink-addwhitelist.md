---
title: "add-whitelist | Cloud"
slug: /cli/cli/PrivateLink-addwhitelist
sidebar_label: "add-whitelist"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将区域添加到 PrivateLink Endpoint 白名单中。 | Cloud"
type: docx
token: Tz35d2fXsogFeWxJblIcS7n2nYc
sidebar_position: 1
keywords: 
  - AI Agent
  - 语义搜索
  - 异常检测
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - add-whitelist
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# add-whitelist

此操作会将区域添加到 PrivateLink Endpoint 白名单中。

## 用法\{#usage}

```bash
zilliz privatelink add-whitelist [OPTIONS]
```

**选项：**

- **--project-id** (*string*) -

    **[必需]**

    项目 ID。

- **--region-id** (*string*) -

    **[必需]**

    要加入白名单的 Cloud 区域。

## 示例\{#example}

```bash
zilliz privatelink add-whitelist --project-id proj-xxxx --region-id aws-us-east-1
```
