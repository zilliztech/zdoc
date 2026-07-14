---
title: "list | Cloud"
slug: /cli/cli/PrivateLink-list
sidebar_label: "list"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロジェクトの PrivateLink エンドポイントを一覧表示します。 | Cloud"
type: docx
token: JQ1JdRsfBo1LdpxdTSpcgrx4n3b
sidebar_position: 4
keywords: 
  - milvus オープンソース
  - milvus はどのように動作するか
  - Zilliz vector database
  - Zilliz database
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

この操作は、プロジェクトの PrivateLink エンドポイントを一覧表示します。

## Description\{#description}

JSON 出力で、ページネーション項目とエンドポイントエントリを含めて、プロジェクトの PrivateLink エンドポイントを一覧表示します。

## Synopsis\{#synopsis}

```bash
zilliz privatelink list
--project-id <value>
[--api-key <value>]
```

## Options\{#options}

- **--project-id** (*string*) -

    一覧表示したい PrivateLink エンドポイントが属するプロジェクト ID を指定します。

    プロジェクト ID。

- **--api-key** (*string*) -

    このコマンド用の API key を指定します。この値は、環境変数または設定済みの API key を上書きします。

## Example\{#example}

```bash
zilliz -o json privatelink list --project-id proj-xxxx

# Example output
# {
#   "count": 0,
#   "currentPage": 1,
#   "endpoints": [],
#   "pageSize": 10
# }
```
