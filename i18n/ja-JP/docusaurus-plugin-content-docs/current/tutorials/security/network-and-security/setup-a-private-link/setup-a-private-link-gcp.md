---
title: "Private Service Connect (GCP) の設定 | Cloud"
slug: /setup-a-private-link-gcp
sidebar_label: "Private Service Connect (GCP) の設定"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスタから異なるGCP VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。 | Cloud"
type: origin
token: MU3TwStv0iruQLkhRq8cSXhhnmd
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
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db

---

import Admonition from '@theme/Admonition';


# Private Service Connect (GCP) の設定

このガイドでは、Zilliz Cloudクラスタから異なるGCP VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。

この機能は、専用(エンタープライズ)クラスターでのみ利用可能です。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクトの下で同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudはプライベートリンクに対して料金を請求しません。ただし、Zilliz Cloudにアクセスするために作成した<a href="https://cloud.google.com/vpc/pricing?hl=ja#psc-forwarding-rule-service">エンドポイントごと</a>に、クラウドプロバイダーから料金が請求される場合があります。</p>

</Admonition>

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- 専用(Enterprise)クラスタが作成されました。クラスタの作成方法については、「[クラスタ作成](./create-cluster)する」を参照してください。

## プライベートエンドポイントの作成する{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供しています。ターゲットプロジェクトに移動し、左側のナビゲーションで**ネットワーク>プライベートエンドポイント**をクリックします。**+プライベートエンドポイント**をクリックします。

![setup_private_link_aws_01](/img/ja-JP/setup_private_link_aws_01.png)

### クラウドプロバイダーと地域を選択する{#select-a-cloud-provider-and-region}

GCPリージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、[**GCP**]ドロップダウンリストから[**Cloud Provider**]を選択します。[**リージョン**]で、プライベートにアクセスするクラスターを収容するリージョンを選択します。[**次**へ]をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、「[クラウドプロバイダー&地域](./cloud-providers-and-regions)」を参照してください。

![setup_private_link_window_gcp](/img/ja-JP/setup_private_link_window_gcp.png)

### エンドポイントを作成する{#create-an-endpoint}

UIコンソールまたはCLIを使用して、クラウドプロバイダコンソールでこの手順を完了する必要があります。

