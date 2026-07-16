---
title: "AWS 上に BYOC をデプロイ | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "AWS 上に BYOC をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、AWS Virtual Private Cloud (VPC) に完全マネージドの Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。 | BYOC"
type: origin
token: DsqzwjegpiYSdtk1k75c1zXsnZc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS 上に BYOC をデプロイ

このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、AWS Virtual Private Cloud (VPC) に完全マネージドの Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

- Zilliz BYOC は現在 **General Availability** で提供されています。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) にお問い合わせください。

- このガイドでは、AWS コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

- BYOC organization owner である必要があります。

## 手順\{#procedure}

AWS 上に BYOC をデプロイするには、Zilliz Cloud が customer-managed VPC 内の S3 bucket および EKS cluster にアクセスできるように、ユーザーに代わって特定のロールを引き受ける必要があります。そのため、Zilliz Cloud は、S3 bucket、EKS cluster、VPC に関する情報、およびこれらのインフラストラクチャリソースにアクセスするために必要なロールの情報を収集する必要があります。

BYOC organization 内で **Create Project** ボタンをクリックして、デプロイを開始します。

### ステップ 1: プロジェクトを作成する\{#step-1-create-a-project}

このステップでは、プロジェクト名を設定し、cloud providers、regions、初期プロジェクトサイズを決定し、Zilliz Cloud がプロジェクトを作成してデータプレーンをデプロイする方法を選択します。

**Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。プロジェクトはこのステップの最後に作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![FlZqw4JI6hcTNVbWCyJcBPdFnsb](https://zdoc-images.s3.us-west-2.amazonaws.com/FlZqw4JI6hcTNVbWCyJcBPdFnsb.png)

### ステップ 2: データプレーンをデプロイする\{#step-2-deploy-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックすると、データプレーンのデプロイを中止します。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内ではいつでもデータプレーンのデプロイを開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。 

    ![W1BNwopYAht6oxb9m9FccJXDnRc](https://zdoc-images.s3.us-west-2.amazonaws.com/W1BNwopYAht6oxb9m9FccJXDnRc.png)

1. **AWS PrivateLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内の cluster へのプライベート接続が可能になります。このオプションを有効にする場合、プライベート接続のために VPC Endpoint を作成する必要があります。詳細については、[Prepare for Cluster Connection](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

    ![EfRbwxMhIhlIKfbCaTPcPZPlnJd](https://zdoc-images.s3.us-west-2.amazonaws.com/EfRbwxMhIhlIKfbCaTPcPZPlnJd.png)

1. **Architecture** で、アプリケーションに合った architecture type を選択します。 

    これは、使用する Zilliz BYOC イメージの architecture type を決定します。利用可能なオプションは **X86** と **ARM** です。

1.  **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義した範囲内でプロジェクトのワークロードに基づき、Zilliz Cloud が EC2 instances の数を自動調整できるようにし、効率的なリソース利用を確保します。

    1. **Initial Project Size** を設定します。 

        BYOC プロジェクトでは、query node、tiered query node、index services、Milvus components、および依存関係で異なる種類の EC2 instances を使用します。これらのサービスおよび components それぞれについて、instance type と count を個別に設定できます。 

        **Auto-scaling** が無効の場合は、各プロジェクト component に必要な EC2 instances の数を、対応する **Count** フィールドに指定するだけです。

        ![MliHb3dF5oJYGPxvhpfcLT1vnfd](https://zdoc-images.s3.us-west-2.amazonaws.com/mlihb3df5ojygpxvhpfclt1vnfd.png "MliHb3dF5oJYGPxvhpfcLT1vnfd")

        **Auto-scaling** を有効にすると、対応する **Min** フィールドと **Max** フィールドを設定して、実際のプロジェクトワークロードに基づいて Zilliz Cloud が EC2 instances の数を自動スケールできる範囲を指定する必要があります。

        ![QQ4Gb1IyiowJPQxCViGcMb8pnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/qq4gb1iyiowjpqxcvigcmb8pnhb.png "QQ4Gb1IyiowJPQxCViGcMb8pnHb")

        リソース設定を容易にするため、あらかじめ定義された 4 つのプロジェクトサイズオプションがあります。以下の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成可能な clusters の数、およびそれらの clusters に含めることができる entities 数の対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大 cluster 数</p></th>
             <th colspan="3"><p>最大 entities 数（百万）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8 ～ 16 CUs の 3 clusters</p></td>
             <td><p>16 Million - 32 Million</p></td>
             <td><p>64 Million - 128 Million</p></td>
             <td><p>320 Million - 640 Million</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CUs の 7 clusters</p></td>
             <td><p>32 Million - 128 Million</p></td>
             <td><p>128 Million - 512 Million</p></td>
             <td><p>640 Million - 2.6 Billion</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CUs の 12 clusters</p></td>
             <td><p>128 Million - 384 Million</p></td>
             <td><p>512 Million - 1.5 Billion</p></td>
             <td><p>2.6 Billion - 7.7 Billion</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CUs の 17 clusters</p></td>
             <td><p>384 Million - 1.2 Billion</p></td>
             <td><p>1.5 Billion -  4.6 Billion</p></td>
             <td><p>7.7 Billion - 23 Billion</p></td>
           </tr>
        </table>

        **Initial Project Size** で **Custom** を選択し、すべてのデータプレーン components について EC2 instance types と counts を調整することで、設定をカスタマイズすることもできます。希望する EC2 instance types が一覧にない場合は、追加のサポートについて [contact Zilliz support](https://zilliz.com/contact) にお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションは、tiered-storage cluster を作成できるかどうかを決定します。このオプションを選択すると、tiered query nodes の instance type と count を設定できます。 

        ![LWMFbm73GoM8mFxjajCcaGqPnMO](https://zdoc-images.s3.us-west-2.amazonaws.com/lwmfbm73gom8mfxjajccagqpnmo.png "LWMFbm73GoM8mFxjajCcaGqPnMO")

        <Admonition type="info" icon="📘" title="注意">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の count と **Tiered Query Node** の count の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。
        
        - BYOC で Tiered Storage が利用可能になる前に作成された clusters については、Tiered Storage を手動で有効にできます。詳細については、[Enable Tiered Storage for Exisiting Clusters](./enable-tiered-storage-aws) を参照してください。

        </Admonition>

1. **Deploy Method** で、Zilliz Cloud がタスクを進める方法を選択します。

    AWS 上で BYOC プロジェクト用のインフラストラクチャをプロビジョニングする方法は 3 つあります。次のいずれかを選択できます。

    - **Use AWS CloudFormation to provision the infrastructure.**

        AWS CloudFormation を使用してプロジェクトのデータプレーンインフラストラクチャをプロビジョニングしたい場合は、**Deploy Method** セクションで **Quickstart** タイルを選択します。これは BYOC プロジェクトを開始するための推奨方法でもあります。

        AWS CloudFormation を使用することにした場合は、**Next** をクリックすると、プロジェクトを新しい VPC にデプロイするか、既存の VPC にデプロイするかを選択するための次のダイアログボックスが表示されます。

        ![EWCsb9An2oM6dkxjCuOcM5hRnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/ewcsb9an2om6dkxjcuocm5hrnce.png "EWCsb9An2oM6dkxjCuOcM5hRnCe")

        その後、**Create Stack with CloudFormation** をクリックして、プロジェクトのデプロイを開始できます。

    - **Use a Terraform script to provision the infrastructure.**

        Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、スクリプトの出力をコピーして Zilliz Cloud に貼り戻す必要があります。詳細については、[Terraform Provider](./terraform-provider) を参照してください。 

        [Credential Settings](./deploy-byoc-aws#step-2-set-up-credentials) および [Network Settings](./deploy-byoc-aws#step-3-configure-network-settings) で指定されているように、Terraform スクリプトから返された情報を Zilliz Cloud コンソールに入力する必要がある点に注意してください。

    - **Use the AWS console to create** the **necessary resources and roles.**

        AWS コンソール上で、storage bucket や複数の IAM roles など、必要なリソースを作成する必要があります。その後、それらの名前と ID をコピーして Zilliz Cloud コンソールに貼り戻します。この方法でプロジェクトを作成したい場合は、**Deploy Method** セクションで **Manually** タイルを選択し、**Next** をクリックします。 

        Zilliz Cloud は、設定を容易にするためにプロセスを [Credential Settings](./deploy-byoc-aws#step-2-set-up-credentials) と [Network Settings](./deploy-byoc-aws#step-3-configure-network-settings) に分けています。 

1. **Next** をクリックして認証情報を設定します。

</Procedures>

### ステップ 2: 認証情報を設定する\{#step-2-set-up-credentials}

**Credential Settings** では、storage と、storage access、EKS cluster management、data-plane deployment のための複数の IAM roles を設定する必要があります。

![LEGhbUbZwoPdwSx1PjxcHBjQnab](https://zdoc-images.s3.us-west-2.amazonaws.com/leghbubzwopdwsx1pjxchbjqnab.png "LEGhbUbZwoPdwSx1PjxcHBjQnab")

<Procedures>

1. **Storage settings** で、AWS から取得した **Bucket Name** と **IAM Role ARN** を設定します。 

    Zilliz Cloud は、指定された bucket をデータプレーンの storage として使用し、指定された IAM role を使用してユーザーに代わってアクセスします。

     S3 bucket の作成手順の詳細については、[Create S3 Bucket and IAM Role](./create-bucket-and-role) を参照してください。 

1. **EKS Settings** で、EKS management 用の **IAM Role ARN** を設定します。 

    Zilliz Cloud は、指定された role を使用してユーザーに代わって EKS cluster をデプロイし、その EKS cluster 内にデータプレーンをデプロイします。

    EKS role の作成手順の詳細については、[Create EKS IAM Role](./create-eks-role) を参照してください。

1. **Cross-Account Settings** で、data-plane deployment 用の **IAM Role ARN** を設定します。

    ダイアログボックスに表示される **External ID** をコピーする必要があります。Zilliz Cloud は、指定された role を使用して Zilliz Cloud BYOC project のデータプレーンをデプロイします。 

    cross-account role の作成手順の詳細については、[Create Cross-Account IAM Role](./create-cross-account-role) を参照してください。

1. **Next** をクリックしてネットワーク設定を構成します。

</Procedures>

### ステップ 3: ネットワーク設定を構成する\{#step-3-configure-network-settings}

**Network Settings** では、VPC と、その VPC 内の subnets、security groups、および必要に応じて VPC endpoint などの各種リソースを作成します。

![NeKmbmKVhoNWcOx18IjcC1eLnDb](https://zdoc-images.s3.us-west-2.amazonaws.com/nekmbmkvhonwcox18ijcc1elndb.png "NeKmbmKVhoNWcOx18IjcC1eLnDb")

<Procedures>

1. **Network Settings** で、**VPC ID**、**Subnet IDs**、**Security Group ID**、および必要に応じて **VPC endpoint ID** を設定します。

    指定した VPC 内で、Zilliz Cloud が必要とするものは次のとおりです。

    - 1 つの public subnet と 3 つの private subnets。

    - 1 つの security group、および

    - オプションの VPC endpoint。

    **VPC Endpoint ID** は、上記の **General Settings** で **AWS PrivateLink** をオンにした場合にのみ利用可能であることに注意してください。VPC および関連リソースの作成手順の詳細については、[Configure a Customer-Managed VPC](./configure-vpc) を参照してください。

1. **Next** をクリックして概要を表示します。

1. **Deployment Summary** で、設定内容を確認します。

1. 問題がなければ **Create** をクリックします。

</Procedures>

## デプロイの詳細を表示する\{#view-deployment-details}

プロジェクトを作成すると、プロジェクトページでそのステータスを確認できます。

![Bw2Xb6wIKoXWAuxU4jOcDdAnn2e](https://zdoc-images.s3.us-west-2.amazonaws.com/bw2xb6wikoxwauxu4jocddann2e.png "Bw2Xb6wIKoXWAuxU4jOcDdAnn2e")

プロジェクトのデータプレーンをデプロイして clusters を作成した後は、直接 VPC access を使用するか、AWS PrivateLink 経由でこれらの clusters に接続できます。詳細については、[Connect to BYOC Clusters](./prepare-for-cluster-connection) を参照してください。

## Suspend と Resume\{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、そのプロジェクトを支える EKS cluster に関連付けられたすべての EC2 instances が終了します。この操作は、プロジェクト内の一時停止された Zilliz Cloud clusters には影響せず、データプレーンが復元されるとそれらを再開できます。

![G2tIwZdrsh88VrbSWsEc6iHunWe](https://zdoc-images.s3.us-west-2.amazonaws.com/G2tIwZdrsh88VrbSWsEc6iHunWe.png)

実行中のプロジェクトを一時停止できるのは、プロジェクト内に clusters が存在しない場合、またはすべての clusters がすでに一時停止されている場合のみです。

プロジェクトカードのステータスタグが **Suspended** と表示されている間は、そのプロジェクト内の clusters を操作できません。この場合、**Resume** をクリックしてプロジェクトを再開できます。ステータスタグが再び **Running** に変わると、プロジェクト内の clusters の操作を続行できます。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス作業を支援するため、Zilliz Cloud ではデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようになっています。ガバナンスやセキュリティ要件を満たすために、これを無効にすることもできます。

以下の手順では、Zilliz Cloud のテクニカルサポートから特定された問題について連絡を受けた際に、無効化していたテクニカルサポートアクセスを再度有効にする方法を示します。

<Procedures>

1. Zilliz Cloud がデータプレーン上の問題を特定し、かつテクニカルサポートアクセスを無効にしている場合、当社はそのことを通知し、テクニカルサポートアクセスを申請します。

1. 対象のデータプレーンを見つけ、データプレーンカード右下の **...** をクリックし、ドロップダウンリストから **Technical Support Access** をクリックします。

    ![TKIEwRBp0hpQL5btdvwccQGKngZ](https://zdoc-images.s3.us-west-2.amazonaws.com/TKIEwRBp0hpQL5btdvwccQGKngZ.png)

1. 表示されたダイアログボックスで、**Technical Support Access** をオンにします。

    ![SLmCwHdrNhJiw3bzf9kc5gB4nAb](https://zdoc-images.s3.us-west-2.amazonaws.com/SLmCwHdrNhJiw3bzf9kc5gB4nAb.png)

1. すると、当社がアクセスを申請する理由と、Zilliz Cloud によって割り当てられた issue owner の ID に関する情報が表示されます。**Expected Duration** でアクセス期間を決定し、必要に応じて **Description** に要件を入力できます。すべて設定したら、**Save** をクリックします。

    ![D8X5w8TZQhkN51bpoqHc09o0nue](https://zdoc-images.s3.us-west-2.amazonaws.com/D8X5w8TZQhkN51bpoqHc09o0nue.png)

1. トラブルシューティング中にダイアログボックスを開くと、このアクセスの終了時刻が表示されます。テクニカルサポートアクセスは、有効期限が切れるか、ユーザーが明示的に無効化すると再び無効になります。

    ![HL1OwXlTihXk9PbzvjbchIp0n3f](https://zdoc-images.s3.us-west-2.amazonaws.com/HL1OwXlTihXk9PbzvjbchIp0n3f.png)

</Procedures>

## 手順\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />
