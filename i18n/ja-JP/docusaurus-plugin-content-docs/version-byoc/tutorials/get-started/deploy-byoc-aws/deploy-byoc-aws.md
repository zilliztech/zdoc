---
title: "AWS での BYOC のデプロイ | BYOC"
slug: /deploy-byoc-aws
sidebar_key: deploy-byoc-aws
sidebar_label: "AWS での BYOC のデプロイ"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、お客様の AWS Virtual Private Cloud (VPC) 内に完全に管理された Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。| BYOC"
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

# AWS での BYOC のデプロイ

このページでは、Zilliz Cloud コンソールとカスタム AWS 設定を使用して、お客様の AWS Virtual プライベート Cloud (VPC) 内に完全に管理された Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC は現在<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当者</a>までお問い合わせください。</p></li>
<li><p>このガイドでは、AWS コンソールで必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングすることを希望される場合は、<a href="./terraform-provider">Terraform Provider</a> をご覧ください。</p></li>
</ul>

</Admonition>

## 前提条件\{#prerequisites}

- BYOC 組織オーナーである必要があります。

## 手順\{#procedure}

AWS に BYOC をデプロイするには、Zilliz Cloud がお客様に代わって顧客管理下の VPC 内にある S3 バケットおよび EKS クラスターにアクセスするために、特定のロールを引き受ける必要があります。その結果、Zilliz Cloud は、お客様の S3 バケット、EKS クラスター、VPC に関する情報と、これらのインフラストラクチャリソースにアクセスするために必要なロールを取得する必要があります。

BYOC 組織内で、**プロジェクトの作成とデータプレーンのデプロイ**ボタンをクリックしてデプロイを開始します。

