---
title: "Global Cluster への接続 | Cloud"
slug: /connect-to-global-cluster
sidebar_label: "Global Cluster への接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "global cluster の実行後、endpoint と認証トークンを使用して接続します。このページでは、2 種類の endpoint、各 endpoint を使用するタイミング、および switchover と failover 中のルーティング動作について説明します。 | Cloud"
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

この機能は、Business Critical（SaaS）および BYOC デプロイでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョン、および次の Google Cloud リージョンで利用できます：gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

global cluster の実行後、endpoint と認証トークンを使用して接続します。このページでは、2 種類の endpoint、各 endpoint を使用するタイミング、および switchover と failover 中のルーティング動作について説明します。

## endpoint タイプを選択する\{#choose-an-endpoint-type}

global cluster では、次の 2 つの方法で接続できます。

- **global endpoint** 経由

- global cluster 内の primary cluster または secondary cluster の **public endpoint** または **private endpoint** 経由

次の表は、2 つの接続 endpoint を比較したものです。

|  | **Global endpoint** | **primary cluster または secondary cluster の endpoint** |
| --- | --- | --- |
| **書き込みルーティング** | 自動的に primary cluster にルーティングされます | 書き込みを受け付けるのは primary の public endpoint のみです |
| **読み取りルーティング** | primary cluster にルーティングされます<br/>（レイテンシーに基づいて最も近くで利用可能な cluster にインテリジェントにルーティングする機能は近日サポート予定です。） | 読み取りは、接続先の特定の cluster に送られます |
| **Switchover / Failover** | 自動的に再ルーティングされるため、コード変更は不要です | 新しい primary を指すように接続先を更新する必要があります |
| **Private Link** | サポートされていません（public internet が必要です） | サポートされています。 |
| **最適な用途** | 自動 failover とレイテンシーベースのルーティングを必要とする本番アプリケーション | 特定の cluster への直接アクセス（例：環境レプリケーション、テスト、デバッグ） |

<Admonition type="info" icon="📘" title="Notes">

本番ワークロードには global endpoint の使用を推奨します。これにより、switchover や failover の際に、アプリケーションコードで endpoint の変更を処理する必要がなくなります。

</Admonition>

## endpoint とトークンを取得する\{#get-your-endpoint-and-token}

<Procedures>

1. global cluster または対象 cluster に移動します。

    - **global endpoint** の場合：**Global** **Cluster** ページに移動します。

    - **public endpoint** の場合：対象の primary cluster または secondary cluster の **Cluster** **Details** ページに移動します。

1. Connect カードで、**Global Endpoint** または **Public Endpoint** をコピーします。

    ![OPCTbMaYIoUXHKxDf0ycdMNBnze](https://zdoc-images.s3.us-west-2.amazonaws.com/opctbmayiouxhkxdf0ycdmnbnze.png "OPCTbMaYIoUXHKxDf0ycdMNBnze")

1. 認証トークンを準備します。これは [API key](./manage-api-keys) または [cluster credential](./cluster-credentials)（`username:password`）のいずれかです。

</Procedures>

## global endpoint を使用して接続する\{#connect-using-the-global-endpoint}

global endpoint は、global cluster 内の現在の primary cluster に常にリクエストをルーティングする単一の URL です。 

switchover または failover が発生すると、Zilliz Cloud は global endpoint を自動的に更新し、新しい primary cluster を指すようにします。これにより、cluster URI を手動で変更しなくても、アプリケーションは同じ endpoint を使い続けることができます。

Zilliz Cloud は、SDK と RESTful API の両方を通じた global endpoint への接続をサポートしています。本番アプリケーションでは、SDK クライアントの使用を推奨します。

<details>

<summary>RESTful API 接続よりも SDK 接続が推奨されるのはなぜですか？</summary>

SDK クライアントは、endpoint リスト、primary および secondary のロール、cluster の正常性を含む global cluster トポロジーを取得できます。この情報により、primary cluster が変更された場合に SDK クライアントはより速く対応できます。将来的には、SDK クライアントは読み取り/書き込み分離もサポートする予定であり、書き込みリクエストは primary cluster にルーティングされ、対象となる読み取りリクエストは global cluster トポロジーに基づいてルーティングされます。

一方、RESTful API 接続は global cluster トポロジー情報を保持しません。そのため、switchover または failover 後に新しい primary cluster へ切り替わるまでに、RESTful API 接続の方が時間がかかる場合があります。同じ理由により、RESTful API 接続では読み取り/書き込み分離をサポートできません。

次の表は、SDK 接続と RESTful API 接続を比較したものです。

| **Dimension** | **SDK connection** | **RESTful API connection** |
| --- | --- | --- |
| 最適な用途 | ロール変更時の高速な復旧と、将来の読み取り/書き込み分離を必要とする本番アプリケーション。 | 軽量なスクリプト、シンプルな REST 統合、一度限りの管理操作。 |
| トポロジー認識 | endpoint リスト、primary および secondary のロール、cluster の正常性を含む global cluster トポロジーを取得します。 | global cluster トポロジー情報を保持しません。 |
| Primary 変更への対応 | switchover または failover 後に primary cluster が変わった場合、通常は数秒以内により速く対応できます。 | クライアントがトポロジー情報を保持しないため、新しい primary への切り替えに通常は数分かかることがあります。 |
| 読み取り/書き込み分離 | ✅ 近日サポート予定です。 | ❌ サポートされていません |

</details>

### SDK バージョンを確認する\{#check-sdk-version}

開始する前に、SDK を[インストール](./install-sdks)済みであること、および SDK が最小バージョン要件を満たしていることを確認してください。

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

global cluster 内の各 cluster には、それぞれ独自の public endpoint があります。特定の cluster を直接指定する必要がある場合にこれを使用します。

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

### 通常運用時\{#during-normal-operation}

| **Request type** | **Global endpoint** | **Public endpoint** |
| --- | --- | --- |
| 書き込み（insert、upsert、delete） | primary cluster にルーティングされます | primary cluster の endpoint でのみ受け付けられます |
| 読み取り（search、query） | primary cluster にルーティングされます<br/>（レイテンシーに基づいて最も近くで利用可能な cluster にインテリジェントにルーティングする機能は近日サポート予定です。） | 接続先の特定の cluster によって処理されます |

### switchover / failover 中および完了後\{#during-and-after-switchover-failover}

| **Scenario** | **Global endpoint** | **Public endpoint** |
| --- | --- | --- |
| switchover 進行中 | 書き込みは一時的に停止し、その後新しい primary で再開されます。読み取りは継続されます。 | endpoint に変更はありません。旧 primary は secondary になります。 |
| failover 進行中 | 新しい primary が昇格されるまで書き込みは利用できません。読み取りは secondary で継続されます。 | 旧 primary の endpoint には到達できなくなります。 |
| 完了後 | 自動的に新しい primary にルーティングされます。コード変更は不要です。 | 書き込みのために、新しい primary の public endpoint を使用するようコードを更新してください。 |

### SDK の自動再接続\{#sdk-automatic-reconnection}

global endpoint を使用する場合、Zilliz Cloud SDK は switchover および failover 中の endpoint 再ルーティングを処理します。アプリケーション側で、ルーティング変更そのものに対する再試行ロジックを実装する必要はありません。ただし、切り替えの瞬間に処理中だった書き込みは一時的なエラーを受け取る可能性があります。このようなケースは、アプリケーションの標準的な再試行ロジックで処理できます。
