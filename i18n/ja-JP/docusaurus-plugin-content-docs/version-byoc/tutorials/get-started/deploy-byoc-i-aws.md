---
title: "BYOC-I を AWS にデプロイ | BYOC"
slug: /deploy-byoc-i-aws
sidebar_key: deploy-byoc-i-aws
sidebar_label: "BYOC-I を AWS にデプロイ"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、AWS Virtual Private Cloud (VPC) に BYOC エージェントを持つ Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法を説明します。 | BYOC"
type: origin
token: D1E4wLr5xiuHoFkJgblcHZ1FnLb
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - aws
  - permissions
  - minimum permissions
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS 上で BYOC-I をデプロイ

このページでは、AWS Virtual プライベート Cloud (VPC) に BYOC エージェントを持つ Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC は現在 <strong>一般提供</strong> されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud サポート</a>までお問い合わせください。</p></li>
<li><p>このガイドでは、AWS コンソール上で必要なリソースをステップバイステップで作成する方法を説明します。インフラストラクチャのプロビジョニングに Terraform スクリプトを使用する場合は、<a href="./terraform-provider">Terraform Provider</a> を参照してください。</p></li>
</ul>

</Admonition>

## 前提条件\{#prerequisites}

以下を確認してください。

- BYOC-I 組織のオーナーであること。

