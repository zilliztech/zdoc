---
title: "PrivateLink (AWS) の設定 | Cloud"
slug: /setup-a-private-link-aws
sidebar_key: setup-a-private-link-aws
sidebar_label: "PrivateLink (AWS) の設定"
beta: FALSE
notebook: FALSE
description: "このガイドでは、Zilliz Cloud クラスターから異なる AWS VPC でホストされているサービスへ PrivateLink を設定する手順を示します。 | Cloud"
type: origin
token: GBY6wbUmwi9lLjkXSuKccODgnne
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - private link
  - privatelink
  - private endpoint
  - private service connect
  - aws
  - gcp
  - azure

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# プライベートLink (AWS) の設定

このガイドでは、Zilliz Cloud クラスターから異なる AWS VPC でホストされているサービスへプライベートリンクを設定する手順を示します。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は<strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

プライベートリンクはプロジェクトレベルで設定され、このプロジェクト下で同じクラウドプロバイダーおよびリージョンにデプロイされたすべてのクラスターに対して有効になります。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud では、プライベートエンドポイントの作成および利用に対する課金はありません。ただし、クラウドプロバイダーによっては、Zilliz Cloud へのアクセス用に作成した<a href="https://aws.amazon.com/privatelink/pricing/">各エンドポイントに対して料金が発生する場合があります</a>。</p>

</Admonition>

## 開始前の準備\{#before-you-start}

以下の点を確認してください：

