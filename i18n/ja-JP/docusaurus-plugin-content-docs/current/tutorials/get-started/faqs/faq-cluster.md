---
title: "FAQ: クラスター | CLOUD"
slug: /faq-cluster
sidebar_label: "FAQ: クラスター"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性がある問題と、それぞれの解決策について説明します。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2
displayed_sidebar: default

---

# FAQ: クラスター

このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性がある問題と、それぞれの解決策を一覧で示します。

## 目次

- [無料クラスターの容量はどのくらいですか？](#what-is-the-capacity-of-a-free-cluster)
- ["quota exceeded\[reason=disk quota exceeded, please allocate more resources" というエラーが発生した場合はどうすればよいですか？](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [専用クラスターの作成後にクラスタータイプを変更できますか？](#can-i-change-the-cluster-type-after-my-dedicated-cluster-is-created)
- [プロジェクトの作成後にクラウドリージョンを変更できますか？](#can-i-change-the-cloud-region-of-my-project-after-it-is-created)
- [サービングクラスターの Query CU をスケールダウンするにはどうすればよいですか？](#how-can-i-scale-down-the-query-cus-of-my-serving-cluster)
- [Zilliz Cloud への接続時に接続タイムアウトエラーが発生した場合はどうすればよいですか？](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [クラスターの作成後にクラスターに接続できないのはなぜですか？](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [非アクティブなクラスターはどうなりますか？](#what-happens-to-my-inactive-clusters)
- [クラスターを一時停止すると料金が発生しますか？](#will-i-be-charged-if-i-suspend-my-cluster)
- [接続エンドポイントを取得するにはどうすればよいですか？](#how-to-obtain-a-connection-endpoint)
- [Zilliz Cloud を Attu に接続できますか？](#can-i-connect-zilliz-cloud-to-attu)

## よくある質問




### 無料クラスターの容量はどのくらいですか？\{#what-is-the-capacity-of-a-free-cluster}

一般に、無料クラスターは 100 万個の 768 次元ベクトルを処理できます。ただし、実際の容量はスキーマによって異なります。

データが無料クラスターの最大容量を超える場合は、Serverless または Dedicated のデプロイオプションに[アップグレード](./select-zilliz-cloud-service-plans)して新しいクラスターを作成し、そこに[データを移行](./offline-migration)してください。クラスターの容量の詳細については、[適切な CU の選択](./cu-types-explained#assess-capacity) を参照してください。

### "quota exceeded\[reason=disk quota exceeded, please allocate more resources" というエラーが発生した場合はどうすればよいですか？\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データを挿入またはアップサートするときに、データがサービングクラスターの CU 容量を超えているため、このエラーが発生します。無料クラスターは 100 万個の 768 次元ベクトルを処理できます。専用クラスターの容量は、[クラスタータイプと CU サイズ](./cu-types-explained#assess-capacity)によって異なります。

この問題を解決するには、以下の手順に従ってください。

- 無料クラスターを使用している場合は、Serverless または Dedicated のデプロイオプションに[アップグレード](./manage-cluster)してください。

- Dedicated クラスターを使用している場合は、CU サイズを増やして[クラスターをスケールアップ](./auto-scaling)してください。

### 専用クラスターの作成後にクラスタータイプを変更できますか？\{#can-i-change-the-cluster-type-after-my-dedicated-cluster-is-created}

はい。クラスタータイプを変更するには、以下の手順に従ってください。

1. 希望するクラスタータイプで新しいサービングクラスターを作成します。[計算ツール](https://zilliz.com/pricing#calculator)を使用して、この新しいサービングクラスターの Query CU を決定してください。

1. 現在のサービングクラスターから、作成した新しいクラスターに[データを移行](./offline-migration)します。または、[お問い合わせ](https://support.zilliz.com/hc/en-us)いただき、クラスター間のデータ移行を依頼することもできます。お問い合わせの際は、ソースクラスターとターゲットクラスターを指定してください。

### プロジェクトの作成後にクラウドリージョンを変更できますか？\{#can-i-change-the-cloud-region-of-my-project-after-it-is-created}

いいえ。プロジェクトのリージョンは、プロジェクトの作成後に変更できません。別のリージョンを使用する場合は、新しいプロジェクトを作成してください。詳細については、[プロジェクトの管理](./manage-projects) を参照してください。

### サービングクラスターの Query CU をスケールダウンするにはどうすればよいですか？\{#how-can-i-scale-down-the-query-cus-of-my-serving-cluster}

はい。サービングクラスターの Query CU をスケールダウンするには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/signup)の **Summary** セクションに移動し、**Query CU** の横にある **Scale** をクリックします。スケーリングページが開き、Query CU の数を増減できます。サービングクラスターをスケールダウンする前に、新しい Query CU 数がデータ量とワークロード容量に対応できることを確認してください。

詳細については、[クラスタースケーリングの計画](./plan-cluster-scaling) を参照してください。

### Zilliz Cloud への接続時に接続タイムアウトエラーが発生した場合はどうすればよいですか？\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

Zilliz Cloud クラスターへの接続を確立するには、関連する複数のパラメーターを指定する必要があります。たとえば、PyMilvus SDK の connect メソッドは、次のように使用できます。

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

接続タイムアウトエラーは、以下のシナリオで発生する可能性があります。

- ネットワーク状態が悪い

    ネットワーク状態が悪い場合は、connect 操作のタイムアウト時間を長くすることをお勧めします。上記のコードでは、`timeout` が `30` 秒に設定されています。これは、リクエストの送信後 30 秒以内に応答を受信できない場合、connect 操作がタイムアウトすることを意味します。

- 接続パラメーターが正しくない

    Zilliz Cloud クラスターでは TLS が有効になっています。そのため、クラスターに正常に接続するには、上記の例のように、接続パラメーターに `secure` を含めて `true` に設定してください。これを行わないと、接続に失敗し、タイムアウトエラーのプロンプトが表示される可能性があります。

- ホワイトリストに登録されていないローカル IP アドレス

    クラスターへの接続を試みる場合は、VPN/Proxy 接続をオフにし、パブリック IP アドレスを取得し（プライベート IP アドレスは機能しません）、接続先のクラスターのホワイトリストにその IP アドレスを追加していることも確認する必要があります。

### クラスターの作成後にクラスターに接続できないのはなぜですか？\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

以下の手順で問題を特定できます。

1. クラスターのステータスが RUNNING であることを確認します。クラスターの作成中、削除中、または IP ホワイトリストの更新中は、クラスターに接続できません。

1. 接続に使用する IP アドレスが IP ホワイトリストに含まれていることを確認します。

1. クラスターエンドポイント URI のポートが正しいことを確認します。エンドポイント URI は、Zilliz Cloud Web コンソールからコピーしてください。次の表に、さまざまなクラウドプロバイダーにデプロイされたクラスターのポートを示します。

    | **クラウドプロバイダー** | **ポート** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. `telnet in01-(uuid).(region).vectordb.zillizcloud.com port-number` を実行して、ポートの接続性をテストします。

上記のすべての手順を試しても問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node.js SDK で Zilliz Cloud に接続できない場合は、次の点を試してください。

1. 最新バージョンの [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node) がインストールされていることを確認してください。

1. クライアントが正しく初期化されていることを確認してください。

    ```javascript
    import { MilvusClient } from '@zilliz/milvus2-sdk-node';
    
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

1. クラスターのエンドポイントとトークンが正しいことを確認してください。クラスターエンドポイントには、プロトコル `https://` を含めてください。

1. クラスターエンドポイント URI のポートが正しいことを確認します。エンドポイント URI は、Zilliz Cloud Web コンソールからコピーしてください。次の表に、さまざまなクラウドプロバイダーにデプロイされたクラスターのポートを示します。

    | **クラウドプロバイダー** | **ポート** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. クラスター設定で IP アドレスがホワイトリストに登録されている必要があります。

### 非アクティブなクラスターはどうなりますか？\{#what-happens-to-my-inactive-clusters}

無料クラスターは、7 日間非アクティブな状態が続くと、通知のうえで自動的に一時停止されます。必要に応じていつでも再開できます。ただし、専用クラスターは、長期間非アクティブであっても自動的には一時停止されません。コストを節約するには、専用クラスターを手動で一時停止することをお勧めします。

### クラスターを一時停止すると料金が発生しますか？\{#will-i-be-charged-if-i-suspend-my-cluster}

クラスターを一時停止すると、コンピューティングではなくストレージに対してのみ料金が発生します。ストレージコストの詳細については、[料金](https://zilliz.com/pricing) を参照してください。

### 接続エンドポイントを取得するにはどうすればよいですか？\{#how-to-obtain-a-connection-endpoint}

接続エンドポイントは、Zilliz Cloud Web コンソールから取得できます。使用するエンドポイントの種類の詳細については、[サービングクラスターへの接続](./connect-to-serving-cluster) および [オンデマンド検索用の接続](./connect-for-on-demand-search) を参照してください。

### Zilliz Cloud を Attu に接続できますか？\{#can-i-connect-zilliz-cloud-to-attu}

はい。[Attu](https://github.com/zilliztech/attu) は、Milvus および Zilliz Cloud 向けのオープンソースのビジュアル管理ツールです。Docker コンテナまたはデスクトップアプリとして実行できます。接続するには、Attu のログインページで Zilliz Cloud の **パブリックエンドポイント** と **API キー**（または username:password 形式のクラスター認証情報）を指定してください。
