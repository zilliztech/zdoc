---
title: "create | Cloud"
slug: /cli/cli/OnDemandCluster-create
sidebar_label: "create"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Zilliz Cloud でオンデマンドクラスターを作成します。 | Cloud"
type: docx
token: IqkTduvaBo7477xaW1Hc1wBTn9c
sidebar_position: 1
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - 作成
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

この操作は、Zilliz Cloud でオンデマンドクラスターを作成します。

## Description\{#description}

Zilliz Cloud でオンデマンドクラスターを作成します。オンデマンドクラスターは、アイドル時に一時停止し、クエリワークロードに応じて再開できます。

## Synopsis\{#synopsis}

```bash
zilliz on-demand-cluster create
--project-id <value>
--region-id <value>
--cu-size <value>
--cluster-name <value>
[--session-ttl <value>]
[--max-query-node-cu <value>]
[--max-query-node-replicas <value>]
```

## Options\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    プロジェクト ID を指定します。

- **--region-id** (*string*) -

    **[REQUIRED]**

    クラウドリージョンを指定します（例: `aws-us-east-1`）。

- **--cu-size** (*integer*) -

    **[REQUIRED]**

    コンピュートユニットの数を指定します。最小値: `8`。

- **--cluster-name** (*string*) -

    **[REQUIRED]**

    クラスターの表示名を指定します。最大 64 文字。使用可能な文字: 英字、数字、スペース、`_`、`-`、および中国語文字。

- **--session-ttl** (*string*) -

    自動一時停止 TTL を指定します。形式: `<number><s|m|h>`（例: `30m`、`1h`、`90s`）。最小値: `60s`。デフォルト: `60s`。

- **--max-query-node-cu** (*integer*) -

    クエリノードの最大 CU を指定します。

- **--max-query-node-replicas** (*integer*) -

    クエリノードの最大レプリカ数を指定します。

## Example\{#example}

```bash
# Create with minimum requirements
zilliz on-demand-cluster create --project-id proj-xxxx --region-id aws-us-east-1 --cu-size 8 --cluster-name my-on-demand

# Create with custom TTL and query node limits
zilliz on-demand-cluster create --project-id proj-xxxx --region-id aws-us-east-1 --cu-size 16 --cluster-name my-cluster --session-ttl 30m --max-query-node-cu 4 --max-query-node-replicas 2
```
