---
title: "FAQ: Cluster | BYOC"
slug: /faq-cluster
sidebar_label: "FAQ: Cluster"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloud cluster の使用中に発生する可能性のある問題と、それに対応する解決策を一覧表示します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2
displayed_sidebar: default

---

# FAQ: Cluster

このトピックでは、Zilliz Cloud cluster の使用中に発生する可能性のある問題と、それに対応する解決策を一覧表示します。

## Contents

- [エラー "quota exceeded\[reason=disk quota exceeded, please allocate more resources" を受け取った場合はどうすればよいですか？](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [serving cluster の query CUs をスケールダウンするにはどうすればよいですか？](#how-can-i-scale-down-the-query-cus-of-my-serving-cluster)
- [Zilliz Cloud への接続を試みた際に connection timeout エラーが発生した場合、どう対処すればよいですか？](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [cluster 作成後に cluster に接続できないのはなぜですか？](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [cluster を一時停止した場合、課金されますか？](#will-i-be-charged-if-i-suspend-my-cluster)

## FAQs




### エラー "quota exceeded\[reason=disk quota exceeded, please allocate more resources" を受け取った場合はどうすればよいですか？\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データを挿入または upsert する際に、このエラーが表示されるのは、データ量が serving cluster の CU 容量を超えているためです。cluster の容量は、その [cluster type と CU size](./cu-types-explained#assess-capacity) によって異なります。

この問題に対処するには、以下の手順に従ってください。

このような場合は、query CUs を増やして [serving cluster をスケールアップ](./auto-scaling) することをお勧めします。

### serving cluster の query CUs をスケールダウンするにはどうすればよいですか？\{#how-can-i-scale-down-the-query-cus-of-my-serving-cluster}

cluster をスケールダウンする必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Zilliz Cloud への接続を試みた際に connection timeout エラーが発生した場合、どう対処すればよいですか？\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

Zilliz Cloud cluster への接続を確立するには、いくつかの関連パラメーターを指定する必要があります。たとえば、PyMilvus SDK の connect メソッドは以下のように使用できます。

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

connection timeout エラーは、以下のような場合に発生する可能性があります。

- ネットワーク状態が悪い

    ネットワーク状態が悪い場合への対処として、connect 操作の timeout 時間を長くすることをお勧めします。上記のコードでは、`timeout` は `30` 秒に設定されています。これは、リクエスト送信後 30 秒以内に応答がない場合、connect 操作がタイムアウトすることを意味します。

- 接続パラメーターが正しくない

    Zilliz Cloud cluster では TLS が有効になっているため、cluster への接続を成功させるには、上記の例のように connect パラメーターに `secure` を含め、それを `true` に設定してください。これを行わないと、接続に失敗し、timeout エラーが表示される場合があります。

- VPC security group rules

    connection timeout が発生する場合は、ソース IP が許可されていることを確認するために、VPC security group rules を確認してください。

### cluster 作成後に cluster に接続できないのはなぜですか？\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

以下の手順に従うことで、問題を特定できます。

1. cluster のステータスが RUNNING であることを確認します。cluster の作成中、削除中、または IP whitelist の更新中は、cluster に接続できません。

1. 接続元の IP アドレスが IP white list に含まれているか確認します。

1. cluster endpoint URI 内のポートが正しいか確認します。必ず Zilliz Cloud web console から endpoint URI をコピーしてください。以下の表は、異なる cloud provider 上にデプロイされた cluster のポートを示しています。

    | **Cloud Provider** | **Port** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. `telnet in01-(uuid).(region).vectordb.zillizcloud.com port-number` を実行して、ポートの接続性をテストします。

上記のすべての手順を試しても問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Node.js SDK で Zilliz Cloud に接続できない場合はどうすればよいですか？\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node.js SDK で Zilliz Cloud に接続できない場合は、以下を試してください。

1. 最新バージョンの [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node) をインストールしていることを確認します。

1. client を正しく初期化していることを確認します。

    ```bash
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

1. cluster endpoint と token が正しいことを確認します。cluster endpoint には必ずプロトコル `https://` を含めてください。

1. cluster endpoint URI 内のポートが正しいか確認します。必ず Zilliz Cloud web console から endpoint URI をコピーしてください。以下の表は、異なる cloud provider 上にデプロイされた cluster のポートを示しています。

    | **Cloud Provider** | **Port** |
    | --- | --- |
    | AWS | 19530 - 19550 |
    | Google Cloud | 443 |
    | Azure | 19530 |

1. IP アドレスが cluster 設定で whitelist に登録されている必要があります。

### cluster を一時停止した場合、課金されますか？\{#will-i-be-charged-if-i-suspend-my-cluster}

cluster が一時停止している間は、compute ではなく storage のみ課金されます。storage コストの詳細については、[Pricing](https://zilliz.com/pricing) を参照してください。
