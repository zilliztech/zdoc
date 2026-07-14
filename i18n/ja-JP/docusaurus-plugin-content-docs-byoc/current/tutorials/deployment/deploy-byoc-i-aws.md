---
title: "AWS に BYOC-I をデプロイ | BYOC"
slug: /deploy-byoc-i-aws
sidebar_label: "AWS に BYOC-I をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、AWS Virtual Private Cloud (VPC) 内に BYOC エージェントを使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。 | BYOC"
type: origin
token: D1E4wLr5xiuHoFkJgblcHZ1FnLb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS に BYOC-I をデプロイ

このページでは、AWS Virtual Private Cloud (VPC) 内に BYOC エージェントを使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。

<Admonition type="info" icon="📘" title="注意">

- Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud サポート](https://zilliz.com/contact-sales) にお問い合わせください。

- このガイドでは、AWS コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

以下を満たしていることを確認してください。 

- BYOC-I 組織のオーナーであること。

- [必要な権限](./deploy-byoc-i-aws#required-permissions) に記載されている権限が付与されていること。

## 適用可能な VPC リージョン\{#applicable-vpc-regions}

次の表は、Zilliz Cloud BYOC ソリューションがサポートする AWS クラウドリージョンを示しています。Zilliz Cloud コンソールでお使いのクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="4"><p>北米</p></td>
     <td><p>us-west-2</p></td>
     <td><p>米国オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>米国バージニア北部</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>米国オハイオ</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ（中部）</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>アジア</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>日本、東京</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>韓国、ソウル</p></td>
   </tr>
   <tr>
     <td><p>ap-east-1</p></td>
     <td><p>香港</p></td>
   </tr>
   <tr>
     <td><p>オセアニア</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>オーストラリア、シドニー</p></td>
   </tr>
</table>

## 手順\{#procedures}

### ステップ 1: デプロイ環境を準備する\{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraform 構成ファイルを実行して BYOC-I プロジェクトのデータプレーンをデプロイするように構成されたローカルマシン、仮想マシン (VM)、または CI/CD パイプラインのことです。このステップでは、以下を行う必要があります。 

- **AWS 認証情報（AWS プロファイルまたはアクセスキー）を構成します。**

    AWS 認証情報の構成方法の詳細については、[このドキュメント](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) を参照してください。

- **最新の Terraform バイナリをインストールします。**

    Terraform のインストール方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I 組織内で **Create Project** ボタンをクリックしてデプロイを開始します。表示されるダイアログボックスで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

このステップの最後でプロジェクトが作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![BYiTwvFLRhOJvRbMWNSc7zitnPu](https://zdoc-images.s3.us-west-2.amazonaws.com/BYiTwvFLRhOJvRbMWNSc7zitnPu.png)

### ステップ 3: データプレーンを準備する\{#step-3-prepare-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイを中止できます。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内ではいつでもデータプレーンのデプロイを開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。 

    ![Lxi8wtMwmhRETHbRDqucLMx1nvb](https://zdoc-images.s3.us-west-2.amazonaws.com/Lxi8wtMwmhRETHbRDqucLMx1nvb.png)

1. **AWS PrivateLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用の VPC エンドポイントを作成する必要があります。

    ![WIjGwV6bvhzqk1ba4YecWQGonTh](https://zdoc-images.s3.us-west-2.amazonaws.com/WIjGwV6bvhzqk1ba4YecWQGonTh.png)

1. **Architecture** で、アプリケーションに適したアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1.  **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義された範囲内でプロジェクトのワークロードに基づき Zilliz Cloud が EC2 インスタンス数を自動調整し、効率的なリソース利用を実現するようにします。

    1. **Initial Project Size** を構成します。 

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係がそれぞれ異なるタイプの EC2 インスタンスを使用します。これらのサービスやコンポーネントごとに、インスタンスタイプと台数を個別に設定できます。 

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な EC2 インスタンス数を、対応する **Count** フィールドに指定するだけです。

        ![CxLubcykMohdUbxSlfVcj7ecn8d](https://zdoc-images.s3.us-west-2.amazonaws.com/cxlubcykmohdubxslfvcj7ecn8d.png "CxLubcykMohdUbxSlfVcj7ecn8d")

        **Auto-scaling** を有効にすると、実際のプロジェクトワークロードに基づいて Zilliz Cloud が EC2 インスタンス数を自動スケーリングできるよう、対応する **Min** フィールドと **Max** フィールドを設定して範囲を指定する必要があります。

        ![FYu6bpIW9oURxuxkZlbc9ETzn3d](https://zdoc-images.s3.us-west-2.amazonaws.com/fyu6bpiw9ourxuxkzlbc9etzn3d.png "FYu6bpIW9oURxuxkZlbc9ETzn3d")

        リソース設定を容易にするために、あらかじめ定義された 4 つのプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成可能なクラスター数、およびそれらのクラスターに含められるエンティティ数の対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスター数</p></th>
             <th colspan="3"><p>最大エンティティ数</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8 ～ 16 CUs のクラスターを 3 個</p></td>
             <td><p>1,600 万 - 3,200 万</p></td>
             <td><p>6,400 万 - 1 億 2,800 万</p></td>
             <td><p>3 億 2,000 万 - 6 億 4,000 万</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CUs のクラスターを 7 個</p></td>
             <td><p>3,200 万 - 1 億 2,800 万</p></td>
             <td><p>1 億 2,800 万 - 5 億 1,200 万</p></td>
             <td><p>6 億 4,000 万 - 26 億</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CUs のクラスターを 12 個</p></td>
             <td><p>1 億 2,800 万 - 3 億 8,400 万</p></td>
             <td><p>5 億 1,200 万 - 15 億</p></td>
             <td><p>26 億 - 77 億</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CUs のクラスターを 17 個</p></td>
             <td><p>3 億 8,400 万 - 12 億</p></td>
             <td><p>15 億 - 46 億</p></td>
             <td><p>77 億 - 230 億</p></td>
           </tr>
        </table>

        **Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントの EC2 インスタンスタイプと台数を調整することで、設定をカスタマイズすることもできます。希望する EC2 インスタンスタイプが一覧にない場合は、追加サポートのために [Zilliz サポートにお問い合わせ](https://zilliz.com/contact) ください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションは、階層型ストレージクラスターを作成できるかどうかを決定します。このオプションを選択すると、階層型クエリノードのインスタンスタイプと台数を設定できます。 

        ![FKDsbxbUuoEqMJxniZGcSZMQnb3](https://zdoc-images.s3.us-west-2.amazonaws.com/fkdsbxbuuoeqmjxnizgcszmqnb3.png "FKDsbxbUuoEqMJxniZGcSZMQnb3")

        <Admonition type="info" icon="📘" title="注意">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の数と **Tiered Query Node** の数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。
        
        - Tiered Storage が BYOC で利用可能になる前に作成されたクラスターについては、Tiered Storage を手動で有効化できます。詳細は、[既存のクラスターで Tiered Storage を有効化する](./enable-tiered-storage-aws) を参照してください。

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンをデプロイする\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![GHGqbw4UroKPu7xoEWmcDQaDnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/ghgqbw4urokpu7xoewmcdqadned.png "GHGqbw4UroKPu7xoEWmcDQaDnEd")

上記の Terraform スクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-I プロジェクトセットアップガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイしてクラスターを作成した後は、直接 VPC アクセスまたは AWS PrivateLink のいずれかを通じてこれらのクラスターに接続できます。詳細は、[BYOC クラスターへの接続](./prepare-for-cluster-connection) を参照してください。

## データプレーンの管理\{#manage-dataplanes}

![RJwFwpytnhWVcabKr6tcNsnfnrb](https://zdoc-images.s3.us-west-2.amazonaws.com/RJwFwpytnhWVcabKr6tcNsnfnrb.png)

### Undeploy タグが付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカード右上のステータスタグが **Undeploy** と表示されている場合は、プロジェクトカードの **Deploy Data Plane** ボタンをいつでもクリックして再度開くことができます。プロジェクトの名前を変更または削除するには、プロジェクトカードの **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。  

### Deploying タグが付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境を準備し、表示されたコマンドを実行したら、BYOC エージェントがアクティブになるまで待つ必要があります。プロジェクトカードのステータスタグが **Deploying** と表示され、進行率のパーセンテージが表示されている間は、データプレーンが配置されるまでプロジェクトの名前変更や削除はできません。

### Running タグが付いたデータプレーン\{#data-planes-with-a-running-tag}

プロジェクトカードのステータスタグが **Running** と表示されたら、プロジェクト内でクラスターの作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクト内にクラスターが存在しないことを確認してください。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよび保守作業を支援するために、Zilliz Cloud ではデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようになっています。 

![XThkbwy5hoho7Ixpgg5ctUp1nRe](https://zdoc-images.s3.us-west-2.amazonaws.com/xthkbwy5hoho7ixpgg5ctup1nre.png "XThkbwy5hoho7Ixpgg5ctUp1nRe")

対象プロジェクトのドロップダウンメニューから **Technical Support Access** をクリックすると、現在の設定を表示できます。

![Z4L2bIrA0onlxPxFNUNcYv78nIe](https://zdoc-images.s3.us-west-2.amazonaws.com/z4l2bira0onlxpxfnuncyv78nie.png "Z4L2bIrA0onlxPxFNUNcYv78nIe")

データガバナンスおよびセキュリティ要件を満たすために、これを無効にすることもできます。

## 必要な権限\{#required-permissions}

このセクションでは、AWS に BYOC-I をデプロイするために必要な主要権限をすべて確認できます。

### VPC およびネットワークリソースの権限\{#vpc-and-networking-resource-permissions}

- **VPC 管理**: VPC の作成、変更、記述、削除

- **サブネット操作**: サブネットの作成と削除

- **セキュリティグループ**: セキュリティグループとそのルールの作成、変更、削除

- **ルートテーブル**: ルートテーブルの作成、関連付け、管理

- **インターネットゲートウェイ**: インターネットゲートウェイの作成、アタッチ、デタッチ

- **NAT ゲートウェイ**: Elastic IP を使用した NAT ゲートウェイの作成と削除

- **VPC エンドポイント**: AWS サービス用 VPC エンドポイントの作成と削除

- **起動テンプレート**: EC2 起動テンプレートの作成と削除

- **Route53**: VPC をホストゾーンに関連付け

- **タグ付け**: VPC リソースへのタグの作成と削除

### IAM ロールおよび BYOC-I デプロイ権限\{#iam-roles-and-byoc-i-deployment-permissions}

- **ロール管理**: IAM ロールの作成、取得、一覧表示、ポリシーのアタッチ/デタッチ、削除

- **ポリシー管理**: IAM ポリシーの作成、取得、バージョン一覧表示、削除

- **タグ付け**: ロールおよびポリシーへのタグ付与とタグ解除

- **ID 検証**: 呼び出し元 ID の取得 (STS)

### S3 バケット権限\{#s3-bucket-permissions}

- **バケット操作**: S3 バケットの作成、一覧表示、設定取得、削除

- **バケット設定**: バケットのタグ付け、ポリシー、ACL、CORS、バージョニング、暗号化、およびパブリックアクセス設定の管理

- **オブジェクトタグ付け**: オブジェクトタグの設定、取得、削除

- **バケット一覧**: アカウント内のすべてのバケットを一覧表示

### EKS クラスターおよび関連リソースの権限\{#eks-cluster-and-related-resource-permissions}

- **サービスリンクロール**: クラスターおよびノードグループ管理のための EKS サービスリンクロールを作成

- **OIDC プロバイダー**: OpenID Connect プロバイダーの作成、タグ付与、取得、削除（`Vendor=zilliz-byoc` タグ要件あり）

- **IAM ロール管理**: EKS ロールの読み取りと、EKS サービスへのロールの受け渡し

- **EC2 リソース**: 起動テンプレートの作成、インスタンスの起動、タグの管理（`Vendor=zilliz-byoc` タグ要件あり）

- **EKS クラスター操作**: EKS クラスターの作成、更新、記述、タグ付与、削除

- **ノードグループ操作**: EKS ノードグループの作成、更新、記述、削除

- **アドオン管理**: EKS アドオンの作成、更新、記述、削除

- **アクセスエントリ管理**: EKS アクセスエントリおよび Pod Identity 関連付けの作成、更新、記述、削除

