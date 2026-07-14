---
title: "describe | Cloud"
slug: /cli/cli/OnDemandCluster-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はオンデマンドクラスターの詳細を取得します。 | Cloud"
type: docx
token: L2WsdkbDVoD5sGxAkkkcK4UEnHb
sidebar_position: 3
keywords: 
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - セマンティック検索
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

この操作はオンデマンドクラスターの詳細を取得します。

## Description\{#description}

ステータス、プロジェクト、リージョン、CU サイズ情報を含む、単一のオンデマンドクラスターの詳細を取得します。

## Synopsis\{#synopsis}

```bash
zilliz on-demand-cluster describe
--cluster-id <value>
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    オンデマンドクラスター ID。

## Example\{#example}

```bash
zilliz -o json on-demand-cluster describe --cluster-id in-xxxxxxxxxxxx

# Example output
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
