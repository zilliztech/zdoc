---
title: "Global Cluster への接続 | BYOC"
slug: /connect-to-global-cluster
sidebar_label: "Global Cluster への接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "global cluster の実行後、endpoint と認証トークンを使用して接続します。このページでは、2 種類の endpoint、それぞれの使い分け、switchover および failover 中のルーティング動作について説明します。 | BYOC"
type: origin
token: DknbwaLS3iAAiUk9ifPc1Vmvnze
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Global Cluster への接続

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンと、次の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

global cluster の実行後、endpoint と認証トークンを使用して接続します。このページでは、2 種類の endpoint、それぞれの使い分け、switchover および failover 中のルーティング動作について説明します。

## endpoint タイプを選択する\{#choose-an-endpoint-type}

global cluster では、次の 2 つの接続方法を提供します。

- **global endpoint** を使用する

- global cluster 内の primary または secondary cluster の **public endpoint または private endpoint** を使用する

次の表は、2 種類の接続 endpoint を比較したものです。

|  | **Global endpoint** | **primary または secondary cluster の endpoint** |
| --- | --- | --- |
| **Write routing** | 自動的に primary cluster にルーティングされる | 書き込みを受け付けるのは primary の public endpoint のみ |
| **Read routing** | primary cluster にルーティングされる<br/>(レイテンシに基づいて最も近い利用可能な cluster へインテリジェントにルーティングする機能は近日サポート予定です。) | 読み取りは、接続先の特定の cluster に送られる |
| **Switchover / Failover** | 自動的に再ルーティングされる — コード変更不要 | 新しい primary を指すように接続先を更新する必要がある |
| **Private Link** | 非対応（パブリックインターネットが必要） | 対応 |
| **Best for** | 自動 failover とレイテンシベースのルーティングを必要とする本番アプリケーション | 特定の cluster への直接アクセス（例: 環境レプリケーション、テスト、デバッグ） |

<Admonition type="info" icon="📘" title="Notes">

本番ワークロードでは global endpoint の使用を推奨します。これにより、switchover または failover 時にアプリケーションコードで endpoint の変更を処理する必要がなくなります。

</Admonition>

## endpoint とトークンを取得する\{#get-your-endpoint-and-token}

<Procedures>

1. global cluster または対象 cluster に移動します。

    - **global endpoint** の場合: **Global** **Cluster** ページに移動します。

    - **public endpoint** の場合: 対象の primary または secondary cluster の **Cluster** **Details** ページに移動します。

