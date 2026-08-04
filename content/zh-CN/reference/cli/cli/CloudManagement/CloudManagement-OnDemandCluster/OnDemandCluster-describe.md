---
title: "describe | Cloud"
slug: /cli/cli/OnDemandCluster-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取按需集群的详细信息。 | Cloud"
type: docx
token: L2WsdkbDVoD5sGxAkkkcK4UEnHb
sidebar_position: 3
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
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

此操作获取按需集群的详细信息。

## 说明\{#description}

获取单个按需集群的详细信息，包括状态、项目、区域和 CU 大小信息。

## 概要\{#synopsis}

```bash
zilliz on-demand-cluster describe
--cluster-id <value>
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    按需集群 ID。

## 示例\{#example}

```bash
zilliz -o json on-demand-cluster describe --cluster-id in-xxxxxxxxxxxx

# 示例输出
# {
#   "autoSuspend": 60,
#   "clusterId": "in-xxxxxxxxxxxx",
#   "clusterName": "c8_60",
#   "status": "RUNNING",
#   "cuSize": 8,
#   "projectId": "proj-xxxx",
#   "regionId": "aws-us-west-2"
# }
```
