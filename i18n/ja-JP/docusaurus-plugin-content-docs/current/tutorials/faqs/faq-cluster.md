---
title: "FAQ：クラスター | CLOUD"
slug: /faq-cluster
sidebar_label: "FAQ：クラスター"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudクラスターを使用中に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。 | CLOUD"
type: origin
token: EV41wG08BiOWW8kbo9xcTGoPnKd
sidebar_position: 2

---

# FAQ：クラスター

このトピックでは、Zilliz Cloudクラスターを使用中に遭遇する可能性のある問題と、それに対応する解決策をリストアップしています。

## 目次

- [無料クラスターの容量はどれくらいですか？](#what-is-the-capacity-of-a-free-cluster)
- [「quota exceeded[reason=disk quota exceeded, please allocate more resources」というエラーが表示された場合、どのように対処すればよいですか？](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [専用クラスター作成後にCUタイプを変更することはできますか？](#can-i-change-the-cu-type-after-my-dedicated-cluster-is-created)
- [クラスター作成後にクラウドリージョンを変更することはできますか？](#can-i-change-the-cloud-region-of-my-cluster-after-it-is-created)
- [クラスターのCUサイズを縮小するにはどうすればよいですか？](#how-can-i-scale-down-my-cluster-cu-size)
- [AWSに無料クラスターをデプロイすることはできますか？](#can-i-deploy-a-free-cluster-on-aws)
- [Zilliz Cloudに接続しようとしたときに接続タイムアウトエラーが発生する場合、どのように対処すればよいですか？](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [なぜクラスター作成後クラスターに接続できないのでしょうか？](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node.js SDKでZilliz Cloudに接続できない場合、どのように対処すればよいですか？](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [非アクティブなクラスターはどうなりますか？](#what-happens-to-my-inactive-clusters)
- [クラスターを一時停止した場合、課金は発生しますか？](#will-i-be-charged-if-i-suspend-my-cluster)
- [クラスターURIを取得するには？](#how-to-obtain-a-cluster-uri)

## FAQ

### 無料クラスターの容量はどれくらいですか？\{#what-is-the-capacity-of-a-free-cluster}

一般的に、無料クラスターは100万個の768次元ベクトルを処理できます。ただし、実際の容量はスキーマによって異なります。

データが無料クラスターの最大容量を超えている場合は、[アップグレード](./select-zilliz-cloud-service-plans)してServerlessまたはDedicatedデプロイメントオプションにし、新しいクラスターを作成して[データを移行](./offline-migration)してください。クラスターの容量に関する詳細については、[適切なCUの選択](./cu-types-explained#assess-capacity)を参照してください。

### 「quota exceeded[reason=disk quota exceeded, please allocate more resources」というエラーが表示された場合、どのように対処すればよいですか？\{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データの挿入またはアップサート時に、データがクラスターのCU容量を超えるとこのエラーが表示されます。無料クラスターは100万個の768次元ベクトルを処理できます。専用クラスターの容量は[CUタイプとCUサイズ](./cu-types-explained#assess-capacity)によって異なります。

この問題に対処するには、以下の手順に従ってください。

- 無料クラスターを使用している場合は、[アップグレード](./manage-cluster)してServerlessまたはDedicatedデプロイメントオプションに変更してください。

- 専用クラスターを使用している場合は、CUサイズを増やすことでクラスターを[スケールアップ](./scale-cluster)してください。

### 専用クラスター作成後にCUタイプを変更することはできますか？\{#can-i-change-the-cu-type-after-my-dedicated-cluster-is-created}

はい。CUタイプを変更するには、以下の手順に従う必要があります。

1. 希望するCUタイプの新しいクラスターを作成します。[計算ツール](https://zilliz.com/pricing#calculator)を使用して、新しいクラスターのCUサイズを決定してください。

2. 現在のクラスターから先ほど作成した新しいクラスターにデータを[移行](./offline-migration)してください。または、クラスター間のデータ移行を代行してもらうために[お問い合わせ](https://support.zilliz.com/hc/en-us)することもできます。お問い合わせの際には、ソースクラスターとターゲットクラスターを明確に指定してください。

### クラスター作成後にクラウドリージョンを変更することはできますか？\{#can-i-change-the-cloud-region-of-my-cluster-after-it-is-created}

はい。クラスターのクラウドリージョンを変更するには、以下の手順に従う必要があります。

1. 希望するクラウドリージョンで新しいクラスターを作成します。

2. 現在のクラスターから先ほど作成した新しいクラスターにデータを[移行](./offline-migration)してください。または、クラスター間のデータ移行を代行してもらうために[お問い合わせ](https://support.zilliz.com/hc/en-us)することもできます。お問い合わせの際には、ソースクラスターとターゲットクラスターを明確に指定してください。

### クラスターのCUサイズを縮小するにはどうすればよいですか？\{#how-can-i-scale-down-my-cluster-cu-size}

はい。クラスターのCUサイズを縮小するには、[Zilliz Cloudコンソール](https://cloud.zilliz.com/signup) の**概要**セクションに移動し、CU **サイズ**の隣にある**スケール**をクリックします。これにより、スケーリングページが開き、CUサイズを増減させることができます。クラスターを縮小する前に、CUサイズがデータ量とワークロード容量に対応していることを確認してください。

詳細については、[クラスターのスケーリング](./scale-cluster)を参照してください。

### AWSに無料クラスターをデプロイすることはできますか？\{#can-i-deploy-a-free-cluster-on-aws}

はい。無料クラスターをAWSのeu-central-1（ドイツ・フランクフルト）またはGoogle Cloudのus-west1（アメリカ・オレゴン）にデプロイできます。他のクラウドリージョンにクラスターをデプロイするには、Dedicatedデプロイメントオプションにアップグレードしてください。サポートされているクラウドプロバイダーとリージョンの完全なリストについては、[クラウドプロバイダーおよびリージョン](./cloud-providers-and-regions)を参照してください。

### Zilliz Cloudに接続しようとしたときに接続タイムアウトエラーが発生する場合、どのように対処すればよいですか？\{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

Zilliz Cloudクラスターへの接続を確立するには、いくつかの関連パラメータを提供する必要があります。たとえば、PyMilvus SDKの接続メソッドは以下のように使用できます：

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

- ネットワーク状況が不良の場合

    ネットワーク状況が不良の場合に備えて、接続操作のタイムアウト時間を長くすることをお勧めします。上記のコードでは、`timeout`が`30`秒に設定されており、要求送信後30秒以内に応答がない場合、接続操作がタイムアウトすることを意味します。

- 接続パラメータが誤っている場合

    Zilliz CloudクラスターにはTLSが有効になっているため、クラスターへの接続に成功するには、接続パラメータに`secure`を含め、上記の例のように`true`に設定する必要があります。これを行わないと、接続に失敗し、タイムアウトエラーが表示される場合があります。

- ローカルIPアドレスがホワイトリストに登録されていない場合

    クラスターへの接続を試みる場合、VPN/Proxy接続をオフにし、パブリックIPアドレスを取得（プライベートIPアドレスは機能しません）し、接続したいクラスターのホワイトリストにそのIPアドレスを追加する必要があります。

### なぜクラスター作成後クラスターに接続できないのでしょうか？\{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

以下の手順に従って問題を特定できます：

1. クラスターのステータスがRUNNINGであることを確認します。クラスターが作成中、削除中、またはIPホワイトリストが更新中の場合は、クラスターに接続できません。

2. 接続元のIPアドレスがIPホワイトリストに含まれていることを確認します。

3. クラスターエンドポイントURIのポートが正しいことを確認します。Zilliz CloudウェブコンソールからエンドポイントURIをコピーしてください。以下の表は、異なるクラウドプロバイダーにデプロイされたクラスターのポートを示しています。

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

上記のすべての手順を試しても問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Node.js SDKでZilliz Cloudに接続できない場合、どのように対処すればよいですか？\{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node.js SDKでZilliz Cloudに接続できない場合は、以下を試してください：

1. 最新バージョンの[Node.js SDK](https://github.com/milvus-io/milvus-sdk-node)をインストールしていることを確認してください。

2. クライアントが正しく初期化されていることを確認してください。

    ```bash
    const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
    ```

3. クラスターエンドポイントとトークンが正しいことを確認してください。クラスターエンドポイントに`https://`プロトコルを含めていることを確認してください。

4. クラスターエンドポイントURIのポートが正しいことを確認します。Zilliz CloudウェブコンソールからエンドポイントURIをコピーしてください。以下の表は、異なるクラウドプロバイダーにデプロイされたクラスターのポートを示しています。

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

5. IPアドレスはクラスター設定のホワイトリストに登録されている必要があります。

### 非アクティブなクラスターはどうなりますか？\{#what-happens-to-my-inactive-clusters}

無料クラスターは、7日間の非アクティブ状態が続くと自動的に一時停止されます。必要に応じてクラスターをいつでも再開できます。ただし、専用クラスターは長期間の非アクティブ状態によって自動的に一時停止されることはありません。コスト削減のため、専用クラスターは手動で一時停止することをお勧めします。

### クラスターを一時停止した場合、課金は発生しますか？\{#will-i-be-charged-if-i-suspend-my-cluster}

クラスターが一時停止している場合、コンピューティングではなくストレージに対してのみ課金されます。ストレージコストの詳細については、[価格](https://zilliz.com/pricing)を参照してください。

### クラスターURIを取得するには？\{#how-to-obtain-a-cluster-uri}
クラスターURIとは、接続に使用できるクラスターエンドポイントを指します。

Zilliz CloudウェブコンソールからURIを取得できます。詳細については、[クラスターへの接続](./connect-to-cluster#connect-to-a-cluster)を参照してください。