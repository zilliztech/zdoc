---
title: "list | Cloud"
slug: /cli/cli/OnDemandCluster-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出项目中的按需集群/region. | Cloud"
type: docx
token: BZ6WdvA0eoRUJyxAqfMcJe6QnMd
sidebar_position: 4
keywords: 
  - Zilliz Cloud
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - Zilliz
  - Zilliz Cloud
  - 云
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作会列出项目中的按需集群/region.

## 说明\{#description}

列出项目和区域中的按需集群，包括集群状态和 CU 大小。

## Synopsis\{#synopsis}

```bash
zilliz on-demand-cluster list
--project-id <value>
--region-id <value>
```

## 选项\{#options}

- **--project-id** (*string*) -

    **[必填]**

    项目 ID。

- **--region-id** (*string*) -

    **[必填]**

    云区域（例如 aws-us-west-2）。

## 示例\{#example}

```bash
zilliz -o json on-demand-cluster list --project-id proj-xxxx --region-id aws-us-west-2

# Example output
# {
#   "count": 2,
#   "onDemandClusters": [
#     {
#       "clusterId": "in07-xxxxxxxxxxxxxxx",
#       "clusterName": "c8_60",
#       "status": "RUNNING",
#       "cuSize": 8,
#       "projectId": "proj-xxxx",
#       "regionId": "aws-us-west-2"
#     },
#     {
#       "clusterId": "in07-yyyyyyyyyyyyyyy",
#       "clusterName": "e2e",
#       "status": "SUSPENDED",
#       "cuSize": 8,
#       "projectId": "proj-xxxx",
#       "regionId": "aws-us-west-2"
#     }
#   ]
# }

# A cluster can also temporarily report SUSPENDING while it is being suspended.
```
