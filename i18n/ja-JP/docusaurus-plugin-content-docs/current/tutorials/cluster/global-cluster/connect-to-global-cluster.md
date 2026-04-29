---
title: "グローバルクラスターへの接続 | Cloud"
slug: /connect-to-global-cluster
sidebar_key: connect-to-global-cluster
sidebar_label: "グローバルクラスターへの接続"
beta: FALSE
notebook: FALSE
description: "グローバルクラスターが稼働したら、エンドポイントと認証トークンを使用して接続します。このページでは、2 種類のエンドポイント、それぞれの使用タイミング、およびスイッチオーバーやフェイルオーバー時のルーティング動作について説明します。 | Cloud"
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

グローバルクラスターが実行された後、エンドポイントと認証トークンを使用して接続します。このページでは、2 種類のエンドポイント、それぞれの使用タイミング、およびスイッチオーバーやフェイルオーバー時のルーティング動作について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## エンドポイントタイプの選択\{#choose-an-endpoint-type}

グローバルクラスターには、以下の 2 つの接続方法があります。

- **グローバルエンドポイント** を経由する方法

- グローバルクラスター内の プライマリークラスター またはセカンダリクラスターの **パブリックエンドポイント** または **プライベート** エンドポイントを経由する方法

以下の表は、これら 2 つの接続エンドポイントを比較したものです。

<table>
   <tr>
     <th></th>
     <th><p><strong>Global endpoint</strong></p></th>
     <th><p><strong>プライマリークラスター またはセカンダリクラスターのエンドポイント</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>書き込みルーティング</strong></p></td>
     <td><p>自動的に プライマリークラスター へルーティングされます</p></td>
     <td><p>書き込みを受け付けるのは プライマリークラスター の パブリックエンドポイント のみです</p></td>
   </tr>
   <tr>
     <td><p><strong>読み取りルーティング</strong></p></td>
     <td><p>プライマリークラスター へルーティングされます</p><p>(まもなく、レイテンシに基づいて最も近い利用可能なクラスターへインテリジェントにルーティングする機能がサポートされる予定です。)</p></td>
     <td><p>接続した特定のクラスターに対して読み取りが行われます</p></td>
   </tr>
   <tr>
     <td><p><strong>スイッチオーバー / フェイルオーバー</strong></p></td>
     <td><p>自動的に再ルーティングされ、コードの変更は不要です</p></td>
     <td><p>新しい プライマリークラスター を指すように接続先を手動で更新する必要があります</p></td>
   </tr>
   <tr>
     <td><p><strong>プライベート Link</strong></p></td>
     <td><p>非対応（パブリックインターネットが必要）</p></td>
     <td><p>対応しています。</p></td>
   </tr>
   <tr>
     <td><p><strong>推奨用途</strong></p></td>
     <td><p>自動フェイルオーバーとレイテンシベースのルーティングを必要とする本番アプリケーション</p></td>
     <td><p>特定のクラスターへの直接アクセス（例：環境の複製、テスト、デバッグ）</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>本番ワークロードには グローバルエンドポイント の使用を推奨します。これにより、スイッチオーバーやフェイルオーバー発生時にアプリケーションコード内でエンドポイントの変更を処理する必要がなくなります。</p>

</Admonition>

## エンドポイントとトークンの取得\{#get-your-endpoint-and-token}

<Procedures>

1. グローバルクラスターまたは対象クラスターに移動します。

    - **global** **endpoint** の場合：**Global** **Cluster** ページに移動します。

    - **public** **endpoint** の場合：特定の プライマリークラスター またはセカンダリクラスターの **Cluster** **Details** ページに移動します。