- サービスと Zilliz Cloud クラスターが異なるリージョンにあり、サービスが AWS プライベートLink を介してクラスターにアクセスする必要がある場合は、[チケットを提出](https://support.zilliz.com/hc/en-us/requests/new)してください。当社が対応いたします。

## プライベートエンドポイントの作成\{#create-private-endpoint}

Zilliz Cloud では、直感的な Web コンソールを使用してプライベートエンドポイントを追加できます。対象のプロジェクトに移動し、左側のナビゲーションで**ネットワーク > プライベートエンドポイント**をクリックします。**+ プライベートエンドポイント**をクリックします。

![I02ibsAgioWpuLxwzHDcp1c2nge](https://zdoc-images.s3.us-west-2.amazonaws.com/i02ibsagiowpulxwzhdcp1c2nge.png "I02ibsAgioWpuLxwzHDcp1c2nge")

### ステップ 1: クラウドプロバイダーとリージョンの選択\{#step-1-select-a-cloud-provider-and-region}

AWS リージョンにデプロイされたクラスターのプライベートエンドポイントを作成するには、**クラウドプロバイダー**ドロップダウンリストから**AWS**を選択します。**リージョン**では、プライベートにアクセスしたいクラスターが存在するリージョンを選択します。**次へ**をクリックします。

利用可能なクラウドプロバイダーとリージョンの詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) をご覧ください。

![NxuFbXh41oA53VxB4sPcfR9snVg](https://zdoc-images.s3.us-west-2.amazonaws.com/nxufbxh41oa53vxb4spcfr9snvg.png "NxuFbXh41oA53VxB4sPcfR9snVg")

### ステップ 2: エンドポイントの作成\{#step-2-create-an-endpoint}

このステップは、UI コンソール経由または CLI 経由のいずれかを使用して、クラウドプロバイダーのコンソール上で完了する必要があります。

- **UI コンソール経由**

    ![AJlTbcoxNoXKBIxAxz6cYrkBnrc](https://zdoc-images.s3.us-west-2.amazonaws.com/ajltbcoxnoxkbixaxz6cyrkbnrc.png "AJlTbcoxNoXKBIxAxz6cYrkBnrc")

    <Procedures>

    1. **UI コンソール経由**タブに切り替え、**サービス名**をコピーします。

    1. AWS コンソールに移動し、右上隅でお使いのサービスが実行されているリージョンを選択します。次に、左側のナビゲーションで**エンドポイント**をクリックします。**エンドポイントの作成**をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        <p>常に、Zilliz Cloud クラスターへのアクセスが必要なサービスが配置されているリージョンを使用してください。</p>
        <ul>
        <li><p>サービスが Zilliz Cloud クラスターをホストしているリージョンと同じリージョンで実行されている場合は、そのリージョンを使用してください。</p></li>
        <li><p>サービスが Zilliz Cloud クラスターをホストしているリージョンとは異なるリージョンで実行されている場合は、サービスが実行されているリージョンを使用してください。</p></li>
        </ul>

        </Admonition>

        ![setup_private_link_window_aws](https://zdoc-images.s3.us-west-2.amazonaws.com/setup_private_link_window_aws.png "setup_private_link_window_aws")

    1. **エンドポイントの作成**ページで、エンドポイントの**タイプ**として**NLB および GWLB を使用するエンドポイントサービス**を選択します。

        ![create_endpoint_type_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/create_endpoint_type_gcp.png "create_endpoint_type_gcp")

    1. AWS コンソールに切り替えます。**サービス設定**で、Zilliz Cloud Web コンソールからコピーした**サービス名**を**サービス名**フィールドに貼り付けます。次に、**サービスの確認**をクリックします。

        ![enter_service_name_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/enter_service_name_gcp.png "enter_service_name_gcp")

        <Admonition type="info" icon="📘" title="Notes">

        <p>サービスが Zilliz Cloud クラスターがホストされているリージョンとは異なるリージョンで動作している場合は、<strong>クロスリージョンエンドポイントを有効にする</strong>を選択し、Zilliz Cloud クラスターが実行されているリージョンを選択してから、<strong>サービスの確認</strong>をクリックしてください。</p>
        <p>以下の図では、Zilliz Cloud クラスターが<strong>ヨーロッパ (フランクフルト)</strong>で実行されており、サービスが別のリージョンで実行されていることを想定しています。</p>
        <p><img src="https://zdoc-images.s3.us-west-2.amazonaws.com/nx2abfqbfokf1axbn4lchjfznqs.png" alt="NX2AbfqBfokf1axbn4LchJfZnqS" title="NX2AbfqBfokf1axbn4LchJfZnqS" /></p>

        </Admonition>

    1. サービス名の確認が完了したら、ネットワーク設定、サブネット、セキュリティグループを設定し、**作成**をクリックします。

    1. エンドポイントが正常に作成されたら、エンドポイント ID（"vpce-" で始まる文字列）をコピーします。

    </Procedures>

- **CLI 経由**

    ![TzQdb9ReToZlkTxGRVZcCdUbnOe](https://zdoc-images.s3.us-west-2.amazonaws.com/tzqdb9retozlktxgrvzccdubnoe.png "TzQdb9ReToZlkTxGRVZcCdUbnOe")

    <Procedures>

    1. **CLI 経由**タブに切り替えます。

    1. **VPC ID**を入力します。

        VPC を表示するには、[Amazon VPC コンソール](https://console.aws.amazon.com/vpc/) に移動します。ナビゲーションペインで**お客様の VPC**を選択します。目的の VPC を見つけてその ID をコピーし、Zilliz Cloud の**VPC ID**に入力します。

        VPC を作成する方法については、[VPC の作成](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html#Create-VPC) をご覧ください。

    1. **サブネット ID**を入力します。

        サブネットは VPC の細分化された単位です。作成するプライベートエンドポイントと同じリージョンに存在するサブネットが必要です。サブネットを表示するには、[Amazon VPC コンソール](https://console.aws.amazon.com/vpc/) に移動します。現在のリージョンをプライベートリンクの作成用に指定されたリージョンに変更します。ナビゲーションペインで**サブネット**を選択します。目的のサブネットを見つけてその ID をコピーし、Zilliz Cloud の**サブネット ID**に入力します。

        サブネットを作成する方法については、[VPC 内のサブネットの作成](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-subnets.html#create-subnets) をご覧ください。

    1. コードブロック内のコピーアイコンをクリックし、AWS コンソールに移動します。

        上部のナビゲーションで AWS CloudShell を起動します。Zilliz Cloud からコピーした CLI コマンドを CloudShell で実行します。

        ![setup_private_link_aws_cloud_shell](https://zdoc-images.s3.us-west-2.amazonaws.com/setup_private_link_aws_cloud_shell.png "setup_private_link_aws_cloud_shell")

        返されるメッセージは以下のようになります：

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

        返されたメッセージで、作成された VPC エンドポイントの VpcEndpointId（"vpce-" で始まる）をコピーします。

    </Procedures>

### ステップ 3: エンドポイントの承認\{#step-3-authorize-your-endpoint}

AWS コンソールで取得したエンドポイント ID を Zilliz Cloud の**エンドポイントID**ボックスに貼り付けます。**Create**をクリックします。

![setup_private_link_aws_authorize_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/setup_private_link_aws_authorize_endpoint.png "setup_private_link_aws_authorize_endpoint")

## プライベートリンクの取得\{#obtain-a-private-link}

送信した VPC エンドポイントを確認して承認すると、Zilliz Cloud はこのエンドポイント用にプライベートリンクを割り当てます。このプロセスには約 5 分かかります。

プライベートリンクの準備が整うと、Zilliz Cloud の**プライベート Link**ページで確認できます。

## DNS レコードの設定\{#set-up-a-dns-record}

Zilliz Cloud によって割り当てられたプライベートリンク経由でクラスターにアクセスする前に、DNS ゾーンに CNAME レコードを作成して、プライベートリンクを VPC エンドポイントの DNS 名に解決する必要があります。

- **Amazon Route 53 を使用してホストゾーンを作成する**

    Amazon Route 53 は Web ベースの DNS サービスです。DNS レコードを追加できるように、ホスト DNS ゾーンを作成します。

    ![A1zxblLRPo96Kvx0zzccZ485nGb](https://zdoc-images.s3.us-west-2.amazonaws.com/a1zxbllrpo96kvx0zzccz485ngb.png "A1zxblLRPo96Kvx0zzccZ485nGb")

    <Procedures>

    1. AWS アカウントにログインし、[Hosted zones](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#) に移動します。

    1. **Create hosted zone**をクリックします。

    1. **ホストゾーン設定**セクションで、以下のパラメータを設定します。

        <table>
           <tr>
             <th><p><strong>Parameter name</strong></p></th>
             <th><p><strong>Parameter Description</strong></p></th>
           </tr>
           <tr>
             <td><p><strong>Domain name</strong></p></td>
             <td><p>対象クラスター用に Zilliz Cloud によって割り当てられた プライベート Link。</p></td>
           </tr>
           <tr>
             <td><p><strong>Description</strong></p></td>
             <td><p>ホストゾーンを区別するために使用する説明。</p></td>
           </tr>
           <tr>
             <td><p><strong>Type</strong></p></td>
             <td><p><strong>プライベート hosted zone</strong>を選択します。</p></td>
           </tr>
        </table>

    1. ホストゾーンに関連付ける VPC のセクションで、ホストゾーンに関連付けるために VPC ID を追加します。

    </Procedures>

- **ホストゾーン内にエイリアスレコードを作成する**

    エイリアスレコードは、エイリアス名を真のまたは正規のドメイン名にマップする DNS レコードの一種です。エイリアスレコードを作成して、Zilliz Cloud によって割り当てられたプライベートリンクを VPC エンドポイントの DNS 名にマップします。その後、プライベートリンクを使用してクラスターにプライベートにアクセスできます。

    ![VoCsbJtTDo1glVx0vtGcqWPRnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/vocsbjttdo1glvx0vtgcqwprned.png "VoCsbJtTDo1glVx0vtGcqWPRnEd")

    <Procedures>

    1. 作成したホストゾーンで、**Create record**をクリックします。

    1. **Create record**ページで、**エイリアス**をオンにし、以下のようにトラフィックのルーティング先を選択します。

        1. 最初のドロップダウンリストで**エイリアス to VPC endpoint**を選択します。

        1. 2 番目のドロップダウンリストでクラウドリージョンを選択します。

        1. 上記で作成したエンドポイントの名前を入力します。

    1. **Create records**をクリックします。

    </Procedures>

## クラスターへのインターネットアクセスの管理\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、プロジェクトへのインターネットアクセスを制限するためにクラスターのパブリックエンドポイントを無効化することを選択できます。パブリックエンドポイントを無効化すると、ユーザーはプライベートリンクのみを使用してクラスターに接続できるようになります。

パブリックエンドポイントを無効化するには：

<Procedures>

1. 対象クラスターの**クラスターの詳細**ページに移動します。

1. **Connect**セクションに移動します。

1. クラスターのパブリックエンドポイントの横にある設定アイコンをクリックします。

1. 情報を読み、**Disable Public Endpoint**ダイアログボックスで**Disable**をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>プライベートエンドポイントは<a href="/reference/restful/data-plane-v2">data plane</a>アクセスのみに影響します。<a href="/reference/restful/control-plane-v2">Control plane</a>は引き続きパブリックインターネット経由でアクセスできます。</p></li>
<li><p>パブリックエンドポイントを再度有効にした後、パブリックエンドポイントにアクセスできるようになるまで、ローカル DNS キャッシュの有効期限が切れるのを待つ必要がある場合があります。</p></li>
</ul>

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disable_public_endpoint.png "disable_public_endpoint")

## よくある質問\{#faq}

### AWS 上でプライベートリンクに接続する際に常にタイムアウトが報告されるのはなぜですか？\{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

タイムアウトは通常、以下の理由で発生します。

- プライベート DNS レコードが存在しない。

    DNS レコードが存在する場合、以下のようにプライベートリンクを ping できます。

    ![QOanbDGrYovMXHxczXmcCbUcnsc](https://zdoc-images.s3.us-west-2.amazonaws.com/qoanbdgryovmxhxczxmccbucnsc.png "QOanbDGrYovMXHxczXmcCbUcnsc")

    <Admonition type="info" icon="📘" title="Notes">

    <p>ping リクエストの出力で VPC エンドポイントの IP アドレスが正しく解決されていれば、DNS レコードは機能しています。</p>

    </Admonition>

    以下が表示される場合は、[DNS レコードの設定](./setup-a-private-link-aws#set-up-a-dns-record)を行う必要があります。

    ![X5ahblpw1oRxp8xKR3OczuD9nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/x5ahblpw1orxp8xkr3oczud9nff.png "X5ahblpw1oRxp8xKR3OczuD9nFf")

- セキュリティグループルールが存在しない、または無効である。

    AWS コンソールで、EC2 インスタンスから VPC エンドポイントへのトラフィックに対してセキュリティグループルールを適切に設定する必要があります。VPC 内の適切なセキュリティグループは、プライベートリンクに付加されたポート上で EC2 インスタンスからのインバウンドアクセスを許可する必要があります。

    `curl` コマンドを使用してプライベートリンクの接続性をテストできます。正常な場合、400 レスポンスが返されます。

    ![ERtlbR2v7oA3Q4xXRlccM3VhnNc](https://zdoc-images.s3.us-west-2.amazonaws.com/ertlbr2v7oa3q4xxrlccm3vhnnc.png "ERtlbR2v7oA3Q4xXRlccM3VhnNc")

    以下のスクリーンショットのように `curl` コマンドがレスポンスなしでハングアップする場合は、[VPC エンドポイントの作成](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html)のステップ 9 を参照して、適切なセキュリティグループルールを設定する必要があります。

    ![KHj0bEy7ZojM6axnR0ocg1LPnue](https://zdoc-images.s3.us-west-2.amazonaws.com/khj0bey7zojm6axnr0ocg1lpnue.png "KHj0bEy7ZojM6axnR0ocg1LPnue")

    <Admonition type="info" icon="📘" title="Notes">

    <p>2 つのセキュリティグループを設定する必要があります。1 つは EC2 インスタンス用で、プライベートリンクに関連付けられたポートでのトラフィックを許可する必要があり、もう 1 つは VPC エンドポイント用で、EC2 インスタンスの IP アドレスからのトラフィックを許可し、指定されたポート番号を対象とする必要があります。</p>

    </Admonition>

### 既存のクラスター用にプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成すると、同じリージョンおよびプロジェクトに存在するすべての既存および将来の Dedicated (Enterprise) クラスターに効果が及びます。必要なことは、異なるクラスターごとに異なる DNS レコードを追加することだけです。

