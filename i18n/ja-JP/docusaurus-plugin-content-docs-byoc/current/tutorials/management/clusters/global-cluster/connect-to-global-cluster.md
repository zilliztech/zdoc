---
title: "グローバルクラスターへの接続 | BYOC"
slug: /connect-to-global-cluster
sidebar_label: "グローバルクラスターへの接続"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "グローバルクラスターが稼働したら、エンドポイントと認証トークンを使用して接続します。このページでは、2 種類のエンドポイント、それぞれの使い分け、およびスイッチオーバーとフェイルオーバー中のルーティング動作について説明します。 | BYOC"
type: origin
token: DknbwaLS3iAAiUk9ifPc1Vmvnze
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# グローバルクラスターへの接続

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンと、次の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

グローバルクラスターが稼働したら、エンドポイントと認証トークンを使用して接続します。このページでは、2 種類のエンドポイント、それぞれの使い分け、およびスイッチオーバーとフェイルオーバー中のルーティング動作について説明します。

## エンドポイントタイプを選択する\{#choose-an-endpoint-type}

グローバルクラスターでは、次の 2 つの接続方法を提供します。

- **グローバルエンドポイント** 経由

- グローバルクラスター内のプライマリクラスターまたはセカンダリクラスターの **パブリックエンドポイントまたはプライベートエンドポイント** 経由

次の表は、2 つの接続エンドポイントを比較したものです。

|  | **グローバルエンドポイント** | **プライマリクラスターまたはセカンダリクラスターのエンドポイント** |
| --- | --- | --- |
| **書き込みルーティング** | プライマリクラスターに自動的にルーティングされます | 書き込みを受け付けるのはプライマリのパブリックエンドポイントのみです |
| **読み取りルーティング** | プライマリクラスターにルーティングされます<br/>（レイテンシーに基づいて、最も近い利用可能なクラスターへインテリジェントにルーティングする機能は近日サポート予定です。） | 読み取りは、接続先の特定のクラスターに送られます |
| **スイッチオーバー / フェイルオーバー** | 自動的に再ルーティングされます — コード変更は不要です | 新しいプライマリを指すように接続先を更新する必要があります |
| **Private Link** | サポートされていません（パブリックインターネットが必要です） | サポートされています |
| **最適な用途** | 自動フェイルオーバーとレイテンシーベースのルーティングを必要とする本番アプリケーション | 特定のクラスターへの直接アクセス（例: 環境レプリケーション、テスト、デバッグ） |

<Admonition type="info" title="Notes">

本番ワークロードではグローバルエンドポイントの使用を推奨します。これにより、スイッチオーバーまたはフェイルオーバー時にアプリケーションコードでエンドポイントの変更を処理する必要がなくなります。

</Admonition>

## エンドポイントとトークンを取得する\{#get-your-endpoint-and-token}

<Procedures>

1. グローバルクラスターまたは対象クラスターに移動します。

    - **グローバル** **エンドポイント** の場合: **Global** **Cluster** ページに移動します。

    - **パブリック** **エンドポイント** の場合: 対象のプライマリクラスターまたはセカンダリクラスターの **Cluster** **Details** ページに移動します。

