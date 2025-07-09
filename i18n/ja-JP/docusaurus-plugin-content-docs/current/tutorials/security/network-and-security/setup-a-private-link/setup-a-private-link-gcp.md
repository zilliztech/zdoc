---
title: "プライベートサービスコネクト（GCP）の設定 | Cloud"
slug: /setup-a-private-link-gcp
sidebar_label: "プライベートサービスコネクト（GCP）の設定"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスタから異なるGCP VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。 | Cloud"
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
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';


# プライベートサービスコネクト（GCP）の設定

このガイドでは、Zilliz Cloudクラスタから異なるGCP VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。

この機能は、専用(エンタープライズ)クラスターでのみ利用可能です。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクトの下で同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudはプライベートリンクに対して料金を請求しません。ただし、クラウドプロバイダーは、Zilliz Cloudにアクセスするために作成した<a href="https://cloud.google.com/vpc/pricing#psc-forwarding-rule-service">各エンドポイントごとに料金を請求します</a>を使用する場合があります。</p>

</Admonition>

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- 企業向けの専用クラスタが作成されました。クラスタの作成方法については、[クラスタ作成](./create-cluster)を参照してください。

## プライベートエンドポイントの作成{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供しています。ターゲットプロジェクトに移動し、左側のナビゲーションで**ネットワーク>プライベートエンドポイント**をクリックします。**+プライベートエンドポイント**をクリックします。

![setup_private_link_aws_01](/img/setup_private_link_aws_01.png)

### クラウドプロバイダーと地域を選択してください{#select-a-cloud-provider-and-region}

GCPリージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、Cloud ProviderドロップダウンリストからGCPを選択します。Regionで、プライベートにアクセスしたいクラスターを収容するリージョンを選択します。Nextをクリックしてください。 

利用可能なクラウドプロバイダーとリージョンの詳細については、[クラウドプロバイダー&地域](./cloud-providers-and-regions)を参照してください。 

![setup_private_link_window_gcp](/img/setup_private_link_window_gcp.png)

### エンドポイントを作成する{#create-an-endpoint}

UIコンソールまたはCLIを使用して、クラウドプロバイダコンソールでこの手順を完了する必要があります。

