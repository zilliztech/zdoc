---
title: "FAQ: Cluster | BYOC"
slug: /faq-cluster
sidebar_label: "FAQ: Cluster"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性のある問題と、それに対応する解決策を一覧で示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2
displayed_sidebar: default

---

# FAQ: Cluster

このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性のある問題と、それに対応する解決策を一覧で示します。

## 目次

- ["quota exceeded\[reason=disk quota exceeded, please allocate more resources" というエラーを受け取った場合はどうすればよいですか？](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [サービングクラスターのクエリ CU をスケールダウンするにはどうすればよいですか？](#how-can-i-scale-down-the-query-cus-of-my-serving-cluster)
- [Zilliz Cloud への接続を試みた際に接続タイムアウトエラーが発生した場合、どのように対処できますか？](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [クラスター作成後にクラスターに接続できないのはなぜですか？](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [クラスターを一時停止した場合、料金は発生しますか？](#will-i-be-charged-if-i-suspend-my-cluster)

## FAQs




### "quota exceeded\[reason=disk quota exceeded, please allocate more resources" というエラーを受け取った場合はどうすればよいですか？\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データを挿入または upsert するときに、データ量がサービングクラスターの CU 容量を超えているため、このエラーが発生します。クラスターの容量は、その [クラスタータイプと CU サイズ](./cu-types-explained#assess-capacity) によって異なります。

この問題に対処するには、以下の手順に従ってください。

このような場合は、クエリ CU を増やして [サービングクラスターをスケールアップ](./auto-scaling) することをお勧めします。

### サービングクラスターのクエリ CU をスケールダウンするにはどうすればよいですか？\{#how-can-i-scale-down-the-query-cus-of-my-serving-cluster}

クラスターをスケールダウンする必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us) してください。

### Zilliz Cloud への接続を試みた際に接続タイムアウトエラーが発生した場合、どのように対処できますか？\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

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

- ネットワーク状態が不安定な場合

    ネットワーク状態が不安定な場合に対処するには、接続操作のタイムアウト時間を延長することをお勧めします。上記のコードでは、`timeout` は `30` 秒に設定されており、これはリクエスト送信後 30 秒以内に応答がない場合、接続操作がタイムアウトすることを意味します。

- 接続パラメーターが正しくない場合

    Zilliz Cloud クラスターでは TLS が有効になっているため、クラスターに正常に接続するには、上記の例のように接続パラメーターに `secure` を含めて `true` に設定してください。これを行わないと、接続に失敗し、タイムアウトエラーが表示される可能性があります。

- VPC セキュリティグループルール

    接続タイムアウトが発生する場合は、VPC セキュリティグループルールを確認し、送信元 IP が許可されていることを確認してください。

### クラスター作成後にクラスターに接続できないのはなぜですか？\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

以下の手順に従って問題を特定できます。

1. クラスターのステータスが RUNNING であることを確認します。クラスターの作成中、削除中、または IP 許可リストの更新中はクラスターに接続できません。

1. 接続元の IP アドレスが IP 許可リストに含まれているか確認します。

1. クラスターエンドポイント URI 内のポートが正しいか確認します。必ず Zilliz Cloud Web コンソールからエンドポイント URI をコピーしてください。以下の表は、異なるクラウドプロバイダーにデプロイされたクラスターのポートを示しています。

    | **クラウドプロバイダー** | **ポート** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. `telnet in01-(uuid).(region).vectordb.zillizcloud.com port-number` を実行して、ポートの接続性をテストします。

上記のすべての手順を試しても問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us) してください。

### Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node.js SDK で Zilliz Cloud への接続に失敗する場合は、次を試してください。

1. 最新バージョンの [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node) をインストールしていることを確認してください。

1. クライアントが正しく初期化されていることを確認してください。

    ```bash
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

1. クラスターエンドポイントとトークンが正しいことを確認してください。クラスターエンドポイントには必ずプロトコル `https://` を含めてください。

1. クラスターエンドポイント URI 内のポートが正しいか確認します。必ず Zilliz Cloud Web コンソールからエンドポイント URI をコピーしてください。以下の表は、異なるクラウドプロバイダーにデプロイされたクラスターのポートを示しています。

    | **クラウドプロバイダー** | **ポート** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. IP アドレスがクラスター設定で許可リストに登録されている必要があります。

### クラスターを一時停止した場合、料金は発生しますか？\{#will-i-be-charged-if-i-suspend-my-cluster}

クラスターが一時停止されている間は、コンピューティングではなくストレージに対してのみ課金されます。ストレージコストの詳細については、[Pricing](https://zilliz.com/pricing) を参照してください。
