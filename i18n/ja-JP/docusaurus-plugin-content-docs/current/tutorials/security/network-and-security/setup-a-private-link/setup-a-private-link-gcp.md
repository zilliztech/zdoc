---
title: "Private Service Connect (GCP) の設定 | Cloud"
slug: /setup-a-private-link-gcp
sidebar_key: setup-a-private-link-gcp
sidebar_label: "Private Service Connect (GCP) の設定"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud クラスターから異なる GCP VPC でホストされているサービスへのプライベートリンクを設定する手順を示します。| Cloud"
type: origin
token: IojuwADAwiRK0hkl4pgcvC2QnQd
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - プライベートリンク
  - privatelink
  - プライベートエンドポイント
  - private service connect
  - aws
  - gcp
  - azure

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プライベート Service Connect の設定 (GCP)

このガイドでは、Zilliz Cloud クラスターから異なる GCP VPC でホストされているサービスへプライベートリンクを設定する手順を示します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は<strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

プライベートリンクはプロジェクトレベルで設定され、このプロジェクト下の同じクラウドプロバイダーおよびリージョンにデプロイされたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud はプライベートリンクに対して料金を請求しません。ただし、クラウドプロバイダーは Zilliz Cloud にアクセスするために作成する<a href="https://cloud.google.com/vpc/pricing#psc-forwarding-rule-service">各エンドポイントに対して料金</a>を請求する場合があります。</p>

</Admonition>

## 始める前に\{#before-you-start}

以下の条件が満たされていることを確認してください：

- サービスと Zilliz Cloud クラスターが異なるリージョンにあり、プライベート Service Connect エンドポイントを介してサービスからクラスターにアクセスしたい場合、エンドポイントの作成時にグローバルアクセスを有効にする必要があります。

## プライベートエンドポイントの作成\{#create-private-endpoint}

Zilliz Cloud は、プライベートエンドポイントを追加するための直感的な Web コンソールを提供しています。対象のプロジェクトに移動し、左側のナビゲーションで**ネットワーク > プライベートエンドポイント**をクリックします。**+ プライベートエンドポイント**をクリックします。

