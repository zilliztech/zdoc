---
title: "AWS に BYOC-I をデプロイする | BYOC"
slug: /deploy-byoc-i-aws
sidebar_label: "AWS に BYOC-I をデプロイする"
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

# AWS に BYOC-I をデプロイする

このページでは、AWS Virtual Private Cloud (VPC) 内に BYOC エージェントを使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。

<Admonition type="info" icon="📘" title="注意">

- Zilliz BYOC は現在 **General Availability** で提供されています。アクセス方法および実装の詳細については、[Zilliz Cloud support](https://zilliz.com/contact-sales) までお問い合わせください。

- このガイドでは、AWS コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

以下を満たしていることを確認してください。

- BYOC-I 組織のオーナーであること。

- [Required permissions](./deploy-byoc-i-aws#required-permissions) に記載された権限が付与されていること。

## 適用可能な VPC リージョン\{#applicable-vpc-regions}

次の表は、Zilliz Cloud BYOC ソリューションがサポートする AWS クラウドリージョンの一覧です。Zilliz Cloud コンソール上でお使いのクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

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

デプロイ環境とは、Terraform 設定ファイルを実行して BYOC-I プロジェクトのデータプレーンをデプロイするよう構成されたローカルマシン、仮想マシン (VM)、または CI/CD パイプラインのことです。このステップでは、以下を行う必要があります。

- **AWS 認証情報（AWS profile または access key）を設定します。**

    AWS 認証情報の設定方法の詳細については、[このドキュメント](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) を参照してください。

- **最新の Terraform バイナリをインストールします。**

    Terraform のインストール方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I 組織内で **Create Project** ボタンをクリックしてデプロイを開始します。表示されるダイアログボックスで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

このステップの最後にプロジェクトが作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![BYiTwvFLRhOJvRbMWNSc7zitnPu](https://zdoc-images.s3.us-west-2.amazonaws.com/BYiTwvFLRhOJvRbMWNSc7zitnPu.png)

### ステップ 3: データプレーンを準備する\{#step-3-prepare-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイを停止します。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内でデータプレーンのデプロイはいつでも開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。 

    ![Lxi8wtMwmhRETHbRDqucLMx1nvb](https://zdoc-images.s3.us-west-2.amazonaws.com/Lxi8wtMwmhRETHbRDqucLMx1nvb.png)

1. **AWS PrivateLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合、プライベート接続用の VPC エンドポイントを作成する必要があります。

    ![WIjGwV6bvhzqk1ba4YecWQGonTh](https://zdoc-images.s3.us-west-2.amazonaws.com/WIjGwV6bvhzqk1ba4YecWQGonTh.png)

1. **Architecture** で、アプリケーションに適したアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1. **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義した範囲内でプロジェクトのワークロードに基づき EC2 インスタンス数を Zilliz Cloud が自動調整できるようにし、効率的なリソース利用を実現します。

    1. **Initial Project Size** を構成します。 

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係で異なるタイプの EC2 インスタンスを使用します。これらのサービスおよびコンポーネントごとに、インスタンスタイプと台数を個別に設定できます。 

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な EC2 インスタンス数を対応する **Count** フィールドに指定するだけです。

        ![CxLubcykMohdUbxSlfVcj7ecn8d](https://zdoc-images.s3.us-west-2.amazonaws.com/cxlubcykmohdubxslfvcj7ecn8d.png "CxLubcykMohdUbxSlfVcj7ecn8d")

        **Auto-scaling** を有効にすると、対応する **Min** および **Max** フィールドを設定して、実際のプロジェクトワークロードに基づき Zilliz Cloud が EC2 インスタンス数を自動スケールできるように範囲を指定する必要があります。

        ![FYu6bpIW9oURxuxkZlbc9ETzn3d](https://zdoc-images.s3.us-west-2.amazonaws.com/fyu6bpiw9ourxuxkzlbc9etzn3d.png "FYu6bpIW9oURxuxkZlbc9ETzn3d")

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

        ![FKDsbxbUuoEqMJxniZGcSZMQnb3](https://zdoc-images.s3.us-west-2.amazonaws.com/fkdsbxbuuoeqmjxnizgcszmqnb3.png "FKDsbxbUuoEqMJxniZGcSZMQnb3")

        <Admonition type="info" icon="📘" title="注意">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の台数と **Tiered Query Node** の台数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。
        
        - BYOC で Tiered Storage が利用可能になる前に作成されたクラスターについては、Tiered Storage を手動で有効化できます。詳細は、[Enable Tiered Storage for Exisiting Clusters](./enable-tiered-storage-aws) を参照してください。

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンをデプロイする\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![GHGqbw4UroKPu7xoEWmcDQaDnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/ghgqbw4urokpu7xoewmcdqadned.png "GHGqbw4UroKPu7xoEWmcDQaDnEd")

上記 Terraform スクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイしてクラスターを作成した後は、直接 VPC アクセスまたは AWS PrivateLink のいずれかを通じてこれらのクラスターに接続できます。詳細は、[Connect to BYOC Clusters](./prepare-for-cluster-connection) を参照してください。

## データプレーンを管理する\{#manage-dataplanes}

![RJwFwpytnhWVcabKr6tcNsnfnrb](https://zdoc-images.s3.us-west-2.amazonaws.com/RJwFwpytnhWVcabKr6tcNsnfnrb.png)

### Undeploy タグが付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカード右上のステータスタグが **Undeploy** と表示されている場合、いつでもプロジェクトカード上の **Deploy Data Plane** ボタンをクリックして再度開くことができます。プロジェクトの名前を変更または削除するには、プロジェクトカード内の **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。  

### Deploying タグが付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境を準備して表示されたコマンドを実行した後は、BYOC エージェントが有効化されるまで待つ必要があります。プロジェクトカード上のステータスタグが **Deploying** と表示され、進行率が示されている間は、データプレーンの配置が完了するまでプロジェクトの名前変更や削除はできません。

### Running タグが付いたデータプレーン\{#data-planes-with-a-running-tag}

プロジェクトカード上のステータスタグが **Running** と表示されたら、そのプロジェクト内でクラスターの作成を開始できます。稼働中のプロジェクトの名前変更または削除を行うには、プロジェクト内にクラスターが存在しないことを確認してください。

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

## 必要な権限\{#required-permissions}

このセクションでは、AWS に BYOC-I をデプロイするために必要な主要権限をすべて確認できます。

### VPC およびネットワークリソースの権限\{#vpc-and-networking-resource-permissions}

- **VPC Management**: VPC の作成、変更、記述、および削除

- **Subnet Operations**: サブネットの作成および削除

- **Security Groups**: セキュリティグループとそのルールの作成、変更、および削除

- **Route Tables**: ルートテーブルの作成、関連付け、および管理

- **Internet Gateways**: インターネットゲートウェイの作成、アタッチ、およびデタッチ

- **NAT Gateways**: Elastic IP を使用した NAT ゲートウェイの作成および削除

- **VPC Endpoints**: AWS サービス用 VPC エンドポイントの作成および削除

- **Launch Templates**: EC2 起動テンプレートの作成および削除

- **Route53**: VPC とホストゾーンの関連付け

- **Tagging**: VPC リソースへのタグの作成および削除

### IAM ロールおよび BYOC-I デプロイ権限\{#iam-roles-and-byoc-i-deployment-permissions}

- **Role Management**: IAM ロールの作成、取得、一覧表示、ポリシーのアタッチ/デタッチ、および削除

- **Policy Management**: IAM ポリシーの作成、取得、バージョン一覧表示、および削除

- **Tagging**: ロールおよびポリシーへのタグ付与とタグ削除

- **Identity Verification**: 呼び出し元 ID の取得 (STS)

### S3 バケット権限\{#s3-bucket-permissions}

- **Bucket Operations**: S3 バケットの作成、一覧表示、構成取得、および削除

- **Bucket Configuration**: バケットのタグ付け、ポリシー、ACL、CORS、バージョニング、暗号化、およびパブリックアクセス設定の管理

- **Object Tagging**: オブジェクトタグの設定、取得、および削除

- **Bucket Listing**: アカウント内のすべてのバケットを一覧表示

### EKS クラスターおよび関連リソースの権限\{#eks-cluster-and-related-resource-permissions}

- **Service-Linked Roles**: クラスターおよびノードグループ管理用の EKS サービスリンクロールの作成

- **OIDC Provider**: OpenID Connect プロバイダーの作成、タグ付け、取得、および削除（`Vendor=zilliz-byoc` タグ要件あり）

- **IAM Role Management**: EKS ロールの読み取り、および EKS サービスへのロールの受け渡し

- **EC2 Resources**: 起動テンプレートの作成、インスタンスの実行、およびタグ管理（`Vendor=zilliz-byoc` タグ要件あり）

- **EKS Cluster Operations**: EKS クラスターの作成、更新、記述、タグ付け、および削除

- **Node Group Operations**: EKS ノードグループの作成、更新、記述、および削除

- **Addon Management**: EKS アドオンの作成、更新、記述、および削除

- **Access Entry Management**: EKS アクセスエントリおよび Pod Identity 関連付けの作成、更新、記述、および削除

