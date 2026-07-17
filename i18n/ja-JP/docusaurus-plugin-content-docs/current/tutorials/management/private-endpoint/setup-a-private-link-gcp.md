---
title: "Private Service Connect（GCP）の設定 | Cloud"
slug: /setup-a-private-link-gcp
sidebar_label: "Private Service Connect（GCP）の設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud cluster から異なる GCP VPC でホストされているサービスへの private link を設定する手順を説明します。 | Cloud"
type: origin
token: IojuwADAwiRK0hkl4pgcvC2QnQd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Private Service Connect（GCP）の設定

このガイドでは、Zilliz Cloud cluster から異なる GCP VPC でホストされているサービスへの private link を設定する手順を説明します。

private link は project レベルで設定され、この project 配下の同じ cloud provider と region にデプロイされたすべての **Dedicated** serving cluster および **on-demand** cluster に対して有効です。

<Admonition type="info" icon="📘" title="Note">

各 project につき最大 10 個の private endpoint を作成できます。

</Admonition>

Zilliz Cloud は private endpoint の作成および使用に対して料金を請求しません。ただし、Zilliz Cloud へアクセスするために作成した各 endpoint に対しては、cloud provider が[料金を請求する](https://aws.amazon.com/privatelink/pricing/)場合があります。

## 始める前に\{#before-you-start}

次の条件を満たしていることを確認してください。

- サービスと Zilliz Cloud cluster が異なる region にあり、そのサービスから Private Service Connect endpoint 経由で cluster にアクセスしたい場合は、endpoint 作成時にその endpoint の global access を有効にする必要があります。

## private endpoint の作成\{#create-private-endpoint}

Zilliz Cloud は、private endpoint を追加するための直感的な web console を提供しています。対象の project に移動し、左側のナビゲーションで **Network > Private Endpoint** をクリックします。**+ Private Endpoint** をクリックします。

![Yz5Cb5PMooxAIExRkEvcoBr9noc](https://zdoc-images.s3.us-west-2.amazonaws.com/yz5cb5pmooxaiexrkevcobr9noc.png "Yz5Cb5PMooxAIExRkEvcoBr9noc")

### cloud provider と region の選択\{#select-a-cloud-provider-and-region}

GCP region にデプロイされた cluster 用の private endpoint を作成するには、**Cloud Provider** ドロップダウンリストから **GCP** を選択します。**Region** では、private にアクセスしたい cluster が配置されている region を選択します。**Next** をクリックします。 

利用可能な cloud provider と region の詳細については、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 

![F8jBbJcdnoqMBBxMQZZcJfvKnny](https://zdoc-images.s3.us-west-2.amazonaws.com/f8jbbjcdnoqmbbxmqzzcjfvknny.png "F8jBbJcdnoqMBBxMQZZcJfvKnny")

### endpoint の作成\{#create-an-endpoint}

endpoint は、Google Cloud Dashboard（**via UI Console**）または gCloud CLI（**via CLI**）のいずれかを使って作成できます。以下の手順に進む前に、すでに VPC を作成し、その VPC 内で Zilliz Cloud に接続する必要があるサービスを実行していることを確認してください。

#### UI console 経由\{#via-ui-console}

![CicmbETm0oALKkxGh3Xc2wz0nVa](https://zdoc-images.s3.us-west-2.amazonaws.com/cicmbetm0oalkkxgh3xc2wz0nva.png "CicmbETm0oALKkxGh3Xc2wz0nVa")

Zilliz Cloud console で **Copy and Go** をクリックして、GCP 上の Private Service Connect リストを開き、以下の手順に従って endpoint を作成します。

<Procedures>

1. 開いた [Private Service Connect](https://console.cloud.google.com/net-services/psc) ページで、**+ Connect endpoint** をクリックします。

1. **Target** では、**Published service** を選択します。

1. **Target Service** に、Zilliz Cloud console からコピーしたものを貼り付けます。

1. **Endpoint name** に、endpoint に使用する名前を入力します。

1. endpoint 用の **Network** を選択します。Zilliz Cloud cluster に接続する必要があるサービスは、指定した VPC 内で実行されている必要があります。

1. endpoint 用の **Subnetwork** を選択します。

1. endpoint 用の **IP address** を選択するか、新しく作成します。

1. サービスと対象の Zilliz Cloud cluster が異なる region にあり、そのサービスから Private Service Connect endpoint 経由で cluster にアクセスしたい場合は、その endpoint に対して **Enable global access** を選択します。

1. ドロップダウンリストから **Namespace** を選択するか、新しい namespace を作成します。

1. **Add endpoint** をクリックします。

1. endpoint 名をコピーして、Zilliz Cloud console に戻ります。

</Procedures>

#### CLI 経由\{#via-cli}

![OurbbN4HdodjSNx9ph2cWTwWnIc](https://zdoc-images.s3.us-west-2.amazonaws.com/ourbbn4hdodjsnx9ph2cwtwwnic.png "OurbbN4HdodjSNx9ph2cWTwWnIc")

<Procedures>

1. **Via CLI** タブに切り替えます。

1. **Project ID** を入力します。 

    Google Cloud project ID を取得するには、

    1. [Google Cloud Dashboard](https://console.cloud.google.com/home/dashboard) を開きます。

    1. 目的の Project ID を見つけて、その ID をコピーします。

    1. この ID を Zilliz Cloud の Google Cloud Project ID に入力します。

1. **VPC Name** を入力します。

    VPC endpoint を作成する前に、GCP console に VPC が存在している必要があります。VPC を確認するには、以下を実行します。

    1. [Google Cloud VPC Dashboard](https://console.cloud.google.com/networking/networks/list) を開きます。

    1. ナビゲーションペインで **VPC networks** を選択します。

    1. 目的の VPC を見つけ、その Name をコピーします。

    1. この名前を Zilliz Cloud の **VPC Name** に入力します。

    VPC network の作成については、[Create and manage VPC networks](https://cloud.google.com/vpc/docs/create-modify-vpc-networks) を参照してください。

1. **Subnet Name** を入力します。

    subnet は VPC のサブディビジョンです。作成する private link と同じ region に存在する subnet が必要です。subnet を確認するには、以下を実行します。

    1. [VPC network list](https://console.cloud.google.com/networking/networks/list) を開きます。

    1. ナビゲーションペインで **VPC networks** を選択します。

    1. 目的の VPC の名前をクリックします。

    1. 目的の subnet を見つけ、その名前をコピーします。

    1. この名前を Zilliz Cloud の **Subnet Name** に入力します。

1. **Private Service Connect Endpoint Prefix** を入力します。

    利便性のため、**Private Service Connect Endpoint prefix** に endpoint prefix を設定する必要があります。これにより、作成するすべての forwarding rule にこの prefix が付与されます。

1. code block のコピーアイコンをクリックし、Google Cloud Console に移動します。

    上部ナビゲーションから Google Cloud Cloud Shell を起動します。Cloud Shell で、Zilliz Cloud からコピーした CLI command を実行します。

    ![vpc_networks_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/vpc_networks_gcp.png "vpc_networks_gcp")

    endpoint が作成されたら、[Google Cloud Private Service Connect page](https://console.cloud.google.com/net-services/psc/list/consumers) に移動し、作成した endpoint の名前をコピーします。 

</Procedures>

### endpoint の認可\{#authorize-your-endpoint}

Google Cloud console から取得した endpoint ID と project ID を、それぞれ Zilliz Cloud 上の **Endpoint ID** と **Project ID** ボックスに貼り付けます。**Create** をクリックします。

![VOy4blyfmoi7RLxO0GWcXmzDnFe](https://zdoc-images.s3.us-west-2.amazonaws.com/voy4blyfmoi7rlxo0gwcxmzdnfe.png "VOy4blyfmoi7RLxO0GWcXmzDnFe")

## private link の取得\{#obtain-a-private-link}

送信した上記の属性が検証および承認されると、Zilliz Cloud はこの endpoint に private link を割り当てます。このプロセスには約 5 分かかります。 

private link の準備ができると、Zilliz Cloud の **Private Link** ページで確認できます。

## firewall rule と DNS record の設定\{#set-up-firewall-rules-and-a-dns-record}

Zilliz Cloud によって割り当てられた private link 経由で cluster にアクセスする前に、private link を VPC endpoint の DNS 名に解決するための CNAME record を DNS zone に作成する必要があります。

### firewall rule の作成\{#create-firewall-rules}

managed cluster への private access を許可するには、適切な firewall rule を追加します。次のスニペットは、TCP port 22 を通過するトラフィックを許可する方法を示しています。**VPC_NAME** は自分の VPC 名に設定する必要があります。

```bash
VPC_NAME={{vpc-name}};

gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
```

### Cloud DNS を使用した hosted zone の作成\{#create-a-hosted-zone-using-cloud-dns}

GCP console の [Cloud DNS](https://console.cloud.google.com/net-services/dns/zones) に移動し、DNS zone を作成します。

![V0XRbvlgLoHRPexZSzEcFB5rn17](https://zdoc-images.s3.us-west-2.amazonaws.com/v0xrbvlglohrpexzszecfb5rn17.png "V0XRbvlgLoHRPexZSzEcFB5rn17")

<Procedures>

1. **Zone type** で **Private** を選択します。

1. **Zone name** を `zilliz-privatelink-zone` または適切な別の値に設定します。

1. **DNS name** を手順 7 で取得した private link に設定します。

    有効な DNS 名の例は `in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com` のような形式です。

1. **Networks** で適切な VPC network を選択します。

1. **CREATE** をクリックします。

</Procedures>

### hosted zone に record を作成\{#create-a-record-in-the-hosted-zone}

<Procedures>

1. 上で作成した zone で、**RECORD SETS** タブの **ADD STANDARD** をクリックします。

1. **Create record set** ページで、デフォルト設定のまま **A** record を作成します。

    ![Zys4bZxploNNTex5h2OcGGwnnYd](https://zdoc-images.s3.us-west-2.amazonaws.com/zys4bzxplonntex5h2ocggwnnyd.png "Zys4bZxploNNTex5h2OcGGwnnYd")

1. **IPv4 Address** の **SELECT IP ADDRESS** をクリックし、自分の endpoint の IP address を選択します。

    ![Uh1sbVdLSok8N6xyRMhcildDn7f](https://zdoc-images.s3.us-west-2.amazonaws.com/uh1sbvdlsok8n6xyrmhcilddn7f.png "Uh1sbVdLSok8N6xyRMhcildDn7f")

1. **CREATE** をクリックします。

</Procedures>

## cluster へのインターネットアクセスの管理\{#manage-internet-access-to-your-clusters}

private endpoint を設定した後、project へのインターネットアクセスを制限するために、cluster の public endpoint を無効化することを選択できます。public endpoint を無効化すると、ユーザーは private link を使用してのみ cluster に接続できるようになります。

public endpoint を無効化するには：

<Procedures>

1. 対象 cluster の **Cluster Details** ページに移動します。

1. **Connection** セクションに移動します。

1. cluster public endpoint の横にある設定アイコンをクリックします。

1. 情報を読み、**Disable Public Endpoint** ダイアログボックスで **Disable** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- private endpoint は [data plane](/reference/restful/data-plane-v2) へのアクセスにのみ影響します。[control plane](/reference/restful/control-plane-v2) には引き続き public internet 経由でアクセスできます。

- public endpoint を再度有効にした後、public endpoint にアクセスできるようになるまで、ローカル DNS cache の有効期限が切れるのを待つ必要がある場合があります。

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disable_public_endpoint.png "disable_public_endpoint")

## FAQ\{#faq}

### GCP で private link に ping すると、なぜ常に `Name or service not known` と表示されるのですか？\{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

[firewall rule と DNS record の設定](./setup-a-private-link-gcp#set-up-firewall-rules-and-a-dns-record)を参照して DNS 設定を確認してください。

- 設定が正しい場合、private link に ping すると次のように表示されるはずです。

    ![private_link_gcp_ts_01](https://zdoc-images.s3.us-west-2.amazonaws.com/private_link_gcp_ts_01.png "private_link_gcp_ts_01")

- 設定が正しくない場合、private link に ping すると次のように表示されることがあります。

    ![private_link_gcp_ts_02](https://zdoc-images.s3.us-west-2.amazonaws.com/private_link_gcp_ts_02.png "private_link_gcp_ts_02")

### 既存の cluster に対して private endpoint を作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。private endpoint を作成すると、同じ region と project に存在する既存および今後作成されるすべての Dedicated (Enterprise) cluster に適用されます。必要なのは、異なる cluster に対して異なる DNS record を追加することだけです。