![Yz5Cb5PMooxAIExRkEvcoBr9noc](https://zdoc-images.s3.us-west-2.amazonaws.com/yz5cb5pmooxaiexrkevcobr9noc.png "Yz5Cb5PMooxAIExRkEvcoBr9noc")

### クラウドプロバイダーとリージョンの選択\{#select-a-cloud-provider-and-region}

GCP リージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、**クラウドプロバイダー**ドロップダウンリストから**GCP**を選択します。**リージョン**で、 privately アクセスしたいクラスターが存在するリージョンを選択します。**次へ**をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。

![F8jBbJcdnoqMBBxMQZZcJfvKnny](https://zdoc-images.s3.us-west-2.amazonaws.com/f8jbbjcdnoqmbbxmqzzcjfvknny.png "F8jBbJcdnoqMBBxMQZZcJfvKnny")

### エンドポイントの作成\{#create-an-endpoint}

エンドポイントは、Google Cloud Dashboard（**UI コンソール経由**）または gCloud CLI（**CLI 経由**）のいずれかで作成できます。以下の手順に従う前に、すでに VPC が作成されており、Zilliz Cloud に接続する必要のあるサービスがその VPC 内で実行されていることを確認してください。

#### UI コンソール経由\{#via-ui-console}

![CicmbETm0oALKkxGh3Xc2wz0nVa](https://zdoc-images.s3.us-west-2.amazonaws.com/cicmbetm0oalkkxgh3xc2wz0nva.png "CicmbETm0oALKkxGh3Xc2wz0nVa")

Zilliz Cloud コンソールで**コピーして移動**をクリックして GCP の プライベート Service Connect リストを開き、以下の手順に従ってエンドポイントを作成します：

<Procedures>

1. 開いた [プライベート Service Connect](https://console.cloud.google.com/net-services/psc) ページで、**+ エンドポイントに接続**をクリックします。

1. **ターゲット**として、**公開済みサービス**を選択します。

1. **ターゲットサービス**に、Zilliz Cloud コンソールからコピーした値を貼り付けます。

1. **エンドポイント名**に、エンドポイントに使用する名前を入力します。

1. エンドポイント用の**ネットワーク**を選択します。Zilliz Cloud クラスターに接続する必要のあるサービスは、指定された VPC 内で実行されている必要があります。

1. エンドポイント用の**サブネットワーク**を選択します。

1. エンドポイント用の**IP アドレス**を選択するか、新しいものを作成します。

1. サービスと対象の Zilliz Cloud クラスターが異なるリージョンにあり、プライベート Service Connect エンドポイントを介してサービスからクラスターにアクセスしたい場合は、エンドポイントに対して**グローバルアクセスを有効にする**を選択します。

1. ドロップダウンリストから**ネームスペース**を選択するか、新しいネームスペースを作成します。

1. **エンドポイントの追加**をクリックします。

1. エンドポイント名をコピーして、Zilliz Cloud コンソールに戻ります。

</Procedures>

#### CLI 経由\{#via-cli}

![OurbbN4HdodjSNx9ph2cWTwWnIc](https://zdoc-images.s3.us-west-2.amazonaws.com/ourbbn4hdodjsnx9ph2cwtwwnic.png "OurbbN4HdodjSNx9ph2cWTwWnIc")

<Procedures>

1. **CLI 経由**タブに切り替えます。

1. **プロジェクト ID**を入力します。

    Google Cloud プロジェクト ID を取得するには、

    1. [Google Cloud Dashboard](https://console.cloud.google.com/home/dashboard) を開きます。

    1. 希望するプロジェクト ID を見つけて、その ID をコピーします。

    1. この ID を Zilliz Cloud の Google Cloud プロジェクト ID に入力します。

1. **VPC 名**を入力します。

    VPC エンドポイントを作成する前に、GCP コンソール上に VPC が存在している必要があります。VPC を表示するには、次のようにします：

    1. [Google Cloud VPC Dashboard](https://console.cloud.google.com/networking/networks/list) を開きます。

    1. ナビゲーションペインで、**VPC ネットワーク**を選択します。

    1. 希望する VPC を見つけて、その名前をコピーします。

    1. この名前を Zilliz Cloud の**VPC 名**に入力します。

    VPC ネットワークの作成については、[VPC ネットワークの作成と管理](https://cloud.google.com/vpc/docs/create-modify-vpc-networks) を参照してください。

1. **サブネット名**を入力します。

    サブネットは VPC の細分化された部分です。作成するプライベートリンクと同じリージョンに存在するサブネットが必要です。サブネットを表示するには、次のようにします：

    1. [VPC ネットワークリスト](https://console.cloud.google.com/networking/networks/list) を開きます。

    1. ナビゲーションペインで、**VPC ネットワーク**を選択します。

    1. 希望する VPC の名前をクリックします。

    1. 希望するサブネットを見つけて、その名前をコピーします。

    1. この名前を Zilliz Cloud の**サブネット名**に入力します。

1. **プライベート Service Connect エンドポイントプレフィックス**を入力します。

    利便性のため、作成するすべての転送ルールにこのプレフィックスが付与されるように、**プライベート Service Connect エンドポイントプレフィックス**にエンドポイントプレフィックスを設定する必要があります。

1. コードブロック内のコピーアイコンをクリックし、Google Cloud Console に移動します。

    上部のナビゲーションで、Google Cloud Cloud Shell を起動します。Zilliz Cloud からコピーした CLI コマンドを Cloud Shell で実行します。

    ![vpc_networks_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/vpc_networks_gcp.png "vpc_networks_gcp")

    エンドポイントが作成されたら、[Google Cloud プライベート Service Connect ページ](https://console.cloud.google.com/net-services/psc/list/consumers) に移動し、刚才作成したエンドポイントの名前をコピーします。

</Procedures>

### エンドポイントの承認\{#authorize-your-endpoint}

Google Cloud コンソールから取得したエンドポイント ID とプロジェクト ID を、それぞれ Zilliz Cloud の**エンドポイント ID**および**プロジェクト ID**ボックスに貼り付けます。**作成**をクリックします。

![VOy4blyfmoi7RLxO0GWcXmzDnFe](https://zdoc-images.s3.us-west-2.amazonaws.com/voy4blyfmoi7rlxo0gwcxmzdnfe.png "VOy4blyfmoi7RLxO0GWcXmzDnFe")

## プライベートリンクの取得\{#obtain-a-private-link}

送信した前述の属性を確認して承認すると、Zilliz Cloud はこのエンドポイント用にプライベートリンクを割り当てます。このプロセスには約 5 分かかります。

プライベートリンクの準備が整うと、Zilliz Cloud の**プライベートリンク**ページで表示できます。

## ファイアウォールルールと DNS レコードの設定\{#set-up-firewall-rules-and-a-dns-record}

Zilliz Cloud によって割り当てられたプライベートリンクを介してクラスターにアクセスする前に、DNS ゾーン内に CNAME レコードを作成して、プライベートリンクを VPC エンドポイントの DNS 名に解決する必要があります。

### ファイアウォールルールの作成\{#create-firewall-rules}

マネージドクラスターへのプライベートアクセスを許可するには、適切なファイアウォールルールを追加します。以下のスニペットは、TCP ポート 22 経由のトラフィックを許可する方法を示しています。**VPC_NAME**をあなたの VPC の名前に設定する必要があることに注意してください。

```bash
VPC_NAME={{vpc-name}};

gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
```

### Cloud DNS を使用してホストゾーンを作成する\{#create-a-hosted-zone-using-cloud-dns}

GCP コンソールの [Cloud DNS](https://console.cloud.google.com/net-services/dns/zones) に移動し、DNS ゾーンを作成します。

![V0XRbvlgLoHRPexZSzEcFB5rn17](https://zdoc-images.s3.us-west-2.amazonaws.com/v0xrbvlglohrpexzszecfb5rn17.png "V0XRbvlgLoHRPexZSzEcFB5rn17")

<Procedures>

1. **ゾーンタイプ**で**プライベート**を選択します。

1. **ゾーン名**を `zilliz-privatelink-zone` または適切と思われる他の値に設定します。

1. **DNS 名**をステップ 7 で取得したプライベートリンクに設定します。

    有効な DNS 名の例：`in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com`

1. **ネットワーク**で適切な VPC ネットワークを選択します。

1. **作成**をクリックします。

</Procedures>

### ホストゾーン内にレコードを作成する\{#create-a-record-in-the-hosted-zone}

<Procedures>

1. 上記で作成したゾーン内で、**レコードセット**タブの**標準を追加**をクリックします。

1. **レコードセットの作成**ページで、デフォルト設定を使用して**A**レコードを作成します。

    ![Zys4bZxploNNTex5h2OcGGwnnYd](https://zdoc-images.s3.us-west-2.amazonaws.com/zys4bzxplonntex5h2ocggwnnyd.png "Zys4bZxploNNTex5h2OcGGwnnYd")

1. **IPv4 アドレス**内の**IP アドレスの選択**をクリックし、エンドポイントの IP アドレスを選択します。

    ![Uh1sbVdLSok8N6xyRMhcildDn7f](https://zdoc-images.s3.us-west-2.amazonaws.com/uh1sbvdlsok8n6xyrmhcilddn7f.png "Uh1sbVdLSok8N6xyRMhcildDn7f")

1. **作成**をクリックします。

</Procedures>

## クラスターへのインターネットアクセスを管理する\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを構成した後、プロジェクトへのインターネットアクセスを制限するためにクラスターのパブリックエンドポイントを無効化することを選択できます。パブリックエンドポイントを無効化すると、ユーザーはプライベートリンクのみを使用してクラスターに接続できるようになります。

パブリックエンドポイントを無効化するには：

<Procedures>

1. 対象のクラスターの**クラスターの詳細**ページに移動します。

1. **接続**セクションに移動します。

1. クラスターのパブリックエンドポイントの横にある設定アイコンをクリックします。

1. 情報を読み、**パブリックエンドポイントを無効化**ダイアログボックスで**無効化**をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>プライベートエンドポイントは<a href="/reference/restful/data-plane-v2">データプレーン</a>アクセスのみに影響します。<a href="/reference/restful/control-plane-v2">コントロールプレーン</a>は引き続き公衆インターネット経由でアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効化した後、パブリックエンドポイントにアクセスできるようになるまで、ローカルの DNS キャッシュが期限切れになるまで待つ必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disable_public_endpoint.png "disable_public_endpoint")

## FAQ\{#faq}

### GCP でプライベートリンクを ping すると、常に `Name or service not known` と報告されるのはなぜですか？\{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

[ファイアウォールルールと DNS レコードの設定](./setup-a-private-link-gcp#set-up-firewall-rules-and-a-dns-record) を参照して、DNS 設定を確認してください。

- 設定が正しい場合、プライベートリンクを ping すると次のように表示されます。

    ![private_link_gcp_ts_01](https://zdoc-images.s3.us-west-2.amazonaws.com/private_link_gcp_ts_01.png "private_link_gcp_ts_01")

- 設定が正しくない場合、プライベートリンクを ping すると次のように表示される可能性があります。

    ![private_link_gcp_ts_02](https://zdoc-images.s3.us-west-2.amazonaws.com/private_link_gcp_ts_02.png "private_link_gcp_ts_02")

### 既存のクラスターに対してプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成すると、同じリージョンおよびプロジェクトに存在するすべての既存および将来の Dedicated (Enterprise) クラスターに効果が及びます。必要なのは、異なるクラスターに対して異なる DNS レコードを追加することだけです。