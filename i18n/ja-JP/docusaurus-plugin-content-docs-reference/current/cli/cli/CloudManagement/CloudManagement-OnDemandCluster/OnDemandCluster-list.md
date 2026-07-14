---
title: "list | Cloud"
slug: /cli/cli/OnDemandCluster-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロジェクト/リージョン内のオンデマンドクラスターを一覧表示します。 | Cloud"
type: docx
token: BZ6WdvA0eoRUJyxAqfMcJe6QnMd
sidebar_position: 4
keywords: 
  - Zilliz Cloud
  - Milvus とは
  - milvus database
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

この操作は、プロジェクト/リージョン内のオンデマンドクラスターを一覧表示します。

## Description\{#description}

プロジェクトおよびリージョン内のオンデマンドクラスターを、クラスターのステータスと CU サイズを含めて一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz on-demand-cluster list
--project-id <value>
--region-id <value>
```

## Options\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    プロジェクト ID。

- **--region-id** (*string*) -

    **[REQUIRED]**

    クラウドリージョン（例: aws-us-west-2）。

## Example\{#example}

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

# クラスターは、一時停止中に一時的に SUSPENDING と表示されることもあります。
```