![XtlJbBTIboHNbixzfqpc7H3nnvb](https://zdoc-images.s3.us-west-2.amazonaws.com/xtljbbtibohnbixzfqpc7h3nnvb.png "XtlJbBTIboHNbixzfqpc7H3nnvb")

### ステップ 1: プロジェクトの作成\{#step-1-create-a-project}

このステップでは、プロジェクト名の設定、クラウドプロバイダーとリージョンの決定、初期プロジェクトサイズの指定、および Zilliz Cloud によるプロジェクト作成とデータプレーンデプロイの方法の選択を行います。

![Jo6Rw1WoBhBchRbBOMmcRBC3nsd](https://zdoc-images.s3.us-west-2.amazonaws.com/Jo6Rw1WoBhBchRbBOMmcRBC3nsd.png)

<Procedures>

1. **プロジェクト名**を設定します。

1. **クラウドプロバイダー**と**リージョン**を選択します。

1. **AWS プライベートLink**を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合、プライベート接続用の VPC エンドポイントを作成する必要があります。詳細については、[クラスター接続の準備](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

1. **アーキテクチャ**で、アプリケーションに適合するアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは**X86**および**ARM**です。

1. **リソース設定**で、以下の操作を行います。

    1. **オートスケーリング**を有効または無効にして、Zilliz Cloud がプロジェクトのワークロードに基づいて定義された範囲内で EC2 インスタンス数を自動的に調整できるようにし、リソースの効率的な使用を確保します。

    1. **初期プロジェクトサイズ**を設定します。

        BYOC プロジェクトでは、クエリノード、ティアードクエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なるタイプの EC2 インスタンスを使用します。これらのサービスおよびコンポーネントごとにインスタンスタイプと数を個別に設定できます。

        **オートスケーリング**が無効になっている場合は、各プロジェクトコンポーネントに必要な EC2 インスタンス数を対応する**数**フィールドに指定するだけです。

        ![MliHb3dF5oJYGPxvhpfcLT1vnfd](https://zdoc-images.s3.us-west-2.amazonaws.com/mlihb3df5ojygpxvhpfclt1vnfd.png "MliHb3dF5oJYGPxvhpfcLT1vnfd")

        **オートスケーリング**が有効になっている場合は、対応する**最小**および**最大**フィールドを設定することで、実際のプロジェクトワークロードに基づいて EC2 インスタンス数を自動的にスケールさせるための範囲を Zilliz Cloud に対して指定する必要があります。

        ![QQ4Gb1IyiowJPQxCViGcMb8pnHb](https://zdoc-images.s3.us-west-2.amazonaws.com/qq4gb1iyiowjpqxcvigcmb8pnhb.png "QQ4Gb1IyiowJPQxCViGcMb8pnHb")

        リソース設定を容易にするため、4 つの事前定義されたプロジェクトサイズオプションがあります。以下の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成可能なクラスター数、およびこれらのクラスターが含めることができるエンティティ数の対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスター数</p></th>
             <th colspan="2"><p>最大エンティティ数 (百万)</p></th>
           </tr>
           <tr>
             <td><p>パフォーマンス最適化済み CU</p></td>
             <td><p>容量最適化済み CU</p></td>
           </tr>
           <tr>
             <td><p>小</p></td>
             <td><p>8〜16 CU の 3 クラスター</p></td>
             <td><p>1,000 万〜2,500 万</p></td>
             <td><p>4,000 万〜8,000 万</p></td>
           </tr>
           <tr>
             <td><p>中</p></td>
             <td><p>16〜64 CU の 7 クラスター</p></td>
             <td><p>2,500 万〜1 億</p></td>
             <td><p>8,000 万〜3 億 5,000 万</p></td>
           </tr>
           <tr>
             <td><p>大</p></td>
             <td><p>64〜192 CU の 12 クラスター</p></td>
             <td><p>1 億〜3 億</p></td>
             <td><p>3 億 5,000 万〜10 億</p></td>
           </tr>
           <tr>
             <td><p>特大</p></td>
             <td><p>192〜576 CU の 17 クラスター</p></td>
             <td><p>3 億〜9 億</p></td>
             <td><p>10 億〜30 億</p></td>
           </tr>
        </table>

        また、**初期プロジェクトサイズ**で**カスタム**を選択し、すべてのデータプレーンコンポーネントの EC2 インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。ご希望の EC2 インスタンスタイプが一覧に表示されていない場合は、さらなるサポートが必要な場合、[Zilliz サポート](https://zilliz.com/contact) にお問い合わせください。

    1. **ティアードクエリノード**を有効にするかどうかを決定します。

        このオプションは、ティアードストレージクラスターを作成できるかどうかを決定します。このオプションを選択すると、ティアードクエリノードのインスタンスタイプと数を設定できます。

        ![LWMFbm73GoM8mFxjajCcaGqPnMO](https://zdoc-images.s3.us-west-2.amazonaws.com/lwmfbm73gom8mfxjajccagqpnmo.png "LWMFbm73GoM8mFxjajCcaGqPnMO")

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p><strong>プロジェクトサイズ</strong>での選択は、<strong>ティアードストレージノード</strong>の設定に影響しません。</p></li>
        <li><p><strong>オートスケーリング</strong>が無効の場合、<strong>デフォルトクエリノード</strong>の数と<strong>ティアードクエリノード</strong>の数の合計は正の整数である必要があります。</p></li>
        <li><p><strong>オートスケーリング</strong>が有効の場合、<strong>デフォルトクエリノード</strong>と<strong>ティアードクエリノード</strong>の両方の<strong>最小</strong>値の合計は正の整数である必要があります。</p></li>
        </ul>

        </Admonition>

1. **デプロイ方法**で、Zilliz Cloud がタスクを実行する方法を選択します。

    AWS 上で BYOC プロジェクトのインフラストラクチャをプロビジョニングするための 3 つのオプションがあります。以下のいずれかを選択できます。

    - **AWS CloudFormation を使用してインフラストラクチャをプロビジョニングする。**

        プロジェクトのデータプレーンインフラストラクチャをプロビジョニングするために AWS CloudFormation を使用することを希望される場合は、**デプロイ方法**セクションで**クイックスタート**タイルを選択します。これは、BYOC プロジェクトを開始するための推奨方法でもあります。

        AWS CloudFormation を使用することにした場合は、**次へ**をクリックします。すると、プロジェクトを新しい VPC にデプロイするか、既存の VPC にデプロイするかを選択するための次のダイアログボックスが表示されます。

        ![EWCsb9An2oM6dkxjCuOcM5hRnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/ewcsb9an2om6dkxjcuocm5hrnce.png "EWCsb9An2oM6dkxjCuOcM5hRnCe")

        その後、**CloudFormation でスタックを作成**をクリックしてプロジェクトのデプロイを開始できます。

    - **Terraform スクリプトを使用してインフラストラクチャをプロビジョニングする。**

        Terraform スクリプトを使用してインフラストラクチャをプロビジョニングすることを希望される場合は、スクリプト出力をコピーして Zilliz Cloud に貼り付ける必要があります。詳細については、[Terraform Provider](./terraform-provider) をご覧ください。

        なお、[認証情報設定](./deploy-byoc-aws#step-2-set-up-credentials) および [ネットワーク設定](./deploy-byoc-aws#step-3-configure-network-settings) で指定されている通り、Terraform スクリプトによって返された情報を Zilliz Cloud コンソールに入力する必要があります。

    - **AWS コンソールを使用して必要なリソースとロールを作成する。**

        ストレージバケットやいくつかの IAM ロールなどの必要なリソースを AWS コンソールで作成する必要があります。その後、それらの名前と ID をコピーして Zilliz Cloud コンソールに貼り付けます。この方法でプロジェクトを作成することを希望される場合は、**デプロイ方法**セクションで**手動で**タイルを選択し、**次へ**をクリックします。

        Zilliz Cloud は、設定を容易にするために、プロセスを [認証情報設定](./deploy-byoc-aws#step-2-set-up-credentials) と [ネットワーク設定](./deploy-byoc-aws#step-3-configure-network-settings) に分割しています。

1. **次へ**をクリックして認証情報を設定します。

</Procedures>

### ステップ 2: 認証情報の設定\{#step-2-set-up-credentials}

**認証情報設定**では、ストレージアクセス、EKS クラスター管理、およびデータプレーンデプロイのためのストレージといくつかの IAM ロールを設定する必要があります。

![LEGhbUbZwoPdwSx1PjxcHBjQnab](https://zdoc-images.s3.us-west-2.amazonaws.com/leghbubzwopdwsx1pjxchbjqnab.png "LEGhbUbZwoPdwSx1PjxcHBjQnab")

<Procedures>

1. **ストレージ設定**で、AWS から取得した**バケット名**と**IAM ロール ARN**を設定します。

    Zilliz Cloud は、指定されたバケットをデータプレーンストレージとして使用し、指定された IAM ロールを使用してお客様に代わってこれにアクセスします。

     S3 バケットを作成する手順の詳細については、[S3 バケットと IAM ロールの作成](./create-bucket-and-role) をお読みください。

1. **EKS 設定**で、EKS 管理用の**IAM ロール ARN**を設定します。

    Zilliz Cloud は、指定されたロールを使用してお客様に代わって EKS クラスターをデプロイし、その EKS クラスター内にデータプレーンをデプロイします。

    EKS ロールを作成する手順の詳細については、[EKS IAM ロールの作成](./create-eks-role) をお読みください。

1. **クロスアカウント設定**で、データプレーンデプロイ用の**IAM ロール ARN**を設定します。

    ダイアログボックスに表示される**外部 ID**をコピーする必要があります。Zilliz Cloud は、指定されたロールを使用して Zilliz Cloud BYOC プロジェクトのデータプレーンをデプロイします。

    クロスアカウントロールを作成する手順の詳細については、[クロスアカウント IAM ロールの作成](./create-cross-account-role) をお読みください。

1. **次へ**をクリックしてネットワーク設定を構成します。

</Procedures>

### ステップ 3: ネットワーク設定の構成\{#step-3-configure-network-settings}

**ネットワーク設定**では、VPC を作成し、サブネット、セキュリティグループ、およびオプションの VPC エンドポイントなど、VPC 内のいくつかのタイプのリソースを作成します。

![NeKmbmKVhoNWcOx18IjcC1eLnDb](https://zdoc-images.s3.us-west-2.amazonaws.com/nekmbmkvhonwcox18ijcc1elndb.png "NeKmbmKVhoNWcOx18IjcC1eLnDb")

<Procedures>

1. **ネットワーク設定**で、**VPC ID**、**サブネット ID**、**セキュリティグループ ID**、およびオプションの**VPC エンドポイント ID**を設定します。

    指定された VPC 内において、Zilliz Cloud は以下を必要とします。

    - パブリックサブネット 1 つとプライベートサブネット 3 つ。

    - セキュリティグループ 1 つ。

    - オプションの VPC エンドポイント。

    **VPC エンドポイント ID**は、上記の**一般設定**で**AWS プライベートLink**をオンにした場合にのみ利用可能です。VPC およびその関連リソースを作成する手順の詳細については、[顧客管理 VPC の構成](./configure-vpc) を参照してください。

1. **次へ**をクリックして概要を表示します。

1. **デプロイ概要**で、構成設定を確認します。

1. すべての設定が期待通りであれば、**作成**をクリックします。

</Procedures>

## デプロイ詳細の表示\{#view-deployment-details}

プロジェクトを作成した後、プロジェクトページでそのステータスを表示できます。

![Bw2Xb6wIKoXWAuxU4jOcDdAnn2e](https://zdoc-images.s3.us-west-2.amazonaws.com/bw2xb6wikoxwauxu4jocddann2e.png "Bw2Xb6wIKoXWAuxU4jOcDdAnn2e")

プロジェクトのデータプレーンをデプロイし、クラスターを作成したら、直接 VPC アクセスまたは AWS プライベートLink を介してこれらのクラスターに接続できます。詳細については、[BYOC クラスターへの接続](./prepare-for-cluster-connection) を参照してください。

## 一時停止と再開\{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、プロジェクトをサポートする EKS クラスターに関連するすべての EC2 インスタンスが終了します。このアクションは、プロジェクト内の一時停止された Zilliz Cloud クラスターには影響せず、データプレーンが復元されれば再開できます。

![BN8KbqawgoErlZxtNYFcEvrjne4](https://zdoc-images.s3.us-west-2.amazonaws.com/bn8kbqawgoerlzxtnyfcevrjne4.png "BN8KbqawgoErlZxtNYFcEvrjne4")

プロジェクト内にクラスターが存在しない場合、またはすべてのクラスターがすでに一時停止されている場合にのみ、実行中のプロジェクトを一時停止できます。

![QXK1bRewYoasCzx1AHNcpbSBnhe](https://zdoc-images.s3.us-west-2.amazonaws.com/qxk1brewyoasczx1ahncpbsbnhe.png "QXK1bRewYoasCzx1AHNcpbSBnhe")

プロジェクトカードのステータスタグが**一時停止**と表示されている場合、プロジェクト内のクラスターを操作することはできません。そのような場合は、**再開**をクリックしてプロジェクトを再開できます。ステータスタグが再度**実行中**に変わると、プロジェクト内のクラスターの操作を続行できます。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス操作を支援するため、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようにしています。

![K1qzbwdxXoge0exlN6NcClN7nfh](https://zdoc-images.s3.us-west-2.amazonaws.com/k1qzbwdxxoge0exln6nccln7nfh.png "K1qzbwdxXoge0exlN6NcClN7nfh")

対象プロジェクトのドロップダウンメニューから**テクニカルサポートアクセス**をクリックして、現在の設定を表示します。

![YYOabQl2ioTl6AxIVLwcwjWqnBc](https://zdoc-images.s3.us-west-2.amazonaws.com/yyoabql2iotl6axivlwcwjwqnbc.png "YYOabQl2ioTl6AxIVLwcwjWqnBc")

データガバナンスおよびセキュリティ要件を満たすために、これを無効にすることができます。

## 手順\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />