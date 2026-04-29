---
title: "AWS での BYOC-I のデプロイ | BYOC"
slug: /deploy-byoc-i-aws
sidebar_key: deploy-byoc-i-aws
sidebar_label: "AWS での BYOC-I のデプロイ"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、お客様の AWS Virtual Private Cloud (VPC) 内に BYOC エージェントを備えた Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。| BYOC"
type: origin
token: D1E4wLr5xiuHoFkJgblcHZ1FnLb
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - aws
  - 権限
  - 最小権限
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS 上での BYOC-I のデプロイ

このページでは、AWS Virtual プライベート Cloud (VPC) 内に BYOC エージェントを備えた Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC は現在<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud サポート</a>にお問い合わせください。</p></li>
<li><p>このガイドでは、AWS コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングする場合は、「<a href="./terraform-provider">Terraform Provider</a>」をご覧ください。</p></li>
</ul>

</Admonition>

## 前提条件\{#prerequisites}

以下の条件を満たしていることを確認してください。

- BYOC-I オーガニゼーションの所有者であること。

- [必要な権限](./deploy-byoc-i-aws#required-permissions) に記載されている権限が付与されていること。

## 手順\{#procedures}

### ステップ 1: デプロイ環境の準備\{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraform 設定ファイルを実行し、BYOC-I プロジェクトのデータプレーンをデプロイするために構成されたローカルマシン、仮想マシン (VM)、または CI/CD パイプラインのことです。このステップでは、以下を行う必要があります。

- **AWS 認証情報の設定 (AWS プロファイルまたはアクセスキー)。**

    AWS 認証情報の設定方法については、[このドキュメント](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) を参照してください。

- **最新の Terraform バイナリのインストール。**

    Terraform のインストール方法については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトの作成\{#step-2-create-a-project}

BYOC-I オーガニゼーション内で、**Create Project and Deploy データプレーン** ボタンをクリックしてデプロイを開始します。

![Xd4ObksJao97jdxSFVTclO4Fno6](https://zdoc-images.s3.us-west-2.amazonaws.com/xd4obksjao97jdxsfvtclo4fno6.png "Xd4ObksJao97jdxSFVTclO4Fno6")

### ステップ 3: 一般設定の構成\{#step-3-set-up-the-general-settings}

**一般設定** では、プロジェクト名を設定し、Zilliz Cloud がプロジェクトのデータプレーンをデプロイするクラウドプロバイダーとリージョンを決定する必要があります。

![Xejfbdz6PockHsxn5uacw3OTnVc](https://zdoc-images.s3.us-west-2.amazonaws.com/xejfbdz6pockhsxn5uacw3otnvc.png "Xejfbdz6PockHsxn5uacw3OTnVc")

<Procedures>

1. **プロジェクト名** を設定します。

1. **クラウドプロバイダー** と **リージョン** を選択します。

1. **AWS プライベートLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合、プライベート接続用に VPC エンドポイントを作成する必要があります。

1. **アーキテクチャ** で、アプリケーションに適合するアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは **X86** と **ARM** です。

1. **リソース設定** で、以下を行う必要があります。

    1. **オートスケーリング** を有効または無効にして、Zilliz Cloud がプロジェクトのワークロードに基づいて定義された範囲内で EC2 インスタンス数を自動的に調整できるようにし、リソースの効率的な使用を確保します。

    1. **初期プロジェクトサイズ** を構成します。

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なるタイプの EC2 インスタンスを使用します。これらのサービスおよびコンポーネントごとにインスタンスタイプと数を個別に設定できます。

        **オートスケーリング** が無効になっている場合は、対応する **Count** フィールドに各プロジェクトコンポーネントに必要な EC2 インスタンス数を指定するだけです。

        ![VHLHbZrT1oNG03xAJMgcFVKAnCh](https://zdoc-images.s3.us-west-2.amazonaws.com/vhlhbzrt1ong03xajmgcfvkanch.png "VHLHbZrT1oNG03xAJMgcFVKAnCh")

        **オートスケーリング** が有効になっている場合は、対応する **Min** および **Max** フィールドを設定することで、実際のプロジェクトワークロードに基づいて EC2 インスタンス数を自動的にスケールさせるための範囲を Zilliz Cloud に対して指定する必要があります。

        ![VVjXbGaS3ovyZdxEPcacd6Vnnkh](https://zdoc-images.s3.us-west-2.amazonaws.com/vvjxbgas3ovyzdxepcacd6vnnkh.png "VVjXbGaS3ovyZdxEPcacd6Vnnkh")

        リソース設定を容易にするために、4 つの事前定義されたプロジェクトサイズオプションがあります。以下の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成可能なクラスター数、およびこれらのクラスターが含めることができるエンティティ数の対応関係を示しています。

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

        また、**初期プロジェクトサイズ** で **Custom** を選択し、すべてのデータプレーンコンポーネントの EC2 インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する EC2 インスタンスタイプが一覧に表示されていない場合は、さらなるサポートが必要な場合、[Zilliz サポート](https://zilliz.com/contact) にお問い合わせください。

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンのデプロイ\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![GHGqbw4UroKPu7xoEWmcDQaDnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/ghgqbw4urokpu7xoewmcdqadned.png "GHGqbw4UroKPu7xoEWmcDQaDnEd")

上記の Terraform スクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-I プロジェクトセットアップガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイし、クラスターを作成したら、直接 VPC アクセスまたは AWS プライベートLink を介してこれらのクラスターに接続できます。詳細については、「[BYOC クラスターへの接続](./prepare-for-cluster-connection)」を参照してください。

## プロジェクトの管理\{#manage-projects}

![AHEybTRhto0gcKxnKIucbm3inte](https://zdoc-images.s3.us-west-2.amazonaws.com/aheybtrhto0gckxnkiucbm3inte.png "AHEybTRhto0gcKxnKIucbm3inte")

### デプロイ解除 タグ付きプロジェクト\{#projects-with-an-undeploy-tag}

プロジェクトカードの右上隅にあるステータスタグが **デプロイ解除** と表示されている場合、プロジェクトカード上の **Deploy データプレーン** ボタンをクリックしていつでも再開できます。プロジェクトの名前を変更または削除するには、プロジェクトカード内の **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。

### デプロイ中 タグ付きプロジェクト\{#projects-with-a-deploying-tag}

デプロイ環境を準備し、表示されたコマンドを実行した後、BYOC エージェントがアクティブになるのを待つ必要があります。プロジェクトカードのステータスタグが **デプロイ中** と表示され、進捗率が示されている間は、データプレーンが整うまでプロジェクトの名前を変更したり削除したりすることはできません。

### Running タグ付きプロジェクト\{#projects-with-a-running-tag}

プロジェクトカードのステータスタグが **Running** と表示されたら、プロジェクト内でクラスターの作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクト内にクラスターが存在しないことを確認してください。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよび運用保守作業を支援するため、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようにしています。

![XThkbwy5hoho7Ixpgg5ctUp1nRe](https://zdoc-images.s3.us-west-2.amazonaws.com/xthkbwy5hoho7ixpgg5ctup1nre.png "XThkbwy5hoho7Ixpgg5ctUp1nRe")

対象プロジェクトのドロップダウンメニューから **テクニカルサポートアクセス** をクリックすると、現在の設定を表示できます。

![Z4L2bIrA0onlxPxFNUNcYv78nIe](https://zdoc-images.s3.us-west-2.amazonaws.com/z4l2bira0onlxpxfnuncyv78nie.png "Z4L2bIrA0onlxPxFNUNcYv78nIe")

データガバナンスおよびセキュリティ要件を満たすために、これを無効にすることができます。

## 必要な権限\{#required-permissions}

このセクションでは、AWS 上で BYOC-I をデプロイするために必要な主要な権限をすべて紹介します。

### VPC およびネットワークリソースの権限\{#vpc-and-networking-resource-permissions}

- **VPC 管理**: VPC の作成、変更、説明、削除

- **サブネット操作**: サブネットの作成と削除

- **セキュリティグループ**: セキュリティグループとそのルールの作成、変更、削除

- **ルートテーブル**: ルートテーブルの作成、関連付け、管理

- **インターネットゲートウェイ**: インターネットゲートウェイの作成、アタッチ、デタッチ

- **NAT ゲートウェイ**: Elastic IP を持つ NAT ゲートウェイの作成と削除

- **VPC エンドポイント**: AWS サービス用の VPC エンドポイントの作成と削除

- **起動テンプレート**: EC2 起動テンプレートの作成と削除

- **Route53**: VPC とホストゾーンとの関連付け

- **タグ付け**: VPC リソース上のタグの作成と削除

### IAM ロールおよび BYOC-I デプロイの権限\{#iam-roles-and-byoc-i-deployment-permissions}

- **ロール管理**: IAM ロールの作成、取得、一覧表示、ポリシーのアタッチ/デタッチ、削除

- **ポリシー管理**: IAM ポリシーの作成、取得、バージョンの一覧表示、削除

- **タグ付け**: ロールとポリシーのタグ付けおよびタグ解除

- **ID 検証**: 呼び出し元 ID の取得 (STS)

### S3 バケットの権限\{#s3-bucket-permissions}

- **バケット操作**: S3 バケットの作成、一覧表示、設定の取得、削除

- **バケット設定**: バケットのタグ付け、ポリシー、ACL、CORS、バージョニング、暗号化、パブリックアクセス設定の管理

- **オブジェクトタグ付け**: オブジェクトタグの付与、取得、削除

- **バケットリスト**: アカウント内のすべてのバケットの一覧表示

### EKS クラスターおよび関連リソースの権限\{#eks-cluster-and-related-resource-permissions}

- **サービスにリンクされたロール**: クラスターおよびノードグループ管理用の EKS サービスにリンクされたロールの作成

- **OIDC プロバイダー**: OpenID Connect プロバイダーの作成、タグ付け、取得、削除 (`Vendor=zilliz-byoc` タグ要件あり)

- **IAM ロール管理**: EKS ロールの読み取りおよび EKS サービスへのロールの受け渡し

- **EC2 リソース**: 起動テンプレートの作成、インスタンスの実行、タグの管理 (`Vendor=zilliz-byoc` タグ要件あり)

- **EKS クラスター操作**: EKS クラスターの作成、更新、説明、タグ付け、削除

- **ノードグループ操作**: EKS ノードグループの作成、更新、説明、削除

- **アドオン管理**: EKS アドオンの作成、更新、説明、削除

- **アクセスエントリ管理**: EKS アクセスエントリおよびポッド ID 関連付けの作成、更新、説明、削除

