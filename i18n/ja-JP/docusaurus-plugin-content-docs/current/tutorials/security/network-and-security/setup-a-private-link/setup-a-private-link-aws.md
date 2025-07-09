---
title: "PrivateLink(AWS)を設定する | Cloud"
slug: /setup-a-private-link-aws
sidebar_label: "PrivateLink(AWS)を設定する"
beta: FALSE
notebook: FALSE
description: "このガイドは、プライベートリンクを設定する手順を示していますZilliz Cloudクラスタ異なるAWS VPCでホストされているサービスに。 | Cloud"
type: origin
token: GBY6wbUmwi9lLjkXSuKccODgnne
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
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';


# PrivateLink(AWS)を設定する

このガイドは、プライベートリンクを設定する手順を示していますZilliz Cloudクラスタ異なるAWS VPCでホストされているサービスに。

この機能は、専用(エンタープライズ)クラスターでのみ利用可能です。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクトの下で同じクラウドプロバイダーとリージョンにデプロイされたすべてのクラスターに対して有効です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、プライベートエンドポイントの作成および使用に対して料金を請求しません。ただし、クラウドプロバイダーは、Zilliz Cloudにアクセスするために作成した<a href="https://aws.amazon.com/privatelink/pricing/">各エンドポイントごとに料金を請求します</a>を使用する場合があります。</p>

</Admonition>

</include>

## 始める前に{#before-you-start}

それを確認してください:

- 企業向けの専用クラスタが作成されました。クラスタの作成方法については、[クラスタ作成](./create-cluster)を参照してください。

</include>

