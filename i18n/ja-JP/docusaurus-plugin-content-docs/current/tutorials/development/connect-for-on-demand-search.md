---
title: "オンデマンド検索のための接続 | Cloud"
slug: /connect-for-on-demand-search
sidebar_label: "オンデマンド検索のための接続"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "オンデマンドクラスターのコンピュートを使用してオンデマンドの検索またはクエリワークロードを実行したい場合は、プロジェクトエンドポイントを使用します。 | Cloud"
type: origin
token: BTrNwoEfYii1e9kf0BScWDpcnA2
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# オンデマンド検索のための接続

オンデマンドクラスターのコンピュートを使用してオンデマンドの検索またはクエリワークロードを実行したい場合は、プロジェクトエンドポイントを使用します。

<Admonition type="info" icon="📘" title="注">

このページでは、オンデマンド検索のためにプロジェクトエンドポイントに接続する方法について説明します。Free、Serverless、または Dedicated のサービングクラスターに接続したい場合は、[サービングクラスターへの接続](./connect-to-clusters) を参照してください。

</Admonition>

## エンドポイント形式\{#endpoint-format}

| エンドポイントタイプ | エンドポイントパターン | 用途 |
| --- | --- | --- |
| プロジェクトエンドポイント | `https://{project-id}.{region}.api.zillizcloud.com` | オンデマンドクラスターを介したデータインポート、バッチ検索、クエリ、取得、検索、およびハイブリッド検索。 |

## 始める前に\{#before-you-begin}

- Zilliz Cloud コンソールからプロジェクトエンドポイントを取得します。

- 検索ワークロードにコンピュートリソースを提供するオンデマンドクラスター ID を取得します。

- プロジェクトと対象データに対して十分な権限を持つ API キーを作成します。

- ユースケースに応じた Milvus SDK をインストールします。詳細は、[SDK のインストール](./install-sdks) を参照してください。

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

セッションオブジェクトを使用して、操作をオンデマンドクラスターに関連付けます。

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

プロジェクトエンドポイントに接続する場合は、有効な API キーを認証トークンとして使用します。

`username:password` 形式のクラスター認証情報は、サービングクラスターエンドポイント用です。プロジェクトエンドポイントを介したオンデマンド検索では、必要なプロジェクト権限を持つ API キーを使用してください。

## この接続を使用するタイミング\{#when-to-use-this-connection}

プロジェクトエンドポイントは、バッチ処理、探索、検証、実験、および常時稼働のサービングよりもオンデマンドコンピュートの方が適しているその他のワークロードに使用します。

完全な Collection API と常時稼働の低レイテンシサービングを必要とする本番アプリケーションでは、代わりに Free、Serverless、または Dedicated のサービングクラスターに接続してください。サービングクラスターのエンドポイント形式と接続例については、[サービングクラスターへの接続](./connect-to-clusters) を参照してください。
