---
title: "BYOC-I を GCP にデプロイ | BYOC"
slug: /deploy-byoc-i-gcp
sidebar_key: deploy-byoc-i-gcp
sidebar_label: "BYOC-I を GCP にデプロイ"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、GCP Virtual Private Cloud (VPC) 内に BYOC エージェントを持つ Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法を説明します。 | BYOC"
type: origin
token: JIZEwUFZJilFtVkhlS8cD8GRnyg
sidebar_position: 6
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - 権限
  - 最小限の権限
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# GCP 上で BYOC-I をデプロイ

このページでは、GCP Virtual Private Cloud (VPC) 内に BYOC エージェントを持つ Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

- Zilliz BYOC は現在 **一般提供** されています。アクセスおよび実装の詳細については、[Zilliz Cloud サポート](https://zilliz.com/contact-sales)までお問い合わせください。

- このガイドでは、GCP コンソール上で必要なリソースを段階的に作成する方法を説明します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングする場合は、[Terraform Provider](./terraform-provider) を参照してください。

</Admonition>

## 前提条件\{#prerequisites}

以下を確認してください。

- BYOC-I 組織のオーナーであること。

- [必要な権限](./deploy-byoc-i-gcp#required-permissions) に記載された権限が付与されていること。

## 適用可能な VPC リージョン\{#applicable-vpc-regions}

次の表は、Zilliz Cloud BYOC ソリューションがサポートする Google Cloud Platform (GCP) リージョンを示しています。使用するクラウドリージョンが Zilliz Cloud コンソールに表示されない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>us-west1</p></td>
     <td><p>オレゴン州、米国</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>バージニア州、米国</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>アイオワ州、米国</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ</p></td>
     <td><p>europe-west3</p></td>
     <td><p>フランクフルト、ドイツ</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
</table>

## 手順\{#procedures}

### ステップ 1: デプロイ環境を準備する\{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraform 構成ファイルを実行し、BYOC-I プロジェクトのデータプレーンをデプロイするように構成されたローカルマシン、仮想マシン (GCE)、または CI/CD パイプラインです。このステップでは、以下が必要です。

- **GCP 認証情報を構成する (GCP サービスアカウントまたはアクセスキー)。**

    GCP 認証情報の構成方法の詳細については、[このドキュメント](https://docs.cloud.google.com/iam/docs/service-account-creds) を参照してください。

- **最新の Terraform バイナリをインストールする。**

    Terraform のインストール方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。表示されたダイアログで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

プロジェクトはこのステップの最後で作成され、**Deploy Data Plane** ダイアログにリダイレクトされます。

![TU8UwHbqjh7ZXRb7dDLcxd4ynQh](https://zdoc-images.s3.us-west-2.amazonaws.com/TU8UwHbqjh7ZXRb7dDLcxd4ynQh.png)

### ステップ 3: データプレーンを準備する\{#step-3-prepare-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイは中止されますが、上記で作成したプロジェクトは保持されます。プロジェクトでは後からいつでもデータプレーンのデプロイを開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。

    ![LMSYw1erBhDRh6bN0QUc17VDndb](https://zdoc-images.s3.us-west-2.amazonaws.com/LMSYw1erBhDRh6bN0QUc17VDndb.png)

1. **GCP Private Service Connect** (PSC) を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用の Private Service Connect Endpoint を作成する必要があります。詳細については、[クラスター接続の準備](./prepare-for-cluster-connection#private-endpoint-access)を参照してください。

1. **Architecture** で、アプリケーションに合ったアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは **X86** と **ARM** です。

1. **Resource Settings** では、以下が必要です。

    1. **Auto-scaling** を有効または無効にして、Zilliz Cloud がプロジェクトのワークロードに基づいて定義された範囲内で GCE インスタンスの数を自動的に調整し、効率的なリソース使用を確保できるようにします。

    1. **Initial Project Size** を構成します。

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なるタイプの GCE インスタンスを使用します。これらのサービスとコンポーネントのインスタンスタイプと数を個別に設定できます。

        **Auto-scaling** が無効の場合は、各プロジェクトコンポーネントに必要な GCE インスタンス数を対応する **Count** フィールドに指定するだけです。

        ![IHQ6wjryihsQS0b8ABEcVsAVn4f](https://zdoc-images.s3.us-west-2.amazonaws.com/IHQ6wjryihsQS0b8ABEcVsAVn4f.png)

        **Auto-scaling** が有効になると、対応する **Min** および **Max** フィールドを設定することで、実際のプロジェクトワークロードに基づいて Zilliz Cloud が GCE インスタンスの数を自動的にスケーリングする範囲を指定する必要があります。

        ![OaihwHBQshYxlWbvRpucpKMXnfc](https://zdoc-images.s3.us-west-2.amazonaws.com/OaihwHBQshYxlWbvRpucpKMXnfc.png)

        リソース設定を容易にするため、4 つの定義済みプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションとプロジェクト内で作成できるクラスター数、およびこれらのクラスターが含めることができるエンティティ数の対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスター数</p></th>
             <th colspan="3"><p>最大エンティティ数（百万）</p></th>
           </tr>
           <tr>
             <td><p>パフォーマンス最適化済み CU</p></td>
             <td><p>容量最適化済み CU</p></td>
             <td><p>階層型ストレージ CU</p></td>
           </tr>
           <tr>
             <td><p>小</p></td>
             <td><p>8 ～ 16 CU のクラスター 3 個</p></td>
             <td><p>1600 万 ～ 3200 万</p></td>
             <td><p>6400 万 ～ 1.28 億</p></td>
             <td><p>3.2 億 ～ 6.4 億</p></td>
           </tr>
           <tr>
             <td><p>中</p></td>
             <td><p>16 ～ 64 CU のクラスター 7 個</p></td>
             <td><p>3200 万 ～ 1.28 億</p></td>
             <td><p>1.28 億 ～ 5.12 億</p></td>
             <td><p>6.4 億 ～ 26 億</p></td>
           </tr>
           <tr>
             <td><p>大</p></td>
             <td><p>64 ～ 192 CU のクラスター 12 個</p></td>
             <td><p>1.28 億 ～ 3.84 億</p></td>
             <td><p>5.12 億 ～ 15 億</p></td>
             <td><p>26 億 ～ 77 億</p></td>
           </tr>
           <tr>
             <td><p>特大</p></td>
             <td><p>192 ～ 576 CU のクラスター 17 個</p></td>
             <td><p>3.84 億 ～ 12 億</p></td>
             <td><p>15 億 ～ 46 億</p></td>
             <td><p>77 億 ～ 230 億</p></td>
           </tr>
        </table>

        **Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントの GCE インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する GCE インスタンスタイプがリストにない場合は、さらなるサポートのために [Zilliz サポートにお問い合わせ](https://zilliz.com/contact) ください。

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションにより、階層型ストレージクラスターを作成できるかどうかが決まります。このオプションを選択すると、階層型クエリノードのインスタンスタイプと数を設定できます。

        ![ZOTXbgWJgoPQbox8PyYcdlwDnqe](https://zdoc-images.s3.us-west-2.amazonaws.com/zotxbgwjgopqbox8pyycdlwdnqe.png "ZOTXbgWJgoPQbox8PyYcdlwDnqe")

        <Admonition type="info" icon="📘" title="Notes">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。

        - **Auto-scaling** が無効の場合、**Default Query Node** の数と **Tiered Query Node** の数の合計は正の整数である必要があります。

        - **Auto-scaling** が有効の場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。

        - BYOC で階層型ストレージが利用可能になる前に作成されたクラスターでは、階層型ストレージを手動で有効にできます。詳細については、[既存クラスターで階層型ストレージを有効にする](./enable-tiered-storage-aws)を参照してください。

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンをデプロイする\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![B6RbbG77do1gq7xqK1xc2BzAnYc](https://zdoc-images.s3.us-west-2.amazonaws.com/b6rbbg77do1gq7xqk1xc2bzanyc.png "B6RbbG77do1gq7xqK1xc2BzAnYc")

上記の Terraform スクリプトの実行の詳細については、[Zilliz Cloud BYOC-I プロジェクト設定ガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイし、クラスターを作成したら、直接 VPC アクセスまたは GCP PSC を介してこれらのクラスターに接続できます。詳細については、[クラスター接続の準備](./prepare-for-cluster-connection)を参照してください。

## データプレーンの管理\{#manage-dataplanes}

![QT8cbuzztosfjUxLLUycQpvAnyg](https://zdoc-images.s3.us-west-2.amazonaws.com/qt8cbuzztosfjuxlluycqpvanyg.png "QT8cbuzztosfjUxLLUycQpvAnyg")

### Undeploy タグの付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカードの右上隅のステータスタグが **Undeploy** と表示されている場合は、いつでもプロジェクトカードの **Deploy Data Plane** ボタンをクリックして再度開くことができます。プロジェクトの名前を変更または削除するには、プロジェクトカードの **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。

### Deploying タグの付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境を準備し、表示されたコマンドを実行したら、BYOC エージェントがアクティブ化されるまで待つ必要があります。プロジェクトカードのステータスタグが **Deploying** と表示され、進行状況のパーセンテージが表示されている場合、データプレーンが準備できるまでプロジェクトの名前を変更または削除することはできません。

### Running タグの付いたデータプレーン\{#data-planes-with-a-running-tag}

プロジェクトカードのステータスタグが **Running** と表示されると、プロジェクト内でクラスターの作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクト内にクラスターがないことを確認してください。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス操作を支援するため、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようにしています。

![KqXwwNWukhGXlQbytQkcbimWneb](https://zdoc-images.s3.us-west-2.amazonaws.com/KqXwwNWukhGXlQbytQkcbimWneb.png)

対象プロジェクトのドロップダウンメニューから **Technical Support Access** をクリックして、現在の設定を表示します。

![YCCJw6UPIhKMZDbf4SscmH4jnyd](https://zdoc-images.s3.us-west-2.amazonaws.com/YCCJw6UPIhKMZDbf4SscmH4jnyd.png)

データガバナンスおよびセキュリティ要件を満たすために、これを無効にすることができます。

## 必要な権限\{#required-permissions}

このセクションでは、GCP 上で BYOC-I をデプロイするために必要な主要な権限をすべて紹介します。

### 必要な API\{#required-apis}

GCP BYOC-I データプレーンをデプロイするには、お客様の GCP プロジェクトで次の API を有効にする必要があります。

- Cloud Resource Manager API: `cloudresourcemanager.googleapis.com`

- Artifact Registry API: `artifactregistry.googleapis.com`

- Compute Engine API: `compute.googleapis.com`

- Kubernetes Engine API: `container.googleapis.com`

- IAM API: `iam.googleapis.com`

- Cloud Storage API: `storage.googleapis.com`

- Service Usage API: `serviceusage.googleapis.com`

### Terraform Runner の権限\{#terraform-runner-permissions}

Terraform runner には、お客様の GCP プロジェクトでネットワーク、GKE、GCS、IAM、Private Service Connect、および一時的な booter VM リソースを作成するための十分な権限が必要です。

標準の Terraform サンプルでは、Terraform runner に対象 GCP プロジェクトで次のロールと同等の権限を付与します。

- `roles/serviceusage.serviceUsageAdmin`

- `roles/compute.networkAdmin`

- `roles/compute.instanceAdmin.v1`

- `roles/container.admin`

- `roles/storage.admin`

- `roles/iam.serviceAccountAdmin`

- `roles/iam.roleAdmin`

- `roles/resourcemanager.projectIamAdmin`

- `roles/iam.serviceAccountUser`

デフォルトでは、このサンプルは `vendor=zilliz-byoc` の Resource Manager タグも有効にします。Resource Manager タグを有効にする場合、Terraform runner には次の権限も必要です。

- `roles/resourcemanager.tagAdmin`

- `roles/resourcemanager.tagUser`

Terraform runner が Resource Manager タグを管理できない場合は、`vendor_tag_key_id` と `vendor_tag_value_id` を通じて事前作成済みのタグ ID を指定するか、次を設定します。

```plaintext
enable_resource_manager_tags = false
```

### Terraform によって作成されるサービスアカウント\{#service-accounts-created-by-terraform}

Terraform サンプルは、お客様側に 4 つのサービスアカウントを作成します。

- GKE ノードサービスアカウント

- メンテナンスサービスアカウント

- ストレージサービスアカウント

- Booter サービスアカウント

#### GKE ノードサービスアカウント\{#gke-node-service-account}

GKE ノードサービスアカウントは、BYOC-I データプレーン用に作成される GKE ノードプールにアタッチされます。その権限は GKE ノードのランタイム動作用に付与されるもので、`cloud-agent` やその他の Zilliz 管理エージェントワークロード用ではありません。

Terraform サンプルは、このサービスアカウントに次の権限を付与します。

- `roles/container.defaultNodeServiceAccount`: 対象 BYOC-I GKE クラスターに対する IAM 条件でスコープ設定されます。

- `roles/logging.logWriter`: ノードレベルのログ書き込み用です。

- `roles/monitoring.metricWriter`: ノードレベルのメトリクス書き込み用です。

このサービスアカウントは、GKE ノードプールでノード VM サービスアカウントとして構成されます。Zilliz はこのサービスアカウントを偽装せず、BYOC-I エージェントもアプリケーション ID として使用しません。

#### メンテナンスサービスアカウント\{#maintenance-service-account}

メンテナンスサービスアカウントは、Zilliz BYOC 組織サービスアカウントがデータプレーンのメンテナンス操作のために偽装できる、お客様側のサービスアカウントです。

Terraform サンプルは、このサービスアカウントに次の権限を付与します。

- `container.clusters.get` と `container.clusters.update` を持つカスタムクラスター管理ロール。対象 BYOC-I GKE クラスターに対する IAM 条件でスコープ設定されます。

- `container.operations.get` と `container.operations.list` を持つカスタム操作閲覧ロール。対象 GKE ロケーションにスコープ設定されます。

- `resourcemanager.projects.get` を持つカスタムプロジェクト閲覧ロール。

- GKE ノードサービスアカウントに対する `roles/iam.serviceAccountUser`。これにより、メンテナンスワークフローは構成済みのノード ID で対象ノードプールを操作できます。

Zilliz BYOC 組織サービスアカウントには、このメンテナンスサービスアカウントに対してのみ `roles/iam.serviceAccountTokenCreator` が付与されます。GKE ノード、ストレージ、または booter サービスアカウントを偽装する権限は付与されません。

`enable_direct_mig_resize = true` の場合、Terraform サンプルは、GKE 管理インスタンスグループの直接リサイズ用にメンテナンスサービスアカウントへオプションのカスタムロールも付与します。

- `compute.instanceGroupManagers.get`

- `compute.instanceGroupManagers.update`

- `compute.zoneOperations.get`

このオプションロールは、対象クラスターの GKE 管理インスタンスグループに対する IAM 条件でスコープ設定されます。

#### ストレージサービスアカウント\{#storage-service-account}

ストレージサービスアカウントは、GKE Workload Identity を通じて BYOC-I GCS バケットへアクセスする必要がある Kubernetes ワークロードによって使用されます。

Terraform サンプルは、このサービスアカウントに次の権限を付与します。

- `roles/storage.objectAdmin`: BYOC-I GCS バケットに対する IAM 条件でスコープ設定されます。

- `roles/storage.bucketViewer`: BYOC-I GCS バケットに対する IAM 条件でスコープ設定されます。

- ブートストラップ中に使用される固定の BYOC-I Kubernetes サービスアカウントに対する `roles/iam.workloadIdentityUser`。

- 対象 GKE クラスターの Workload Identity principal set に対する `roles/iam.workloadIdentityUser`。これにより、後で作成されるランタイムインスタンスの名前空間とサービスアカウントがストレージ ID を使用できます。

ストレージサービスアカウントは、Zilliz BYOC 組織サービスアカウントから直接偽装されることはありません。アクセスは、お客様の GKE クラスターで実行されるワークロードから GKE Workload Identity を通じて仲介されます。

### Booter VM の権限\{#booter-vm-permissions}

GCP BYOC-I は、プライベート GKE クラスターに `cloud-agent` をインストールするために短時間だけ存在する booter VM を使用します。booter VM は専用の booter サービスアカウントを使用します。

booter サービスアカウントには、次の操作にスコープ設定された権限が付与されます。

- GKE クラスター認証情報を取得する。

- `cloud-agent` に必要な Kubernetes リソースを作成および更新する。

- ブートストラップ中にロールアウトステータスと Pod ログを読み取る。

- ブートストラップ後に構成済みの booter VM のみを削除する。

Resource Manager タグが有効な場合、booter の自己削除権限は `vendor=zilliz-byoc` タグによってさらに制約されます。

