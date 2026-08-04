---
title: "list-services | Cloud"
slug: /cli/cli/PrivateLink-listservices
sidebar_label: "list-services"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出可用的 PrivateLink 端点服务。 | Cloud"
type: docx
token: WIbvdNJNIoOG3Rx4gfncUuD4nBd
sidebar_position: 5
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - list-services
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list-services

此操作列出可用的 PrivateLink 端点服务。

## 用法\{#usage}

```bash
zilliz privatelink list-services [OPTIONS]
```

**选项：**

- **--region-id** (*string*) -

    按云区域筛选。

## 示例\{#example}

```bash
zilliz privatelink list-services
zilliz privatelink list-services --region-id aws-us-east-1
```