1. 接続カードで、**Global Endpoint** または **Public Endpoint** をコピーします。

    ![OPCTbMaYIoUXHKxDf0ycdMNBnze](https://zdoc-images.s3.us-west-2.amazonaws.com/opctbmayiouxhkxdf0ycdmnbnze.png "OPCTbMaYIoUXHKxDf0ycdMNBnze")

1. 認証トークンを準備します。これは [API key](./manage-api-keys) または [cluster credential](./cluster-credentials) (`username:password`) のいずれかになります。

</Procedures>

## SDK バージョンの確認\{#check-sdk-version}

[インストール](./install-sdks) 済みの SDK があることを確認してください。グローバルクラスターに接続する前に、SDK が最小バージョン要件を満たしていることを確認してください。

<table>
   <tr>
     <th><p>SDK</p></th>
     <th><p>最小バージョン</p></th>
   </tr>
   <tr>
     <td><p>Python</p></td>
     <td><p><code>2.6.9</code></p></td>
   </tr>
   <tr>
     <td><p>Node.js</p></td>
     <td><p><code>2.6.10</code></p></td>
   </tr>
   <tr>
     <td><p>Java</p></td>
     <td><p><code>2.6.14</code></p></td>
   </tr>
   <tr>
     <td><p>Go</p></td>
     <td><p><code>2.6.2</code></p></td>
   </tr>
</table>

## グローバルエンドポイント を使用した接続\{#connect-using-the-global-endpoint}

グローバルエンドポイント は、グローバルクラスター内の適切なクラスターへリクエストをルーティングする単一の URL です。SDK クライアントの `uri` として使用してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Use the global endpoint for automatic routing
const client = new MilvusClient({
    address: "YOUR_GLOBAL_ENDPOINT",  // Global endpoint from the console
    token: "YOUR_CLUSTER_TOKEN"       // API key or username:password
})
```

</TabItem>

<TabItem value='java'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

// Use the global endpoint for automatic routing
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_GLOBAL_ENDPOINT", // Global endpoint from the console
    APIKey:  "YOUR_CLUSTER_TOKEN", // API key or username:password
})
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
  --url "YOUR_GLOBAL_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

## Connect using a パブリックエンドポイント\{#connect-using-a-public-endpoint}

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

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Connect directly to a specific cluster
const client = new MilvusClient({
    address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    token: "YOUR_CLUSTER_TOKEN"  // API key or username:password
})
```

</TabItem>

<TabItem value='java'>

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
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>パブリックエンドポイントを使用する場合、書き込み操作を受け付けるのはプライマリークラスターのパブリックエンドポイントのみです。セカンダリークラスターのパブリックエンドポイントへの書き込みは失敗します。</p>

</Admonition>

## Routing behavior\{#routing-behavior}

### During normal operation\{#during-normal-operation}

<table>
   <tr>
     <th><p><strong>Request type</strong></p></th>
     <th><p><strong>グローバルエンドポイント</strong></p></th>
     <th><p><strong>パブリックエンドポイント</strong></p></th>
   </tr>
   <tr>
     <td><p>Write (insert, upsert, delete)</p></td>
     <td><p>Routed to the プライマリークラスター</p></td>
     <td><p>Only accepted on the プライマリークラスター's endpoint</p></td>
   </tr>
   <tr>
     <td><p>Read (search, query)</p></td>
     <td><p>Routed to the プライマリークラスター</p><p>(Intelligent routing to the nearest available cluster based on latency will be supported soon.)</p></td>
     <td><p>Served by the specific cluster you connect to</p></td>
   </tr>
</table>

### During and after switchover / failover\{#during-and-after-switchover-failover}

<table>
   <tr>
     <th><p><strong>Scenario</strong></p></th>
     <th><p><strong>グローバルエンドポイント</strong></p></th>
     <th><p><strong>パブリックエンドポイント</strong></p></th>
   </tr>
   <tr>
     <td><p>スイッチオーバー in progress</p></td>
     <td><p>Writes briefly paused, then resume on the new primary. Reads continue.</p></td>
     <td><p>No change to endpoints. Old primary becomes secondary.</p></td>
   </tr>
   <tr>
     <td><p>フェイルオーバー in progress</p></td>
     <td><p>Writes unavailable until new primary is promoted. Reads continue on secondaries.</p></td>
     <td><p>Old primary's endpoint becomes unreachable.</p></td>
   </tr>
   <tr>
     <td><p>After completion</p></td>
     <td><p>Automatically routes to the new primary. No code changes.</p></td>
     <td><p>Update your code to use the new primary's パブリックエンドポイント for writes.</p></td>
   </tr>
</table>

### SDK automatic reconnection\{#sdk-automatic-reconnection}

グローバルエンドポイントを使用する場合、Zilliz Cloud SDK はスイッチオーバーおよびフェイルオーバー中のエンドポイントの再ルーティングを処理します。アプリケーション側でルーティング変更に対するリトライロジックを実装する必要はありません。ただし、切り替え時点で進行中の書き込みは一時的なエラーを受ける可能性があります。これらのケースは、アプリケーション内の標準的なリトライロジックで処理されます。