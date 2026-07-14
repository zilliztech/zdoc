---
title: "FAQ: クラスター | BYOC"
slug: /faq-cluster
sidebar_label: "FAQ: クラスター"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性のある問題と、それに対応する解決策を一覧表示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2
displayed_sidebar: default

---

# FAQ: クラスター

このトピックでは、Zilliz Cloud クラスターの使用中に発生する可能性のある問題と、それに対応する解決策を一覧表示します。

## 目次

- [エラー "quota exceeded\[reason=disk quota exceeded, please allocate more resources" を受け取った場合はどうすればよいですか？](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [サービングクラスターのクエリ CU をスケールダウンするにはどうすればよいですか？](#how-can-i-scale-down-the-query-cus-of-my-serving-cluster)
- [Zilliz Cloud への接続を試みた際に接続タイムアウトエラーが発生した場合、どのように対処すればよいですか？](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [クラスター作成後にクラスターに接続できないのはなぜですか？](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [クラスターを一時停止した場合、課金されますか？](#will-i-be-charged-if-i-suspend-my-cluster)

## FAQs




### エラー "quota exceeded\[reason=disk quota exceeded, please allocate more resources" を受け取った場合はどうすればよいですか？\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データの insert または upsert を行う際、このエラーはデータ量がサービングクラスターの CU 容量を超えているために発生します。クラスターの容量は、その [クラスタータイプと CU サイズ](./cu-types-explained#assess-capacity) によって決まります。

この問題に対処するには、以下の手順に従ってください。

このような場合は、クエリ CU を増やして [サービングクラスターをスケールアップ](./undefined) することをお勧めします。

### サービングクラスターのクエリ CU をスケールダウンするにはどうすればよいですか？\{#how-can-i-scale-down-the-query-cus-of-my-serving-cluster}

クラスターをスケールダウンする必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Zilliz Cloud への接続を試みた際に接続タイムアウトエラーが発生した場合、どのように対処すればよいですか？\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

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

接続タイムアウトエラーは、以下のような状況で発生する可能性があります。

- ネットワーク状態が不安定

    ネットワーク状態が不安定な場合の対処としては、connect 操作のタイムアウト時間を延長することをお勧めします。上記のコードでは、`timeout` は `30` 秒に設定されています。これは、リクエスト送信後 30 秒以内に応答を受信しない場合、connect 操作がタイムアウトすることを意味します。

- 接続パラメーターが正しくない

    Zilliz Cloud クラスターでは TLS が有効になっているため、クラスターに正常に接続するには、上記の例のように connect パラメーターに `secure` を含めて `true` に設定してください。これを行わないと、接続に失敗し、タイムアウトエラーが表示される可能性があります。

- VPC セキュリティグループルール

    接続タイムアウトが発生する場合は、ソース IP が許可されていることを確認するために、VPC セキュリティグループルールを確認してください。

### クラスター作成後にクラスターに接続できないのはなぜですか？\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

以下の手順に従うことで、問題を特定できます。

1. クラスターのステータスが RUNNING かどうかを確認します。クラスターの作成中、削除中、または IP ホワイトリストの更新中はクラスターに接続できません。

1. 接続元の IP アドレスが IP ホワイトリストに含まれているか確認します。

1. クラスターエンドポイント URI 内のポートが正しいか確認します。必ず Zilliz Cloud Web コンソールからエンドポイント URI をコピーしてください。以下の表は、異なるクラウドプロバイダー上にデプロイされたクラスターのポートを示しています。

    | **クラウドプロバイダー** | **ポート** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. `telnet in01-(uuid).(region).vectordb.zillizcloud.com port-number` を実行して、そのポートの接続性をテストします。

上記のすべての手順を試しても問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node.js SDK で Zilliz Cloud に接続できない場合は、以下をお試しください。

1. [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node) の最新バージョンをインストールしていることを確認します。

1. クライアントを正しく初期化していることを確認します。

    ```bash
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

1. クラスターエンドポイントとトークンが正しいことを確認します。クラスターエンドポイントには必ずプロトコル `https://` を含めてください。

1. クラスターエンドポイント URI 内のポートが正しいか確認します。必ず Zilliz Cloud Web コンソールからエンドポイント URI をコピーしてください。以下の表は、異なるクラウドプロバイダー上にデプロイされたクラスターのポートを示しています。

    | **クラウドプロバイダー** | **ポート** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. IP アドレスがクラスター設定でホワイトリストに追加されている必要があります。

### クラスターを一時停止した場合、課金されますか？\{#will-i-be-charged-if-i-suspend-my-cluster}

クラスターを一時停止すると、コンピューティングではなくストレージに対してのみ課金されます。ストレージコストの詳細については、[Pricing](https://zilliz.com/pricing) を参照してください。
