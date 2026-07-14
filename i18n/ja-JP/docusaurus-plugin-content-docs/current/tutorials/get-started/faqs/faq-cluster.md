---
title: "FAQ: Cluster | CLOUD"
slug: /faq-cluster
sidebar_label: "FAQ: Cluster"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性のある問題と、その対応する解決方法を一覧表示します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2
displayed_sidebar: default

---

# FAQ: Cluster

このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性のある問題と、その対応する解決方法を一覧表示します。

## 目次

- [無料クラスターの容量はどのくらいですか？](#what-is-the-capacity-of-a-free-cluster)
- [「quota exceeded\[reason=disk quota exceeded, please allocate more resources」というエラーを受け取った場合はどうすればよいですか？](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [専用クラスターの作成後にクラスタータイプを変更できますか？](#can-i-change-the-cluster-type-after-my-dedicated-cluster-is-created)
- [プロジェクトの作成後にクラウドリージョンを変更できますか？](#can-i-change-the-cloud-region-of-my-project-after-it-is-created)
- [serving クラスターの query CU をスケールダウンするにはどうすればよいですか？](#how-can-i-scale-down-the-query-cus-of-my-serving-cluster)
- [Zilliz Cloud への接続を試みたときに接続タイムアウトエラーが発生した場合はどう対処すればよいですか？](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [クラスター作成後にクラスターに接続できないのはなぜですか？](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [非アクティブなクラスターはどうなりますか？](#what-happens-to-my-inactive-clusters)
- [クラスターを一時停止すると課金されますか？](#will-i-be-charged-if-i-suspend-my-cluster)
- [接続エンドポイントを取得するにはどうすればよいですか？](#how-to-obtain-a-connection-endpoint)
- [Zilliz Cloud を Attu に接続できますか？](#can-i-connect-zilliz-cloud-to-attu)

## FAQ




### 無料クラスターの容量はどのくらいですか？\{#what-is-the-capacity-of-a-free-cluster}

一般的に、無料クラスターは 768 次元のベクトルを 100 万件処理できます。ただし、実際の容量はスキーマに依存します。 

データが無料クラスターの最大容量を超える場合は、[アップグレード](./select-zilliz-cloud-service-plans)して Serverless または Dedicated のデプロイオプションで新しいクラスターを作成し、そこへ[データを移行](./offline-migration)してください。クラスターの容量に関する詳細は、[Select the Right CU](./cu-types-explained#assess-capacity) を参照してください。

### 「quota exceeded\[reason=disk quota exceeded, please allocate more resources」というエラーを受け取った場合はどうすればよいですか？\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データの insert または upsert 時にこのエラーが表示されるのは、データ量が serving クラスターの CU 容量を超えているためです。無料クラスターは 768 次元のベクトルを 100 万件処理できます。専用クラスターの容量は、その [クラスタータイプと CU サイズ](./cu-types-explained#assess-capacity) に依存します。

この問題に対処するには、以下の手順に従ってください。

- 無料クラスターを使用している場合は、[アップグレード](./manage-cluster)して Serverless または Dedicated のデプロイオプションを利用してください。

- Dedicated クラスターを使用している場合は、CU サイズを増やして [クラスターをスケールアップ](./undefined) してください。

### 専用クラスターの作成後にクラスタータイプを変更できますか？\{#can-i-change-the-cluster-type-after-my-dedicated-cluster-is-created}

はい。クラスタータイプを変更するには、以下の手順に従う必要があります。

1. 希望するクラスタータイプで新しい serving クラスターを作成します。この新しい serving クラスターの query CU を決定するには、[calculator](https://zilliz.com/pricing#calculator) を使用してください。

1. 現在の serving クラスターから、今作成した新しいクラスターにデータを [移行](./offline-migration) します。あるいは、クラスター間のデータ移行を当社で対応するために、[お問い合わせ](https://support.zilliz.com/hc/en-us)いただくことも可能です。お問い合わせの際は、ソースクラスターとターゲットクラスターを明記してください。

### プロジェクトの作成後にクラウドリージョンを変更できますか？\{#can-i-change-the-cloud-region-of-my-project-after-it-is-created}

いいえ。プロジェクトリージョンはプロジェクト作成後に変更できません。別のリージョンを使用するには、新しいプロジェクトを作成してください。詳細は、[Manage Projects](./manage-projects) を参照してください。

### serving クラスターの query CU をスケールダウンするにはどうすればよいですか？\{#how-can-i-scale-down-the-query-cus-of-my-serving-cluster}

はい。serving クラスターの query CU をスケールダウンするには、[Zilliz Cloud console](https://cloud.zilliz.com/signup) の **Summary** セクションに移動し、**Query CU** の横にある **Scale** をクリックします。これによりスケーリングページが開き、query CU の数を増減できます。serving クラスターをスケールダウンする前に、新しい query CU 数でデータ量とワークロード容量に対応できることを確認してください。

詳細は、[Scale Cluster](./undefined) を参照してください。

### Zilliz Cloud への接続を試みたときに接続タイムアウトエラーが発生した場合はどう対処すればよいですか？\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

Zilliz Cloud クラスターへの接続を確立するには、関連するいくつかのパラメーターを指定する必要があります。たとえば、PyMilvus SDK の connect メソッドは以下のように使用できます。

```python
from pymilvus import Connections

conn = Connections.connect(
        alias=ALIAS,
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        timeout=30,
        secure=True
)
```

接続タイムアウトエラーは、以下のような状況で発生する可能性があります。

- ネットワーク状態が悪い

    ネットワーク状態が悪い場合の対処としては、connect 操作の timeout 時間を延長することを推奨します。上記のコードでは、`timeout` は `30` 秒に設定されています。これは、リクエスト送信後 30 秒以内に応答がない場合、connect 操作がタイムアウトすることを意味します。

- 接続パラメーターが正しくない

    Zilliz Cloud クラスターでは TLS が有効になっているため、クラスターに正常に接続するには、上記の例のように connect パラメーターに `secure` を含め、`true` に設定してください。これを行わないと、接続失敗や timeout エラーの原因になる場合があります。

- ローカル IP アドレスが許可リストに含まれていない

    クラスターに接続しようとしている場合は、VPN/Proxy 接続をオフにし、パブリック IP アドレスを取得し（プライベート IP アドレスでは動作しません）、接続したいクラスターの許可リストにその IP アドレスを追加していることも確認する必要があります。

### クラスター作成後にクラスターに接続できないのはなぜですか？\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

以下の手順に従って問題を特定できます。

1. クラスターのステータスが RUNNING であることを確認してください。クラスターの作成中、削除中、または IP 許可リストの更新中はクラスターに接続できません。

1. 接続元の IP アドレスが IP 許可リストに含まれていることを確認してください。

1. クラスターエンドポイント URI 内のポートが正しいことを確認してください。エンドポイント URI は Zilliz Cloud web console からコピーしてください。以下の表は、異なるクラウドプロバイダー上にデプロイされたクラスターのポートを示しています。

    | **Cloud Provider** | **Port** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. `telnet in01-(uuid).(region).vectordb.zillizcloud.com port-number` を実行して、ポートの接続性をテストしてください。

上記すべての手順を試しても問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node.js SDK で Zilliz Cloud に接続できない場合は、以下を試してください。

1. [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node) の最新バージョンをインストールしていることを確認してください。

1. クライアントが正しく初期化されていることを確認してください。

    ```bash
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

1. クラスターエンドポイントとトークンが正しいことを確認してください。クラスターエンドポイントには必ずプロトコル `https://` を含めてください。

1. クラスターエンドポイント URI 内のポートが正しいことを確認してください。エンドポイント URI は Zilliz Cloud web console からコピーしてください。以下の表は、異なるクラウドプロバイダー上にデプロイされたクラスターのポートを示しています。

    | **Cloud Provider** | **Port** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. クラスター設定で IP アドレスが許可リストに登録されている必要があります。

### 非アクティブなクラスターはどうなりますか？\{#what-happens-to-my-inactive-clusters}

無料クラスターは、7 日間非アクティブな状態が続くと通知のうえ自動的に一時停止されます。必要に応じていつでもクラスターを再開できます。ただし、専用クラスターは長期間の非アクティブ状態によって自動的に一時停止されることはありません。コスト削減のため、専用クラスターは手動で一時停止することを推奨します。

### クラスターを一時停止すると課金されますか？\{#will-i-be-charged-if-i-suspend-my-cluster}

クラスターが一時停止されると、課金対象はコンピューティングではなくストレージのみになります。ストレージコストの詳細については、[Pricing](https://zilliz.com/pricing) を参照してください。

### 接続エンドポイントを取得するにはどうすればよいですか？\{#how-to-obtain-a-connection-endpoint}

エンドポイントは Zilliz Cloud web console から取得できます。どの種類のエンドポイントを使用すべきかの詳細については、[Connect to Serving Clusters](./connect-to-serving-cluster) および [Connect for On-Demand Search](./connect-for-on-demand-search) を参照してください。

### Zilliz Cloud を Attu に接続できますか？\{#can-i-connect-zilliz-cloud-to-attu}

はい。[Attu](https://github.com/zilliztech/attu) は、Milvus と Zilliz Cloud のためのオープンソースのビジュアル管理ツールです。Docker コンテナーまたはデスクトップアプリとして実行できます。接続するには、Attu のログインページで Zilliz Cloud の **パブリックエンドポイント** と **API key**（または username:password 形式のクラスター認証情報）を指定してください。
