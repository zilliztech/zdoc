---
title: "プライベートサービス接続の設定（GCP） | Cloud"
slug: /setup-a-private-link-gcp
sidebar_label: "プライベートサービス接続の設定（GCP）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスタから異なるGCP VPCでホストされているサービスへのプライベートリンクを設定する手順を説明します。 | Cloud"
type: origin
token: IojuwADAwiRK0hkl4pgcvC2QnQd
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - private link
  - privatelink
  - private endpoint
  - private service connect
  - aws
  - gcp
  - azure
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


# プライベートサービス接続の設定（GCP）

このガイドでは、Zilliz Cloudクラスタから異なるGCP VPCでホストされているサービスへのプライベートリンクを設定する手順を説明します。

<Admonition type="info" icon="📘" title="注釈">

<p>この機能は<strong>専用</strong>クラスタでのみ利用可能です。</p>

</Admonition>

プライベートリンクはプロジェクトレベルで設定され、同じプロジェクト内の同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスタに対して有効です。

<Admonition type="info" icon="📘" title="注釈">

<p>Zilliz Cloudはプライベートリンクの利用料を請求しません。ただし、クラウドプロバイダーは、Zilliz Cloudにアクセスするために作成した各エンドポイントに対して<a href="https://cloud.google.com/vpc/pricing#psc-forwarding-rule-service">料金を請求する</a>場合があります。</p>

</Admonition>

## 開始する前に\{#before-you-start}

以下の条件が満たされていることを確認してください：

- サービスとZilliz Cloudクラスタが異なるリージョンにあり、サービスがプライベートサービス接続エンドポイント経由でクラスタにアクセスしたい場合、エンドポイントを作成する際にグローバルアクセスを有効にする必要があります。

## プライベートエンドポイントの作成\{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供します。対象のプロジェクトに移動し、左側のナビゲーションで**ネットワーク > プライベートエンドポイント**をクリックし、**+ プライベートエンドポイント**をクリックします。

![Yz5Cb5PMooxAIExRkEvcoBr9noc](/img/Yz5Cb5PMooxAIExRkEvcoBr9noc.png)

### クラウドプロバイダーとリージョンを選択\{#select-a-cloud-provider-and-region}

GCPリージョンにデプロイされたクラスタのプライベートエンドポイントを作成するには、**クラウドプロバイダー**ドロップダウンリストから**GCP**を選択します。**リージョン**で、プライベートアクセスしたいクラスタがあるリージョンを選択し、**次へ**をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions)を参照してください。

![F8jBbJcdnoqMBBxMQZZcJfvKnny](/img/F8jBbJcdnoqMBBxMQZZcJfvKnny.png)

### エンドポイントを作成\{#create-an-endpoint}

エンドポイントは、Google Cloudダッシュボード（**UIコンソール経由**）またはgCloud CLI（**CLI経由**）のいずれかで作成できます。以下の手順に従う前に、すでにVPCを作成し、そのVPC内でZilliz Cloudに接続する必要があるサービスを実行していることを確認してください。

#### UIコンソール経由\{#via-ui-console}

![CicmbETm0oALKkxGh3Xc2wz0nVa](/img/CicmbETm0oALKkxGh3Xc2wz0nVa.png)

Zilliz Cloudコンソールで**コピーして移動**をクリックしてGCPでプライベートサービス接続リストを開き、以下の手順に従ってエンドポイントを作成します：

