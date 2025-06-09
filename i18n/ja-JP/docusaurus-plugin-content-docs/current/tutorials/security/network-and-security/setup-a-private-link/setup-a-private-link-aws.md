---
title: "PrivateLink (AWS) を設定する | Cloud"
slug: /setup-a-private-link-aws
sidebar_label: "PrivateLink (AWS) を設定する"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloudクラスターから異なるAWS VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。 | Cloud"
type: origin
token: ZTIEwCxy2iHzIVkd9b1cfAaanTg
sidebar_position: 1
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
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database

---

import Admonition from '@theme/Admonition';


# PrivateLink (AWS) を設定する

このガイドでは、Zilliz Cloudクラスターから異なるAWS VPCでホストされているサービスへのプライベートリンクを設定する手順を示します。

この機能は、専用(エンタープライズ)クラスターでのみ利用可能です。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクトの下で同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、プライベートエンドポイントの作成および使用に対して料金を請求しません。ただし、Zilliz Cloudにアクセスするために作成した<a href="https://aws.amazon.com/jp/privatelink/pricing/?nc1=h_ls">エンドポイントごと</a>に、クラウドプロバイダーから料金が請求される場合があります。</p>

</Admonition>

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- 専用(Enterprise)クラスタが作成されました。クラスタの作成方法については、「[クラスタ作成](./create-cluster)する」を参照してください。

## プライベートエンドポイントの作成する{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供しています。ターゲットプロジェクトに移動し、左側のナビゲーションで**ネットワーク>プライベートエンドポイント**をクリックします。**+プライベートエンドポイント**をクリックします。

![setup_private_link_aws_01](/img/setup_private_link_aws_01.png)

### クラウドプロバイダーと地域を選択する{#select-a-cloud-provider-and-region}

AWSリージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、**AWS**を**Cloud Provider**ドロップダウンリストから選択します。**リージョン**で、プライベートにアクセスしたいクラスターを収容するリージョンを選択します。**次**へをクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、「[クラウドプロバイダー&地域](./cloud-providers-and-regions)」を参照してください。

![setup_private_link_window](/img/setup_private_link_window.png)

### エンドポイントの作成する{#create-an-endpoint}

UIコンソールまたはCLIを使用して、クラウドプロバイダコンソールでこの手順を完了する必要があります。

- **UIコンソールから**

    1. [**UIコンソール経由**]タブに切り替えます。

    1. AWSコンソールページに移動します。AWSコンソールで、クラウドリージョンがステップ1で選択したクラウドリージョンに対応しているかどうかを確認します。左ナビゲーションの**エンドポイント**をクリックします。**エンドポイントを作成**をクリックします。

        ![setup_private_link_window_aws](/img/setup_private_link_window_aws.png)

    1. [**Create Endpoint**]ページで、[**Endpoint services that use NLB and GWLB**]をエンドポイントの**種類**として選択します。

        ![create_endpoint_type_gcp](/img/create_endpoint_type_gcp.png)

    1. Zilliz Cloudコンソールに戻り、サービス名をコピーしてください。

    1. AWSコンソールに切り替えます。**サービス設定**で、Zilliz Cloudウェブコンソールからコピーした**サービス名**を**サービス名**フィールドに貼り付けます。その後、**サービスの検証**をクリックします。

        ![enter_service_name_gcp](/img/enter_service_name_gcp.png)

    1. サービス名が確認されたら、ネットワーク設定、サブネット、セキュリティグループを完了し、[**作成**]をクリックします。

    1. エンドポイントが正常に作成されたら、エンドポイントID("vpce-"で始まる)をコピーしてください。