1. Connect カードで、**Global Endpoint** または **Public Endpoint** をコピーします。

    ![OPCTbMaYIoUXHKxDf0ycdMNBnze](https://zdoc-images.s3.us-west-2.amazonaws.com/opctbmayiouxhkxdf0ycdmnbnze.png "OPCTbMaYIoUXHKxDf0ycdMNBnze")

1. 認証トークンを準備します。これは [API key](./manage-api-keys) または [cluster credential](./cluster-credentials)（`username:password`）のいずれかです。

</Procedures>

## global endpoint を使用して接続する\{#connect-using-the-global-endpoint}

global endpoint は、リクエストを global cluster 内の現在の primary cluster に常にルーティングする単一の URL です。 

switchover または failover が発生した場合、Zilliz Cloud は global endpoint を自動的に更新して新しい primary cluster を指すようにします。これにより、cluster URI を手動で変更しなくても、アプリケーションは同じ endpoint を継続して使用できます。

Zilliz Cloud は、SDK と RESTful API の両方を介した global endpoint への接続をサポートしています。本番アプリケーションでは、SDK クライアントの使用を推奨します。

<details>

<summary>RESTful API 接続より SDK 接続が推奨されるのはなぜですか？</summary>

SDK クライアントは、endpoint リスト、primary と secondary のロール、cluster の正常性を含む global cluster トポロジーを取得できます。この情報により、primary cluster が変更されたときに SDK クライアントはより迅速に対応できます。将来的には SDK クライアントで read/write splitting もサポートされ、書き込みリクエストは primary cluster にルーティングされ、対象となる読み取りリクエストは global cluster トポロジーに基づいてルーティングされます。

一方、RESTful API 接続は global cluster トポロジー情報を保持しません。その結果、switchover または failover の後、新しい primary cluster への切り替えに RESTful API 接続はより長い時間を要する可能性があります。同じ理由により、RESTful API 接続では read/write splitting をサポートできません。

次の表は、SDK 接続と RESTful API 接続を比較したものです。

| **Dimension** | **SDK connection** | **RESTful API connection** |
| --- | --- | --- |
| Best for | ロール変更時のより高速な復旧と、将来的な read/write splitting を必要とする本番アプリケーション。 | 軽量なスクリプト、シンプルな REST 統合、単発の管理操作。 |
| Topology awareness | endpoint リスト、primary と secondary のロール、cluster の正常性を含む global cluster トポロジーを取得する。 | global cluster トポロジー情報を保持しない。 |
| Primary change handling | switchover または failover 後に primary cluster が変更された場合、通常は数秒以内により速く対応できる。 | クライアントがトポロジー情報を保持しないため、新しい primary への切り替えに通常は数分かかる場合がある。 |
| Read/write splitting | ✅ 近日サポート予定 | ❌ 非対応 |

</details>

### SDK バージョンを確認する\{#check-sdk-version}

開始する前に、SDK を[インストール](./install-sdks)していること、および SDK が最小バージョン要件を満たしていることを確認してください。

| SDK | Minimum Version |
| --- | --- |
| Python | `2.6.9` |
| Java | `2.6.14` |

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

## public endpoint を使用して接続する\{#connect-using-a-public-endpoint}

global cluster 内の各 cluster には、それぞれ独自の public endpoint があります。特定の cluster を直接指定する必要がある場合に使用します。

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

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Connect directly to a specific cluster
const client = new MilvusClient({
    address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    token: "YOUR_CLUSTER_TOKEN"  // API key or username:password
})
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

// Connect directly to a specific cluster
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    APIKey:  "YOUR_CLUSTER_TOKEN",  // API key or username:password
})
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_PUBLIC_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

public endpoint を使用する場合、書き込み操作を受け付けるのは primary cluster の public endpoint のみです。secondary cluster の public endpoint への書き込みは失敗します。

</Admonition>

## ルーティング動作\{#routing-behavior}

### 通常動作中\{#during-normal-operation}

| **Request type** | **Global endpoint** | **Public endpoint** |
| --- | --- | --- |
| Write (insert, upsert, delete) | primary cluster にルーティングされる | primary cluster の endpoint でのみ受け付けられる |
| Read (search, query) | primary cluster にルーティングされる<br/>(レイテンシに基づいて最も近い利用可能な cluster へインテリジェントにルーティングする機能は近日サポート予定です。) | 接続先の特定の cluster が処理する |

### switchover / failover 中および完了後\{#during-and-after-switchover-failover}

| **Scenario** | **Global endpoint** | **Public endpoint** |
| --- | --- | --- |
| Switchover in progress | 書き込みは一時的に停止し、その後新しい primary で再開される。読み取りは継続する。 | endpoint に変更はない。旧 primary は secondary になる。 |
| Failover in progress | 新しい primary が昇格するまで書き込みは利用不可。読み取りは secondary で継続する。 | 旧 primary の endpoint には到達できなくなる。 |
| After completion | 自動的に新しい primary にルーティングされる。コード変更は不要。 | 書き込みのために、新しい primary の public endpoint を使用するようコードを更新する。 |

### SDK の自動再接続\{#sdk-automatic-reconnection}

global endpoint を使用する場合、Zilliz Cloud SDK は switchover および failover 中の endpoint 再ルーティングを処理します。アプリケーション側で、ルーティング変更そのものに対するリトライロジックを実装する必要はありません。ただし、切り替えの瞬間に処理中だった書き込みは一時的なエラーを受け取る可能性があります。このようなケースは、アプリケーション内の標準的なリトライロジックで処理できます。