- [必要な権限](./deploy-byoc-i-aws#required-permissions) に記載された権限が付与されていること。

## 手順\{#procedures}

### ステップ 1: デプロイ環境を準備する\{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraform 設定ファイルを実行し、BYOC-I プロジェクトのデータプレーンをデプロイするように構成されたローカルマシン、仮想マシン (VM)、または CI/CD パイプラインです。このステップでは、以下が必要です。

- **AWS 認証情報を構成する（AWS プロファイルまたはアクセスキー）。**

    AWS 認証情報の構成方法の詳細については、[このドキュメント](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) を参照してください。

- **最新の Terraform バイナリをインストールする。**

    Terraform のインストール方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。表示されたダイアログで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

プロジェクトはこのステップの最後で作成され、**Deploy Data Plane** ダイアログにリダイレクトされます。

![BYiTwvFLRhOJvRbMWNSc7zitnPu](https://zdoc-images.s3.us-west-2.amazonaws.com/BYiTwvFLRhOJvRbMWNSc7zitnPu.png)

### ステップ 3: データプレーンをデプロイする\{#step-3-deploy-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイは中止されますが、上記で作成したプロジェクトは保持されます。プロジェクトでは後からいつでもデータプレーンのデプロイを開始でき、1つのプロジェクトに複数のデータプレーンを追加できます。

    ![Lxi8wtMwmhRETHbRDqucLMx1nvb](https://zdoc-images.s3.us-west-2.amazonaws.com/Lxi8wtMwmhRETHbRDqucLMx1nvb.png)

1. **AWS プライベートLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用の VPC エンドポイントを作成する必要があります。

    ![WIjGwV6bvhzqk1ba4YecWQGonTh](https://zdoc-images.s3.us-west-2.amazonaws.com/WIjGwV6bvhzqk1ba4YecWQGonTh.png)

1. **アーキテクチャ** で、アプリケーションに合ったアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは **X86** と **ARM** です。

1.  **リソース設定** では、以下が必要です。

    1. **オートスケーリング** を有効または無効にして、Zilliz Cloud がプロジェクトのワークロードに基づいて定義された範囲内で EC2 インスタンスの数を自動的に調整し、効率的なリソース使用を確保できるようにします。

    1. **初期プロジェクトサイズ** を構成します。

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なるタイプの EC2 インスタンスを使用します。これらのサービスとコンポーネントのインスタンスタイプと数を個別に設定できます。

        **オートスケーリング** が無効の場合は、各プロジェクトコンポーネントに必要な EC2 インスタンス数を対応する **Count** フィールドに指定するだけです。

        ![VHLHbZrT1oNG03xAJMgcFVKAnCh](https://zdoc-images.s3.us-west-2.amazonaws.com/vhlhbzrt1ong03xajmgcfvkanch.png "VHLHbZrT1oNG03xAJMgcFVKAnCh")

        **オートスケーリング** が有効になると、対応する **Min** および **Max** フィールドを設定することで、実際のプロジェクトワークロードに基づいて Zilliz Cloud が EC2 インスタンスの数を自動的にスケーリングする範囲を指定する必要があります。

        ![VVjXbGaS3ovyZdxEPcacd6Vnnkh](https://zdoc-images.s3.us-west-2.amazonaws.com/vvjxbgas3ovyzdxepcacd6vnnkh.png "VVjXbGaS3ovyZdxEPcacd6Vnnkh")

        リソース設定を容易にするため、4 つの定義済みプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションとプロジェクト内で作成できるクラスター数、およびこれらのクラスターが含めることができるエンティティ数の対応関係を示しています。

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
             <td><p>8 ～ 16 CU のクラスター 3 個</p></td>
             <td><p>1000 万 ～ 2500 万</p></td>
             <td><p>4000 万 ～ 8000 万</p></td>
           </tr>
           <tr>
             <td><p>中</p></td>
             <td><p>16 ～ 64 CU のクラスター 7 個</p></td>
             <td><p>2500 万 ～ 1 億</p></td>
             <td><p>8000 万 ～ 3.5 億</p></td>
           </tr>
           <tr>
             <td><p>大</p></td>
             <td><p>64 ～ 192 CU のクラスター 12 個</p></td>
             <td><p>1 億 ～ 3 億</p></td>
             <td><p>3.5 億 ～ 10 億</p></td>
           </tr>
           <tr>
             <td><p>特大</p></td>
             <td><p>192 ～ 576 CU のクラスター 17 個</p></td>
             <td><p>3 億 ～ 9 億</p></td>
             <td><p>10 億 ～ 30 億</p></td>
           </tr>
        </table>

        **初期プロジェクトサイズ** で **Custom** を選択し、すべてのデータプレーンコンポーネントの EC2 インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する EC2 インスタンスタイプがリストにない場合は、さらなるサポートのために [Zilliz サポートにお問い合わせ](https://zilliz.com/contact) ください。

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションにより、階層型ストレージクラスターを作成できるかどうかが決まります。このオプションを選択すると、階層型クエリノードのインスタンスタイプと数を設定できます。

        ![FKDsbxbUuoEqMJxniZGcSZMQnb3](https://zdoc-images.s3.us-west-2.amazonaws.com/fkdsbxbuuoeqmjxnizgcszmqnb3.png "FKDsbxbUuoEqMJxniZGcSZMQnb3")

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p><strong>Project Size</strong> での選択は、<strong>Tiered Storage Node</strong> の設定には影響しません。</p></li>
        <li><p><strong>Auto-scaling</strong> が無効の場合、<strong>Default Query Node</strong> の数と <strong>Tiered Query Node</strong> の数の合計は正の整数である必要があります。</p></li>
        <li><p><strong>Auto-scaling</strong> が有効の場合、<strong>Default Query Node</strong> と <strong>Tiered Query Node</strong> の両方の <strong>Min</strong> 値の合計は正の整数である必要があります。</p></li>
        <li><p>BYOC で階層型ストレージが利用可能になる前に作成されたクラスターでは、階層型ストレージを手動で有効にできます。詳細については、<a href="./enable-tiered-storage-aws">既存クラスターで階層型ストレージを有効にする</a>を参照してください。</p></li>
        </ul>

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンをデプロイする\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![GHGqbw4UroKPu7xoEWmcDQaDnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/ghgqbw4urokpu7xoewmcdqadned.png "GHGqbw4UroKPu7xoEWmcDQaDnEd")

上記の Terraform スクリプトの実行の詳細については、[Zilliz Cloud BYOC-I プロジェクト設定ガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイし、クラスターを作成したら、直接 VPC アクセスまたは AWS プライベートLink を介してこれらのクラスターに接続できます。詳細については、[BYOC クラスターへの接続](./prepare-for-cluster-connection) を参照してください。

## データプレーンの管理\{#manage-dataplanes}

![RJwFwpytnhWVcabKr6tcNsnfnrb](https://zdoc-images.s3.us-west-2.amazonaws.com/RJwFwpytnhWVcabKr6tcNsnfnrb.png)

### Undeploy タグの付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカードの右上隅のステータスタグが **デプロイ解除** と表示されている場合は、いつでもプロジェクトカードの **Deploy データプレーン** ボタンをクリックして再度開くことができます。プロジェクトの名前を変更または削除するには、プロジェクトカードの **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。

### Deploying タグの付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境を準備し、表示されたコマンドを実行したら、BYOC エージェントがアクティブ化されるまで待つ必要があります。プロジェクトカードのステータスタグが **デプロイ中** と表示され、進行状況のパーセンテージが表示されている場合、データプレーンが準備できるまでプロジェクトの名前を変更または削除することはできません。

### Running タグの付いたデータプレーン\{#data-planes-with-a-running-tag}

プロジェクトカードのステータスタグが **Running** と表示されると、プロジェクト内でクラスターの作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクト内にクラスターがないことを確認してください。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス操作を支援するため、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようにしています。

![XThkbwy5hoho7Ixpgg5ctUp1nRe](https://zdoc-images.s3.us-west-2.amazonaws.com/xthkbwy5hoho7ixpgg5ctup1nre.png "XThkbwy5hoho7Ixpgg5ctUp1nRe")

対象プロジェクトのドロップダウンメニューから **テクニカルサポートアクセス** をクリックして、現在の設定を表示します。

![Z4L2bIrA0onlxPxFNUNcYv78nIe](https://zdoc-images.s3.us-west-2.amazonaws.com/z4l2bira0onlxpxfnuncyv78nie.png "Z4L2bIrA0onlxPxFNUNcYv78nIe")

データガバナンスおよびセキュリティ要件を満たすために、これを無効にすることができます。

## 必要な権限\{#required-permissions}

このセクションでは、AWS 上で BYOC-I をデプロイするために必要な主要な権限をすべて紹介します。

### VPC およびネットワークリソースの権限\{#vpc-and-networking-resource-permissions}

- **VPC管理**: VPC の作成、変更、記述、および削除

- **サブネット操作**: サブネットの作成および削除

- **セキュリティグループ**: セキュリティグループおよびそのルールの作成、変更、および削除

- **ルートテーブル**: ルートテーブルの作成、関連付け、および管理

- **インターネットゲートウェイ**: インターネットゲートウェイの作成、アタッチ、およびデタッチ

- **NATゲートウェイ**: Elastic IP を使用した NAT ゲートウェイの作成および削除

- **VPCエンドポイント**: AWS サービス用の VPC エンドポイントの作成および削除

- **起動テンプレート**: EC2 起動テンプレートの作成および削除

- **Route53**: ホストゾーンへの VPC の関連付け

- **タグ付け**: VPC リソースへのタグの作成および削除

### IAM ロールおよび BYOC-I デプロイの権限\{#iam-roles-and-byoc-i-deployment-permissions}

- **ロール管理**: IAM ロールの作成、取得、リスト表示、ポリシーのアタッチ/デタッチ、および削除

- **ポリシー管理**: IAM ポリシーの作成、取得、バージョンのリスト表示、および削除

- **タグ付け**: ロールおよびポリシーのタグ付けおよびタグ解除

- **ID検証**: 呼び出し元 ID の取得（STS）

### S3 バケットの権限\{#s3-bucket-permissions}

- **バケット操作**: S3 バケットの作成、リスト表示、設定の取得、および削除

- **バケット設定**: バケットのタグ付け、ポリシー、ACL、CORS、バージョニング、暗号化、およびパブリックアクセス設定の管理

- **オブジェクトタグ付け**: オブジェクトタグの設定、取得、および削除

- **バケットリスト**: アカウント内のすべてのバケットのリスト表示

### EKS クラスターおよび関連リソースの権限\{#eks-cluster-and-related-resource-permissions}

- **サービスにリンクされたロール**: クラスターおよびノードグループ管理用の EKS サービスにリンクされたロールの作成

- **OIDCプロバイダー**: OpenID Connect プロバイダーの作成、タグ付け、取得、および削除（`Vendor=zilliz-byoc` タグ要件あり）

- **IAMロール管理**: EKS ロールの読み取りおよび EKS サービスへのロールの引き渡し

- **EC2リソース**: 起動テンプレートの作成、インスタンスの実行、およびタグの管理（`Vendor=zilliz-byoc` タグ要件あり）

- **EKSクラスター操作**: EKS クラスターの作成、更新、記述、タグ付け、および削除

- **ノードグループ操作**: EKS ノードグループの作成、更新、記述、および削除

- **アドオン管理**: EKS アドオンの作成、更新、記述、および削除

- **アクセスエントリー管理**: EKS アクセスエントリーおよびポッド ID 関連付けの作成、更新、記述、および削除
