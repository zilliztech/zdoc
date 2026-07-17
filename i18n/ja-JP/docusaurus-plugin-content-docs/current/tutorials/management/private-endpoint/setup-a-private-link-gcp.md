---
title: "Private Service Connect（GCP）を設定する | Cloud"
slug: /setup-a-private-link-gcp
sidebar_label: "Private Service Connect（GCP）を設定する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud クラスターから、異なる GCP VPC でホストされているサービスへのプライベートリンクを設定する手順を説明します。 | Cloud"
type: origin
token: IojuwADAwiRK0hkl4pgcvC2QnQd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Private Service Connect（GCP）を設定する

このガイドでは、Zilliz Cloud クラスターから、異なる GCP VPC でホストされているサービスへのプライベートリンクを設定する手順を説明します。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクト配下で同じクラウドプロバイダーとリージョンにデプロイされているすべての **Dedicated** サービングクラスターと **on-demand** クラスターに対して有効になります。

<Admonition type="info" icon="📘" title="Note">

プロジェクトごとに最大 10 個のプライベートエンドポイントを作成できます。

</Admonition>

Zilliz Cloud はプライベートエンドポイントの作成および使用に対して課金しません。ただし、Zilliz Cloud にアクセスするために作成した各エンドポイントについては、クラウドプロバイダーが[課金する](https://aws.amazon.com/privatelink/pricing/)場合があります。

## 開始前に\{#before-you-start}

以下の条件を満たしていることを確認してください。

- サービスと Zilliz Cloud クラスターが異なるリージョンにあり、そのサービスから Private Service Connect エンドポイント経由でクラスターにアクセスしたい場合は、エンドポイント作成時にグローバルアクセスを有効にする必要があります。

## プライベートエンドポイントを作成する\{#create-private-endpoint}

Zilliz Cloud には、プライベートエンドポイントを追加するための直感的な Web コンソールが用意されています。対象のプロジェクトに移動し、左側のナビゲーションで **Network > Private Endpoint** をクリックします。**+ Private Endpoint** をクリックします。

![Yz5Cb5PMooxAIExRkEvcoBr9noc](https://zdoc-images.s3.us-west-2.amazonaws.com/yz5cb5pmooxaiexrkevcobr9noc.png "Yz5Cb5PMooxAIExRkEvcoBr9noc")

### クラウドプロバイダーとリージョンを選択する\{#select-a-cloud-provider-and-region}

GCP リージョンにデプロイされたクラスター用のプライベートエンドポイントを作成するには、**Cloud Provider** のドロップダウンリストから **GCP** を選択します。**Region** では、プライベートにアクセスしたいクラスターが配置されているリージョンを選択します。**Next** をクリックします。 

利用可能なクラウドプロバイダーとリージョンの詳細については、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 

![F8jBbJcdnoqMBBxMQZZcJfvKnny](https://zdoc-images.s3.us-west-2.amazonaws.com/f8jbbjcdnoqmbbxmqzzcjfvknny.png "F8jBbJcdnoqMBBxMQZZcJfvKnny")

### エンドポイントを作成する\{#create-an-endpoint}

エンドポイントは、Google Cloud Dashboard（**via UI Console**）または gCloud CLI（**via CLI**）のいずれかを使用して作成できます。以下の手順を進める前に、VPC を作成済みであり、その VPC 内で Zilliz Cloud に接続する必要があるサービスが実行されていることを確認してください。

#### UI コンソール経由\{#via-ui-console}

![CicmbETm0oALKkxGh3Xc2wz0nVa](https://zdoc-images.s3.us-west-2.amazonaws.com/cicmbetm0oalkkxgh3xc2wz0nva.png "CicmbETm0oALKkxGh3Xc2wz0nVa")

Zilliz Cloud コンソールで **Copy and Go** をクリックして、GCP 上の Private Service Connect リストを開き、以下の手順に従ってエンドポイントを作成します。

<Procedures>

1. 開いた [Private Service Connect](https://console.cloud.google.com/net-services/psc) ページで、**+ Connect endpoint** をクリックします。

1. **Target** では、**Published service** を選択します。

1. **Target Service** に、Zilliz Cloud コンソールからコピーしたものを貼り付けます。

1. **Endpoint name** に、エンドポイントに使用する名前を入力します。

1. エンドポイント用の **Network** を選択します。Zilliz Cloud クラスターに接続する必要があるサービスは、指定した VPC 内で実行されている必要があります。

1. エンドポイント用の **Subnetwork** を選択します。

1. エンドポイント用の **IP address** を選択するか、新しく作成します。

1. サービスと対象の Zilliz Cloud クラスターが異なるリージョンにあり、そのサービスから Private Service Connect エンドポイント経由でクラスターにアクセスしたい場合は、エンドポイントの **Enable global access** を選択します。

1. ドロップダウンリストから **Namespace** を選択するか、新しい名前空間を作成します。

1. **Add endpoint** をクリックします。

1. エンドポイント名をコピーして、Zilliz Cloud コンソールに戻ります。

</Procedures>

#### CLI 経由\{#via-cli}

![OurbbN4HdodjSNx9ph2cWTwWnIc](https://zdoc-images.s3.us-west-2.amazonaws.com/ourbbn4hdodjsnx9ph2cwtwwnic.png "OurbbN4HdodjSNx9ph2cWTwWnIc")

<Procedures>

1. **Via CLI** タブに切り替えます。

1. **Project ID** を入力します。 

    Google Cloud プロジェクト ID を取得するには、次のようにします。

    1. [Google Cloud Dashboard](https://console.cloud.google.com/home/dashboard) を開きます。

    1. 目的の Project ID を見つけて、その ID をコピーします。

    1. この ID を Zilliz Cloud の Google Cloud Project ID に入力します。

1. **VPC Name** を入力します。

    VPC エンドポイントを作成する前に、GCP コンソール上に VPC が存在している必要があります。VPC を確認するには、次のようにします。

    1. [Google Cloud VPC Dashboard](https://console.cloud.google.com/networking/networks/list) を開きます。

    1. ナビゲーションペインで **VPC networks** を選択します。

    1. 目的の VPC を見つけて、その Name をコピーします。

    1. この名前を Zilliz Cloud の **VPC Name** に入力します。

    VPC ネットワークを作成するには、[Create and manage VPC networks](https://cloud.google.com/vpc/docs/create-modify-vpc-networks) を参照してください。

1. **Subnet Name** を入力します。

    サブネットは VPC の下位区分です。作成するプライベートリンクと同じリージョンに存在するサブネットが必要です。サブネットを確認するには、次のようにします。

    1. [VPC network list](https://console.cloud.google.com/networking/networks/list) を開きます。

    1. ナビゲーションペインで **VPC networks** を選択します。

    1. 目的の VPC の名前をクリックします。

    1. 目的のサブネットを見つけて、その名前をコピーします。

    1. この名前を Zilliz Cloud の **Subnet Name** に入力します。

1. **Private Service Connect Endpoint Prefix** を入力します。

    利便性のため、**Private Service Connect Endpoint prefix** にエンドポイントのプレフィックスを設定する必要があります。これにより、作成するすべての転送ルールにこのプレフィックスが付きます。

1. コードブロックのコピーアイコンをクリックして、Google Cloud Console に移動します。

    上部ナビゲーションで Google Cloud Cloud Shell を起動します。Cloud Shell で、Zilliz Cloud からコピーした CLI コマンドを実行します。

    ![vpc_networks_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/vpcnetworksgcp.png "vpc_networks_gcp")

    エンドポイントが作成されたら、[Google Cloud Private Service Connect page](https://console.cloud.google.com/net-services/psc/list/consumers) に移動し、作成したエンドポイントの名前をコピーします。 

</Procedures>

### エンドポイントを認可する\{#authorize-your-endpoint}

Google Cloud コンソールで取得したエンドポイント ID とプロジェクト ID を、それぞれ Zilliz Cloud 上の **Endpoint ID** と **Project ID** のボックスに貼り付けます。**Create** をクリックします。

![VOy4blyfmoi7RLxO0GWcXmzDnFe](https://zdoc-images.s3.us-west-2.amazonaws.com/voy4blyfmoi7rlxo0gwcxmzdnfe.png "VOy4blyfmoi7RLxO0GWcXmzDnFe")

## プライベートリンクを取得する\{#obtain-a-private-link}

送信した上記の属性が検証されて受け入れられると、Zilliz Cloud はこのエンドポイントに対してプライベートリンクを割り当てます。この処理には約 5 分かかります。 

プライベートリンクの準備ができると、Zilliz Cloud の **Private Link** ページで確認できます。

## ファイアウォールルールと DNS レコードを設定する\{#set-up-firewall-rules-and-a-dns-record}

Zilliz Cloud によって割り当てられたプライベートリンク経由でクラスターにアクセスする前に、プライベートリンクを VPC エンドポイントの DNS 名に解決するための CNAME レコードを DNS ゾーンに作成する必要があります。

### ファイアウォールルールを作成する\{#create-firewall-rules}

管理対象クラスターへのプライベートアクセスを許可するには、適切なファイアウォールルールを追加します。以下のスニペットは、TCP ポート 22 経由のトラフィックを許可する方法を示しています。**VPC_NAME** を自分の VPC 名に設定する必要があることに注意してください。

```bash
VPC_NAME={{vpc-name}};

gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
```

### Cloud DNS を使用してホストゾーンを作成する\{#create-a-hosted-zone-using-cloud-dns}

GCP コンソールの [Cloud DNS](https://console.cloud.google.com/net-services/dns/zones) に移動し、DNS ゾーンを作成します。

![V0XRbvlgLoHRPexZSzEcFB5rn17](https://zdoc-images.s3.us-west-2.amazonaws.com/v0xrbvlglohrpexzszecfb5rn17.png "V0XRbvlgLoHRPexZSzEcFB5rn17")

<Procedures>

1. **Zone type** で **Private** を選択します。

1. **Zone name** を `zilliz-privatelink-zone` または適切な他の値に設定します。

1. **DNS name** を手順 7 で取得したプライベートリンクに設定します。

    有効な DNS 名は `in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com` のようになります。

1. **Networks** で適切な VPC ネットワークを選択します。

1. **CREATE** をクリックします。

</Procedures>

### ホストゾーンにレコードを作成する\{#create-a-record-in-the-hosted-zone}

<Procedures>

1. 上で作成したゾーンで、**RECORD SETS** タブの **ADD STANDARD** をクリックします。

1. **Create record set** ページで、デフォルト設定の **A** レコードを作成します。

    ![Zys4bZxploNNTex5h2OcGGwnnYd](https://zdoc-images.s3.us-west-2.amazonaws.com/zys4bzxplonntex5h2ocggwnnyd.png "Zys4bZxploNNTex5h2OcGGwnnYd")

1. **IPv4 Address** の **SELECT IP ADDRESS** をクリックし、エンドポイントの IP アドレスを選択します。

    ![Uh1sbVdLSok8N6xyRMhcildDn7f](https://zdoc-images.s3.us-west-2.amazonaws.com/uh1sbvdlsok8n6xyrmhcilddn7f.png "Uh1sbVdLSok8N6xyRMhcildDn7f")

1. **CREATE** をクリックします。

</Procedures>

## クラスターへのインターネットアクセスを管理する\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを構成した後、プロジェクトへのインターネットアクセスを制限するために、クラスターのパブリックエンドポイントを無効化することを選択できます。パブリックエンドポイントを無効化すると、ユーザーはプライベートリンクを使用してのみクラスターに接続できるようになります。

パブリックエンドポイントを無効化するには、次の手順を実行します。

<Procedures>

1. 対象クラスターの **Cluster Details** ページに移動します。

1. **Connection** セクションに移動します。

1. クラスターのパブリックエンドポイントの横にある構成アイコンをクリックします。

1. 情報を確認し、**Disable Public Endpoint** ダイアログボックスで **Disable** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- プライベートエンドポイントが影響するのは [data plane](/reference/restful/data-plane-v2) アクセスのみです。[control plane](/reference/restful/control-plane-v2) には引き続きパブリックインターネット経由でアクセスできます。

- パブリックエンドポイントを再度有効にした後、パブリックエンドポイントにアクセスできるようになるまで、ローカル DNS キャッシュの期限切れを待つ必要がある場合があります。

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disablepublicendpoint.png "disable_public_endpoint")

## FAQ\{#faq}

### GCP でプライベートリンクに ping すると、なぜ常に `Name or service not known` と表示されるのですか？\{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

[ファイアウォールルールと DNS レコードを設定する](./setup-a-private-link-gcp#set-up-firewall-rules-and-a-dns-record) を参照して、DNS 設定を確認してください。

- 設定が正しい場合、プライベートリンクに ping すると次のように表示されます。

    ![private_link_gcp_ts_01](https://zdoc-images.s3.us-west-2.amazonaws.com/privatelinkgcpts01.png "private_link_gcp_ts_01")

- 設定が正しくない場合、プライベートリンクに ping すると次のように表示されることがあります。

    ![private_link_gcp_ts_02](https://zdoc-images.s3.us-west-2.amazonaws.com/privatelinkgcpts02.png "private_link_gcp_ts_02")

### 既存のクラスターに対してプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成すると、同じリージョンとプロジェクトに存在する既存および今後作成されるすべての Dedicated (Enterprise) クラスターに対して有効になります。必要なのは、異なるクラスターごとに異なる DNS レコードを追加することだけです。
