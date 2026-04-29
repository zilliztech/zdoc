---
title: "アクセス：接続エンドポイント | Cloud"
slug: /access-connection-endpoints
sidebar_key: access-connection-endpoints
sidebar_label: "アクセス：接続エンドポイント"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、それぞれ異なる役割を持つ 3 つのエンドポイントを公開しています。| Cloud"
type: origin
token: QSuYwaKvOiPmD7knUZ9cH0jLnAe
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - アクセス
  - 接続エンドポイント

---

import Admonition from '@theme/Admonition';


# アクセス：接続エンドポイント

Zilliz Cloud は、それぞれ固有の責任を持つ 3 つのエンドポイントを公開しています。

<table>
   <tr>
     <th></th>
     <th><p><strong>コントロールプレーン API エンドポイント</strong></p></th>
     <th><p><strong>オンデマンドコンピューティングエンドポイント</strong></p></th>
     <th><p><strong>リアルタイムサービングエンドポイント</strong></p></th>
   </tr>
   <tr>
     <td><p>URL パターン</p></td>
     <td><p><code>https:&ast;//&ast;api.cloud.zilliz.com</code></p></td>
     <td><p><code>https:&ast;//&ast;\{project-id\}.\{region\}.api.zillizcloud.com</code></p></td>
     <td><p><code>https:&ast;//&ast;\{cluster-id\}.\{region\}.vectordb.zillizcloud.com:19530</code></p></td>
   </tr>
   <tr>
     <td><p>責任</p></td>
     <td><p>リソースライフサイクル：クラスター、ボリューム、ジョブ、およびその他のすべてのコントロールプレーンアクティビティ</p></td>
     <td><p>データインポート、バッチ検索</p></td>
     <td><p>完全なコレクション API（DDL + DML + DQL）</p></td>
   </tr>
   <tr>
     <td><p>データ運用</p></td>
     <td><p>なし（データインポートを除く）</p></td>
     <td><p>バルク挿入とインポート；CU 課金の検索</p></td>
     <td><p>低遅延の検索とクエリを伴う挿入、更新（upsert）、および削除</p></td>
   </tr>
   <tr>
     <td><p>使用時期</p></td>
     <td><p>インフラのプロビジョニングと自動化</p></td>
     <td><p>バッチ処理、探索、検証、実験</p></td>
     <td><p>本番環境でのサービング、常時稼働の低遅延クエリ</p></td>
   </tr>
</table>

## リアルタイムサービングクラスターへの接続\{#connect-to-a-real-time-serving-cluster}

Zilliz Cloud では、Free、Serverless、Dedicated の以下のタイプのサービングクラスターを提供しています。接続を設定するには、以下の例に従ってください。

```python
from pymilvus import MilvusClient

# connect to a dedicated cluster
client = MilvusClient(
    uri="https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530",
    token="YOUR_API_KEY"
)

# connect to a free / serverless cluster
client = MilvusClient(
    uri="https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)
```

認証トークンとして、適切な権限を持つ有効な API キー、または `username:password` 形式のクラスター資格情報を使用できます。

## Connect to an on-demand compute cluster\{#connect-to-an-on-demand-compute-cluster}

Zilliz Cloud は、オンデマンドコンピューティング要件に対応するスタンドアロンデータベースも提供しています。

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    cluster="inxx-xxxxxxxxxxxxxxx",
    token="YOUR_API_KEY"
)
```

オンデマンドコンピュートエンドポイントに接続する際は、そのクラスター内のコンピュートリソースを使用して検索やクエリを実行できるように、オンデマンドクラスターのクラスター ID も設定する必要があります。

認証トークンとしては、適切な権限を持つ有効な API キー、または `username:password` 形式のクラスター資格情報を使用できます。

## Connect to Zilliz Cloud コントロールプレーン API endpoint\{#connect-to-zilliz-cloud-control-plane-api-endpoint}

クラスターやボリュームの作成、あるいはバックアップ、リストア、移行などのコントロールプレーンリソースを管理する必要がある場合は、プラットフォームエンドポイントを使用します。

例えば、利用可能なクラウドプロバイダーを以下のように一覧表示できます。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/clouds" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
```

詳細については、[RESTful API リファレンス](/reference/restful) を参照してください。