---
title: "AWS に BYOC をデプロイする | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "AWS に BYOC をデプロイする"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、AWS Virtual Private Cloud (VPC) 内に完全マネージドの Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。 | BYOC"
type: origin
token: DsqzwjegpiYSdtk1k75c1zXsnZc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS に BYOC をデプロイする

このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、AWS Virtual Private Cloud (VPC) 内に完全マネージドの Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。

<Admonition type="info" title="Notes">

- Zilliz BYOC は現在 **General Availability** で提供されています。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) にお問い合わせください。

- このガイドでは、AWS コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングする場合は、[Terraform Provider](./terraform-provider) を参照してください。

</Admonition>

## 事前準備\{#prerequisites}

- BYOC 組織のオーナーであること。

## 手順\{#procedure}

AWS に BYOC をデプロイするには、Zilliz Cloud が、カスタマー管理の VPC 内にある S3 バケットおよび EKS クラスターにアクセスできるよう、お客様に代わって特定のロールを引き受ける必要があります。そのため、Zilliz Cloud は、これらのインフラストラクチャリソースにアクセスするために必要なロールとともに、S3 バケット、EKS クラスター、および VPC に関する情報を収集する必要があります。

BYOC 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。

### ステップ 1: プロジェクトを作成する\{#step-1-create-a-project}

このステップでは、プロジェクト名を設定し、クラウドプロバイダーとリージョン、および初期プロジェクトサイズを決定し、Zilliz Cloud がプロジェクトを作成してデータプレーンをデプロイする方法を選択する必要があります。

**Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。プロジェクトはこのステップの最後に作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![FlZqw4JI6hcTNVbWCyJcBPdFnsb](https://zdoc-images.s3.us-west-2.amazonaws.com/FlZqw4JI6hcTNVbWCyJcBPdFnsb.png)

### ステップ 2: データプレーンをデプロイする\{#step-2-deploy-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイを停止します。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内でデータプレーンのデプロイはいつでも開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。

    ![W1BNwopYAht6oxb9m9FccJXDnRc](https://zdoc-images.s3.us-west-2.amazonaws.com/W1BNwopYAht6oxb9m9FccJXDnRc.png)

1. **AWS PrivateLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用の VPC エンドポイントを作成する必要があります。詳細については、[クラスター接続の準備](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

    ![EfRbwxMhIhlIKfbCaTPcPZPlnJd](https://zdoc-images.s3.us-west-2.amazonaws.com/EfRbwxMhIhlIKfbCaTPcPZPlnJd.png)

1. **Architecture** で、アプリケーションに適したアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1. **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義した範囲内でプロジェクトのワークロードに基づき EC2 インスタンス数を Zilliz Cloud が自動調整できるようにし、効率的なリソース利用を実現します。

    1. **Initial Project Size** を構成します。

        BYOC プロジェクトでは、クエリノード、階層型クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係で異なるタイプの EC2 インスタンスを使用します。これらのサービスおよびコンポーネントごとに、インスタンスタイプと台数を個別に設定できます。

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な EC2 インスタンス数を対応する **Count** フィールドに指定するだけです。

        ![MliHb3dF5oJYGPxvhpfcLT1vnfd](https://zdoc-images.s3.us-west-2.amazonaws.com/mlihb3df5ojygpxvhpfclt1vnfd.png "MliHb3dF5oJYGPxvhpfcLT1vnfd")

        **Auto-scaling** を有効にすると、対応する **Min** および **Max** フィールドを設定して、実際のプロジェクトワークロードに基づき Zilliz Cloud が EC2 インスタンス数を自動スケールできるように範囲を指定する必要があります。

        ![QQ4Gb1IyiowJPQxCViGcMb8pnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/qq4gb1iyiowjpqxcvigcmb8pnhb.png "QQ4Gb1IyiowJPQxCViGcMb8pnHb")

        リソース設定を容易にするため、事前定義されたプロジェクトサイズオプションが 4 つ用意されています。次の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成可能なクラスター数、およびそれらのクラスターに含められるエンティティ数との対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスター数</p></th>
             <th colspan="3"><p>最大エンティティ数（百万）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8 ～ 16 CU のクラスターを 3 個</p></td>
             <td><p>1600 万 - 3200 万</p></td>
             <td><p>6400 万 - 1 億 2800 万</p></td>
             <td><p>3 億 2000 万 - 6 億 4000 万</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CU のクラスターを 7 個</p></td>
             <td><p>3200 万 - 1 億 2800 万</p></td>
             <td><p>1 億 2800 万 - 5 億 1200 万</p></td>
             <td><p>6 億 4000 万 - 26 億</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CU のクラスターを 12 個</p></td>
             <td><p>1 億 2800 万 - 3 億 8400 万</p></td>
             <td><p>5 億 1200 万 - 15 億</p></td>
             <td><p>26 億 - 77 億</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CU のクラスターを 17 個</p></td>
             <td><p>3 億 8400 万 - 12 億</p></td>
             <td><p>15 億 -  46 億</p></td>
             <td><p>77 億 - 230 億</p></td>
           </tr>
        </table>

        **Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントの EC2 インスタンスタイプと台数を調整することで、設定をカスタマイズすることもできます。ご希望の EC2 インスタンスタイプが一覧にない場合は、追加のサポートについて [Zilliz support](https://zilliz.com/contact) までお問い合わせください。

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションは、階層型ストレージクラスターを作成できるかどうかを決定します。このオプションを選択すると、階層型クエリノードのインスタンスタイプと台数を設定できます。

        ![LWMFbm73GoM8mFxjajCcaGqPnMO](https://zdoc-images.s3.us-west-2.amazonaws.com/lwmfbm73gom8mfxjajccagqpnmo.png "LWMFbm73GoM8mFxjajCcaGqPnMO")

        <Admonition type="info" title="Notes">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。

        - **Auto-scaling** が無効な場合、**Default Query Node** の数と **Tiered Query Node** の数の合計は正の整数である必要があります。

        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。

        - BYOC で階層型ストレージが利用可能になる前に作成されたクラスターでは、階層型ストレージを手動で有効にできます。詳細については、[既存クラスターで階層型ストレージを有効にする](./enable-tiered-storage-aws) を参照してください。

        </Admonition>

1. **Deploy Method** で、Zilliz Cloud がタスクを実行する方法を選択します。

    AWS 上の BYOC プロジェクトのインフラストラクチャをプロビジョニングする方法には、3 つのオプションがあります。次のいずれかを選択できます。

    - **AWS CloudFormation を使用してインフラストラクチャをプロビジョニングします。**

        AWS CloudFormation を使用してプロジェクトのデータプレーンインフラストラクチャをプロビジョニングする場合は、**Deploy Method** セクションで **Quickstart** タイルを選択します。これは、BYOC プロジェクトを開始するための推奨方法でもあります。

        AWS CloudFormation を使用する場合は、**Next** をクリックすると、プロジェクトを新しい VPC にデプロイするか既存の VPC にデプロイするかを選択する次のダイアログボックスが表示されます。

        ![EWCsb9An2oM6dkxjCuOcM5hRnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/ewcsb9an2om6dkxjcuocm5hrnce.png "EWCsb9An2oM6dkxjCuOcM5hRnCe")

        その後、**Create Stack with CloudFormation** をクリックしてプロジェクトのデプロイを開始できます。

    - **Terraform スクリプトを使用してインフラストラクチャをプロビジョニングします。**

        Terraform スクリプトを使用してインフラストラクチャをプロビジョニングする場合は、スクリプトの出力をコピーして Zilliz Cloud に貼り付ける必要があります。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

        [Credential Settings](./deploy-byoc-aws#step-2-set-up-credentials) および [Network Settings](./deploy-byoc-aws#step-3-configure-network-settings) に記載されているとおり、Terraform スクリプトから返された情報を Zilliz Cloud コンソールに入力する必要があることに注意してください。

    - **AWS コンソールを使用して**、**必要なリソースとロールを作成します。**

        AWS コンソールで、ストレージバケットや複数の IAM ロールなど、必要なリソースを作成する必要があります。その後、それらの名前と ID をコピーして Zilliz Cloud コンソールに貼り付けます。この方法でプロジェクトを作成する場合は、**Deploy Method** セクションで **Manually** タイルを選択し、**Next** をクリックします。

        設定を容易にするために、Zilliz Cloud ではプロセスを [Credential Settings](./deploy-byoc-aws#step-2-set-up-credentials) と [Network Settings](./deploy-byoc-aws#step-3-configure-network-settings) に分割しています。

1. **Next** をクリックして認証情報を設定します。

</Procedures>

### ステップ 2: 認証情報を設定する\{#step-2-set-up-credentials}

**Credential Settings** では、ストレージ、およびストレージアクセス、EKS クラスター管理、データプレーンのデプロイに使用する複数の IAM ロールを設定する必要があります。

![LEGhbUbZwoPdwSx1PjxcHBjQnab](https://zdoc-images.s3.us-west-2.amazonaws.com/leghbubzwopdwsx1pjxchbjqnab.png "LEGhbUbZwoPdwSx1PjxcHBjQnab")

<Procedures>

1. **Storage settings** で、AWS から取得した **Bucket Name** と **IAM Role ARN** を設定します。

    Zilliz Cloud は、指定されたバケットをデータプレーンのストレージとして使用し、指定された IAM ロールを使用してお客様に代わってアクセスします。

     S3 バケットを作成する手順の詳細については、[S3 バケットと IAM ロールの作成](./create-bucket-and-role) を参照してください。

1. **EKS Settings** で、EKS 管理用の **IAM Role ARN** を設定します。

    Zilliz Cloud は、指定されたロールを使用して、お客様に代わって EKS クラスターをデプロイし、その EKS クラスターにデータプレーンをデプロイします。

    EKS ロールを作成する手順の詳細については、[EKS IAM ロールの作成](./create-eks-role) を参照してください。

1. **Cross-Account Settings** で、データプレーンのデプロイ用の **IAM Role ARN** を設定します。

    ダイアログボックスに表示される **External ID** をコピーする必要があります。Zilliz Cloud は、指定されたロールを使用して、Zilliz Cloud BYOC プロジェクトのデータプレーンをデプロイします。

    クロスアカウントロールを作成する手順の詳細については、[クロスアカウント IAM ロールの作成](./create-cross-account-role) を参照してください。

1. **Next** をクリックしてネットワーク設定を構成します。

</Procedures>

### ステップ 3: ネットワーク設定を構成する\{#step-3-configure-network-settings}

**Network Settings** では、VPC と、サブネット、セキュリティグループ、オプションの VPC エンドポイントなど、VPC 内のいくつかの種類のリソースを作成します。

![NeKmbmKVhoNWcOx18IjcC1eLnDb](https://zdoc-images.s3.us-west-2.amazonaws.com/nekmbmkvhonwcox18ijcc1elndb.png "NeKmbmKVhoNWcOx18IjcC1eLnDb")

<Procedures>

1. **Network Settings** で、**VPC ID**、**Subnet IDs**、**Security Group ID**、およびオプションの **VPC endpoint ID** を設定します。

    指定した VPC では、Zilliz Cloud は次のものを必要とします。

    - パブリックサブネット 1 つとプライベートサブネット 3 つ。

    - セキュリティグループ。

    - オプションの VPC エンドポイント。

    **VPC Endpoint ID** は、上記の **General Settings** で **AWS PrivateLink** をオンにした場合にのみ利用できます。VPC とその関連リソースを作成する手順の詳細については、[AWS でカスタマー管理 VPC を設定する](./configure-vpc) を参照してください。

1. **Next** をクリックして概要を表示します。

1. **Deployment Summary** で、構成設定を確認します。

1. すべてが想定どおりであれば、**Create** をクリックします。

</Procedures>

## デプロイの詳細を表示する\{#view-deployment-details}

プロジェクトを作成すると、プロジェクトページでそのステータスを表示できます。

![Bw2Xb6wIKoXWAuxU4jOcDdAnn2e](https://zdoc-images.s3.us-west-2.amazonaws.com/bw2xb6wikoxwauxu4jocddann2e.png "Bw2Xb6wIKoXWAuxU4jOcDdAnn2e")

プロジェクトのデータプレーンをデプロイしてクラスターを作成した後は、直接 VPC アクセスまたは AWS PrivateLink のいずれかを通じてこれらのクラスターに接続できます。詳細については、[BYOC クラスターへの接続](./prepare-for-cluster-connection) を参照してください。

## 一時停止と再開\{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、そのプロジェクトを支える EKS クラスターに関連付けられたすべての EC2 インスタンスが終了します。この操作は、プロジェクト内の一時停止された Zilliz Cloud クラスターには影響しません。これらのクラスターは、データプレーンが復旧すると再開できます。

![G2tIwZdrsh88VrbSWsEc6iHunWe](https://zdoc-images.s3.us-west-2.amazonaws.com/G2tIwZdrsh88VrbSWsEc6iHunWe.png)

実行中のプロジェクトを一時停止できるのは、プロジェクト内にクラスターが存在しない場合、またはすべてのクラスターがすでに一時停止されている場合のみです。

プロジェクトカードのステータスタグが **Suspended** と表示されると、そのプロジェクト内のクラスターを操作できなくなります。その場合は、**Resume** をクリックしてプロジェクトを再開できます。ステータスタグが再び **Running** になると、プロジェクト内のクラスターの操作を続行できます。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよび保守作業を支援するために、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようにしています。ガバナンスおよびセキュリティ要件を満たすために、これを無効にすることもできます。

次の手順では、特定された問題について Zilliz Cloud テクニカルサポートから連絡を受けた際に、無効化していたテクニカルサポートアクセスを再度有効にする方法を示します。

<Procedures>

1. Zilliz Cloud がデータプレーン上の問題を特定し、かつテクニカルサポートアクセスが無効になっている場合、当社はその旨を通知し、テクニカルサポートアクセスを申請します。

1. 対象のデータプレーンを見つけ、データプレーンカード右下の **...** をクリックし、ドロップダウンリストから **Technical Support Access** をクリックします。

    ![TKIEwRBp0hpQL5btdvwccQGKngZ](https://zdoc-images.s3.us-west-2.amazonaws.com/TKIEwRBp0hpQL5btdvwccQGKngZ.png)

1. 表示されたダイアログボックスで、**Technical Support Access** をオンにします。

    ![SLmCwHdrNhJiw3bzf9kc5gB4nAb](https://zdoc-images.s3.us-west-2.amazonaws.com/SLmCwHdrNhJiw3bzf9kc5gB4nAb.png)

1. すると、当社がアクセスを申請する理由と、Zilliz Cloud によって割り当てられた問題担当者の ID に関する情報が表示されます。**Expected Duration** でアクセス期間を決定し、**Description** に任意の要件を入力できます。すべて設定したら、**Save** をクリックします。

    ![D8X5w8TZQhkN51bpoqHc09o0nue](https://zdoc-images.s3.us-west-2.amazonaws.com/D8X5w8TZQhkN51bpoqHc09o0nue.png)

1. トラブルシューティング中にこのダイアログボックスを開くと、このアクセスの終了時刻が表示されます。テクニカルサポートアクセスは、有効期限が切れるか、明示的に無効にすると再び無効になります。

    ![HL1OwXlTihXk9PbzvjbchIp0n3f](https://zdoc-images.s3.us-west-2.amazonaws.com/HL1OwXlTihXk9PbzvjbchIp0n3f.png)

</Procedures>

## 手順\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />
