---
displayed_sidbar: restfulSidebar
slug: /restful-versioning
title: RESTful API 版本控制
description: 本页介绍 Zilliz Cloud RESTful API 使用的版本控制方案。
beta: FALSE
notebook: FALSE
sidebar_label: API 版本控制
sidebar_position: 0
keywords: 
    - zilliz cloud
    - zilliz
    - cloud
    - restful
    - api
    - versioning
---

import Admonition from '@theme/Admonition';

# RESTful API 版本控制

Zilliz Cloud RESTful API 采用版本控制，以确保 API 端点的稳定性和兼容性。 

版本控制通过 URL 路径版本控制方案实现，即在 URL 路径中包含版本号。 

例如，用于列出所有可用云的 API 端点的 V2 版本可通过以下 URL 访问：

```
https://api.cloud.zilliz.com/v2/clouds
```

而用于创建新 Collection 的 API 端点的 V2 版本可通过以下 URL 访问：

```
https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/create
```

建议您使用这些 API 端点的 **V2 版本**，后续的新功能和改进也将添加到 V2 版本中。V1 版本将很快被弃用。
