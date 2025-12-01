---
title: "FAQ: クラスター | BYOC"
slug: /faq-cluster
sidebar_label: "FAQ: クラスター"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudクラスターを使用中に遭遇する可能性のある問題とその解決方法についてこのトピックで紹介します。 | BYOC"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2

---

# FAQ: クラスター

このトピックでは、Zilliz Cloudクラスターを使用中に遭遇する可能性のある問題とその解決方法について紹介します。

## 目次

- [「quota exceeded\[reason=disk quota exceeded, please allocate more resources」エラーを受け取った場合、どうすればよいですか？](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [クラスターCUサイズをどのようにスケールダウンできますか？](#how-can-i-scale-down-my-cluster-cu-size)
- [Zilliz Cloudに接続しようとしたときに接続タイムアウトエラーをどう処理できますか？](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [クラスター作成後にクラスターに接続できないのはなぜですか？](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node.js SDKでZilliz Cloudに接続できない場合、どうすればよいですか？](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [クラスターを一時停止した場合、課金されますか？](#will-i-be-charged-if-i-suspend-my-cluster)
- [クラスタURIをどのように取得できますか？](#how-to-obtain-a-cluster-uri)

## よくある質問




### 「quota exceeded\[reason=disk quota exceeded, please allocate more resources」エラーを受け取った場合、どうすればよいですか？\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データの挿入またはアップサート時に、データがクラスターCU容量を超えるため、このエラーが発生します。クラスターの容量は[CUタイプとCUサイズ](./cu-types-explained#assess-capacity)によって異なります。

この問題に対処するには、以下の手順に従ってください。

このような場合、CUサイズを増やすことで[クラスターをスケールアップ](./scale-cluster)することをお勧めします。

### クラスターCUサイズをどのようにスケールダウンできますか？\{#how-can-i-scale-down-my-cluster-cu-size}

クラスターCUサイズをスケールダウンする必要がある場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Zilliz Cloudに接続しようとしたときに接続タイムアウトエラーをどう処理できますか？\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

Zilliz Cloudクラスターに接続を確立するには、いくつかの関連パラメータを提供する必要があります。たとえば、PyMilvus SDKの接続メソッドは以下のように使用できます：

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

以下のシナリオで接続タイムアウトエラーが発生する可能性があります：

- ネットワーク状況が悪い

    ネットワーク状況が悪い場合は、接続操作のタイムアウト時間を長くすることをお勧めします。上記のコードでは、`timeout`が30秒に設定されており、リクエストが送信されてから30秒以内に応答がない場合、接続操作がタイムアウトすることを意味します。

- 接続パラメータが間違っている

    Zilliz CloudクラスターはTLSが有効になっているため、クラスターへの接続に成功するには、上記の例のように接続パラメータに`secure`を含め、`true`に設定してください。これを行わないと、接続が失敗し、タイムアウトエラーが表示される可能性があります。

- ホワイトリストに登録されていないローカルIPアドレス

    クラスターへの接続を試みている場合は、VPN/Proxy接続をオフにし、パブリックIPアドレスを取得（プライベートIPアドレスは機能しません）、接続先クラスターのホワイトリストにそのIPアドレスを追加していることを確認する必要があります。

### クラスター作成後にクラスターに接続できないのはなぜですか？\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

以下の手順に従って、問題を特定できます：

1. クラスターのステータスがRUNNINGであることを確認してください。クラスターが作成中、削除中、またはIPホワイトリストが更新中の場合は、クラスターに接続できません。

2. 接続のIPアドレスがIPホワイトリストに含まれていることを確認してください。

3. クラスターエンドポイントURIのポートが正しいことを確認してください。Zilliz CloudウェブコンソールからエンドポイントURIをコピーしたことを確認してください。以下の表は、異なるクラウドプロバイダーにデプロイされたクラスターのポートを一覧表示しています。

    <table>
       <tr>
         <th><p><strong>クラウドプロバイダー</strong></p></th>
         <th><p><strong>ポート</strong></p></th>
       </tr>
       <tr>
         <td><p>AWS</p></td>
         <td><p>19530 - 19550</p></td>
       </tr>
       <tr>
         <td><p>Google Cloud</p></td>
         <td><p>443</p></td>
       </tr>
       <tr>
         <td><p>Azure</p></td>
         <td><p>19530</p></td>
       </tr>
    </table>

4. `telnet in01-(uuid).(region).vectordb.zillizcloud.com ポート番号`を実行して、ポートの接続性をテストします。

上記すべての手順を試した後も問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Node.js SDKでZilliz Cloudに接続できない場合、どうすればよいですか？\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node.js SDKでZilliz Cloudへの接続に失敗した場合は、以下をお試しください：

1. [Node.js SDK](https://github.com/milvus-io/milvus-sdk-node)の最新バージョンをインストールしていることを確認してください。

2. クライアントを正しく初期化していることを確認してください。

    ```bash
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

3. クラスターエンドポイントとトークンが正しいことを確認してください。クラスターエンドポイントに`https://`プロトコルを含めていることを確認してください。

4. クラスターエンドポイントURIのポートが正しいことを確認してください。Zilliz CloudウェブコンソールからエンドポイントURIをコピーしたことを確認してください。以下の表は、異なるクラウドプロバイダーにデプロイされたクラスターのポートを一覧表示しています。

    <table>
       <tr>
         <th><p><strong>クラウドプロバイダー</strong></p></th>
         <th><p><strong>ポート</strong></p></th>
       </tr>
       <tr>
         <td><p>AWS</p></td>
         <td><p>19530 - 19550</p></td>
       </tr>
       <tr>
         <td><p>Google Cloud</p></td>
         <td><p>443</p></td>
       </tr>
       <tr>
         <td><p>Azure</p></td>
         <td><p>19530</p></td>
       </tr>
    </table>

5. IPアドレスがクラスタ設定のホワイトリストに登録されている必要があります。

### クラスターを一時停止した場合、課金されますか？\{#will-i-be-charged-if-i-suspend-my-cluster}

クラスターが一時停止している場合、コンピューティングではなくストレージに対してのみ課金されます。ストレージコストの詳細については、[価格設定](https://zilliz.com/pricing)を参照してください。

### クラスタURIをどのように取得できますか？\{#how-to-obtain-a-cluster-uri}
クラスタURIは接続に使用できるクラスターエンドポイントを指します。

URIはZilliz Cloudウェブコンソールから取得できます。詳細については、[クラスターへの接続](./connect-to-cluster#connect-to-a-cluster)を参照してください。
