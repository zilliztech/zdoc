---
title: "AWS に BYOC をデプロイ | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "AWS に BYOC をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、AWS Virtual Private Cloud (VPC) に完全マネージドな Bring-Your-Own-Cloud (BYOC) data plane を手動で作成する方法について説明します。 | BYOC"
type: origin
token: DsqzwjegpiYSdtk1k75c1zXsnZc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS に BYOC をデプロイ

このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、AWS Virtual Private Cloud (VPC) に完全マネージドな Bring-Your-Own-Cloud (BYOC) data plane を手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

- Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud 営業](https://zilliz.com/contact-sales)までお問い合わせください。

- このガイドでは、AWS コンソールで必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## Prerequisites\{#prerequisites}

- BYOC organization owner である必要があります。

## Procedure\{#procedure}

AWS に BYOC をデプロイするために、Zilliz Cloud はお客様が管理する VPC 内の S3 バケットおよび EKS cluster に、お客様に代わってアクセスするための特定のロールを引き受ける必要があります。したがって、Zilliz Cloud は、お客様の S3 バケット、EKS cluster、VPC、およびこれらのインフラストラクチャリソースにアクセスするために必要なロールに関する情報を収集する必要があります。

BYOC organization 内で、**Create Project** ボタンをクリックしてデプロイを開始します。

### Step 1: Create a project\{#step-1-create-a-project}

このステップでは、プロジェクト名を設定し、cloud provider と region、および初期プロジェクトサイズを決定し、Zilliz Cloud がプロジェクトを作成して data plane をデプロイする方法を選択する必要があります。

**Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。プロジェクトはこのステップの最後に作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![FlZqw4JI6hcTNVbWCyJcBPdFnsb](https://zdoc-images.s3.us-west-2.amazonaws.com/FlZqw4JI6hcTNVbWCyJcBPdFnsb.png)

### Step 2: Deploy the data plane\{#step-2-deploy-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックすると data plane のデプロイを停止できます。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内でいつでも data plane のデプロイを開始でき、1 つのプロジェクトに複数の data plane を追加できます。 

    ![W1BNwopYAht6oxb9m9FccJXDnRc](https://zdoc-images.s3.us-west-2.amazonaws.com/W1BNwopYAht6oxb9m9FccJXDnRc.png)

1. **AWS PrivateLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内の cluster へのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続のために VPC Endpoint を作成する必要があります。詳細については、[Prepare for Cluster Connection](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

    ![EfRbwxMhIhlIKfbCaTPcPZPlnJd](https://zdoc-images.s3.us-west-2.amazonaws.com/EfRbwxMhIhlIKfbCaTPcPZPlnJd.png)

1. **Architecture** で、アプリケーションに適した architecture type を選択します。 

    これにより、使用する Zilliz BYOC image の architecture type が決まります。利用可能なオプションは **X86** と **ARM** です。

1.  **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義された範囲内でプロジェクトのワークロードに基づき、EC2 インスタンス数を Zilliz Cloud が自動調整できるようにし、効率的なリソース利用を実現します。

    1. **Initial Project Size** を構成します。 

        BYOC プロジェクトでは、query node、tiered query node、index services、Milvus コンポーネント、および依存関係が、それぞれ異なるタイプの EC2 インスタンスを使用します。これらのサービスおよびコンポーネントについて、インスタンスタイプと数を個別に設定できます。 

        **Auto-scaling** が無効の場合は、各プロジェクトコンポーネントに必要な EC2 インスタンス数を、対応する **Count** フィールドで指定するだけです。

        ![MliHb3dF5oJYGPxvhpfcLT1vnfd](https://zdoc-images.s3.us-west-2.amazonaws.com/mlihb3df5ojygpxvhpfclt1vnfd.png "MliHb3dF5oJYGPxvhpfcLT1vnfd")

        **Auto-scaling** を有効にすると、対応する **Min** および **Max** フィールドを設定して、実際のプロジェクトワークロードに基づいて EC2 インスタンス数を Zilliz Cloud が自動スケーリングできる範囲を指定する必要があります。

        ![QQ4Gb1IyiowJPQxCViGcMb8pnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/qq4gb1iyiowjpqxcvigcmb8pnhb.png "QQ4Gb1IyiowJPQxCViGcMb8pnHb")

        リソース設定を容易にするために、4 つの事前定義されたプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成できる cluster 数、およびそれらの cluster に含められる entity 数との対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>cluster の最大数</p></th>
             <th colspan="3"><p>entity の最大数（百万）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8 ～ 16 CU の cluster を 3 個</p></td>
             <td><p>1600 万 - 3200 万</p></td>
             <td><p>6400 万 - 1億2800 万</p></td>
             <td><p>3億2000 万 - 6億4000 万</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CU の cluster を 7 個</p></td>
             <td><p>3200 万 - 1億2800 万</p></td>
             <td><p>1億2800 万 - 5億1200 万</p></td>
             <td><p>6億4000 万 - 26億</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CU の cluster を 12 個</p></td>
             <td><p>1億2800 万 - 3億8400 万</p></td>
             <td><p>5億1200 万 - 15億</p></td>
             <td><p>26億 - 77億</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CU の cluster を 17 個</p></td>
             <td><p>3億8400 万 - 12億</p></td>
             <td><p>15億 -  46億</p></td>
             <td><p>77億 - 230億</p></td>
           </tr>
        </table>

        **Initial Project Size** で **Custom** を選択し、すべての data plane コンポーネントの EC2 インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する EC2 インスタンスタイプが一覧にない場合は、さらにサポートを受けるために [Zilliz support](https://zilliz.com/contact) までお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションは、tiered-storage cluster を作成できるかどうかを決定します。このオプションを選択すると、tiered query node のインスタンスタイプと数を設定できます。 

        ![LWMFbm73GoM8mFxjajCcaGqPnMO](https://zdoc-images.s3.us-west-2.amazonaws.com/lwmfbm73gom8mfxjajccagqpnmo.png "LWMFbm73GoM8mFxjajCcaGqPnMO")

        <Admonition type="info" icon="📘" title="注意">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効の場合、**Default Query Node** の数と **Tiered Query Node** の数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効の場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。
        
        - BYOC で Tiered Storage が利用可能になる前に作成された cluster については、Tiered Storage を手動で有効にできます。詳細については、[Enable Tiered Storage for Exisiting Clusters](./enable-tiered-storage-aws) を参照してください。

        </Admonition>

1. **Deploy Method** で、Zilliz Cloud がタスクを実行する方法を選択します。

    AWS 上の BYOC プロジェクトのインフラストラクチャをプロビジョニングするには、3 つのオプションがあります。次のいずれかを選択できます。

    - **Use AWS CloudFormation to provision the infrastructure.**

        AWS CloudFormation を使用してプロジェクトの data plane インフラストラクチャをプロビジョニングしたい場合は、**Deploy Method** セクションで **Quickstart** タイルを選択します。これは、BYOC プロジェクトを開始する際に推奨される方法でもあります。

        AWS CloudFormation を使用する場合は、**Next** をクリックします。すると、プロジェクトを新しい VPC にデプロイするか、既存の VPC にデプロイするかを選択するための次のダイアログボックスが表示されます。

        ![EWCsb9An2oM6dkxjCuOcM5hRnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/ewcsb9an2om6dkxjcuocm5hrnce.png "EWCsb9An2oM6dkxjCuOcM5hRnCe")

        その後、**Create Stack with CloudFormation** をクリックして、プロジェクトのデプロイを開始できます。

    - **Use a Terraform script to provision the infrastructure.**

        Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、スクリプトの出力をコピーして Zilliz Cloud に貼り付ける必要があります。詳細については、[Terraform Provider](./terraform-provider) を参照してください。 

        [Credential Settings](./deploy-byoc-aws#step-2-set-up-credentials) および [Network Settings](./deploy-byoc-aws#step-3-configure-network-settings) に記載されているように、Terraform スクリプトから返された情報を Zilliz Cloud コンソールに入力する必要がある点に注意してください。

    - **Use the AWS console to create** the **necessary resources and roles.**

        AWS コンソールで、ストレージバケットや複数の IAM ロールなど、必要なリソースを作成する必要があります。その後、それらの名前と ID をコピーして Zilliz Cloud コンソールに貼り付けます。この方法でプロジェクトを作成したい場合は、**Deploy Method** セクションで **Manually** タイルを選択し、**Next** をクリックします。 

        Zilliz Cloud では、設定を容易にするために、このプロセスを [Credential Settings](./deploy-byoc-aws#step-2-set-up-credentials) と [Network Settings](./deploy-byoc-aws#step-3-configure-network-settings) に分けています。 

1. **Next** をクリックして認証情報を設定します。

</Procedures>

### Step 2: Set up credentials\{#step-2-set-up-credentials}

**Credential Settings** では、ストレージと、ストレージアクセス、EKS cluster 管理、data-plane デプロイメントのための複数の IAM ロールを設定する必要があります。

![LEGhbUbZwoPdwSx1PjxcHBjQnab](https://zdoc-images.s3.us-west-2.amazonaws.com/leghbubzwopdwsx1pjxchbjqnab.png "LEGhbUbZwoPdwSx1PjxcHBjQnab")

<Procedures>

1. **Storage settings** で、AWS から取得した **Bucket Name** と **IAM Role ARN** を設定します。 

    Zilliz Cloud は、指定されたバケットを data-plane ストレージとして使用し、指定された IAM ロールを使ってお客様に代わってアクセスします。

     S3 バケット作成手順の詳細については、[Create S3 Bucket and IAM Role](./create-bucket-and-role) を参照してください。 

1. **EKS Settings** で、EKS 管理用の **IAM Role ARN** を設定します。 

    Zilliz Cloud は、指定されたロールを使用してお客様に代わって EKS cluster をデプロイし、その EKS cluster 内に data plane をデプロイします。

    EKS ロール作成手順の詳細については、[Create EKS IAM Role](./create-eks-role) を参照してください。

1. **Cross-Account Settings** で、data-plane デプロイメント用の **IAM Role ARN** を設定します。

    ダイアログボックスに表示される **External ID** をコピーする必要があります。Zilliz Cloud は、指定されたロールを使用して Zilliz Cloud BYOC プロジェクトの data plane をデプロイします。 

    クロスアカウントロール作成手順の詳細については、[Create Cross-Account IAM Role](./create-cross-account-role) を参照してください。

1. **Next** をクリックしてネットワーク設定を構成します。

</Procedures>

### Step 3: Configure network settings\{#step-3-configure-network-settings}

**Network Settings** では、VPC と、subnet、security group、オプションの VPC endpoint など複数の種類のリソースを VPC 内に作成します。

![NeKmbmKVhoNWcOx18IjcC1eLnDb](https://zdoc-images.s3.us-west-2.amazonaws.com/nekmbmkvhonwcox18ijcc1elndb.png "NeKmbmKVhoNWcOx18IjcC1eLnDb")

<Procedures>

1. **Network Settings** で、**VPC ID**、**Subnet IDs**、**Security Group ID**、およびオプションの **VPC endpoint ID** を設定します。

    指定された VPC 内で、Zilliz Cloud が必要とするものは次のとおりです。 

    - 1 つの public subnet と 3 つの private subnet。

    - 1 つの security group、および

    - オプションの VPC endpoint。

    **VPC Endpoint ID** は、上記 **General Settings** で **AWS PrivateLink** をオンにした場合にのみ利用可能である点に注意してください。VPC とその関連リソースの作成手順の詳細については、[Configure a Customer-Managed VPC](./configure-vpc) を参照してください。

1. **Next** をクリックして概要を表示します。

1. **Deployment Summary** で、構成設定を確認します。

1. すべて問題なければ **Create** をクリックします。

</Procedures>

## View deployment details\{#view-deployment-details}

プロジェクトを作成した後、プロジェクトページでそのステータスを確認できます。

![Bw2Xb6wIKoXWAuxU4jOcDdAnn2e](https://zdoc-images.s3.us-west-2.amazonaws.com/bw2xb6wikoxwauxu4jocddann2e.png "Bw2Xb6wIKoXWAuxU4jOcDdAnn2e")

プロジェクトの data plane をデプロイし、cluster を作成した後は、直接 VPC アクセスまたは AWS PrivateLink のいずれかを通じてこれらの cluster に接続できます。詳細については、[Connect to BYOC Clusters](./prepare-for-cluster-connection) を参照してください。

## Suspend & Resume\{#suspend-and-resume}

プロジェクトを一時停止すると、data plane が停止し、そのプロジェクトを支える EKS cluster に関連付けられたすべての EC2 インスタンスが終了します。この操作は、プロジェクト内の一時停止された Zilliz Cloud cluster には影響せず、data plane が復旧するとそれらを再開できます。

![G2tIwZdrsh88VrbSWsEc6iHunWe](https://zdoc-images.s3.us-west-2.amazonaws.com/G2tIwZdrsh88VrbSWsEc6iHunWe.png)

実行中のプロジェクトを一時停止できるのは、プロジェクト内に cluster が存在しない場合、またはすべての cluster がすでに一時停止されている場合のみです。

プロジェクトカード上のステータスタグが **Suspended** と表示されている間は、そのプロジェクト内の cluster を操作できません。その場合は、**Resume** をクリックしてプロジェクトを再開できます。ステータスタグが再び **Running** になったら、プロジェクト内の cluster の操作を続行できます。

## Technical support access\{#technical-support-access}

トラブルシューティングおよび保守作業を支援するために、Zilliz Cloud ではデフォルトで technical support がプロジェクトの data plane にアクセスできるようになっています。 

![TKIEwRBp0hpQL5btdvwccQGKngZ](https://zdoc-images.s3.us-west-2.amazonaws.com/TKIEwRBp0hpQL5btdvwccQGKngZ.png)

対象プロジェクトのドロップダウンメニューから **Technical Support Access** をクリックすると、現在の設定を確認できます。データガバナンスやセキュリティ要件に合わせて、これを無効にすることもできます。

## Procedures\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />
