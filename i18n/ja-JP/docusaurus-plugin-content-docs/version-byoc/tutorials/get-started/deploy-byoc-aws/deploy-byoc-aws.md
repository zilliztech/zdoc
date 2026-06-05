---
title: "AWS で BYOC をデプロイ | BYOC"
slug: /deploy-byoc-aws
sidebar_key: deploy-byoc-aws
sidebar_label: "AWS で BYOC をデプロイ"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、お客様の AWS Virtual Private Cloud (VPC) に完全に管理された Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。 | BYOC"
type: origin
token: DsqzwjegpiYSdtk1k75c1zXsnZc
sidebar_position: 3
keywords: 
  - zilliz
  - byoc
  - aws
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS 上に BYOC をデプロイ

このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、AWS Virtual プライベート Cloud (VPC) 内に完全に管理された Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC は現在 <strong>一般提供</strong> されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業</a>までお問い合わせください。</p></li>
<li><p>このガイドでは、AWS コンソール上で必要なリソースを段階的に作成する方法を説明します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングすることをご希望の場合は、<a href="./terraform-provider">Terraform Provider</a> を参照してください。</p></li>
</ul>

</Admonition>

## 前提条件\{#prerequisites}

- BYOC 組織オーナーである必要があります。

## 手順\{#procedure}

AWS 上に BYOC をデプロイするために、Zilliz Cloud はお客様に代わってカスタマー管理 VPC 内の S3 バケットおよび EKS クラスターにアクセスするための特定のロールを引き受ける必要があります。そのため、Zilliz Cloud は S3 バケット、EKS クラスター、VPC に関する情報と、これらのインフラストラクチャリソースにアクセスするために必要なロールを収集する必要があります。

BYOC 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。

### ステップ 1: プロジェクトを作成する\{#step-1-create-a-project}

このステップでは、プロジェクト名を設定し、クラウドプロバイダーとリージョン、初期プロジェクトサイズを決定したうえで、Zilliz Cloud がプロジェクトを作成してデータプレーンをデプロイする方法を選択します。

**Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。このステップの最後でプロジェクトが作成され、**Deploy Data Plane** ダイアログにリダイレクトされます。

![FlZqw4JI6hcTNVbWCyJcBPdFnsb](https://zdoc-images.s3.us-west-2.amazonaws.com/FlZqw4JI6hcTNVbWCyJcBPdFnsb.png)

### ステップ 2: データプレーンをデプロイする\{#step-2-deploy-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定して **Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイは中止されますが、上記で作成したプロジェクトは保持されます。プロジェクトでは後からいつでもデータプレーンのデプロイを開始でき、1つのプロジェクトに複数のデータプレーンを追加できます。

    ![W1BNwopYAht6oxb9m9FccJXDnRc](https://zdoc-images.s3.us-west-2.amazonaws.com/W1BNwopYAht6oxb9m9FccJXDnRc.png)

1. **AWS プライベートLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用に VPC エンドポイントを作成する必要があります。詳細については、[クラスター接続の準備](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

    ![EfRbwxMhIhlIKfbCaTPcPZPlnJd](https://zdoc-images.s3.us-west-2.amazonaws.com/EfRbwxMhIhlIKfbCaTPcPZPlnJd.png)

1. **アーキテクチャ** で、アプリケーションに合ったアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは **X86** と **ARM** です。

1. **リソース設定** では、以下を行う必要があります。

    1. **オートスケーリング** を有効または無効にして、Zilliz Cloud がプロジェクトのワークロードに基づいて定義された範囲内で EC2 インスタンスの数を自動的に調整できるようにし、効率的なリソース使用を確保します。

    1. **初期プロジェクトサイズ** を設定します。

        BYOC プロジェクトでは、クエリノード、階層型クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なるタイプの EC2 インスタンスを使用します。これらのサービスとコンポーネントのインスタンスタイプと数を個別に設定できます。

        **オートスケーリング** が無効の場合は、各プロジェクトコンポーネントに必要な EC2 インスタンスの数を対応する **Count** フィールドに指定するだけです。

        ![MliHb3dF5oJYGPxvhpfcLT1vnfd](https://zdoc-images.s3.us-west-2.amazonaws.com/mlihb3df5ojygpxvhpfclt1vnfd.png "MliHb3dF5oJYGPxvhpfcLT1vnfd")

        **オートスケーリング** を有効にすると、対応する **Min** および **Max** フィールドを設定することで、実際のプロジェクトワークロードに基づいて Zilliz Cloud が EC2 インスタンスの数を自動的にスケーリングする範囲を指定する必要があります。

        ![QQ4Gb1IyiowJPQxCViGcMb8pnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/qq4gb1iyiowjpqxcvigcmb8pnhb.png "QQ4Gb1IyiowJPQxCViGcMb8pnHb")

        リソース設定を容易にするため、4 つの事前定義されたプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションとプロジェクト内に作成できるクラスターの数、およびこれらのクラスターが含むことができるエンティティの数との対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスター数</p></th>
             <th colspan="2"><p>最大エンティティ数（百万）</p></th>
           </tr>
           <tr>
             <td><p>パフォーマンス最適化済み CU</p></td>
             <td><p>容量最適化済み CU</p></td>
           </tr>
           <tr>
             <td><p>小</p></td>
             <td><p>8 ～ 16 CU の 3 クラスター</p></td>
             <td><p>1000 万 ～ 2500 万</p></td>
             <td><p>4000 万 ～ 8000 万</p></td>
           </tr>
           <tr>
             <td><p>中</p></td>
             <td><p>16 ～ 64 CU の 7 クラスター</p></td>
             <td><p>2500 万 ～ 1 億</p></td>
             <td><p>8000 万 ～ 3.5 億</p></td>
           </tr>
           <tr>
             <td><p>大</p></td>
             <td><p>64 ～ 192 CU の 12 クラスター</p></td>
             <td><p>1 億 ～ 3 億</p></td>
             <td><p>3.5 億 ～ 10 億</p></td>
           </tr>
           <tr>
             <td><p>特大</p></td>
             <td><p>192 ～ 576 CU の 17 クラスター</p></td>
             <td><p>3 億 ～ 9 億</p></td>
             <td><p>10 億 ～ 30 億</p></td>
           </tr>
        </table>

        **初期プロジェクトサイズ** で **Custom** を選択し、すべてのデータプレーンコンポーネントの EC2 インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する EC2 インスタンスタイプがリストにない場合は、さらなるサポートのために [Zilliz サポートにお問い合わせ](https://zilliz.com/contact) ください。

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションにより、階層型ストレージクラスターを作成できるかどうかが決まります。このオプションを選択すると、階層型クエリノードのインスタンスタイプと数を設定できます。

        ![LWMFbm73GoM8mFxjajCcaGqPnMO](https://zdoc-images.s3.us-west-2.amazonaws.com/lwmfbm73gom8mfxjajccagqpnmo.png "LWMFbm73GoM8mFxjajCcaGqPnMO")

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p><strong>プロジェクトサイズ</strong> での選択は、<strong>Tiered Storage Node</strong> の設定には影響しません。</p></li>
        <li><p><strong>オートスケーリング</strong> が無効の場合、<strong>Default Query Node</strong> の数と <strong>Tiered Query Node</strong> の数の合計は正の整数である必要があります。</p></li>
        <li><p><strong>オートスケーリング</strong> が有効の場合、<strong>Default Query Node</strong> と <strong>Tiered Query Node</strong> の両方の <strong>Min</strong> 値の合計は正の整数である必要があります。</p></li>
        <li><p>BYOC で階層型ストレージが利用可能になる前に作成されたクラスターでは、階層型ストレージを手動で有効にできます。詳細については、<a href="./enable-tiered-storage-aws">既存クラスターで階層型ストレージを有効にする</a>を参照してください。</p></li>
        </ul>

        </Admonition>

1. **デプロイ方法** で、Zilliz Cloud がタスクを実行する方法を選択します。

    AWS 上の BYOC プロジェクト用のインフラストラクチャをプロビジョニングするには、3 つのオプションがあります。

    - **AWS CloudFormation を使用してインフラストラクチャをプロビジョニングする。**

        AWS CloudFormation を使用してプロジェクトのデータプレーンインフラストラクチャをプロビジョニングすることをご希望の場合は、**デプロイ方法** セクションで **クイックスタート** タイルを選択します。これは BYOC プロジェクトを開始するための推奨方法でもあります。

        AWS CloudFormation を使用することを決定した場合は、**Next** をクリックすると、プロジェクトを新しい VPC にデプロイするか既存の VPC にデプロイするかを選択するための次のダイアログボックスが表示されます。

        ![EWCsb9An2oM6dkxjCuOcM5hRnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/ewcsb9an2om6dkxjcuocm5hrnce.png "EWCsb9An2oM6dkxjCuOcM5hRnCe")

        次に、**Create Stack with CloudFormation** をクリックしてプロジェクトのデプロイを開始できます。

    - **Terraform スクリプトを使用してインフラストラクチャをプロビジョニングする。**

        Terraform スクリプトを使用してインフラストラクチャをプロビジョニングすることをご希望の場合は、スクリプトの出力を Zilliz Cloud にコピーして貼り付ける必要があります。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

        なお、[認証情報設定](./deploy-byoc-aws#step-2-set-up-credentials) および [ネットワーク設定](./deploy-byoc-aws#step-3-configure-network-settings) で指定されているように、Terraform スクリプトから返された情報を Zilliz Cloud コンソールに入力する必要があることに注意してください。

    - **AWS コンソールを使用して** 必要な **リソースとロールを作成する。**

        AWS コンソール上でストレージバケットや複数の IAM ロールなどの必要なリソースを作成する必要があります。次に、それらの名前と ID を Zilliz Cloud コンソールにコピーして貼り付けます。この方法でプロジェクトを作成することをご希望の場合は、**デプロイ方法** セクションで **手動で** タイルを選択し、**Next** をクリックします。

        Zilliz Cloud は、設定を容易にするために、このプロセスを [認証情報設定](./deploy-byoc-aws#step-2-set-up-credentials) と [ネットワーク設定](./deploy-byoc-aws#step-3-configure-network-settings) に分割しています。

1. 認証情報を設定するために **Next** をクリックします。

</Procedures>

### ステップ 2: 認証情報を設定する\{#step-2-set-up-credentials}

**認証情報設定** では、ストレージと、ストレージアクセス、EKS クラスター管理、およびデータプレーンデプロイメント用の複数の IAM ロールを設定する必要があります。

![LEGhbUbZwoPdwSx1PjxcHBjQnab](https://zdoc-images.s3.us-west-2.amazonaws.com/leghbubzwopdwsx1pjxchbjqnab.png "LEGhbUbZwoPdwSx1PjxcHBjQnab")

<Procedures>

1. **ストレージ設定** で、AWS から取得した **バケット名** と **IAM ロール ARN** を設定します。

    Zilliz Cloud は、指定されたバケットをデータプレーンストレージとして使用し、指定された IAM ロールを使用してお客様に代わってアクセスします。

     S3 バケットの作成手順の詳細については、[S3 バケットと IAM ロールの作成](./create-bucket-and-role) をお読みください。

1. **EKS 設定** で、EKS 管理用の **IAM ロール ARN** を設定します。

    Zilliz Cloud は、指定されたロールを使用してお客様に代わって EKS クラスターをデプロイし、EKS クラスター内にデータプレーンをデプロイします。

    EKS ロールの作成手順の詳細については、[EKS IAM ロールの作成](./create-eks-role) をお読みください。

1. **クロスアカウント設定** で、データプレーンデプロイメント用の **IAM ロール ARN** を設定します。

    ダイアログボックスに表示された **外部ID** をコピーする必要があります。Zilliz Cloud は、指定されたロールを使用して Zilliz Cloud BYOC プロジェクトのデータプレーンをデプロイします。

    クロスアカウントロールの作成手順の詳細については、[クロスアカウント IAM ロールの作成](./create-cross-account-role) をお読みください。

1. ネットワーク設定を構成するために **Next** をクリックします。

</Procedures>

### ステップ 3: ネットワーク設定を構成する\{#step-3-configure-network-settings}

**ネットワーク設定** では、VPC を作成し、その VPC 内にサブネット、セキュリティグループ、およびオプションの VPC エンドポイントなど、複数のタイプのリソースを作成します。

![NeKmbmKVhoNWcOx18IjcC1eLnDb](https://zdoc-images.s3.us-west-2.amazonaws.com/nekmbmkvhonwcox18ijcc1elndb.png "NeKmbmKVhoNWcOx18IjcC1eLnDb")

<Procedures>

1. **ネットワーク設定** で、**VPC ID**、**サブネットID**、**セキュリティグループID**、およびオプションの **VPC エンドポイントID** を設定します。

    指定された VPC 内で、Zilliz Cloud には以下が必要です。

    - パブリックサブネット 1 つとプライベートサブネット 3 つ。

    - セキュリティグループ 1 つ、および

    - オプションの VPC エンドポイント。

    なお、**VPC エンドポイントID** は、上記の **一般設定** で **AWS プライベートLink** をオンにした場合にのみ利用可能です。VPC とその関連リソースの作成手順の詳細については、[カスタマー管理 VPC の設定](./configure-vpc) を参照してください。

1. 概要を表示するために **Next** をクリックします。

1. **デプロイ概要** で、構成設定を確認します。

1. すべてが期待どおりであれば、**Create** をクリックします。

</Procedures>

## デプロイ詳細を表示する\{#view-deployment-details}

プロジェクトを作成した後、プロジェクトページでそのステータスを確認できます。

![Bw2Xb6wIKoXWAuxU4jOcDdAnn2e](https://zdoc-images.s3.us-west-2.amazonaws.com/bw2xb6wikoxwauxu4jocddann2e.png "Bw2Xb6wIKoXWAuxU4jOcDdAnn2e")

プロジェクトのデータプレーンをデプロイし、クラスターを作成した後、これらのクラスターには直接 VPC アクセスまたは AWS プライベートLink 経由で接続できます。詳細については、[BYOC クラスターへの接続](./prepare-for-cluster-connection) を参照してください。

## 一時停止と再開\{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、プロジェクトをサポートする EKS クラスターに関連付けられたすべての EC2 インスタンスが終了します。この操作は、プロジェクト内の一時停止された Zilliz Cloud クラスターには影響せず、データプレーンが復元されると再開できます。

![G2tIwZdrsh88VrbSWsEc6iHunWe](https://zdoc-images.s3.us-west-2.amazonaws.com/G2tIwZdrsh88VrbSWsEc6iHunWe.png)

プロジェクト内にクラスターがないか、すべてのクラスターがすでに一時停止されている場合にのみ、実行中のプロジェクトを一時停止できます。

プロジェクトカードのステータスタグが **一時停止ed** と表示されると、プロジェクト内のクラスターを操作できなくなります。この場合、**Resume** をクリックしてプロジェクトを再開できます。ステータスタグが再び **Running** に変わると、プロジェクト内のクラスターの操作を続行できます。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス操作を支援するため、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようにしています。

![TKIEwRBp0hpQL5btdvwccQGKngZ](https://zdoc-images.s3.us-west-2.amazonaws.com/TKIEwRBp0hpQL5btdvwccQGKngZ.png)

対象プロジェクトのドロップダウンメニューから **テクニカルサポートアクセス** をクリックすると、現在の設定を表示できます。データガバナンスおよびセキュリティ要件を満たすために、これを無効にできます。

## 手順\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />
