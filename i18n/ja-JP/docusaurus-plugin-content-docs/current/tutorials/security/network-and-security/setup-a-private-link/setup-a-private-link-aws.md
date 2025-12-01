---
title: "PrivateLink（AWS）を設定 | Cloud"
slug: /setup-a-private-link-aws
sidebar_label: "PrivateLink（AWS）を設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスターから異なるAWS VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。 | Cloud"
type: origin
token: GBY6wbUmwi9lLjkXSuKccODgnne
sidebar_position: 1
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - プライベートリンク
  - privatelink
  - プライベートエンドポイント
  - プライベートサービスコネクト
  - aws
  - gcp
  - azure
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoyベクトル検索
  - ミルヴス

---

import Admonition from '@theme/Admonition';


# PrivateLink（AWS）を設定

このガイドでは、Zilliz Cloudクラスターから異なるAWS VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

プライベートリンクはプロジェクトレベルで設定され、このプロジェクト配下の同じクラウドプロバイダーおよびリージョンに展開されたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、プライベートエンドポイントの作成および使用に対して料金を請求しません。ただし、クラウドプロバイダーは<a href="https://aws.amazon.com/privatelink/pricing/">作成した各エンドポイントに費用がかかる場合があります</a>。</p>

</Admonition>

## 始める前に\{#before-you-start}

以下を確認してください：

- サービスとZilliz Cloudクラスターが異なるリージョンにあり、サービスがAWS PrivateLinkを介してクラスターにアクセスする必要がある場合は、[チケットを送信](https://support.zilliz.com/hc/en-us/requests/new)してください。リクエストを処理いたします。

## プライベートエンドポイントを作成\{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供します。対象のプロジェクトに移動し、左側のナビゲーションで**ネットワーク > プライベートエンドポイント**をクリックします。**+ プライベートエンドポイント**をクリックします。

![I02ibsAgioWpuLxwzHDcp1c2nge](/img/I02ibsAgioWpuLxwzHDcp1c2nge.png)

### クラウドプロバイダーとリージョンを選択\{#select-a-cloud-provider-and-region}

AWSリージョンに展開されたクラスター用のプライベートエンドポイントを作成するには、**クラウドプロバイダー**ドロップダウンリストから**AWS**を選択します。**リージョン**では、プライベートでアクセスしたいクラスターを配置しているリージョンを選択します。**次へ**をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、「[クラウドプロバイダーとリージョン](./cloud-providers-and-regions)」を参照してください。

![NxuFbXh41oA53VxB4sPcfR9snVg](/img/NxuFbXh41oA53VxB4sPcfR9snVg.png)

### エンドポイントを作成\{#create-an-endpoint}

クラウドプロバイダーコンソールで、UIコンソールまたはCLIを使用してこの手順を完了する必要があります。

- **UIコンソール経由**

    ![AJlTbcoxNoXKBIxAxz6cYrkBnrc](/img/AJlTbcoxNoXKBIxAxz6cYrkBnrc.png)

    1. **UIコンソール経由**タブに切り替え、**サービス名**をコピーします。

    1. AWSコンソールページに切り替えます。AWSコンソールで、クラウドリージョンが[ステップ1](./setup-a-private-link-aws#select-a-cloud-provider-and-region)で選択したクラウドリージョンに対応していることを確認します。左側のナビゲーションで**エンドポイント**をクリックします。**エンドポイントの作成**をクリックします。

        ![setup_private_link_window_aws](/img/setup_private_link_window_aws.png)

    1. **エンドポイントの作成**ページで、エンドポイントの**タイプ**として**NLBsおよびGWLBsを使用したエンドポイントサービス**を選択します。

        ![create_endpoint_type_gcp](/img/create_endpoint_type_gcp.png)

    1. AWSコンソールに切り替えます。**サービス設定**で、Zilliz Cloud Webコンソールからコピーした**サービス名**を**サービス名**フィールドに貼り付けます。次に**サービスの確認**をクリックします。

        ![enter_service_name_gcp](/img/enter_service_name_gcp.png)

    1. サービス名が確認されたら、ネットワーク設定、サブネット、セキュリティグループを完了し、**作成**をクリックします。

    1. エンドポイントが正常に作成されたら、エンドポイントID（"vpce-"で始まる）をコピーします。

- **CLI経由**

    ![TzQdb9ReToZlkTxGRVZcCdUbnOe](/img/TzQdb9ReToZlkTxGRVZcCdUbnOe.png)

    1. **CLI経由**タブに切り替えます。

    1. **VPC ID**を入力します。

        VPCを表示するには、[Amazon VPCコンソール](https://console.aws.amazon.com/vpc/)に移動します。ナビゲーションペインで**VPC**を選択します。目的のVPCを見つけ、そのIDをコピーします。このIDをZilliz Cloudの**VPC ID**に入力します。

        VPCを作成するには、「[VPCを作成](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/working-with-vpcs.html#Create-VPC)」を参照してください。

    1. **サブネットID**を入力します。

        サブネットはVPCのサブディビジョンです。作成するプライベートエンドポイントと同じリージョンに存在するサブネットが必要です。サブネットを表示するには、[Amazon VPCコンソール](https://console.aws.amazon.com/vpc/)に移動します。現在のリージョンをプライベートリンクの作成に指定したリージョンに変更します。ナビゲーションペインで**サブネット**を選択します。目的のサブネットを見つけ、そのIDをコピーします。このIDをZilliz Cloudの**サブネットID**に入力します。

        サブネットを作成するには、「[VPCにサブネットを作成](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/working-with-subnets.html#create-subnets)」を参照してください。

    1. コードブロックのコピーアイコンをクリックして、AWSコンソールに移動します。

        上部のナビゲーションで、AWS CloudShellを起動します。CloudShellでZilliz CloudからコピーしたCLIコマンドを実行します。

        ![setup_private_link_aws_cloud_shell](/img/setup_private_link_aws_cloud_shell.png)

        返却されるメッセージは以下のようになります：

        ```json
        {
            "VpcEndpoint": {
                # これをコピーして「VPCプライベートリンクID」に入力してください
                "VpcEndpointId": "vpce-0ce90d01341533a5c",
                "VpcEndpointType": "Interface",
                ...
                "DnsEntries": [
                    {
                        # これをコピーして、次のステップで「VPCE_DNS」として使用します
                        "DnsName": "vpce-0ce90d01341533a5c-ngbqfdnj.vpce-svc-0b62964bfd0edfb74.us-west-2.vpce.amazonaws.com",
                        "HostedZoneId": "Z1YSA3EXCYUU9Z"
                    },
                    {
                        "DnsName": "vpce-0ce90d01341533a5c-ngbqfdnj-us-west-2a.vpce-svc-0b62964bfd0edfb74.us-west-2.vpce.amazonaws.com",
                        "HostedZoneId": "Z1YSA3EXCYUU9Z"
                    }
                ]
        }
        ```

        返却メッセージで、作成したVPCエンドポイントのVpcEndpointId（"vpce-"で始まる）をコピーします。

### エンドポイントを承認\{#authorize-your-endpoint}

AWSコンソールから取得したエンドポイントIDをZilliz Cloudの**エンドポイントID**ボックスに貼り付けます。**作成**をクリックします。

![setup_private_link_aws_authorize_endpoint](/img/setup_private_link_aws_authorize_endpoint.png)

## プライベートリンクを取得\{#obtain-a-private-link}

送信したVPCエンドポイントの確認と承認後、Zilliz Cloudはこのエンドポイント用にプライベートリンクを割り当てます。この処理には約5分かかります。

プライベートリンクの準備ができたら、Zilliz Cloudの**プライベートリンク**ページで表示できます。

## DNSレコードを設定\{#set-up-a-dns-record}

Zilliz Cloudが割り当てたプライベートリンクを介してクラスターにアクセスする前に、DNSゾーンにCNAMEレコードを作成して、プライベートリンクをVPCエンドポイントのDNS名に解決する必要があります。

- **Amazon Route 53を使用してホストゾーンを作成**

    Amazon Route 53はWebベースのDNSサービスです。ホストされるDNSゾーンを作成して、そこにDNSレコードを追加できるようにします。

    ![A1zxblLRPo96Kvx0zzccZ485nGb](/img/A1zxblLRPo96Kvx0zzccZ485nGb.png)

    1. AWSアカウントにログインし、[ホストゾーン](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#)に移動します。

    1. **ホストゾーンを作成**をクリックします。

    1. **ホストゾーン設定**セクションで、以下のパラメータを設定します。

        <table>
           <tr>
             <th><p><strong>パラメータ名</strong></p></th>
             <th><p><strong>パラメータの説明</strong></p></th>
           </tr>
           <tr>
             <td><p><strong>ドメイン名</strong></p></td>
             <td><p>対象クラスター用にZilliz Cloudが割り当てたプライベートリンク。</p></td>
           </tr>
           <tr>
             <td><p><strong>説明</strong></p></td>
             <td><p>ホストゾーンを区別するために使用する説明。</p></td>
           </tr>
           <tr>
             <td><p><strong>タイプ</strong></p></td>
             <td><p><strong>プライベートホストゾーン</strong>を選択します。</p></td>
           </tr>
        </table>

    1. ホストゾーンに関連付けるVPCのセクションで、VPC IDを追加してホストゾーンに関連付けます。

- **ホストゾーンにエイリアスレコードを作成**

    エイリアスレコードは、エイリアス名を真のまたは正規のドメイン名にマッピングするタイプのDNSレコードです。Zilliz Cloudが割り当てたプライベートリンクをVPCエンドポイントのDNS名にマッピングするエイリアスレコードを作成します。その後、プライベートリンクを使用してクラスターにプライベートでアクセスできます。

    ![VoCsbJtTDo1glVx0vtGcqWPRnEd](/img/VoCsbJtTDo1glVx0vtGcqWPRnEd.png)

    1. 作成したホストゾーンで、**レコードを作成**をクリックします。

    1. **レコードを作成**ページで**エイリアス**をオンにし、以下の方法でトラフィックのルーティング先を選択します：

        1. 最初のドロップダウンリストで**VPCエンドポイントにエイリアス**を選択します。

        1. 2番目のドロップダウンリストでクラウドリージョンを選択します。

        1. 上記で作成したエンドポイントの名前を入力します。

    1. **レコードを作成**をクリックします。

## クラスターへのインターネットアクセスを管理\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、プロジェクトへのインターネットアクセスを制限するためにクラスターパブリックエンドポイントを無効にすることができます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してクラスターにのみ接続できるようになります。

パブリックエンドポイントを無効にするには：

1. 対象クラスターの**クラスター詳細**ページに移動します。

1. **接続**セクションに移動します。

1. クラスターパブリックエンドポイントの隣の構成アイコンをクリックします。

1. 情報を読み、**パブリックエンドポイントを無効化**ダイアログボックスで**無効化**をクリックします。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>プライベートエンドポイントは<a href="/reference/restful/data-plane-v2">データプレーン</a>アクセスにのみ影響します。<a href="/reference/restful/control-plane-v2">コントロールプレーン</a>は引き続きパブリックインターネット経由でアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再び有効化した後、パブリックエンドポイントにアクセスできるようになるまで、ローカルDNSキャッシュが期限切れになるまで待つ必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/disable_public_endpoint.png)

## FAQ\{#faq}

### なぜAWSのプライベートリンクに接続すると常にタイムアウトが報告されますか？\{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

タイムアウトは通常、以下の理由で発生します：

- プライベートDNSレコードが存在しない。

    DNSレコードが存在する場合、以下のようにプライベートリンクにpingを実行できます：

    ![QOanbDGrYovMXHxczXmcCbUcnsc](/img/QOanbDGrYovMXHxczXmcCbUcnsc.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p>pingリクエストの出力でVPCエンドポイントのIPアドレスが正しく解決されている場合、DNSレコードは動作しています。</p>

    </Admonition>

    以下が表示される場合は、[DNSレコードを設定](./setup-a-private-link-aws#set-up-a-dns-record)する必要があります。

    ![X5ahblpw1oRxp8xKR3OczuD9nFf](/img/X5ahblpw1oRxp8xKR3OczuD9nFf.png)

- セキュリティグループルールが存在しないか、無効。

    AWSコンソールで、EC2インスタンスからVPCエンドポイントへのトラフィック用にセキュリティグループルールを適切に設定する必要があります。VPC内の適切なセキュリティグループは、プライベートリンクの末尾に付くポートでEC2インスタンスからの受信アクセスを許可する必要があります。

    `curl`コマンドを使用してプライベートリンクの接続性をテストできます。通常の場合、400レスポンスが返されます。

    ![ERtlbR2v7oA3Q4xXRlccM3VhnNc](/img/ERtlbR2v7oA3Q4xXRlccM3VhnNc.png)

    以下のスクリーンショットのように、`curl`コマンドが応答なしでハングする場合、[VPCエンドポイントを作成](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html)のステップ9を参照して、適切なセキュリティグループルールを設定する必要があります。

    ![KHj0bEy7ZojM6axnR0ocg1LPnue](/img/KHj0bEy7ZojM6axnR0ocg1LPnue.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p>2つのセキュリティグループを設定する必要があります：1つはEC2インスタンス用で、プライベートリンクに関連するポートでのトラフィックを許可する必要があります。もう1つはVPCエンドポイント用で、EC2インスタンスのIPアドレスからのトラフィックを許可し、指定されたポート番号を対象とする必要があります。</p>

    </Admonition>

### 既存のクラスターにプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成する際、同じリージョンおよびプロジェクトに存在するすべての既存および将来の専用（エンタープライズ）クラスターに対して有効になります。必要なのは、異なるクラスターに対して異なるDNSレコードを追加することです。