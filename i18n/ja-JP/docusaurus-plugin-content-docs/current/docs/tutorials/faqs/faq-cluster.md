---
title: "FAQ:クラスタ | CLOUD"
slug: /faq-cluster
sidebar_label: "FAQ:クラスタ"
beta: FALSE
notebook: FALSE
description: "このトピックでは、Zilliz Cloudクラスターを使用する際に発生する可能性のある問題と、それに対応する解決策について説明します。 | CLOUD"
type: origin
token: LKxiwykkhi5VyLkTfAGcE3LinBe
sidebar_position: 2

---

# FAQ:クラスタ

このトピックでは、Zilliz Cloudクラスターを使用する際に発生する可能性のある問題と、それに対応する解決策について説明します。

## Contents

- [フリークラスタの容量は何ですか?](#what-is-the-capacity-of-a-free-cluster)
- [「クォータ超過\[理由=ディスククォータ超過、より多くのリソースを割り当ててください」というエラーが表示された場合、どうすればよいですか?](#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources)
- [専用クラスターが作成された後にCUタイプを変更できますか?](#can-i-change-the-cu-type-after-my-dedicated-cluster-is-created)
- [クラスターの作成後にクラウドリージョンを変更できますか?](#can-i-change-the-cloud-region-of-my-cluster-after-it-is-created)
- [クラスターCUの体格を縮小するにはどうすればよいですか?](#how-can-i-scale-down-my-cluster-cu-size)
- [AWSに無料クラスタをデプロイできますか?](#can-i-deploy-a-free-cluster-on-aws)
- [無料プランのクラスターはカスタマイズされたスキーマをサポートしていますか?](#do-clusters-in-the-free-plan-support-customized-schema)
- [Zilliz Cloudに接続しようとすると、接続タイムアウトエラーが発生します。どうすれば対処できますか?](#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud)
- [クラスターが作成された後にクラスターに接続できないのはなぜですか?](#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created)
- [Node. js SDKでZilliz Cloudに接続できない場合、どうすればいいですか?](#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk)
- [非アクティブなクラスターはどうなりますか?](#what-happens-to-my-inactive-clusters)
- [クラスタをサスペンドした場合、料金は発生しますか?](#will-i-be-charged-if-i-suspend-my-cluster)

## FAQs




### フリークラスタの容量は何ですか?{#what-is-the-capacity-of-a-free-cluster}

一般的に、フリークラスタは100万個の768次元ベクトルを処理できます。ただし、実際の容量はスキーマによって異なります。

データが空きクラスタの最大容量を超える場合は、サーバーレスまたは専用プランに[アップグレード](./select-zilliz-cloud-service-plans#select-a-cluster-plan)して新しいクラスタを作成し、そこに[データを移行](./undefined)してください。クラスタの容量の詳細については、「[適切なCUを選択](./cu-types-explained)」を参照してください。

### 「クォータ超過\[理由=ディスククォータ超過、より多くのリソースを割り当ててください」というエラーが表示された場合、どうすればよいですか?{#what-can-i-do-if-i-receive-the-error-quota-exceededreasondisk-quota-exceeded-please-allocate-more-resources}

データを挿入または挿入すると、データがクラスターのCU容量を超えるため、このエラーが表示されます。空きクラスターは、100万個の768次元ベクトルを処理できます。専用クラスターの容量は、[CUタイプとCU体格](./cu-types-explained#assess-capacity)によって異なります。

この問題に対処するには、以下の手順に従ってください。

- 無料クラスタを使用している場合は、サーバーレスまたは専用プランにアップグレードしてください。

- 専用クラスタを使用している場合は、CU体格を上げて[クラスタをスケールアップ](./scale-cluster#scale-up-a-cluster)してください。

### 専用クラスターが作成された後にCUタイプを変更できますか?{#can-i-change-the-cu-type-after-my-dedicated-cluster-is-created}

はい。CUタイプを変更するには、以下の手順に従う必要があります。

1. 希望のCUタイプで新しいクラスタを作成します。[計算機](https://zilliz.com/pricing#calculator)を使用して、この新しいクラスタのCU体格を決定します。

1. 現在のクラスタから作成したばかりの新しいクラスタにデータを移行します。または、クラスタ間のデータ移行を処理するために[お問い合わせ](https://support.zilliz.com/hc/en-us)いただくこともできます。お問い合わせの際は、ソースクラスタとターゲットクラスタを指定してください。

### クラスターの作成後にクラウドリージョンを変更できますか?{#can-i-change-the-cloud-region-of-my-cluster-after-it-is-created}

はい。クラスターのクラウドリージョンを変更するには、以下の手順に従う必要があります。

1. 希望のクラウドリージョンで新しいクラスタを作成します。[計算機](https://zilliz.com/pricing#calculator)を使用して、この新しいクラスタのCU体格を決定します。

1. 現在のクラスタから作成したばかりの新しいクラスタにデータを移行します。または、クラスタ間のデータ移行を処理するために[お問い合わせ](https://support.zilliz.com/hc/en-us)いただくこともできます。お問い合わせの際は、ソースクラスタとターゲットクラスタを指定してください。

### クラスターCUの体格を縮小するにはどうすればよいですか?{#how-can-i-scale-down-my-cluster-cu-size}

はい。クラスタのCUサイズを縮小するには、**サマリー**セクションに移動し、[Zilliz Cloudコンソール](https://cloud.zilliz.com/signup)のCUサイズの横にある**スケール**をクリックします。これにより、CU**サイズ**を増減できるスケーリングページが開きます。クラスタを縮小する前に、CUサイズがデータ量とワークロード容量に対応していることを確認してください。

詳細については、「[スケールクラスタ](./scale-cluster)」を参照してください。

### AWSに無料クラスタをデプロイできますか?{#can-i-deploy-a-free-cluster-on-aws}

いいえ。現在、Zilliz CloudはGCP上での無料クラスタのデプロイのみをサポートしています。AWS上でクラスタをデプロイする場合は、専用（スタンダード）または専用（エンタープライズ）プランを選択してください。

### 無料プランのクラスターはカスタマイズされたスキーマをサポートしていますか?{#do-clusters-in-the-free-plan-support-customized-schema}

いいえ。無料のクラスターはカスタマイズされたスキーマをサポートしていません。ただし、動的スキーマはデフォルメ可能です。つまり、事前に定義されていないフィールドを持つデータを常に挿入できます。動的スキーマの詳細については、「[ダイナミックフィールド](./enable-dynamic-field)」を参照してください。

### Zilliz Cloudに接続しようとすると、接続タイムアウトエラーが発生します。どうすれば対処できますか?{#how-can-i-deal-with-a-connection-timeout-error-when-i-attempt-to-connect-to-zilliz-cloud}

Zilliz Cloudクラスタへの接続を確立するには、関連するパラメータをいくつか提供する必要があります。例えば、PyMilvus SDKのconnectメソッドは以下のように使用できます。

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

接続タイムアウトエラーは、次のシナリオで発生する可能性があります。

- 不良なネットワーク状態

    ネットワークの状態が悪い場合は、接続操作のタイムアウト時間を長くすることをお勧めします。上記のコードでは、`タイムアウト`は`30`秒に設定されているため、リクエストが送信されてから30秒以内に応答がない場合、接続操作はタイムアウトします。

- 不正な接続パラメータ

    Zilliz CloudクラスターにはTLSが有効になっているため、クラスターに正常に接続するには、上記の例に示すように、接続パラメータに`security`を含め、`true`に設定してください。そうしないと、接続に失敗し、タイムアウトエラープロンプトが表示される可能性があります。

- ホワイトリストに登録されていないローカルIPアドレス

    クラスターに接続しようとしている場合は、VPN/プロキシ接続をオフにし、パブリックIPアドレスを取得し(プライベートIPアドレスは機能しません)、接続したいクラスターのホワイトリストにそのIPアドレスを追加する必要があります。

### クラスターが作成された後にクラスターに接続できないのはなぜですか?{#why-cant-i-connect-to-the-cluster-after-the-cluster-is-created}

次の手順に従って問題を特定できます:

1. クラスタのステータスがRUNNINGであるかどうかを確認します。クラスタが作成中、削除中、またはIPホワイトリストが更新中の場合は、クラスタに接続できません。

1. 接続のIPアドレスがIPホワイトリストに含まれているかどうかを確認してください。

1. ポートの接続をテストするには、**telnet in 01-(uuid).(region).vectordb.zillizcloud.com 19530**を実行します。上記の手順をすべて試しても問題が解決しない場合は、[リクエストを送信](https://support.zilliz.com/hc/en-us)してください。

### Node. js SDKでZilliz Cloudに接続できない場合、どうすればいいですか?{#what-can-i-do-if-i-cannot-connect-to-zilliz-cloud-with-nodejs-sdk}

Node. js SDKを使用してZilliz Cloudに接続できない場合は、以下の手順をお試しください。

1. 最新バージョンの[Node. js SDK](https://github.com/milvus-io/milvus-sdk-node)をインストールしてください。

1. クライアントを正しく初期化してください。

```javascript
const client = new MilvusClient('https://your-db-address-with-port', true, 'your-db-user', 'your-db-pasword');
```

### 非アクティブなクラスターはどうなりますか?{#what-happens-to-my-inactive-clusters}

無料のクラスターは、7日間の非アクティブ状態の後、通知により自動的に一時停止されます。必要に応じていつでもクラスターを再開できます。ただし、長期間の非アクティブ状態により、専用クラスターは自動的に一時停止されません。コストを節約するために、専用クラスターを手動で一時停止することをお勧めします。

### クラスタをサスペンドした場合、料金は発生しますか?{#will-i-be-charged-if-i-suspend-my-cluster}

クラスタがサスペンドされると、コンピューティングではなくストレージに対してのみ課金されます。ストレージコストの詳細については、[価格](https://zilliz.com/pricing)を参照してください。
