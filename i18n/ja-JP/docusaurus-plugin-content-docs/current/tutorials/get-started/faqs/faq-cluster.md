---
title: "FAQ: Cluster | CLOUD"
slug: /faq-cluster
sidebar_label: "FAQ: Cluster"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性のある問題と、それに対応する解決策を一覧で示します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2
displayed_sidebar: default

---

# FAQ: Cluster

このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性のある問題と、それに対応する解決策を一覧で示します。

## 内容

- [無料クラスターの容量はどのくらいですか？](#what-is-the-capacity-of-a-free-cluster)
- [「quota exceeded\[reason=disk quota exceeded, please allocate more resources」というエラーが表示された場合はどうすればよいですか？](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [Dedicated クラスターの作成後にクラスタータイプを変更できますか？](#can-i-change-the-cluster-type-after-my-dedicated-cluster-is-created)
- [作成後にプロジェクトのクラウドリージョンを変更できますか？](#can-i-change-the-cloud-region-of-my-project-after-it-is-created)
- [サービングクラスターの Query CU をスケールダウンするにはどうすればよいですか？](#how-can-i-scale-down-the-query-cus-of-my-serving-cluster)
- [Zilliz Cloud への接続を試みたときに接続タイムアウトエラーが発生した場合、どのように対処すればよいですか？](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [クラスター作成後にクラスターに接続できないのはなぜですか？](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [非アクティブなクラスターはどうなりますか？](#what-happens-to-my-inactive-clusters)
- [クラスターを一時停止すると課金されますか？](#will-i-be-charged-if-i-suspend-my-cluster)
- [接続エンドポイントを取得するにはどうすればよいですか？](#how-to-obtain-a-connection-endpoint)
- [Zilliz Cloud を Attu に接続できますか？](#can-i-connect-zilliz-cloud-to-attu)

## FAQs




### 無料クラスターの容量はどのくらいですか？\{#what-is-the-capacity-of-a-free-cluster}

一般に、無料クラスターは 768 次元ベクトルを 100 万件処理できます。ただし、実際の容量はスキーマに依存します。 

データが無料クラスターの最大容量を超える場合は、[アップグレード](./select-zilliz-cloud-service-plans)して Serverless または Dedicated デプロイメントオプションで新しいクラスターを作成し、そこに[データを移行](./offline-migration)してください。クラスターの容量の詳細については、[適切な CU を選択する](./cu-types-explained#assess-capacity)を参照してください。

### 「quota exceeded\[reason=disk quota exceeded, please allocate more resources」というエラーが表示された場合はどうすればよいですか？\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データを insert または upsert する際、このエラーはデータ量がサービングクラスターの CU 容量を超えているために発生します。無料クラスターは 768 次元ベクトルを 100 万件処理できます。Dedicated クラスターの容量は、その[クラスタータイプと CU サイズ](./cu-types-explained#assess-capacity)によって異なります。

この問題に対処するには、以下の手順に従ってください。

- 無料クラスターを使用している場合は、[アップグレード](./manage-cluster)して Serverless または Dedicated デプロイメントオプションを使用してください。

- Dedicated クラスターを使用している場合は、CU サイズを増やして[クラスターをスケールアップ](./auto-scaling)してください。

### Dedicated クラスターの作成後にクラスタータイプを変更できますか？\{#can-i-change-the-cluster-type-after-my-dedicated-cluster-is-created}

はい。クラスタータイプを変更するには、以下の手順に従う必要があります。

1. 希望するクラスタータイプで新しいサービングクラスターを作成します。この新しいサービングクラスターの Query CU を決定するには、[calculator](https://zilliz.com/pricing#calculator) を使用してください。

1. 現在のサービングクラスターから、作成した新しいクラスターにデータを[移行](./offline-migration)します。あるいは、クラスター間のデータ移行について[お問い合わせ](https://support.zilliz.com/hc/en-us)いただくこともできます。お問い合わせの際は、ソースクラスターとターゲットクラスターを明記してください。

### 作成後にプロジェクトのクラウドリージョンを変更できますか？\{#can-i-change-the-cloud-region-of-my-project-after-it-is-created}

いいえ。プロジェクトリージョンはプロジェクト作成後に変更できません。別のリージョンを使用するには、新しいプロジェクトを作成してください。詳細は、[Manage Projects](./manage-projects) を参照してください。

### サービングクラスターの Query CU をスケールダウンするにはどうすればよいですか？\{#how-can-i-scale-down-the-query-cus-of-my-serving-cluster}

はい。サービングクラスターの Query CU をスケールダウンするには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/signup) の **Summary** セクションに移動し、**Query CU** の横にある **Scale** をクリックします。するとスケーリングページが開き、Query CU の数を増減できます。サービングクラスターをスケールダウンする前に、新しい Query CU 数でデータ量とワークロード容量に対応できることを確認してください。

詳細については、[Plan Cluster Scaling](./plan-cluster-scaling) を参照してください。

### Zilliz Cloud への接続を試みたときに接続タイムアウトエラーが発生した場合、どのように対処すればよいですか？\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

Zilliz Cloud クラスターへの接続を確立するには、いくつかの関連パラメーターを指定する必要があります。たとえば、PyMilvus SDK の connect メソッドは以下のように使用できます。

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

接続タイムアウトエラーは、次のような状況で発生する可能性があります。

- ネットワーク状態が悪い場合

    ネットワーク状態が悪い場合に対処するには、connect 操作のタイムアウト時間を長くすることを推奨します。上記コードでは、`timeout` は `30` 秒に設定されています。これは、リクエスト送信後 30 秒以内に応答がない場合、connect 操作がタイムアウトすることを意味します。

- 接続パラメーターが正しくない場合

    Zilliz Cloud クラスターでは TLS が有効になっているため、クラスターに正常に接続するには、上記の例のように接続パラメーターに `secure` を含めて `true` に設定してください。これを行わないと、接続失敗やタイムアウトエラーの原因になる可能性があります。

- ローカル IP アドレスが許可リストに登録されていない場合

    クラスターへの接続を試みる場合は、VPN/Proxy 接続を無効にし、パブリック IP アドレスを取得し（プライベート IP アドレスは機能しません）、接続先クラスターの許可リストにその IP アドレスを追加していることも確認する必要があります。

### クラスター作成後にクラスターに接続できないのはなぜですか？\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

以下の手順で問題を特定できます。

1. クラスターのステータスが RUNNING か確認してください。クラスターの作成中、削除中、または IP 許可リストの更新中はクラスターに接続できません。

1. 接続元の IP アドレスが IP 許可リストに含まれているか確認してください。

1. クラスターエンドポイント URI のポートが正しいか確認してください。エンドポイント URI は必ず Zilliz Cloud Web コンソールからコピーしてください。以下の表は、異なるクラウドプロバイダーにデプロイされたクラスターのポートを示しています。

    | **Cloud Provider** | **Port** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. `telnet in01-(uuid).(region).vectordb.zillizcloud.com port-number` を実行して、ポートの接続性をテストしてください。

上記すべての手順を試しても問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node.js SDK で Zilliz Cloud への接続に失敗する場合は、以下をお試しください。

1. 最新バージョンの [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node) をインストールしていることを確認してください。

1. クライアントを正しく初期化していることを確認してください。

    ```bash
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

1. クラスターエンドポイントとトークンが正しいことを確認してください。クラスターエンドポイントには必ずプロトコル `https://` を含めてください。

1. クラスターエンドポイント URI のポートが正しいか確認してください。エンドポイント URI は必ず Zilliz Cloud Web コンソールからコピーしてください。以下の表は、異なるクラウドプロバイダーにデプロイされたクラスターのポートを示しています。

    | **Cloud Provider** | **Port** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. クラスター設定で IP アドレスが許可リストに登録されている必要があります。

### 非アクティブなクラスターはどうなりますか？\{#what-happens-to-my-inactive-clusters}

無料クラスターは、7 日間非アクティブな状態が続くと通知のうえ自動的に一時停止されます。必要に応じていつでも再開できます。一方、Dedicated クラスターは長期間非アクティブであっても自動的には一時停止されません。コスト削減のため、Dedicated クラスターは手動で一時停止することを推奨します。

### クラスターを一時停止すると課金されますか？\{#will-i-be-charged-if-i-suspend-my-cluster}

クラスターが一時停止されている間は、コンピューティングではなくストレージのみ課金されます。ストレージコストの詳細については、[Pricing](https://zilliz.com/pricing) を参照してください。

### 接続エンドポイントを取得するにはどうすればよいですか？\{#how-to-obtain-a-connection-endpoint}

エンドポイントは Zilliz Cloud Web コンソールから取得できます。どの種類のエンドポイントを使用すべきかの詳細については、[Connect to Serving Clusters](./connect-to-serving-cluster) および [Connect for On-Demand Search](./connect-for-on-demand-search) を参照してください。

### Zilliz Cloud を Attu に接続できますか？\{#can-i-connect-zilliz-cloud-to-attu}

はい。[Attu](https://github.com/zilliztech/attu) は、Milvus と Zilliz Cloud のためのオープンソースのビジュアル管理ツールです。Docker コンテナーまたはデスクトップアプリとして実行できます。接続するには、Attu のログインページで Zilliz Cloud の **public endpoint** と **API key**（または username:password 形式のクラスター認証情報）を入力してください。
