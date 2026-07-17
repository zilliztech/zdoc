---
title: "PrivateLink（AWS）を設定する | Cloud"
slug: /setup-a-private-link-aws
sidebar_label: "PrivateLink（AWS）を設定する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、異なる AWS VPC でホストされているお客様のサービスに対して、Zilliz Cloud クラスターから private link を設定する手順を示します。 | Cloud"
type: origin
token: GBY6wbUmwi9lLjkXSuKccODgnne
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# PrivateLink（AWS）を設定する

このガイドでは、異なる AWS VPC でホストされているお客様のサービスに対して、Zilliz Cloud クラスターから private link を設定する手順を示します。

private link はプロジェクトレベルで設定され、このプロジェクト配下で同じクラウドプロバイダーおよびリージョンにデプロイされたすべての **Dedicated** serving cluster と **on-demand** cluster に対して有効です。

<Admonition type="info" icon="📘" title="Note">

プロジェクトごとに最大 10 個の private endpoint を作成できます。

</Admonition>

Zilliz Cloud では private endpoint の作成および使用に対して料金は発生しません。ただし、Zilliz Cloud にアクセスするために作成した各 endpoint について、クラウドプロバイダーから[料金が請求される](https://aws.amazon.com/privatelink/pricing/)場合があります。

## 開始する前に\{#before-you-start}

以下を確認してください。

- サービスと Zilliz Cloud cluster が異なるリージョンにあり、サービスが AWS PrivateLink を介して cluster にアクセスする必要がある場合は、[チケットを送信](https://support.zilliz.com/hc/en-us/requests/new)してください。こちらで対応します。

## private endpoint を作成する\{#create-private-endpoint}

Zilliz Cloud は、private endpoint を追加するための直感的な Web コンソールを提供しています。対象のプロジェクトに移動し、左側のナビゲーションで **Network > Private Endpoint** をクリックします。**+ Private Endpoint** をクリックします。

![I02ibsAgioWpuLxwzHDcp1c2nge](https://zdoc-images.s3.us-west-2.amazonaws.com/i02ibsagiowpulxwzhdcp1c2nge.png "I02ibsAgioWpuLxwzHDcp1c2nge")

### ステップ 1: クラウドプロバイダーとリージョンを選択する\{#step-1-select-a-cloud-provider-and-region}

AWS リージョンにデプロイされた cluster 用の private endpoint を作成するには、**Cloud Provider** ドロップダウンリストから **AWS** を選択します。**Region** では、非公開でアクセスしたい cluster が存在するリージョンを選択します。**Next** をクリックします。 

利用可能なクラウドプロバイダーとリージョンの詳細については、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。 

![NxuFbXh41oA53VxB4sPcfR9snVg](https://zdoc-images.s3.us-west-2.amazonaws.com/nxufbxh41oa53vxb4spcfr9snvg.png "NxuFbXh41oA53VxB4sPcfR9snVg")

### ステップ 2: Endpoint を作成する\{#step-2-create-an-endpoint}

このステップは、クラウドプロバイダーのコンソールで UI コンソールまたは CLI のいずれかを使用して完了する必要があります。

- **UI コンソールを使用する場合**

    ![AJlTbcoxNoXKBIxAxz6cYrkBnrc](https://zdoc-images.s3.us-west-2.amazonaws.com/ajltbcoxnoxkbixaxz6cyrkbnrc.png "AJlTbcoxNoXKBIxAxz6cYrkBnrc")

    <Procedures>

    1. **Via UI Console** タブに切り替え、**Service Name** をコピーします。

    1. AWS コンソールに移動し、右上でサービスが稼働しているリージョンを選択します。次に、左側のナビゲーションで **Endpoints** をクリックします。**Create Endpoint** をクリックします。

        <Admonition type="info" icon="📘" title="Notes">

        Zilliz Cloud cluster へのアクセスが必要なサービスが存在するリージョンを常に使用してください。
        
        - サービスが Zilliz Cloud cluster をホストしているリージョンと同じリージョンで動作している場合は、そのリージョンを使用します。
        
        - サービスが Zilliz Cloud cluster をホストしているリージョンとは異なるリージョンで動作している場合は、サービスが動作しているリージョンを使用します。

        </Admonition>

        ![setup_private_link_window_aws](https://zdoc-images.s3.us-west-2.amazonaws.com/setup_private_link_window_aws.png "setup_private_link_window_aws")

    1. **Create Endpoint** ページで、endpoint の **Type** として **Endpoint services that use NLBs and GWLBs** を選択します。

        ![create_endpoint_type_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/create_endpoint_type_gcp.png "create_endpoint_type_gcp")

    1. **Service Settings** で、Zilliz Cloud Web コンソールからコピーした **Service Name** を **Service Name** フィールドに貼り付けます。次に **Verify service** をクリックします。

        ![enter_service_name_gcp](https://zdoc-images.s3.us-west-2.amazonaws.com/enter_service_name_gcp.png "enter_service_name_gcp")

        <Admonition type="info" icon="📘" title="📘 Notes">

        サービスが Zilliz Cloud cluster のホスト先とは異なるリージョンで稼働している場合は、**Enable Cross Region endpoint** を選択し、Zilliz Cloud cluster が稼働しているリージョンを選んでください。その後、**Verify service** をクリックします。 
        
        次の図では、Zilliz Cloud cluster は **Europe (Frankfurt)** で稼働し、サービスは別のリージョンで稼働しているものとします。
        
        ![NX2AbfqBfokf1axbn4LchJfZnqS](https://zdoc-images.s3.us-west-2.amazonaws.com/nx2abfqbfokf1axbn4lchjfznqs.png "NX2AbfqBfokf1axbn4LchJfZnqS")

        </Admonition>

    1. service name が検証されたら、まず subnet と security group を設定してから **Create** をクリックします。

    1. endpoint の作成に成功したら、Endpoint ID（"vpce-" で始まる）をコピーします。

    </Procedures>

- **CLI を使用する場合**

    ![TzQdb9ReToZlkTxGRVZcCdUbnOe](https://zdoc-images.s3.us-west-2.amazonaws.com/tzqdb9retozlktxgrvzccdubnoe.png "TzQdb9ReToZlkTxGRVZcCdUbnOe")

    <Procedures>

    1. **Via CLI** タブに切り替えます。

    1. **VPC ID** を入力します。 

        VPC を表示するには、[Amazon VPC console](https://console.aws.amazon.com/vpc/) に移動します。ナビゲーションペインで **Your VPCs** を選択します。目的の VPC を見つけて、その ID をコピーします。この ID を Zilliz Cloud の **VPC ID** に入力します。

        VPC を作成するには、[Create a VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html#Create-VPC) を参照してください。

    1. **Subnet IDs** を入力します。

        subnet は VPC の下位区分です。作成する private endpoint と同じリージョンに存在する subnet が必要です。subnet を表示するには、[Amazon VPC console](https://console.aws.amazon.com/vpc/) に移動します。現在のリージョンを、private link の作成で指定したリージョンに変更します。ナビゲーションペインで **Subnets** を選択します。目的の subnet を見つけて、その ID をコピーします。この ID を Zilliz Cloud の **Subnet IDs** に入力します。 

        subnet を作成するには、[Create a Subnet in Your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-subnets.html#create-subnets) を参照してください。

    1. コードブロック内のコピーアイコンをクリックし、AWS コンソールに移動します。

        上部ナビゲーションで AWS CloudShell を起動します。Zilliz Cloud からコピーした CLI コマンドを CloudShell で実行します。

        ![setup_private_link_aws_cloud_shell](https://zdoc-images.s3.us-west-2.amazonaws.com/setup_private_link_aws_cloud_shell.png "setup_private_link_aws_cloud_shell")

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

        返されたメッセージ内で、作成された VPC endpoint の VpcEndpointId（"vpce-" で始まる）をコピーします。

    </Procedures>

### ステップ 3: endpoint を認可する\{#step-3-authorize-your-endpoint}

AWS コンソールで取得した endpoint ID を Zilliz Cloud の **Endpoint ID** ボックスに貼り付けます。**Create** をクリックします。

![setup_private_link_aws_authorize_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/setup_private_link_aws_authorize_endpoint.png "setup_private_link_aws_authorize_endpoint")

## private link を取得する\{#obtain-a-private-link}

送信した VPC endpoint が検証および承認されると、Zilliz Cloud はこの endpoint に対して private link を割り当てます。このプロセスには約 5 分かかります。 

private link の準備ができると、Zilliz Cloud の **Private Link** ページで確認できます。

## DNS レコードを設定する\{#set-up-a-dns-record}

Zilliz Cloud によって割り当てられた private link 経由で cluster にアクセスする前に、DNS ゾーン内に CNAME レコードを作成し、private link を VPC endpoint の DNS 名に解決できるようにする必要があります。

- **Amazon Route 53 を使用して hosted zone を作成する**

    Amazon Route 53 は Web ベースの DNS サービスです。DNS レコードを追加できるように、hosted DNS zone を作成します。

    ![A1zxblLRPo96Kvx0zzccZ485nGb](https://zdoc-images.s3.us-west-2.amazonaws.com/a1zxbllrpo96kvx0zzccz485ngb.png "A1zxblLRPo96Kvx0zzccZ485nGb")

    <Procedures>

    1. AWS アカウントにログインし、[Hosted zones](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#) に移動します。

    1. **Create hosted zone** をクリックします。

    1. **Hosted zone configuration** セクションで、以下のパラメータを設定します。

        <table>
           <tr>
             <th><p><strong>パラメータ名</strong></p></th>
             <th><p><strong>パラメータの説明</strong></p></th>
           </tr>
           <tr>
             <td><p><strong>Domain name</strong></p></td>
             <td><ul><li><p>Serving cluster: 対象の serving cluster に対して Zilliz Cloud が割り当てた Private Link。</p></li><li><p>On-demand compute: サービスの project endpoint。</p></li></ul></td>
           </tr>
           <tr>
             <td><p><strong>Description</strong></p></td>
             <td><p>hosted zone を区別するために使用する説明です。</p></td>
           </tr>
           <tr>
             <td><p><strong>Type</strong></p></td>
             <td><p><strong>Private hosted zone</strong> を選択します。</p></td>
           </tr>
        </table>

    1. hosted zone に関連付ける VPCs セクションで、hosted zone に関連付けるための VPC ID を追加します。

    </Procedures>

- **hosted zone に alias レコードを作成する**

    alias レコードは、alias 名を実際のドメイン名または正規ドメイン名にマッピングする DNS レコードの一種です。Zilliz Cloud が割り当てた private link を VPC endpoint の DNS 名にマッピングする alias レコードを作成します。これにより、private link を使用して cluster にプライベートにアクセスできます。

    ![VoCsbJtTDo1glVx0vtGcqWPRnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/vocsbjttdo1glvx0vtgcqwprned.png "VoCsbJtTDo1glVx0vtGcqWPRnEd")

    <Procedures>

    1. 作成した hosted zone で **Create record** をクリックします。

    1. **Create record** ページで **Alias** をオンにし、次のように Route traffic to を選択します。

        1. 最初のドロップダウンリストで **Alias to VPC endpoint** を選択します。

        1. 2 番目のドロップダウンリストでクラウドリージョンを選択します。

        1. 上で作成した VPC endpoint の DNS 名を入力します。

    1. **Create records** をクリックします。

    </Procedures>

## クラスターへのインターネットアクセスを管理する\{#manage-internet-access-to-your-clusters}

private endpoint を設定した後、プロジェクトへのインターネットアクセスを制限するために、cluster の public endpoint を無効化することを選択できます。public endpoint を無効化すると、ユーザーは private link を使用してのみ cluster に接続できるようになります。

public endpoint を無効化するには、次の手順に従います。

<Procedures>

1. 対象 cluster の **Cluster Details** ページに移動します。

1. **Connect** セクションに移動します。

1. cluster public endpoint の横にある設定アイコンをクリックします。

1. 情報を読み、**Disable Public Endpoint** ダイアログボックスで **Disable** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="📘 Notes">

- private endpoint は [data plane](/reference/restful/data-plane-v2) へのアクセスにのみ影響します。[control plane](/reference/restful/control-plane-v2) には引き続きパブリックインターネット経由でアクセスできます。

- public endpoint を再度有効化した後、public endpoint にアクセスできるようになるまで、ローカル DNS キャッシュの有効期限が切れるのを待つ必要がある場合があります。

</Admonition>

![disable_public_endpoint](https://zdoc-images.s3.us-west-2.amazonaws.com/disable_public_endpoint.png "disable_public_endpoint")

## FAQ\{#faq}

### AWS 上の private link への接続で常にタイムアウトが報告されるのはなぜですか？\{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

通常、タイムアウトは次の理由で発生します。

- private DNS レコードが存在しない。

    DNS レコードが存在する場合、次のように private link に ping を実行できます。

    ![QOanbDGrYovMXHxczXmcCbUcnsc](https://zdoc-images.s3.us-west-2.amazonaws.com/qoanbdgryovmxhxczxmccbucnsc.png "QOanbDGrYovMXHxczXmcCbUcnsc")

    <Admonition type="info" icon="📘" title="Notes">

    ping リクエストの出力で VPC endpoint の IP アドレスが正しく解決されていれば、DNS レコードは機能しています。 

    </Admonition>

    次のように表示される場合は、[DNS レコードを設定](./setup-a-private-link-aws#set-up-a-dns-record)する必要があります。

    ![X5ahblpw1oRxp8xKR3OczuD9nFf](https://zdoc-images.s3.us-west-2.amazonaws.com/x5ahblpw1orxp8xkr3oczud9nff.png "X5ahblpw1oRxp8xKR3OczuD9nFf")

- security group ルールが存在しない、または無効である。

    AWS コンソールで、EC2 インスタンスから VPC endpoint へのトラフィックに対して security group ルールを適切に設定する必要があります。VPC 内の適切な security group では、private link に付加されたポートに対して EC2 インスタンスからのインバウンドアクセスを許可する必要があります。

    `curl` コマンドを使用して private link の接続性をテストできます。正常な場合は、400 レスポンスが返されます。

    ![ERtlbR2v7oA3Q4xXRlccM3VhnNc](https://zdoc-images.s3.us-west-2.amazonaws.com/ertlbr2v7oa3q4xxrlccm3vhnnc.png "ERtlbR2v7oA3Q4xXRlccM3VhnNc")

    次のスクリーンショットのように `curl` コマンドが応答なしでハングする場合は、[Create a VPC endpoint](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html) の step 9 を参照して、適切な security group ルールを設定する必要があります。

    ![KHj0bEy7ZojM6axnR0ocg1LPnue](https://zdoc-images.s3.us-west-2.amazonaws.com/khj0bey7zojm6axnr0ocg1lpnue.png "KHj0bEy7ZojM6axnR0ocg1LPnue")

    <Admonition type="info" icon="📘" title="Notes">

    2 つの security group を設定する必要があります。1 つは EC2 インスタンス用で、private link に関連付けられたポートでのトラフィックを許可する必要があります。もう 1 つは VPC endpoint 用で、EC2 インスタンスの IP アドレスからのトラフィックを許可し、指定されたポート番号を対象とする必要があります。

    </Admonition>

### 既存の cluster に対して private endpoint を作成できますか？\{#can-i-create-a-private-endpoint-for-an-existing-cluster}

はい。private endpoint を作成すると、同じリージョンおよびプロジェクト内に存在する既存および将来のすべての Dedicated (Enterprise) cluster に対して有効になります。必要なのは、異なる cluster ごとに異なる DNS レコードを追加することだけです。

