---
title: "オンデマンド検索への接続 | BYOC"
slug: /connect-for-on-demand-search
sidebar_label: "オンデマンド検索への接続"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドクラスターのコンピュートリソースを使用して、オンデマンド検索やクエリワークロードを実行する場合は、プロジェクトエンドポイントを使用します。 | BYOC"
type: origin
token: BTrNwoEfYii1e9kf0BScWDpcnA2
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# オンデマンド検索への接続

オンデマンドクラスターのコンピュートリソースを使用して、オンデマンド検索やクエリワークロードを実行する場合は、プロジェクトエンドポイントを使用します。

<Admonition type="info" icon="📘" title="Note">

このページでは、オンデマンド検索用のプロジェクトエンドポイントへの接続について説明します。Free、Serverless、または Dedicated のサービングクラスターに接続する場合は、「[サービングクラスターへの接続](./connect-to-clusters)」を参照してください。

</Admonition>

## エンドポイントの形式\{#endpoint-format}

| エンドポイントの種類 | エンドポイントのパターン | 用途 |
| --- | --- | --- |
| プロジェクトエンドポイント | `https://{project-id}.{region}.api.zillizcloud.com` | オンデマンドクラスター経由でのデータインポート、バッチ検索、クエリ、取得、検索、およびハイブリッド検索。 |

## 始める前に\{#before-you-begin}

- Zilliz Cloud コンソールからプロジェクトエンドポイントを取得します。

- 検索ワークロードにコンピュートリソースを提供するオンデマンドクラスターの ID を取得します。

- プロジェクトおよび対象データに対して十分な権限を持つ API キーを作成します。

- ユースケースに合わせて Milvus SDK をインストールします。詳細については、「[SDK のインストール](./install-sdks)」を参照してください。

## プロジェクトエンドポイントへの接続\{#connect-to-a-project-endpoint}

プロジェクトエンドポイントを使用して `MilvusClient` を作成し、リクエストを処理するオンデマンドクラスターを指定します。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    cluster="inxx-xxxxxxxxxxxxxxx",
    token="YOUR_API_KEY",
)
```

## 検索セッションの作成\{#create-a-search-session}

セッションオブジェクトを使用して、操作をオンデマンドクラスターに紐付けます。

```python
session = client.session(cluster_id="inxx-xxxxxxxxxxxxxxx")
```

その後、セッションを使用して `query`、`get`、`search`、`hybrid_search` などの DQL 操作を実行します。

```python
results = session.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="vector",
    limit=10,
)

print(results)
```

## 認証\{#authentication}

プロジェクトエンドポイントに接続する際は、有効な API キーを認証トークンとして使用します。

`username:password` 形式のクラスター認証情報は、サービングクラスターエンドポイント専用です。プロジェクトエンドポイント経由でオンデマンド検索を行う場合は、必要なプロジェクト権限を持つ API キーを使用してください。

## この接続方法の使用場面\{#when-to-use-this-connection}

バッチ処理、探索、検証、実験など、常時稼働のサービングよりもオンデマンドコンピュートが適しているワークロードには、プロジェクトエンドポイントを使用します。

本番アプリケーションで完全なコレクション API と常時稼働の低レイテンシーサービングが必要な場合は、代わりに Free、Serverless、または Dedicated サービングクラスターに接続してください。サービングクラスターのエンドポイント形式と接続例については、「[サービングクラスターへの接続](./connect-to-clusters)」を参照してください。