- **CLIより**

    ![setup_private_link_aws_via_CLI](/img/setup_private_link_aws_via_CLI.png)

    1. [**Via CLI**]タブに切り替えます。

    1. 2.**VPC ID**を入力します。

        VPCを表示するには、[Amazon VPCコンソール](https://console.aws.amazon.com/vpc/)に移動します。ナビゲーションペインで、**Your VPC**を選択します。希望のVPCを見つけ、そのIDをコピーします。このIDをZilliz Cloudの**VPC ID**に入力します。

        VPCを作成するには、[VPCの作成を](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/create-vpc.html#Create-VPC)参照してください。

    1. [**サブネットID**]を入力します。

        サブネットはVPCのサブディビジョンです。作成するプライベートエンドポイントと同じリージョンに存在するサブネットが必要です。サブネットを表示するには、[Amazon VPCコンソール](https://console.aws.amazon.com/vpc/)に移動します。現在のリージョンをプライベートリンクを作成するために指定されたリージョンに変更します。ナビゲーションペインで、[**サブネット**]を選択します。希望するサブネットを見つけ、そのIDをコピーします。このIDをZilliz Cloudの**サブネットID**に入力します。

        サブネットを作成するには、「[VPCでサブネットを作成する](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/what-is-amazon-vpc.html)」を参照してください。

    1. [**コピーして移動]を**クリックします。

        クラウドプロバイダーコンソールにリダイレクトされます。上部のナビゲーションで、AWS Cloud Shellを起動してください。Zilliz CloudからコピーしたCLIコマンドをCloud Shellで実行してください。

        ![setup_private_link_aws_cloud_shell](/img/setup_private_link_aws_cloud_shell.png)

        以下のようなメッセージが返されます:

        ```json
        {
            "VpcEndpoint": {
                # Copy this and fill it in "Your VPC Private Link ID"
                "VpcEndpointId": "vpce-0ce90d01341533a5c",
                "VpcEndpointType": "Interface",
                ...
                "DnsEntries": [
                    {
                        # Copy this one and use it as "VPCE_DNS" in the next step.
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

        返されたメッセージに、作成したVPCエンドポイントのVpcEndpointId("vpce-"で始まる)をコピーします。

### エンドポイントを承認する{#authorize-your-endpoint}

AWSコンソールから取得したエンドポイントIDをZilliz Cloudの**エンドポイントID**ボックスに貼り付けてください。**作成**をクリックしてください。

![setup_private_link_aws_authorize_endpoint](/img/setup_private_link_aws_authorize_endpoint.png)

## プライベートリンクを取得する{#obtain-a-private-link}

送信したVPCエンドポイントを確認して承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。この過程には約5分かかります。

プライベートリンクが準備できたら、Zilliz Cloudの**プライベートリンク**ページで閲覧可能です。

## DNSレコードを設定する{#set-up-a-dns-record}

Zilliz Cloudが割り当てたプライベートリンクを使用してクラスタをアクセス可能にする前に、プライベートリンクをVPCエンドポイントのDNS名に解決するために、DNSゾーンにCNAMEレコードを作成する必要があります。

- **Amazon Route 53を使用してホストゾーンを作成する**

    Amazon Route 53はWebベースのDNSサービスです。DNSレコードを追加できるように、ホストされたDNSゾーンを作成してください。

    ![X58sbuYieojxVoxepmlchj6On7d](/img/X58sbuYieojxVoxepmlchj6On7d.png)

    1. AWSアカウントにログインし、[ホストゾーン](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones)に移動します。

    1. [**ホストゾーンを作成**]をクリックします。

    1. [**ホストゾーン構成**]セクションで、次のパラメーターを設定します。

        <table>
           <tr>
             <th><p><strong>パラメータ名</strong></p></th>
             <th><p><strong>パラメータの説明</strong></p></th>
           </tr>
           <tr>
             <td><p><strong>ドメイン名</strong></p></td>
             <td><p>ターゲットクラスタ用にZilliz Cloudによって割り当てられたプライベートリンク。</p></td>
           </tr>
           <tr>
             <td><p><strong>説明する</strong></p></td>
             <td><p>ホストゾーンを区別するために使用される説明。</p></td>
           </tr>
           <tr>
             <td><p><strong>タイプ</strong></p></td>
             <td><p>[<strong>プライベートホストゾーン</strong>]を選択します。</p></td>
           </tr>
        </table>

    1. [ホストゾーンに関連付けるVPC]セクションで、ホストゾーンに関連付けるVPC IDを追加します。

- **ホストゾーンにエイリアスレコードを作成する**

    エイリアスレコードは、エイリアス名を真のまたは正規のドメイン名にマップするDNSレコードの一種です。Zilliz Cloudによって割り当てられたプライベートリンクをVPCエンドポイントのDNS名にマップするエイリアスレコードを作成します。その後、プライベートリンクを使用してクラスターにプライベートにアクセスできます。

    ![PAgHbO5MboZu45xp92LcW0pkn5d](/img/PAgHbO5MboZu45xp92LcW0pkn5d.png)

    1. 作成したホストゾーンで、[**レコードを作成**]をクリックします。

    1. [**レコードを作成**]ページで[**エイリアス**]をオンにし、[トラフィックを次のようにルーティング]を選択します。

        1. 最初のドロップダウンリストで[**VPCエンドポイントへ**のエイリアス]を選択します。

        1. 2番目のドロップダウンリストで雲の地域を選択してください。

        1. 上で作成したエンドポイントの名前を入力します。

    1. [**レコードを作成**]をクリックします。

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

![disable_public_endpoint](/img/disable_public_endpoint.png)

## トラブルシューティング{#troubleshooting}

### AWSのプライベートリンクに接続すると、常にタイムアウトが報告されるのはなぜですか?{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

タイムアウトは通常、次の理由で発生します。

- プライベートDNSレコードは存在しません。

    DNSレコードが存在する場合は、次のようにプライベートリンクをpingできます。

    ![IWHQb8XltoGWUexI5w6c4FTOnQc](/img/IWHQb8XltoGWUexI5w6c4FTOnQc.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p>ping要求の出力でVPCエンドポイントのIPアドレスが正しく解決された場合、DNSレコードは機能します。</p>

    </Admonition>

    以下が表示された場合は、[DNSレコードを設定](./setup-a-private-link-aws#set-up-a-dns-record)する必要があります。

    ![Akbqbv7Pko3wwZxtDXxcAW0Anie](/img/Akbqbv7Pko3wwZxtDXxcAW0Anie.png)

- セキュリティグループ規則が存在しないか、無効です。

    AWSコンソールで、EC 2インスタンスからVPCエンドポイントへのトラフィックのセキュリティグループルールを適切に設定する必要があります。VPC内の適切なセキュリティグループは、プライベートリンクにサフィックスが付けられたポートからEC 2インスタンスへのインバウンドアクセスを許可する必要があります。

    プライベートリンクの接続性をテストするには、`url`コマンドを使用できます。通常の場合、400レスポンスが返されます。

    ![PgBnbxb7doEf7cx6IAPc6DYvnub](/img/PgBnbxb7doEf7cx6IAPc6DYvnub.png)

    次のスクリーンショットのように、`url`コマンドが応答せずにハングする場合は、「[Create a VPC endpoint](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html)」の手順9を参照して、適切なセキュリティグループルールを設定する必要があります。

    ![XLFIbDc4Iokhs2xxdL9cSco7nSf](/img/XLFIbDc4Iokhs2xxdL9cSco7nSf.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p>2つのセキュリティグループを設定する必要があります。1つはEC 2インスタンス用で、プライベートリンクに関連付けられたポートでのトラフィックを許可する必要があります。もう1つはVPCエンドポイント用で、EC 2インスタンスのIPアドレスからのトラフィックを許可し、指定されたポート番号をターゲットにする必要があります。</p>

    </Admonition>