- **UIコンソールから**

    Google Cloud UIコンソールでエンドポイントを作成する手順については、[このドキュメント](https://cloud.google.com/vpc/docs/configure-private-service-connect-services#create-endpoint)を参照してください。

    上記の文書のステップ5では、Zilliz Cloudコンソールからコピーしたサービス添付URIを使用してください。

    ![service_uri_gpc](/img/service_uri_gpc.png)

- **CLI通り**

    1. 「Via CLI」タブに切り替えてください。

    1. **プロジェクトID**を入力してください。 

        Google CloudプロジェクトIDを取得するには、

        1. [Google Cloudダッシュボード](https://console.cloud.google.com/home/dashboard)を開きます。

        1. ご希望のプロジェクトIDを見つけ、そのIDをコピーしてください。

        1. Zilliz CloudのGoogle CloudプロジェクトIDにこのIDを入力してください。

    1. **VPC名**を入力してください。

        VPCエンドポイントを作成する前に、GCPコンソールにVPCが必要です。VPCを表示するには、以下の手順を実行してください。

        1. [Google Cloud VPCダッシュボード](https://console.cloud.google.com/networking/networks/list)を開きます。

        1. ナビゲーションペインで、**VPCネットワーク**を選択してください。

        1. あなたの希望のVPCを見つけて、その名前をコピーしてください。

        1. Zilliz Cloudの**VPC名**にこの名前を入力してください。

        VPCネットワークを作成するには、[VPCネットワークの作成と管理](https://cloud.google.com/vpc/docs/create-modify-vpc-networks)を参照してください。

    1. **サブネット名**を入力してください。

        サブネットはVPCのサブディビジョンです。作成するプライベートリンクと同じリージョンに存在するサブネットが必要です。サブネットを表示するには、次の手順を実行します。

        1. [VPCネットワークリスト](https://console.cloud.google.com/networking/networks/list)を開いてください。

        1. ナビゲーションペインで、**VPCネットワーク**を選択してください。

        1. ご希望のVPCの名前をクリックしてください。

        1. あなたの欲望のサブネットを見つけて、その名前をコピーしてください。

        1. Zilliz Cloudの**サブネット名**にこの名前を入力してください。

    1. **プライベートサービス接続エンドポイントプレフィックス**を入力してください。

        便宜上、**Private Service Connect Endpoint prefix**にエンドポイントプレフィックスを設定する必要があります。これにより、作成した転送ルールにこのプレフィックスが適用されます。

    1. 「コピーして移動」をクリックしてください。

        クラウドプロバイダーコンソールにリダイレクトされます。上部のナビゲーションで、Google Cloud Shellを有効にします。Zilliz CloudからコピーしたCLIコマンドをCloud Shellで実行してください。

        ![setup_private_link_window_gcp](/img/setup_private_link_window_gcp.png)

        エンドポイントが作成されたら、[Google Cloud Private Service Connectのページ](https://console.cloud.google.com/net-services/psc/list/consumers)に移動し、作成したエンドポイントの名前をコピーします。 

### エンドポイントを承認する{#authorize-your-endpoint}

Google Cloudコンソールから取得したエンドポイントIDとプロジェクトIDを、それぞれZilliz Cloudの「Endpoint ID」と「Project ID」ボックスに貼り付けます。「Create」をクリックしてください。

## プライベートリンクを取得する{#obtain-a-private-link}

送信した属性を確認して承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。この過程には約5分かかります。 

プライベートリンクが準備できたら、Zilliz Cloudの**プライベートリンク**ページから閲覧可能です。

## ファイアウォールルールとDNSレコードを設定する{#set-up-firewall-rules-and-a-dns-record}

Zilliz Cloudが割り当てたプライベートリンクを使用してクラスタをアクセス可能にする前に、プライベートリンクをVPCエンドポイントのDNS名に解決するために、DNSゾーンにCNAMEレコードを作成する必要があります。

### ファイアウォールルールの作成{#create-firewall-rules}

マネージドクラスタへのプライベートアクセスを許可するには、適切なファイアウォールルールを追加します。次のスニペットは、TCPポート22を介してトラフィックを許可する方法を示しています。VPCの名前に`VPC_NAME`を設定する必要があることに注意してください。

```bash
VPC_NAME={{vpc-name}};

gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
```

### Cloud DNSを使用してホストゾーンを作成する{#create-a-hosted-zone-using-cloud-dns}

GCPコンソールの[クラウドDNS](https://console.cloud.google.com/net-services/dns/zones)に移動し、DNSゾーンを作成してください。

![V0XRbvlgLoHRPexZSzEcFB5rn17](/img/V0XRbvlgLoHRPexZSzEcFB5rn17.png)

1. 「ゾーンタイプ」で「プライベート」を選択してください。

1. **ゾーン名**を`zilliz-privatelink-zone`または他の適切な値に設定してください。

1. ステップ7で取得したプライベートリンクに**DNS名**を設定してください。

    有効なDNS名は`in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com`に似ています。

1. **ネットワーク**で適切なVPCネットワークを選択してください。

1. **作成**をクリックしてください。

### ホストゾーンにレコードを作成する{#create-a-record-in-the-hosted-zone}

1. 上記で作成されたゾーンで、**RECORD SETS**タブの**ADD STANDARD**をクリックしてください。

1. 「レコードセットの作成」ページで、デフォルト設定で「A」レコードを作成してください。

    ![Zys4bZxploNNTex5h2OcGGwnnYd](/img/Zys4bZxploNNTex5h2OcGGwnnYd.png)

1. **IPv 4アドレス**の**SELECT IP ADDRESS**をクリックし、エンドポイントのIPアドレスを選択してください。

    ![Uh1sbVdLSok8N6xyRMhcildDn7f](/img/Uh1sbVdLSok8N6xyRMhcildDn7f.png)

1. **作成**をクリックしてください。

## クラスタへのインターネットアクセスを管理する{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、クラスターのパブリックエンドポイントを無効にして、プロジェクトへのインターネットアクセスを制限することができます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してクラスターにのみ接続できます。

パブリックエンドポイントを無効にするには:

1. ターゲットクラスターの**クラスターの詳細**ページに移動してください。

1. 「接続」セクションに移動してください。

1. クラスターパブリックエンドポイントの横にある構成アイコンをクリックしてください。

1. 情報を読んで、「パブリックエンドポイントを無効にする」ダイアログボックスで「無効にする」をクリックしてください。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>プライベートエンドポイントは<a href="/reference/restful/data-plane-v2">データプレーン</a>へのアクセスにのみ影響します。<a href="/reference/restful/control-plane-v2">コントロールプレーン</a>はパブリックインターネットを介してアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、ローカルDNSキャッシュの有効期限が切れるまで、パブリックエンドポイントにアクセス可能にする必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/disable_public_endpoint.png)

## トラブルシューティング{#troubleshooting}

### GCPでプライベートリンクをpingすると、常に`Name or service not known`が報告されるのはなぜですか?{#why-does-it-always-report-inlinecodeplaceholder0-when-i-ping-the-private-link-on-gcp}

[ファイアウォールルールとDNSレコードを設定する](./setup-a-private-link-gcp#set-up-firewall-rules-and-a-dns-record)を参照してDNS設定を確認してください。

- 設定が正しい場合、プライベートリンクをpingすると、表示されるはずです

    ![private_link_gcp_ts_01](/img/private_link_gcp_ts_01.png)

- 設定が正しくない場合、プライベートリンクをpingすると、表示される場合があります

    ![private_link_gcp_ts_02](/img/private_link_gcp_ts_02.png)

    