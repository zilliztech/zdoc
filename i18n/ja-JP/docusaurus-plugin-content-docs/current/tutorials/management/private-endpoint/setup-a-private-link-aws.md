---
title: "PrivateLink (AWS) を設定する | Cloud"
slug: /setup-a-private-link-aws
sidebar_label: "PrivateLink (AWS) を設定する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、異なる AWS VPC でホストされているサービスに対して、Zilliz Cloud クラスターからプライベートリンクを設定する手順を説明します。 | Cloud"
type: origin
token: GBY6wbUmwi9lLjkXSuKccODgnne
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# PrivateLink (AWS) を設定する

このガイドでは、異なる AWS VPC でホストされているサービスに対して、Zilliz Cloud クラスターからプライベートリンクを設定する手順を説明します。

プライベートリンクはプロジェクトレベルで設定され、このプロジェクト配下で同じクラウドプロバイダーおよびリージョンにデプロイされたすべての **Dedicated** サービングクラスターと **on-demand** クラスターに対して有効です。

<Admonition type="info" icon="📘" title="Note">

プロジェクトごとに最大 10 個のプライベートエンドポイントを作成できます。

</Admonition>

Zilliz Cloud はプライベートエンドポイントの作成および使用に対して課金しません。ただし、Zilliz Cloud へのアクセスのために作成する各エンドポイントについては、クラウドプロバイダーから[課金される場合があります](https://aws.amazon.com/privatelink/pricing/)。

## 開始前に\{#before-you-start}

以下を確認してください。

- サービスと Zilliz Cloud クラスターが異なるリージョンにあり、そのサービスが AWS PrivateLink 経由でクラスターにアクセスする必要がある場合は、[チケットを送信](https://support.zilliz.com/hc/en-us/requests/new)してください。こちらで対応します。

## プライベートエンドポイントを作成する\{#create-private-endpoint}

Zilliz Cloud では、直感的な Web コンソールでプライベートエンドポイントを追加できます。対象のプロジェクトに移動し、左側のナビゲーションで **Network > Private Endpoint** をクリックします。**+ Private Endpoint** をクリックします。

![I02ibsAgioWpuLxwzHDcp1c2nge](https://zdoc-images.s3.us-west-2.amazonaws.com/i02ibsagiowpulxwzhdcp1c2nge.png "I02ibsAgioWpuLxwzHDcp1c2nge")

### ステップ 1: クラウドプロバイダーとリージョンを選択する\{#step-1-select-a-cloud-provider-and-region}

AWS リージョンにデプロイされたクラスター用のプライベートエンドポイントを作成するには、**Cloud Provider** ドロップダウンリストから **AWS** を選択します。**Region** では、プライベートにアクセスしたいクラスターが配置されているリージョンを選択します。**Next** をクリックします。 

利用可能なクラウドプロバイダーとリージョンの詳細については、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 

![NxuFbXh41oA53VxB4sPcfR9snVg](https://zdoc-images.s3.us-west-2.amazonaws.com/nxufbxh41oa53vxb4spcfr9snvg.png "NxuFbXh41oA53VxB4sPcfR9snVg")

### ステップ 2: エンドポイントを作成する\{#step-2-create-an-endpoint}

このステップは、クラウドプロバイダーのコンソールで UI コンソールまたは CLI を使用して完了する必要があります。

- **UI コンソールを使用する場合**

    ![AJlTbcoxNoXKBIxAxz6cYrkBnrc](https://zdoc-images.s3.us-west-2.amazonaws.com/ajltbcoxnoxkbixaxz6cyrkbnrc.png "AJlTbcoxNoXKBIxAxz6cYrkBnrc")

    <Procedures>

    1. **Via UI Console** タブに切り替え、**Service Name** をコピーします。

    1. AWS コンソールに移動し、右上でサービスが稼働しているリージョンを選択します。次に、左側のナビゲーションで **Endpoints** をクリックします。**Create Endpoint** をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        必ず、Zilliz Cloud クラスターへのアクセスが必要なサービスが存在するリージョンを使用してください。
        
        - サービスが Zilliz Cloud クラスターをホストしているリージョンと同じリージョンで動作している場合は、そのリージョンを使用します。
        
        - サービスが Zilliz Cloud クラスターをホストしているリージョンとは異なるリージョンで動作している場合は、サービスが動作しているリージョンを使用します。

        </Admonition>

        ![setup_private_link_window_aws](https://zdoc-images.s3.us-west-2.amazonaws.com/setupprivatelinkwindowaws.png "setup_private_link_window_aws")

    1. **Create Endpoint** ページで、エンドポイントの **Type** として **Endpoint services that use NLBs and GWLBs** を選択します。

        ![create_endpoint_type_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/createendpointtypegcp.png "create_endpoint_type_gcp")

    1. **Service Settings** で、Zilliz Cloud Web コンソールからコピーした **Service Name** を **Service Name** フィールドに貼り付けます。その後、**Verify service** をクリックします。

        ![enter_service_name_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/enterservicenamegcp.png "enter_service_name_gcp")

        <Admonition type="info" icon="📘" title="📘 Notes">

        サービスが Zilliz Cloud クラスターがホストされているリージョンとは異なるリージョンで動作している場合は、**Enable Cross Region endpoint** を選択し、Zilliz Cloud クラスターが稼働しているリージョンを選択してください。その後、**Verify service** をクリックします。 
        
        次の図では、Zilliz Cloud クラスターは **Europe (Frankfurt)** で稼働しており、サービスは別のリージョンで稼働しているものとしています。
        
        ![NX2AbfqBfokf1axbn4LchJfZnqS](https://zdoc-images.s3.us-west-2.amazonaws.com/nx2abfqbfokf1axbn4lchjfznqs.png "NX2AbfqBfokf1axbn4LchJfZnqS")

        </Admonition>

    1. サービス名の検証が完了したら、まずサブネットとセキュリティグループを設定し、その後 **Create** をクリックします。

    1. エンドポイントの作成に成功したら、Endpoint ID（`vpce-` で始まる）をコピーします。

    </Procedures>

- **CLI を使用する場合**

    ![TzQdb9ReToZlkTxGRVZcCdUbnOe](https://zdoc-images.s3.us-west-2.amazonaws.com/tzqdb9retozlktxgrvzccdubnoe.png "TzQdb9ReToZlkTxGRVZcCdUbnOe")

    <Procedures>

    1. **Via CLI** タブに切り替えます。

    1. **VPC ID** を入力します。 

        VPC を確認するには、[Amazon VPC console](https://console.aws.amazon.com/vpc/) に移動します。ナビゲーションペインで **Your VPCs** を選択します。目的の VPC を見つけて ID をコピーします。この ID を Zilliz Cloud の **VPC ID** に入力します。

        VPC の作成については、[Create a VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html#Create-VPC) を参照してください。

    1. **Subnet IDs** を入力します。

        サブネットは VPC の下位区分です。作成するプライベートエンドポイントと同じリージョンに存在するサブネットが必要です。サブネットを確認するには、[Amazon VPC console](https://console.aws.amazon.com/vpc/) に移動します。現在のリージョンを、プライベートリンクの作成用に指定したリージョンに変更します。ナビゲーションペインで **Subnets** を選択します。目的のサブネットを見つけて ID をコピーします。この ID を Zilliz Cloud の **Subnet IDs** に入力します。 

        サブネットの作成については、[Create a Subnet in Your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-subnets.html#create-subnets) を参照してください。

    1. コードブロックのコピーアイコンをクリックし、AWS コンソールに移動します。

        上部ナビゲーションで AWS CloudShell を起動します。Zilliz Cloud からコピーした CLI コマンドを CloudShell で実行します。

        ![setup_private_link_aws_cloud_shell](https://zdoc-images.s3.us-west-2.amazonaws.com/setupprivatelinkawscloudshell.png "setup_private_link_aws_cloud_shell")

        返されるメッセージは次のようになります。

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

        返されたメッセージで、作成された VPC エンドポイントの VpcEndpointId（`vpce-` で始まる）をコピーします。

    </Procedures>

### ステップ 3: エンドポイントを承認する\{#step-3-authorize-your-endpoint}

AWS コンソールから取得したエンドポイント ID を、Zilliz Cloud の **Endpoint ID** ボックスに貼り付けます。**Create** をクリックします。

![setup_private_link_aws_authorize_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/setupprivatelinkawsauthorizeendpoint.png "setup_private_link_aws_authorize_endpoint")

## プライベートリンクを取得する\{#obtain-a-private-link}

送信した VPC エンドポイントの検証および承認が完了すると、Zilliz Cloud はこのエンドポイントに対してプライベートリンクを割り当てます。このプロセスには約 5 分かかります。 

プライベートリンクの準備が完了すると、Zilliz Cloud の **Private Link** ページで確認できます。

## DNS レコードを設定する\{#set-up-a-dns-record}

Zilliz Cloud によって割り当てられたプライベートリンク経由でクラスターにアクセスする前に、DNS ゾーンで CNAME レコードを作成し、プライベートリンクを VPC エンドポイントの DNS 名に解決できるようにする必要があります。

- **Amazon Route 53 を使用してホストゾーンを作成する**

    Amazon Route 53 は Web ベースの DNS サービスです。DNS レコードを追加できるように、ホスト DNS ゾーンを作成します。

    ![A1zxblLRPo96Kvx0zzccZ485nGb](https://zdoc-images.s3.us-west-2.amazonaws.com/a1zxbllrpo96kvx0zzccz485ngb.png "A1zxblLRPo96Kvx0zzccZ485nGb")

    <Procedures>

    1. AWS アカウントにログインし、[Hosted zones](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#) に移動します。

    1. **Create hosted zone** をクリックします。

    1. **Hosted zone configuration** セクションで、次のパラメーターを設定します。

        <table>
           <tr>
             <th><p><strong>パラメーター名</strong></p></th>
             <th><p><strong>パラメーターの説明</strong></p></th>
           </tr>
           <tr>
             <td><p><strong>Domain name</strong></p></td>
             <td><ul><li><p>サービングクラスター: 対象のサービングクラスターに対して Zilliz Cloud が割り当てた Private Link。</p></li><li><p>オンデマンドコンピューティング: サービスのプロジェクトエンドポイント。</p></li></ul></td>
           </tr>
           <tr>
             <td><p><strong>Description</strong></p></td>
             <td><p>ホストゾーンを区別するために使用する説明です。</p></td>
           </tr>
           <tr>
             <td><p><strong>Type</strong></p></td>
             <td><p><strong>Private hosted zone</strong> を選択します。</p></td>
           </tr>
        </table>

    1. ホストゾーンに関連付ける VPC のセクションで、VPC ID を追加してホストゾーンに関連付けます。

    </Procedures>

- **ホストゾーンにエイリアスレコードを作成する**

    エイリアスレコードは、エイリアス名を実際のドメイン名または正規ドメイン名にマッピングする DNS レコードの一種です。Zilliz Cloud によって割り当てられたプライベートリンクを、VPC エンドポイントの DNS 名にマッピングするためのエイリアスレコードを作成します。これにより、プライベートリンクを使用してクラスターにプライベートにアクセスできるようになります。

    ![VoCsbJtTDo1glVx0vtGcqWPRnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/vocsbjttdo1glvx0vtgcqwprned.png "VoCsbJtTDo1glVx0vtGcqWPRnEd")

    <Procedures>

    1. 作成したホストゾーンで、**Create record** をクリックします。

    1. **Create record** ページで、**Alias** をオンにし、次のように Route traffic to を選択します。

        1. 1 つ目のドロップダウンリストで **Alias to VPC endpoint** を選択します。

        1. 2 つ目のドロップダウンリストでクラウドリージョンを選択します。

        1. 上で作成した VPC エンドポイントの DNS 名を入力します。

    1. **Create records** をクリックします。

    </Procedures>

## クラスターへのインターネットアクセスを管理する\{#manage-internet-access-to-your-clusters}

プライベートエンドポイントを設定した後、クラスターのパブリックエンドポイントを無効にして、プロジェクトへのインターネットアクセスを制限することを選択できます。パブリックエンドポイントを無効にすると、ユーザーはプライベートリンクを使用してのみクラスターに接続できます。

パブリックエンドポイントを無効にするには、次の手順を実行します。

<Procedures>

1. 対象クラスターの **Cluster Details** ページに移動します。

1. **Connect** セクションに移動します。

1. クラスターのパブリックエンドポイントの横にある設定アイコンをクリックします。

1. 情報を読み、**Disable Public Endpoint** ダイアログボックスで **Disable** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- プライベートエンドポイントは [data plane](/reference/restful/data-plane-v2) アクセスにのみ影響します。[Control plane](/reference/restful/control-plane-v2) には引き続きパブリックインターネット経由でアクセスできます。

- パブリックエンドポイントを再度有効にした後、パブリックエンドポイントにアクセスできるようになるまで、ローカル DNS キャッシュの有効期限が切れるのを待つ必要がある場合があります。

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disablepublicendpoint.png "disable_public_endpoint")

## FAQ\{#faq}

### AWS のプライベートリンクへの接続時に常にタイムアウトが報告されるのはなぜですか？\{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

通常、タイムアウトは次の理由で発生します。

- プライベート DNS レコードが存在しない。

    DNS レコードが存在する場合、次のようにプライベートリンクに ping を実行できます。

    ![QOanbDGrYovMXHxczXmcCbUcnsc](https://zdoc-images.s3.us-west-2.amazonaws.com/qoanbdgryovmxhxczxmccbucnsc.png "QOanbDGrYovMXHxczXmcCbUcnsc")

    <Admonition type="info" icon="📘" title="Notes">

    ping リクエストの出力で VPC エンドポイントの IP アドレスが正しく解決されていれば、DNS レコードは機能しています。 

    </Admonition>

    次のように表示される場合は、[DNS レコードを設定](./setup-a-private-link-aws#set-up-a-dns-record)する必要があります。

    ![X5ahblpw1oRxp8xKR3OczuD9nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/x5ahblpw1orxp8xkr3oczud9nff.png "X5ahblpw1oRxp8xKR3OczuD9nFf")

- セキュリティグループルールが存在しない、または無効である。

    AWS コンソールで、EC2 インスタンスから VPC エンドポイントへのトラフィックに対してセキュリティグループルールを適切に設定する必要があります。VPC 内の適切なセキュリティグループは、プライベートリンクに付加されたポートで、EC2 インスタンスからのインバウンドアクセスを許可する必要があります。

    `curl` コマンドを使用してプライベートリンクの接続性をテストできます。正常な場合は 400 レスポンスが返されます。

    ![ERtlbR2v7oA3Q4xXRlccM3VhnNc](https://zdoc-images.s3.us-west-2.amazonaws.com/ertlbr2v7oa3q4xxrlccm3vhnnc.png "ERtlbR2v7oA3Q4xXRlccM3VhnNc")

    次のスクリーンショットのように `curl` コマンドが応答なしでハングする場合は、[Create a VPC endpoint](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html) のステップ 9 を参照して、適切なセキュリティグループルールを設定する必要があります。

    ![KHj0bEy7ZojM6axnR0ocg1LPnue](https://zdoc-images.s3.us-west-2.amazonaws.com/khj0bey7zojm6axnr0ocg1lpnue.png "KHj0bEy7ZojM6axnR0ocg1LPnue")

    <Admonition type="info" icon="📘" title="Notes">

    2 つのセキュリティグループを設定する必要があります。1 つは EC2 インスタンス用で、プライベートリンクに関連付けられたポートでのトラフィックを許可する必要があります。もう 1 つは VPC エンドポイント用で、EC2 インスタンスの IP アドレスからのトラフィックを許可し、指定されたポート番号を対象とする必要があります。

    </Admonition>

### 既存のクラスターに対してプライベートエンドポイントを作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。プライベートエンドポイントを作成すると、同じリージョンおよびプロジェクトに存在する既存および今後作成されるすべての Dedicated (Enterprise) クラスターに対して有効になります。必要なのは、異なるクラスターごとに異なる DNS レコードを追加することだけです。

