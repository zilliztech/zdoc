---
title: "グローバルクラスターに接続 | Cloud"
slug: /connect-to-global-cluster
sidebar_key: connect-to-global-cluster
sidebar_label: "グローバルクラスターに接続"
beta: FALSE
notebook: FALSE
description: "グローバルクラスターに接続 | Cloud"
type: origin
token: DknbwaLS3iAAiUk9ifPc1Vmvnze
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - milvus
  - グローバルクラスター
  - 接続
  - エンドポイント
  - ルーティング

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# グローバルクラスターへの接続

グローバルクラスターが実行されたら、エンドポイントと認証トークンを使用して接続します。このページでは、2つのエンドポイントタイプ、それぞれの使用場面、およびスイッチオーバーとフェイルオーバー時のルーティング動作について説明します。

<Admonition type="info" icon="📘" title="Notes">

この機能は、Business Critical（SaaS）および BYOC デプロイでのみ利用できます。

この機能は、すべての AWS リージョンと、Google Cloud の gcp-us-central1 および gcp-us-east4 リージョンで利用できます。Microsoft Azure では利用できません。

</Admonition>

## エンドポイントタイプの選択\{#choose-an-endpoint-type}

グローバルクラスターは、2つの接続方法を提供します。

- **グローバルエンドポイント**経由

- グローバルクラスター内のプライマリークラスターまたはセカンダリークラスターの**パブリックまたはプライベートエンドポイント**経由

次の表は、2つの接続エンドポイントを比較しています。

<table>
   <tr>
     <th></th>
     <th><p><strong>グローバルエンドポイント</strong></p></th>
     <th><p><strong>プライマリークラスターまたはセカンダリークラスターのエンドポイント</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>書き込みルーティング</strong></p></td>
     <td><p>プライマリークラスターに自動的にルーティング</p></td>
     <td><p>プライマリーのパブリックエンドポイントのみが書き込みを受け付ける</p></td>
   </tr>
   <tr>
     <td><p><strong>読み込みルーティング</strong></p></td>
     <td><p>プライマリークラスターにルーティング</p><p>（レイテンシーに基づく最も近い利用可能なクラスターへのインテリジェントルーティングは、近日対応予定です。）</p></td>
     <td><p>接続した特定のクラスターに読み込みが行われる</p></td>
   </tr>
   <tr>
     <td><p><strong>スイッチオーバー / フェイルオーバー</strong></p></td>
     <td><p>自動的に再ルーティング — コード変更は不要</p></td>
     <td><p>新しいプライマリーを指すように接続を更新する必要がある</p></td>
   </tr>
   <tr>
     <td><p><strong>プライベートリンク</strong></p></td>
     <td><p>非対応（パブリックインターネットが必要）</p></td>
     <td><p>対応</p></td>
   </tr>
   <tr>
     <td><p><strong>最適な用途</strong></p></td>
     <td><p>自動フェイルオーバーとレイテンシーベースのルーティングが必要な本番アプリケーション</p></td>
     <td><p>特定のクラスターへの直接アクセス（例：環境レプリケーション、テスト、デバッグ）</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

本番ワークロードにはグローバルエンドポイントの使用を推奨します。これにより、スイッチオーバーまたはフェイルオーバー時にアプリケーションコードでエンドポイントの変更を処理する必要がなくなります。

</Admonition>

## エンドポイントとトークンの取得\{#get-your-endpoint-and-token}

<Procedures>

1. グローバルクラスターまたは対象のクラスターに移動します。

    - **グローバルエンドポイント**の場合：**グローバルクラスター**ページに移動します。

    - **パブリックエンドポイント**の場合：特定のプライマリークラスターまたはセカンダリークラスターの**クラスター詳細**ページに移動します。