- **UIコンソールから**

    Google Cloud UIコンソールでエンドポイントを作成する手順については、[このドキュメント](https://cloud.google.com/vpc/docs/configure-private-service-connect-services?hl=ja#create-endpoint)を参照してください。

    上記の文書のステップ5では、Zilliz Cloudコンソールからコピーしたサービス添付URIを使用してください。

    ![service_uri_gpc](/img/ja-JP/service_uri_gpc.png)

- **CLIより**

    1. [**Via CLI**]タブに切り替えます。

    1. [**プロジェクトID**]を入力します。

        Google CloudプロジェクトIDを取得するには、

        1. [[Google Cloudダッシュボード](https://console.cloud.google.com/home/dashboard)]を開きます。

        1. ご希望のプロジェクトIDを見つけ、そのIDをコピーしてください。

        1. Zilliz CloudのGoogle CloudプロジェクトIDにこのIDを入力してください。

    1. [**VPC名**]を入力します。

        VPCエンドポイントを作成する前に、GCPコンソールにVPCが必要です。VPCを表示するには、以下の手順を実行してください。

        1. [[Google Cloud VPCダッシュボード](https://console.cloud.google.com/networking/networks/list)]を開きます。

        1. ナビゲーションウィンドウで、[**VPCネットワーク**]を選択します。

        1. あなたの希望のVPCを見つけて、その名前をコピーしてください。

        1. Zilliz Cloudの**VPC名**にこの名前を入力してください。

        VPCネットワークを作成するには、「[VPCネットワークの作成と管理](https://cloud.google.com/vpc/docs/create-modify-vpc-networks?hl=ja)」を参照してください。

    1. [**サブネット名**]を入力します。

        サブネットはVPCのサブディビジョンです。作成するプライベートリンクと同じリージョンに存在するサブネットが必要です。サブネットを表示するには、次の手順を実行します。

        1. あなたの[VPCネットワークリスト](https://console.cloud.google.com/networking/networks/list)を開きます。

        1. ナビゲーションウィンドウで、[**VPCネットワーク**]を選択します。

        1. ご希望のVPCの名前をクリックしてください。

        1. あなたの欲望のサブネットを見つけて、その名前をコピーしてください。

        1. Zilliz Cloudの**サブネット名**にこの名前を入力してください。

    1. [**Private Service Connect Endpoint Prefix**]を入力します。

        便宜上、**Private Service Connectエンドポイントプレフィックス**にエンドポイントプレフィックスを設定して、作成した転送ルールにこのプレフィックスを設定する必要があります。

    1. [**コピーして移動]を**クリックします。

        クラウドプロバイダーコンソールにリダイレクトされます。上部のナビゲーションで、Google Cloud Shellを有効にします。Zilliz CloudからコピーしたCLIコマンドをCloud Shellで実行してください。

        ![setup_private_link_window_gcp](/img/ja-JP/setup_private_link_window_gcp.png)

        エンドポイントが作成されたら、[Google Cloud Private Service Connectページ](https://console.cloud.google.com/net-services/psc/list/consumers)に移動し、作成したエンドポイントの名前をコピーします。

### エンドポイントを承認する{#authorize-your-endpoint}

Google Cloudコンソールから取得したエンドポイントIDとプロジェクトIDを、Zilliz Cloud上の**Endpoint ID**と**Project ID**ボックスにそれぞれ貼り付けてください。**作成**をクリックしてください。

## プライベートリンクを取得する{#obtain-a-private-link}

送信した属性を確認して承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。この過程には約5分かかります。

プライベートリンクが準備できたら、Zilliz Cloudの**プライベートリンク**ページで閲覧可能です。

## ファイアウォールルールとDNSレコードを設定する{#set-up-firewall-rules-and-a-dns-record}

Zilliz Cloudが割り当てたプライベートリンクを使用してクラスタをアクセス可能にする前に、プライベートリンクをVPCエンドポイントのDNS名に解決するために、DNSゾーンにCNAMEレコードを作成する必要があります。

### ファイアウォールルールの作成{#create-firewall-rules}

マネージドクラスタへのプライベートアクセスを許可するには、適切なファイアウォールルールを追加します。次のスニペットは、TCPポート22を介してトラフィックを許可する方法を示しています。VPCの名前に`VPC_NAME`を設定する必要があることに注意してください。

```bash
VPC_NAME={{vpc-name}};

gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
```

### Cloud DNSを使用してホストゾーンを作成する{#create-a-hosted-zone-using-cloud-dns}

GCPコンソールで[Cloud DNS](https://console.cloud.google.com/net-services/dns/zones)に移動し、DNSゾーンを作成してください。

![A5OubUFAUoUmA6xZSxuc1BR5nSf](/img/ja-JP/A5OubUFAUoUmA6xZSxuc1BR5nSf.png)

1. ゾーンタイプで**プライベート**を**選択します**。

1. [**ゾーン名**]を`zilliz-privatelink-zone`またはその他の適切な値に設定します。

1. ステップ7で取得したプライベートリンクに**DNS名**を設定してください。

    有効なDNS名は`in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com`に似ています。

1. ネットワークで適切なVPCネットワークを選択しま**す**。

1. [**作成**]をクリックします。

### ホストゾーンにレコードを作成する{#create-a-record-in-the-hosted-zone}

1. 上で作成したゾーンで、「RECORD SETS」タブの「**ADD STANDARD**」をクリック**しま**す。

1. [**レコードセットの作成**]ページで、既定の設定で**A**レコードを作成します。

    ![Wne6bTTreoB95Nxl7fgcynBBnkb](/img/ja-JP/Wne6bTTreoB95Nxl7fgcynBBnkb.png)

1. IPv 4アドレスの**SELECT IP ADDRESS**をクリックし、**エンドポイント**のIPアドレスを選択してください。

    ![PRdFbEHHzomrexx1Z1uchKz0ncg](/img/ja-JP/PRdFbEHHzomrexx1Z1uchKz0ncg.png)

1. [**作成**]をクリックします。

## クラスタへのインターネットアクセスを管理する{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、クラスターのパブリックエンドポイントを無効にして、プロジェクトへのインターネットアクセスを制限することができます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してクラスターにのみ接続できます。

パブリックエンドポイントを無効にするには:

1. ターゲットクラスタの**クラスタ詳細**ページに移動します。

1. [**接続**]セクションに移動します。

1. クラスターパブリックエンドポイントの横にある構成アイコンをクリックしてください。

1. 情報を読んで、**無効**にするをクリックして、**パブリックエンドポイントを無効**にするダイアログボックス。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>プライベートエンドポイントは<a href="/ja-JP/reference/restful/data-plane-v2">データプレーン</a>へのアクセスにのみ影響します。<a href="/ja-JP/reference/restful/control-plane-v2">コントロールプレーン</a>は引き続きパブリックインターネットからアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、ローカルDNSキャッシュの有効期限が切れるまで、パブリックエンドポイントにアクセス可能にする必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/ja-JP/disable_public_endpoint.png)

## トラブルシューティング{#troubleshooting}

### GCPでプライベートリンクをpingすると、常に`Name or service not known`が報告されるのはなぜですか?{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

DNS設定を確認するには、「[ファイアウォールルールとDNSレコードの設定](./setup-a-private-link-gcp#set-up-firewall-rules-and-a-dns-record)」を参照してください。

- 設定が正しい場合、プライベートリンクをpingすると、表示されるはずです

    ![private_link_gcp_ts_01](/img/ja-JP/private_link_gcp_ts_01.png)

- 設定が正しくない場合、プライベートリンクをpingすると、表示される場合があります

    ![private_link_gcp_ts_02](/img/ja-JP/private_link_gcp_ts_02.png)

    