---
title: "Connect to Global クラスター | Cloud"
slug: /connect-to-global-cluster
sidebar_label: "Connect to Global クラスター"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "After your global クラスター is running, connect to it using an endpoint and an authentication token. This page covers the two endpoint types, when to use each, and how routing behaves during switchover and failover. | Cloud"
type: origin
token: DknbwaLS3iAAiUk9ifPc1Vmvnze
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Connect to Global クラスター

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョン、および次の Google Cloud リージョンで利用できます：gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

After your global クラスター is running, connect to it using an endpoint and an authentication token. This page covers the two endpoint types, when to use each, and how routing behaves during switchover and failover.

## endpoint タイプを選択する\{#choose-an-endpoint-type}

A global クラスター provides two ways to connect:

- **global endpoint** 経由

- Via the **public or private endpoints** of the primary or secondary クラスター in a global クラスター

次の表は、2 つの接続 endpoint を比較したものです。

|  | **Global endpoint** | **The endpoint of a primary or secondary クラスター** |
| --- | --- | --- |
| **Write routing** | Automatically routed to the primary クラスター | Only the primary's public endpoint accepts writes |
| **Read routing** | Routed to the primary クラスター<br/>(Intelligent routing to the nearest available クラスター based on latency will be supported soon.) | Reads go to the specific クラスター you connect to |
| **Switchover / Failover** | Re-routes automatically — no code changes | You must update your connection to point to the new primary |
| **Private Link** | Not supported (requires public internet) | Supported. |
| **Best for** | Production applications that need automatic failover and latency-based routing | Direct access to a specific クラスター (e.g., environment replication, testing, debugging) |

<Admonition type="info" title="Notes">

本番ワークロードには global endpoint の使用を推奨します。これにより、switchover や failover の際に、アプリケーションコードで endpoint の変更を処理する必要がなくなります。

</Admonition>

## endpoint とトークンを取得する\{#get-your-endpoint-and-token}

<Procedures>

1. Navigate to your global クラスター or target クラスター:

    - For the **global** **endpoint**: Go to the **Global** **クラスター** page.

    - For a **public** **endpoint**: Go to the **クラスター** **Details** page of the specific primary or secondary クラスター.

1. Connect カードで、**Global Endpoint** または **Public Endpoint** をコピーします。

    ![OPCTbMaYIoUXHKxDf0ycdMNBnze](https://zdoc-images.s3.us-west-2.amazonaws.com/opctbmayiouxhkxdf0ycdmnbnze.png "OPCTbMaYIoUXHKxDf0ycdMNBnze")

1. Prepare your authentication token. This can be either an [API key](./manage-api-keys) or a [クラスター credential](./cluster-credentials) (`username:password`).

</Procedures>

## global endpoint を使用して接続する\{#connect-using-the-global-endpoint}

The global endpoint is a single URL that always routes requests to the current primary クラスター in the global クラスター. 

If a switchover or failover occurs, Zilliz Cloud automatically updates the global endpoint to point to the new primary クラスター. This lets your application continue using the same endpoint without manually changing the クラスター URI.

Zilliz Cloud は、SDK と RESTful API の両方を通じた global endpoint への接続をサポートしています。本番アプリケーションでは、SDK クライアントの使用を推奨します。

<details>

<summary>RESTful API 接続よりも SDK 接続が推奨されるのはなぜですか？</summary>

SDK clients can retrieve the global クラスター topology, including the endpoint list, primary and secondary roles, and クラスター health. With this information, SDK clients can react faster when the primary クラスター changes. SDK clients will also support read/write splitting in the future, where write requests are routed to the primary クラスター and eligible read requests are routed based on the global クラスター topology.

However, RESTful API connections do not maintain global クラスター topology information. As a result, RESTful API connections may take longer to switch to the new primary クラスター after a switchover or failover. For the same reason, RESTful API connections cannot support read/write splitting.

次の表は、SDK 接続と RESTful API 接続を比較したものです。

| **Dimension** | **SDK connection** | **RESTful API connection** |
| --- | --- | --- |
| 最適な用途 | Production applications that need faster recovery during role changes and future read/write splitting. | 軽量なスクリプト、シンプルな REST 統合、一度限りの管理操作。 |
| トポロジー認識 | Retrieves global クラスター topology, including the endpoint list, primary and secondary roles, and クラスター health. | Does not maintain global クラスター topology information. |
| Primary 変更への対応 | Can react faster, usually within seconds, when the primary クラスター changes after a switchover or failover. | クライアントがトポロジー情報を保持しないため、新しい primary への切り替えに通常は数分かかることがあります。 |
| Read/write splitting | ✅ 近日サポート予定です。 | ❌ サポートされていません |

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

Each クラスター in the global クラスター has its own public endpoint. Use this when you need to target a specific クラスター directly.

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

<Admonition type="info" title="Notes">

When using public endpoints, only the primary クラスター's public endpoint accepts write operations. Writing to a secondary クラスター's public endpoint will fail.

</Admonition>

## ルーティング動作\{#routing-behavior}

### 通常運用時\{#during-normal-operation}

| **Request type** | **Global endpoint** | **Public endpoint** |
| --- | --- | --- |
| 書き込み（insert、upsert、delete） | Routed to the primary クラスター | Only accepted on the primary クラスター's endpoint |
| 読み取り（search、query） | Routed to the primary クラスター<br/>(Intelligent routing to the nearest available クラスター based on latency will be supported soon.) | Served by the specific クラスター you connect to |

### switchover / failover 中および完了後\{#during-and-after-switchover-failover}

| **Scenario** | **Global endpoint** | **Public endpoint** |
| --- | --- | --- |
| switchover 進行中 | 書き込みは一時的に停止し、その後新しい primary で再開されます。読み取りは継続されます。 | endpoint に変更はありません。旧 primary は secondary になります。 |
| failover 進行中 | 新しい primary が昇格されるまで書き込みは利用できません。読み取りは secondary で継続されます。 | 旧 primary の endpoint には到達できなくなります。 |
| 完了後 | 自動的に新しい primary にルーティングされます。コード変更は不要です。 | 書き込みのために、新しい primary の public endpoint を使用するようコードを更新してください。 |

### SDK の自動再接続\{#sdk-automatic-reconnection}

global endpoint を使用する場合、Zilliz Cloud SDK は switchover および failover 中の endpoint 再ルーティングを処理します。アプリケーション側で、ルーティング変更そのものに対する再試行ロジックを実装する必要はありません。ただし、切り替えの瞬間に処理中だった書き込みは一時的なエラーを受け取る可能性があります。このようなケースは、アプリケーションの標準的な再試行ロジックで処理できます。