- AWS CloudFormation、[AWSコンソール](./configure-vpc#step-3-optional-create-a-vpc-endpoint)、または[Terraformスクリプト](null)を使用して、すでにVPCエンドポイントを作成しています。

</include>

## プライベートエンドポイントの作成{#create-private-endpoint}

Zilliz Cloudは、プライベートエンドポイントを追加するための直感的なWebコンソールを提供しています。ターゲットプロジェクトに移動し、左側のナビゲーションで**ネットワーク>プライベートエンドポイント**をクリックします。**+プライベートエンドポイント**をクリックします。

![setup_private_link_aws_01](/img/setup_private_link_aws_01.png)

### クラウドプロバイダーと地域を選択してください{#select-a-cloud-provider-and-region}

AWSリージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、クラウドプロバイダーのドロップダウンリストからAWSを選択します。リージョンで、プライベートにアクセスしたいクラスターを収容するリージョンを選択します。次へをクリックします。 

利用可能なクラウドプロバイダーとリージョンの詳細については、[クラウドプロバイダー&地域](./cloud-providers-and-regions)を参照してください。 

![setup_private_link_window](/img/setup_private_link_window.png)

### エンドポイントの作成{#create-an-endpoint}

UIコンソールまたはCLIを使用して、クラウドプロバイダコンソールでこの手順を完了する必要があります。

- **UIコンソールから**

    1. 「UIコンソール経由」タブに切り替えてください。

    1. AWSコンソールページに移動してください。AWSコンソールで、クラウドリージョンが[ステップ1](./setup-a-private-link-aws#select-a-cloud-provider-and-region)で選択したクラウドリージョンに対応しているかどうかを確認してください。左ナビゲーションの**エンドポイント**をクリックしてください。**エンドポイントの作成**をクリックしてください。

        ![setup_private_link_window_aws](/img/setup_private_link_window_aws.png)

    1. 「エンドポイントの作成」ページで、「エンドポイントタイプ」としてNLBとGWLBを使用するエンドポイントサービスを選択してください。

        ![create_endpoint_type_gcp](/img/create_endpoint_type_gcp.png)

    1. Zilliz Cloudコンソールに戻り、サービス名をコピーしてください。

    1. AWSコンソールに切り替えます。**サービス設定**で、Zilliz Cloudウェブコンソールからコピーした**サービス名**を**サービス名**フィールドに貼り付けます。次に、**サービスの検証**をクリックします。

        ![enter_service_name_gcp](/img/enter_service_name_gcp.png)

    1. サービス名が確認されたら、ネットワーク設定、サブネット、セキュリティグループを完了し、**作成**をクリックしてください。

    1. エンドポイントが正常に作成されたら、エンドポイントID("vpce-"で始まる)をコピーしてください。

- **CLI通り**

    ![setup_private_link_aws_via_CLI](/img/setup_private_link_aws_via_CLI.png)

    1. 「Via CLI」タブに切り替えてください。

    1. **VPC ID**を入力してください。 

        あなたのVPCを表示するには、[Amazon VPCコンソール](https://console.aws.amazon.com/vpc/)に移動してください。ナビゲーションペインで、**あなたのVPC**を選択してください。希望のVPCを見つけ、そのIDをコピーしてください。このIDをZilliz Cloudの**VPC ID**に入力してください。

        VPCを作成するには、[VPCの作成](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html#Create-VPC)を参照してください。

    1. **サブネットID**を入力してください。

        サブネットはVPCのサブディビジョンです。作成するプライベートエンドポイントと同じリージョンに存在するサブネットが必要です。サブネットを表示するには、[Amazon VPCコンソール](https://console.aws.amazon.com/vpc/)に移動します。現在のリージョンをプライベートリンクを作成するために指定されたリージョンに変更します。ナビゲーションペインで、**サブネット**を選択します。希望するサブネットを見つけ、そのIDをコピーします。このIDをZilliz Cloudの**サブネットID**に入力してください。 

        サブネットを作成するには、[VPCにサブネットを作成する](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-subnets.html#create-subnets)を参照してください。

    1. 「コピーして移動」をクリックしてください。

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

        返されたメッセージで、作成されたVPCエンドポイントのVpcEndpointId("vpce-"で始まる)をコピーしてください。

### エンドポイントを承認する{#authorize-your-endpoint}

AWSコンソールから取得したエンドポイントIDをZilliz Cloudの**Endpoint ID**ボックスに貼り付けます。**作成**をクリックしてください。

![setup_private_link_aws_authorize_endpoint](/img/setup_private_link_aws_authorize_endpoint.png)

## プライベートリンクを取得する{#obtain-a-private-link}

送信したVPCエンドポイントを確認して承認した後、Zilliz Cloudはこのエンドポイントにプライベートリンクを割り当てます。この過程には約5分かかります。 

プライベートリンクが準備できたら、Zilliz Cloudの**プライベートリンク**ページから閲覧可能です。

</include>

## DNSレコードを設定する{#set-up-a-dns-record}

Zilliz Cloudが割り当てたプライベートリンクを使用してクラスタをアクセス可能にする前に、プライベートリンクをVPCエンドポイントのDNS名に解決するために、DNSゾーンにCNAMEレコードを作成する必要があります。

- **Amazon Route 53を使用してホストゾーンを作成する**

    Amazon Route 53はWebベースのDNSサービスです。DNSレコードを追加できるように、ホストされたDNSゾーンを作成してください。

    ![A1zxblLRPo96Kvx0zzccZ485nGb](/img/A1zxblLRPo96Kvx0zzccZ485nGb.png)

    </include>

    ![O8dObi5aBogsL1xDBY4cgEtInCb](/img/O8dObi5aBogsL1xDBY4cgEtInCb.png)

    </include>

    1. AWSアカウントにログインし、[ホストゾーン](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#)に移動してください。

    1. 「ホストゾーンの作成」をクリックしてください。

    1. 「ホストゾーンの構成」セクションで、以下のパラメータを設定してください。

        <table>
           <tr>
             <th><p><strong>パラメータ名</strong></p></th>
             <th><p><strong>パラメータの説明</strong></p></th>
           </tr>
           <tr>
             <td><p><strong>ドメイン名</strong></p></td>
             <td><p>Zilliz Cloudによってターゲットクラスタに割り当てられたプライベートリンク。</p><p><code>byoc.zillizcloud.com</code>を使用してください。</p><p></include></p></td>
           </tr>
           <tr>
             <td><p><strong>の説明</strong></p></td>
             <td><p>ホストゾーンを区別するために使用される説明。</p></td>
           </tr>
           <tr>
             <td><p><strong>タイプ</strong></p></td>
             <td><p>「プライベートホストゾーン」を選択してください。</p></td>
           </tr>
        </table>

    1. [ホストゾーンに関連付けるVPC]セクションで、ホストゾーンに関連付けるVPC IDを追加します。

- ホストゾーンにエイリアスレコードを作成してください

    エイリアスレコードは、エイリアス名を真のまたは正規のドメイン名にマップするDNSレコードの一種です。Zilliz Cloudによって割り当てられたプライベートリンクをVPCエンドポイントのDNS名にマップするエイリアスレコードを作成します。その後、プライベートリンクを使用してクラスターにプライベートにアクセスできます。

    ![VoCsbJtTDo1glVx0vtGcqWPRnEd](/img/VoCsbJtTDo1glVx0vtGcqWPRnEd.png)

    </include>

    ![KVjsbqBGRofmmxxmqvBccvOanDf](/img/KVjsbqBGRofmmxxmqvBccvOanDf.png)

    </include>

    1. 作成したホストゾーンで、**レコードの作成**をクリックします。

    1. 現在のプロジェクトが展開されているクラウドリージョンに合わせて、**レコード名**を設定してください。

        <table>
           <tr>
             <th><p>AWSリージョン</p></th>
             <th><p>レコード名</p></th>
           </tr>
           <tr>
             <td><p>us-west-2ファイル</p></td>
             <td><p>インラインコードプレースホルダー0</p></td>
           </tr>
           <tr>
             <td><p>eu-central-1ダウンロード</p></td>
             <td><p>インラインコードプレースホルダー0</p></td>
           </tr>
        </table>

    </include>

    1. 「レコードの作成」ページで、「エイリアス」をオンにし、「トラフィックを以下のようにルーティングする」を選択してください

        1. 最初のドロップダウンリストで**VPCエンドポイントへのエイリアス**を選択してください。

        1. 2番目のドロップダウンリストで雲の地域を選択してください。

        1. 上で作成したエンドポイントの名前を入力します。

    1. 「レコードの作成」をクリックしてください。

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

### AWSのプライベートリンクに接続すると、常にタイムアウトが報告されるのはなぜですか?{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

タイムアウトは通常、次の理由で発生します。

- プライベートDNSレコードは存在しません。

    DNSレコードが存在する場合は、次のようにプライベートリンクをpingできます。

    ![QOanbDGrYovMXHxczXmcCbUcnsc](/img/QOanbDGrYovMXHxczXmcCbUcnsc.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p>ping要求の出力でVPCエンドポイントのIPアドレスが正しく解決された場合、DNSレコードは機能します。 </p>

    </Admonition>

    以下が表示された場合は、[DNSレコードを設定する](./setup-a-private-link-aws#set-up-a-dns-record)が必要です。

    ![X5ahblpw1oRxp8xKR3OczuD9nFf](/img/X5ahblpw1oRxp8xKR3OczuD9nFf.png)

- セキュリティグループ規則が存在しないか、無効です。

    AWSコンソールで、EC 2インスタンスからVPCエンドポイントへのトラフィックのセキュリティグループルールを適切に設定する必要があります。VPC内の適切なセキュリティグループは、プライベートリンクにサフィックスが付けられたポートからEC 2インスタンスへのインバウンドアクセスを許可する必要があります。

    `curl`コマンドを使用して、プライベートリンクの接続性をテストできます。通常の場合、400レスポンスが返されます。

    ![ERtlbR2v7oA3Q4xXRlccM3VhnNc](/img/ERtlbR2v7oA3Q4xXRlccM3VhnNc.png)

    次のスクリーンショットのように、`curl`コマンドが応答せずにハングする場合は、[VPCエンドポイントの作成](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html)の手順9を参照して、適切なセキュリティグループルールを設定する必要があります。

    ![KHj0bEy7ZojM6axnR0ocg1LPnue](/img/KHj0bEy7ZojM6axnR0ocg1LPnue.png)

    <Admonition type="info" icon="📘" title="ノート">

    <p>2つのセキュリティグループを設定する必要があります。1つはEC 2インスタンス用で、プライベートリンクに関連付けられたポートでのトラフィックを許可する必要があります。もう1つはVPCエンドポイント用で、EC 2インスタンスのIPアドレスからのトラフィックを許可し、指定されたポート番号をターゲットにする必要があります。</p>

    </Admonition>

</include>