1. Connect カードで、**グローバルエンドポイント**または**パブリックエンドポイント**をコピーします。

    ![OPCTbMaYIoUXHKxDf0ycdMNBnze](https://zdoc-images.s3.us-west-2.amazonaws.com/opctbmayiouxhkxdf0ycdmnbnze.png "OPCTbMaYIoUXHKxDf0ycdMNBnze")

1. 認証トークンを準備します。これは [API キー](./manage-api-keys) または [クラスター認証情報](./cluster-credentials)（`username:password`）のいずれかです。

</Procedures>

## グローバルエンドポイントを使用した接続\{#connect-using-the-global-endpoint}

グローバルエンドポイントは、グローバルクラスター内の現在のプライマリークラスターに常にリクエストをルーティングする単一の URL です。

スイッチオーバーまたはフェイルオーバーが発生すると、Zilliz Cloud はグローバルエンドポイントが新しいプライマリークラスターを指すように自動更新します。そのため、アプリケーションはクラスター URI を手動で変更することなく、同じエンドポイントを引き続き使用できます。

Zilliz Cloud は、SDK と RESTful API の両方によるグローバルエンドポイントへの接続をサポートしています。本番アプリケーションでは SDK クライアントの使用を推奨します。

<details>

<summary>RESTful API 接続より SDK 接続が推奨される理由</summary>

SDK クライアントは、エンドポイント一覧、プライマリーとセカンダリーの役割、クラスターの健全性など、グローバルクラスターのトポロジーを取得できます。この情報により、プライマリークラスターが変更されたときに、SDK クライアントはより迅速に対応できます。また将来的には、書き込みリクエストをプライマリークラスターへ、対象となる読み取りリクエストをグローバルクラスタートポロジーに基づいてルーティングする読み書き分離もサポートする予定です。

一方、RESTful API 接続はグローバルクラスタートポロジー情報を保持しません。そのため、スイッチオーバーまたはフェイルオーバー後に新しいプライマリークラスターへ切り替わるまで、より長い時間がかかる場合があります。同じ理由により、RESTful API 接続は読み書き分離をサポートできません。

次の表は、SDK 接続と RESTful API 接続を比較しています。

<table>
   <tr>
     <th><p><strong>比較項目</strong></p></th>
     <th><p><strong>SDK 接続</strong></p></th>
     <th><p><strong>RESTful API 接続</strong></p></th>
   </tr>
   <tr>
     <td><p>最適な用途</p></td>
     <td><p>役割変更時の迅速な復旧と、将来の読み書き分離を必要とする本番アプリケーション。</p></td>
     <td><p>軽量スクリプト、単純な REST 統合、単発の管理操作。</p></td>
   </tr>
   <tr>
     <td><p>トポロジー認識</p></td>
     <td><p>エンドポイント一覧、プライマリーとセカンダリーの役割、クラスターの健全性など、グローバルクラスタートポロジーを取得します。</p></td>
     <td><p>グローバルクラスタートポロジー情報を保持しません。</p></td>
   </tr>
   <tr>
     <td><p>プライマリー変更への対応</p></td>
     <td><p>スイッチオーバーまたはフェイルオーバー後にプライマリークラスターが変更されると、通常は数秒以内に迅速に対応できます。</p></td>
     <td><p>クライアントがトポロジー情報を保持しないため、新しいプライマリーへの切り替えに通常は数分かかる場合があります。</p></td>
   </tr>
   <tr>
     <td><p>読み書き分離</p></td>
     <td><p>✅ 近日対応予定です。</p></td>
     <td><p>❌ 非対応</p></td>
   </tr>
</table>

</details>

### SDK バージョンの確認\{#check-sdk-version}

開始する前に、SDK が[インストール](./install-sdks)されており、最低バージョン要件を満たしていることを確認してください。

<table>
   <tr>
     <th><p>SDK</p></th>
     <th><p>最低バージョン</p></th>
   </tr>
   <tr>
     <td><p>Python</p></td>
     <td><p><code>2.6.9</code></p></td>
   </tr>
   <tr>
     <td><p>Java</p></td>
     <td><p><code>2.6.14</code></p></td>
   </tr>
</table>

### 接続ガイド\{#connection-guide}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Use the global endpoint for automatic routing
client = MilvusClient(
    uri="YOUR_GLOBAL_ENDPOINT",  # Global endpoint from the console
    token="YOUR_CLUSTER_TOKEN"   # API key or username:password
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

// Use the global endpoint for automatic routing
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri("YOUR_GLOBAL_ENDPOINT")  // Global endpoint from the console
    .token("YOUR_CLUSTER_TOKEN")  // API key or username:password
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_GLOBAL_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
```

</TabItem>
</Tabs>

## パブリックエンドポイントを使用した接続\{#connect-using-a-public-endpoint}

グローバルクラスター内の各クラスターには、それぞれ独自のパブリックエンドポイントがあります。特定のクラスターを直接ターゲットにする必要がある場合は、これを使用してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Connect directly to a specific cluster
client = MilvusClient(
    uri="YOUR_CLUSTER_PUBLIC_ENDPOINT",  # Public endpoint of a specific cluster
    token="YOUR_CLUSTER_TOKEN" # API key or username:password
)
```

</TabItem>

<TabItem value='javascript'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

// Connect directly to a specific cluster
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri("YOUR_CLUSTER_PUBLIC_ENDPOINT")  // Public endpoint of a specific cluster
    .token("YOUR_CLUSTER_TOKEN")  // API key or username:password
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='go'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Connect directly to a specific cluster
const client = new MilvusClient({
    address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    token: "YOUR_CLUSTER_TOKEN"  // API key or username:password
})
```

</TabItem>

<TabItem value='bash'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

// Connect directly to a specific cluster
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    APIKey:  "YOUR_CLUSTER_TOKEN",  // API key or username:password
})
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_PUBLIC_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

パブリックエンドポイントを使用する場合、書き込み操作を受け付けるのはプライマリークラスターのパブリックエンドポイントのみです。セカンダリークラスターのパブリックエンドポイントへの書き込みは失敗します。

</Admonition>

## ルーティング動作\{#routing-behavior}

### 通常運用時\{#during-normal-operation}

<table>
   <tr>
     <th><p><strong>リクエストタイプ</strong></p></th>
     <th><p><strong>グローバルエンドポイント</strong></p></th>
     <th><p><strong>パブリックエンドポイント</strong></p></th>
   </tr>
   <tr>
     <td><p>書き込み（insert、upsert、delete）</p></td>
     <td><p>プライマリークラスターにルーティング</p></td>
     <td><p>プライマリークラスターのエンドポイントでのみ受け付ける</p></td>
   </tr>
   <tr>
     <td><p>読み取り（search、query）</p></td>
     <td><p>プライマリークラスターにルーティング</p><p>（レイテンシーに基づいて最も近い利用可能なクラスターへルーティングする機能は近日対応予定です。）</p></td>
     <td><p>接続先の特定のクラスターが処理</p></td>
   </tr>
</table>

### スイッチオーバー / フェイルオーバー中および完了後\{#during-and-after-switchover-failover}

<table>
   <tr>
     <th><p><strong>シナリオ</strong></p></th>
     <th><p><strong>グローバルエンドポイント</strong></p></th>
     <th><p><strong>パブリックエンドポイント</strong></p></th>
   </tr>
   <tr>
     <td><p>スイッチオーバー実行中</p></td>
     <td><p>書き込みは短時間停止した後、新しいプライマリーで再開します。読み取りは継続します。</p></td>
     <td><p>エンドポイントは変更されません。以前のプライマリーはセカンダリーになります。</p></td>
   </tr>
   <tr>
     <td><p>フェイルオーバー実行中</p></td>
     <td><p>新しいプライマリーが昇格するまで書き込みは利用できません。読み取りはセカンダリーで継続します。</p></td>
     <td><p>以前のプライマリーのエンドポイントには接続できなくなります。</p></td>
   </tr>
   <tr>
     <td><p>完了後</p></td>
     <td><p>新しいプライマリーに自動的にルーティングされます。コード変更は不要です。</p></td>
     <td><p>書き込みには新しいプライマリーのパブリックエンドポイントを使用するようコードを更新します。</p></td>
   </tr>
</table>

### SDK の自動再接続\{#sdk-automatic-reconnection}

グローバルエンドポイントを使用する場合、Zilliz Cloud SDK はスイッチオーバーおよびフェイルオーバー中のエンドポイントの再ルーティングを処理します。アプリケーション側でルーティング変更に対するリトライロジックを実装する必要はありません。ただし、切り替え時点で進行中の書き込みは一時的なエラーを受ける可能性があります。これらのケースは、アプリケーション内の標準的なリトライロジックで処理されます。