1. 開く[プライベートサービス接続](https://console.cloud.google.com/net-services/psc)ページで、**+ エンドポイントを接続**をクリックします。

1. **ターゲット**で、**公開サービス**を選択します。

1. **ターゲットサービス**で、Zilliz Cloudコンソールからコピーしたものを貼り付けます。

1. **エンドポイント名**で、エンドポイントに使用する名前を入力します。

1. エンドポイントの**ネットワーク**を選択します。Zilliz Cloudクラスタに接続する必要があるサービスは、指定されたVPC内で実行されている必要があります。

1. エンドポイントの**サブネットワーク**を選択します。

1. エンドポイントの**IPアドレス**を選択するか、新しいものを作成します。

1. サービスと対象のZilliz Cloudクラスタが異なるリージョンにあり、サービスがプライベートサービス接続エンドポイント経由でクラスタにアクセスしたい場合、エンドポイントの**グローバルアクセスを有効にする**を選択します。

1. ドロップダウンリストから**名前空間**を選択するか、新しい名前空間を作成します。

1. **エンドポイントを追加**をクリックします。

1. エンドポイント名をコピーし、Zilliz Cloudコンソールに戻ります。

#### CLI経由\{#via-cli}

![OurbbN4HdodjSNx9ph2cWTwWnIc](/img/OurbbN4HdodjSNx9ph2cWTwWnIc.png)

1. **CLI経由**タブに切り替えます。

1. **プロジェクトID**を入力します。

    Google CloudプロジェクトIDを取得するには、

    1. [Google Cloudダッシュボード](https://console.cloud.google.com/home/dashboard)を開きます。

    1. 目的のプロジェクトIDを見つけ、そのIDをコピーします。

    1. Zilliz CloudのGoogle CloudプロジェクトIDにこのIDを入力します。

1. **VPC名**を入力します。

    VPCエンドポイントを作成する前に、GCPコンソールにVPCが必要です。VPCを表示するには、以下のようにします：

    1. [Google Cloud VPCダッシュボード](https://console.cloud.google.com/networking/networks/list)を開きます。

    1. ナビゲーションペインで**VPCネットワーク**を選択します。

    1. 目的のVPCを見つけ、その名前をコピーします。

    1. Zilliz Cloudの**VPC名**にこの名前を入力します。

    VPCネットワークを作成するには、[VPCネットワークの作成と管理](https://cloud.google.com/vpc/docs/create-modify-vpc-networks)を参照してください。

1. **サブネット名**を入力します。

    サブネットはVPCの分割です。作成するプライベートリンクと同じリージョンにあるサブネットが必要です。サブネットを表示するには、以下のようにします：

    1. [VPCネットワークリスト](https://console.cloud.google.com/networking/networks/list)を開きます。

    1. ナビゲーションペインで**VPCネットワーク**を選択します。

    1. 目的のVPCの名前をクリックします。

    1. 目的のサブネットを見つけ、その名前をコピーします。

    1. Zilliz Cloudの**サブネット名**にこの名前を入力します。

1. **プライベートサービス接続エンドポイントプレフィックス**を入力します。

    利便性のため、**プライベートサービス接続エンドポイントプレフィックス**でエンドポイントプレフィックスを設定する必要があります。これにより、作成する転送ルールはすべてこのプレフィックスを持つことになります。

1. コードブロックス内のコピーアイコンをクリックし、Google Cloudコンソールに移動します。

    上部ナビゲーションでGoogle Cloud Cloud Shellを起動します。Cloud ShellでZilliz CloudからコピーしたCLIコマンドを実行します。

    ![vpc_networks_gcp](/img/vpc_networks_gcp.png)

    エンドポイントが作成されたら、[Google Cloudプライベートサービス接続ページ](https://console.cloud.google.com/net-services/psc/list/consumers)に移動し、作成したエンドポイントの名前をコピーします。

### エンドポイントを承認\{#authorize-your-endpoint}

Google Cloudコンソールから取得したエンドポイントIDとプロジェクトIDを、Zilliz Cloudの**エンドポイントID**と**プロジェクトID**ボックスにそれぞれ貼り付け、**作成**をクリックします。

![VOy4blyfmoi7RLxO0GWcXmzDnFe](/img/VOy4blyfmoi7RLxO0GWcXmzDnFe.png)

## プライベートリンクを取得\{#obtain-a-private-link}

提出した上記の属性を検証および承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。このプロセスには約5分かかります。

プライベートリンクが準備できると、Zilliz Cloudの**プライベートリンク**ページで確認できます。

## ファイアウォールルールとDNSレコードを設定\{#set-up-firewall-rules-and-a-dns-record}

Zilliz Cloudが割り当てたプライベートリンク経由でクラスタにアクセスする前に、プライベートリンクをVPCエンドポイントのDNS名に解決するために、DNSゾーンにCNAMEレコードを作成する必要があります。

### ファイアウォールルールを作成\{#create-firewall-rules}

管理対象クラスタへのプライベートアクセスを許可するには、適切なファイアウォールルールを追加します。以下のスニペットは、TCPポート22を介したトラフィックを許可する方法を示しています。**VPC_NAME**をVPCの名前に設定する必要があることに注意してください。

```bash
VPC_NAME={{vpc-name}};

gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
```

### Cloud DNSを使用してホストゾーンを作成\{#create-a-hosted-zone-using-cloud-dns}

GCPコンソールで[Cloud DNS](https://console.cloud.google.com/net-services/dns/zones)に移動し、DNSゾーンを作成します。

![V0XRbvlgLoHRPexZSzEcFB5rn17](/img/V0XRbvlgLoHRPexZSzEcFB5rn17.png)

1. **ゾーンタイプ**で**プライベート**を選択します。

1. **ゾーン名**を`zilliz-privatelink-zone`または適切な他の値に設定します。

1. **DNS名**をステップ7で取得したプライベートリンクに設定します。

    有効なDNS名は`in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com`のようになります。

1. **ネットワーク**で適切なVPCネットワークを選択します。

1. **作成**をクリックします。

### ホストゾーンにレコードを作成\{#create-a-record-in-the-hosted-zone}

1. 上記で作成したゾーンで、**レコードセット**タブの**標準を追加**をクリックします。

1. **レコードセットの作成**ページで、デフォルト設定で**A**レコードを作成します。

    ![Zys4bZxploNNTex5h2OcGGwnnYd](/img/Zys4bZxploNNTex5h2OcGGwnnYd.png)

1. **IPv4アドレス**で**IPアドレスを選択**をクリックし、エンドポイントのIPアドレスを選択します。

    ![Uh1sbVdLSok8N6xyRMhcildDn7f](/img/Uh1sbVdLSok8N6xyRMhcildDn7f.png)

1. **作成**をクリックします。

## クラスタへのインターネットアクセスを管理\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、クラスタのパブリックエンドポイントを無効にして、プロジェクトへのインターネットアクセスを制限することを選択できます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してのみクラスタに接続できます。

パブリックエンドポイントを無効にするには：

1. 対象クラスタの**クラスタ詳細**ページに移動します。

1. **接続**セクションに移動します。

1. クラスタのパブリックエンドポイントの隣にある設定アイコンをクリックします。

1. 情報を読み、**パブリックエンドポイントの無効化**ダイアログボックスで**無効化**をクリックします。

<Admonition type="info" icon="📘" title="注釈">

<ul>
<li><p>プライベートエンドポイントは<a href="/reference/restful/data-plane-v2">データプレーン</a>アクセスにのみ影響します。<a href="/reference/restful/control-plane-v2">コントロールプレーン</a>は引き続き公開インターネット経由でアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、パブリックエンドポイントにアクセスできるようになるまで、ローカルDNSキャッシュの有効期限が切れるのを待つ必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/disable_public_endpoint.png)

## FAQ\{#faq}

### GCPでプライベートリンクをpingすると、なぜ常に`Name or service not known`と報告されるのですか？\{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

[ファイアウォールルールとDNSレコードを設定](./setup-a-private-link-gcp#set-up-firewall-rules-and-a-dns-record)を参照してDNS設定を確認してください。

- 設定が正しい場合、プライベートリンクをpingすると、以下のように表示されます

    ![private_link_gcp_ts_01](/img/private_link_gcp_ts_01.png)

- 設定が正しくない場合、プライベートリンクをpingすると、以下のように表示される場合があります

    ![private_link_gcp_ts_02](/img/private_link_gcp_ts_02.png)

### 既存のクラスタにプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成すると、同じリージョンとプロジェクトに存在するすべての既存および将来の専用（エンタープライズ）クラスタに有効になります。必要なのは、異なるクラスタに異なるDNSレコードを追加することだけです。