1. Connect カードで、**Global Endpoint** または **Public Endpoint** をコピーします。

    ![OPCTbMaYIoUXHKxDf0ycdMNBnze](https://zdoc-images.s3.us-west-2.amazonaws.com/opctbmayiouxhkxdf0ycdmnbnze.png "OPCTbMaYIoUXHKxDf0ycdMNBnze")

1. 認証トークンを準備します。これは [API キー](./manage-api-keys) または [クラスター認証情報](./cluster-credentials)（`username:password`）のいずれかです。

</Procedures>

## グローバルエンドポイントを使用して接続する\{#connect-using-the-global-endpoint}

グローバルエンドポイントは、リクエストをグローバルクラスター内の現在のプライマリクラスターに常にルーティングする単一の URL です。

スイッチオーバーまたはフェイルオーバーが発生した場合、Zilliz Cloud はグローバルエンドポイントを自動的に更新し、新しいプライマリクラスターを指すようにします。これにより、クラスター URI を手動で変更しなくても、アプリケーションは同じエンドポイントを継続して使用できます。

Zilliz Cloud は、SDK と RESTful API の両方を通じたグローバルエンドポイントへの接続をサポートしています。本番アプリケーションでは、SDK クライアントの使用を推奨します。

<details>

<summary>RESTful API 接続よりも SDK 接続が推奨されるのはなぜですか？</summary>

SDK クライアントは、エンドポイントリスト、プライマリとセカンダリのロール、クラスターの健全性など、グローバルクラスターのトポロジーを取得できます。この情報があれば、SDK クライアントはプライマリクラスターが変更されたときにより迅速に対応できます。また、SDK クライアントは将来的に read/write splitting もサポートする予定であり、書き込みリクエストはプライマリクラスターにルーティングされ、対象となる読み取りリクエストはグローバルクラスターのトポロジーに基づいてルーティングされます。

ただし、RESTful API 接続はグローバルクラスターのトポロジー情報を保持しません。そのため、スイッチオーバーまたはフェイルオーバー後に新しいプライマリクラスターへ切り替わるまでに、RESTful API 接続の方が時間がかかる場合があります。同じ理由により、RESTful API 接続では read/write splitting をサポートできません。

次の表は、SDK 接続と RESTful API 接続を比較したものです。

| **観点** | **SDK 接続** | **RESTful API 接続** |
| --- | --- | --- |
| 最適な用途 | ロール変更時のより迅速な復旧と、将来の read/write splitting を必要とする本番アプリケーション | 軽量なスクリプト、シンプルな REST 統合、単発の管理操作 |
| トポロジーの認識 | エンドポイントリスト、プライマリとセカンダリのロール、クラスターの健全性など、グローバルクラスターのトポロジーを取得します。 | グローバルクラスターのトポロジー情報を保持しません。 |
| プライマリ変更時の処理 | スイッチオーバーまたはフェイルオーバー後にプライマリクラスターが変更された場合、通常は数秒以内に迅速に対応できます。 | クライアントがトポロジー情報を保持しないため、新しいプライマリへの切り替えに通常は数分かかる場合があります。 |
| Read/write splitting | ✅ 近日サポート予定です。 | ❌ サポートされていません |

</details>

### SDK バージョンを確認する\{#check-sdk-version}

開始する前に、SDK を[インストール](./install-sdks)していること、および SDK が最小バージョン要件を満たしていることを確認してください。

| SDK | 最小バージョン |
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

## パブリックエンドポイントを使用して接続する\{#connect-using-a-public-endpoint}

グローバルクラスター内の各クラスターには、それぞれ独自のパブリックエンドポイントがあります。特定のクラスターを直接指定する必要がある場合に使用します。

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

パブリックエンドポイントを使用する場合、書き込み操作を受け付けるのはプライマリクラスターのパブリックエンドポイントのみです。セカンダリクラスターのパブリックエンドポイントへの書き込みは失敗します。

</Admonition>

## ルーティング動作\{#routing-behavior}

### 通常運用時\{#during-normal-operation}

| **リクエストタイプ** | **グローバルエンドポイント** | **パブリックエンドポイント** |
| --- | --- | --- |
| 書き込み（insert、upsert、delete） | プライマリクラスターにルーティングされます | プライマリクラスターのエンドポイントでのみ受け付けられます |
| 読み取り（search、query） | プライマリクラスターにルーティングされます<br/>（レイテンシーに基づいて、最も近い利用可能なクラスターへインテリジェントにルーティングする機能は近日サポート予定です。） | 接続先の特定のクラスターによって処理されます |

### スイッチオーバー / フェイルオーバー中および完了後\{#during-and-after-switchover-failover}

| **シナリオ** | **グローバルエンドポイント** | **パブリックエンドポイント** |
| --- | --- | --- |
| スイッチオーバー進行中 | 書き込みは一時的に停止し、その後新しいプライマリで再開されます。読み取りは継続されます。 | エンドポイントに変更はありません。旧プライマリはセカンダリになります。 |
| フェイルオーバー進行中 | 新しいプライマリが昇格するまで書き込みは利用できません。読み取りはセカンダリで継続されます。 | 旧プライマリのエンドポイントに到達できなくなります。 |
| 完了後 | 自動的に新しいプライマリにルーティングされます。コード変更は不要です。 | 書き込みに新しいプライマリのパブリックエンドポイントを使用するよう、コードを更新してください。 |

### SDK の自動再接続\{#sdk-automatic-reconnection}

グローバルエンドポイントを使用する場合、Zilliz Cloud SDK はスイッチオーバーおよびフェイルオーバー中のエンドポイント再ルーティングを処理します。アプリケーション側で、ルーティング変更そのものに対するリトライロジックを実装する必要はありません。ただし、切り替えの瞬間に処理中だった書き込みは一時的なエラーを受け取る可能性があります。このようなケースは、アプリケーション内の標準的なリトライロジックで処理できます。
