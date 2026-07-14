---
title: "GCP に BYOC-I をデプロイ | BYOC"
slug: /deploy-byoc-i-gcp
sidebar_label: "GCP に BYOC-I をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、GCP Virtual Private Cloud (VPC) 内に BYOC agent を使用して Bring-Your-Own-Cloud (BYOC) data plane をデプロイする方法を説明します。 | BYOC"
type: origin
token: JIZEwUFZJilFtVkhlS8cD8GRnyg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# GCP に BYOC-I をデプロイ

このページでは、GCP Virtual Private Cloud (VPC) 内に BYOC agent を使用して Bring-Your-Own-Cloud (BYOC) data plane をデプロイする方法を説明します。

<Admonition type="info" icon="📘" title="注記">

- Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud support](https://zilliz.com/contact-sales) にお問い合わせください。

- このガイドでは、GCP コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

以下を確認してください。

- BYOC-I 組織の所有者であること。

- [Required permissions](./deploy-byoc-i-gcp#required-permissions) に記載された権限が付与されていること。

## 適用可能な VPC リージョン\{#applicable-vpc-regions}

以下の表は、Zilliz Cloud BYOC ソリューションがサポートする Google Cloud Platform (GCP) リージョンを示しています。Zilliz Cloud コンソール上にご利用のクラウドリージョンが見つからない場合は、support@zilliz.com までご連絡ください。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>ロケーション</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北アメリカ</p></td>
     <td><p>us-west1</p></td>
     <td><p>米国オレゴン</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>米国バージニア</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>米国アイオワ</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ</p></td>
     <td><p>europe-west3</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
   </tr>
</table>

## 手順\{#procedures}

### ステップ 1: デプロイ環境を準備する\{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraform 設定ファイルを実行して BYOC-I プロジェクトのデータプレーンをデプロイするように構成されたローカルマシン、仮想マシン (GCE)、または CI/CD パイプラインのことです。このステップでは、次の作業が必要です。 

- **GCP 認証情報（GCP サービスアカウントまたはアクセスキー）を設定する。**

    GCP 認証情報の設定方法の詳細については、[このドキュメント](https://docs.cloud.google.com/iam/docs/service-account-creds) を参照してください。

- **最新の Terraform バイナリをインストールする。**

    Terraform のインストール方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I 組織内で **Create Project** ボタンをクリックしてデプロイを開始します。表示されるダイアログボックスで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

このステップの終了時にプロジェクトが作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![TU8UwHbqjh7ZXRb7dDLcxd4ynQh](https://zdoc-images.s3.us-west-2.amazonaws.com/TU8UwHbqjh7ZXRb7dDLcxd4ynQh.png)

### ステップ 3: データプレーンを準備する\{#step-3-prepare-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイを停止します。ただし、上記で作成したプロジェクトは引き続き利用可能です。プロジェクト内でいつでもデータプレーンのデプロイを開始でき、1 つのプロジェクトに複数のデータプレーンを追加することもできます。 

    ![LMSYw1erBhDRh6bN0QUc17VDndb](https://zdoc-images.s3.us-west-2.amazonaws.com/LMSYw1erBhDRh6bN0QUc17VDndb.png)

1. **GCP Private Service Connect** (PSC) を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合、プライベート接続用の Private Service Connect Endpoint を作成する必要があります。詳細については、[Prepare for Cluster Connection](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

1. **Architecture** で、アプリケーションに一致するアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1.  **Resource Settings** では、以下の設定を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、プロジェクトのワークロードに基づいて定義された範囲内で GCE インスタンス数を Zilliz Cloud が自動的に調整できるようにし、効率的なリソース利用を確保します。

    1. **Initial Project Size** を設定します。 

        BYOC プロジェクトでは、query node、index services、Milvus コンポーネント、および依存関係がそれぞれ異なるタイプの GCE インスタンスを使用します。これらのサービスとコンポーネントについて、インスタンスタイプと数を個別に設定できます。 

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な GCE インスタンス数を対応する **Count** フィールドに指定するだけです。

        ![IHQ6wjryihsQS0b8ABEcVsAVn4f](https://zdoc-images.s3.us-west-2.amazonaws.com/IHQ6wjryihsQS0b8ABEcVsAVn4f.png)

        **Auto-scaling** を有効にすると、実際のプロジェクトワークロードに基づいて Zilliz Cloud が GCE インスタンス数を自動的にスケーリングできるように、対応する **Min** および **Max** フィールドを設定して範囲を指定する必要があります。

        ![OaihwHBQshYxlWbvRpucpKMXnfc](https://zdoc-images.s3.us-west-2.amazonaws.com/OaihwHBQshYxlWbvRpucpKMXnfc.png)

        リソース設定を容易にするために、4 つの事前定義済みプロジェクトサイズオプションが用意されています。次の表は、これらのプロジェクトサイズオプションと、プロジェクト内に作成可能なクラスター数、およびそれらのクラスターに含められるエンティティ数の対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>クラスターの最大数</p></th>
             <th colspan="3"><p>エンティティの最大数（百万）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8 ～ 16 CUs のクラスターを 3 個</p></td>
             <td><p>16 Million - 32 Million</p></td>
             <td><p>64 Million - 128 Million</p></td>
             <td><p>320 Million - 640 Million</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CUs のクラスターを 7 個</p></td>
             <td><p>32 Million - 128 Million</p></td>
             <td><p>128 Million - 512 Million</p></td>
             <td><p>640 Million - 2.6 Billion</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CUs のクラスターを 12 個</p></td>
             <td><p>128 Million - 384 Million</p></td>
             <td><p>512 Million - 1.5 Billion</p></td>
             <td><p>2.6 Billion - 7.7 Billion</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CUs のクラスターを 17 個</p></td>
             <td><p>384 Million - 1.2 Billion</p></td>
             <td><p>1.5 Billion -  4.6 Billion</p></td>
             <td><p>7.7 Billion - 23 Billion</p></td>
           </tr>
        </table>

        また、**Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントについて GCE インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する GCE インスタンスタイプが一覧にない場合は、追加のサポートについて [Zilliz support](https://zilliz.com/contact) にお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションは、階層型ストレージクラスターを作成できるかどうかを決定します。このオプションを選択すると、tiered query node のインスタンスタイプと数を設定できます。 

        ![ZOTXbgWJgoPQbox8PyYcdlwDnqe](https://zdoc-images.s3.us-west-2.amazonaws.com/zotxbgwjgopqbox8pyycdlwdnqe.png "ZOTXbgWJgoPQbox8PyYcdlwDnqe")

        <Admonition type="info" icon="📘" title="注記">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の count と **Tiered Query Node** の count の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。
        
        - BYOC で Tiered Storage が利用可能になる前に作成されたクラスターについては、手動で Tiered Storage を有効にできます。詳細については、[Enable Tiered Storage for Exisiting Clusters](./enable-tiered-storage-aws) を参照してください。

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンをデプロイする\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![B6RbbG77do1gq7xqK1xc2BzAnYc](https://zdoc-images.s3.us-west-2.amazonaws.com/b6rbbg77do1gq7xqk1xc2bzanyc.png "B6RbbG77do1gq7xqK1xc2BzAnYc")

`terraform apply` を実行する際は、次のようにコマンドの末尾に `-var="gcp_project_id=xxx"` を追加する必要がある点に注意してください。

```shell
terraform apply \
  -var="dataplane_id=zilliz-byoc-gcp-us-west1-74xxxx" \
  -var="project_id=project-xxxxx" \
  -var="gcp_project_id=YOUR_GCP_PROJECT_ID"
```

上記の Terraform スクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイしてクラスターを作成したら、これらのクラスターには直接 VPC アクセスまたは GCP PSC を介して接続できます。詳細については、[Prepare for Cluster Connection](./prepare-for-cluster-connection) を参照してください。

## データプレーンを管理する\{#manage-dataplanes}

![QT8cbuzztosfjUxLLUycQpvAnyg](https://zdoc-images.s3.us-west-2.amazonaws.com/qt8cbuzztosfjuxlluycqpvanyg.png "QT8cbuzztosfjUxLLUycQpvAnyg")

### Undeploy タグが付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカードの右隅にあるステータスタグが **Undeploy** と表示されている場合は、プロジェクトカードの **Deploy Data Plane** ボタンをクリックしていつでも再度開くことができます。プロジェクトの名前を変更または削除するには、プロジェクトカード内の **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。  

### Deploying タグが付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境を準備して表示されたコマンドを実行した後は、BYOC agent がアクティブになるまで待つ必要があります。プロジェクトカードのステータスタグが **Deploying** と表示され、進行率のパーセンテージが示されている間は、データプレーンの配置が完了するまでプロジェクトの名前変更や削除はできません。

### Running タグが付いたデータプレーン\{#data-planes-with-a-running-tag}

プロジェクトカードのステータスタグが **Running** と表示されたら、プロジェクト内でクラスターの作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクト内にクラスターが存在しないことを確認してください。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングや保守作業を支援するために、Zilliz Cloud ではデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようになっています。 

![KqXwwNWukhGXlQbytQkcbimWneb](https://zdoc-images.s3.us-west-2.amazonaws.com/KqXwwNWukhGXlQbytQkcbimWneb.png)

対象のプロジェクトのドロップダウンメニューから **Technical Support Access** をクリックすると、現在の設定を表示できます。

![YCCJw6UPIhKMZDbf4SscmH4jnyd](https://zdoc-images.s3.us-west-2.amazonaws.com/YCCJw6UPIhKMZDbf4SscmH4jnyd.png)

データガバナンスやセキュリティ要件を満たすために、これを無効にすることもできます。

## 必要な権限\{#required-permissions}

このセクションでは、GCP に BYOC-I をデプロイするために必要な主要な権限をすべて確認できます。

### 必要な API\{#required-apis}

GCP BYOC-I データプレーンをデプロイするには、お客様の GCP プロジェクトで以下の API を有効にする必要があります。

- Cloud Resource Manager API: `cloudresourcemanager.googleapis.com`

- Artifact Registry API: `artifactregistry.googleapis.com`

- Compute Engine API: `compute.googleapis.com`

- Kubernetes Engine API: `container.googleapis.com`

- IAM API: `iam.googleapis.com`

- Cloud Storage API: `storage.googleapis.com`

- Service Usage API: `serviceusage.googleapis.com`

### Terraform Runner の権限\{#terraform-runner-permissions}

Terraform runner には、お客様の GCP プロジェクト内でネットワーク、GKE、GCS、IAM、Private Service Connect、および一時的な booter VM リソースを作成するための十分な権限が必要です。

標準の Terraform サンプルでは、ターゲット GCP プロジェクトに対して Terraform runner に次の roles と同等の権限を付与します。

- `roles/serviceusage.serviceUsageAdmin`

- `roles/compute.networkAdmin`

- `roles/compute.instanceAdmin.v1`

- `roles/container.admin`

- `roles/storage.admin`

- `roles/iam.serviceAccountAdmin`

- `roles/iam.roleAdmin`

- `roles/resourcemanager.projectIamAdmin`

- `roles/iam.serviceAccountUser`

デフォルトでは、このサンプルは `vendor=zilliz-byoc` の Resource Manager tags も有効にします。Resource Manager tags が有効な場合、Terraform runner にはさらに次の権限も必要です。

- `roles/resourcemanager.tagAdmin`

- `roles/resourcemanager.tagUser`

Terraform runner が Resource Manager tags を管理できない場合は、`vendor_tag_key_id` および `vendor_tag_value_id` を通じて事前作成済みの tag ID を指定するか、次を設定してください。

```plaintext
enable_resource_manager_tags = false
```

### Terraform によって作成されるサービスアカウント\{#service-accounts-created-by-terraform}

Terraform サンプルでは、お客様側のサービスアカウントを 4 つ作成します。

- GKE node サービスアカウント

- Maintenance サービスアカウント

- Storage サービスアカウント

- Booter サービスアカウント

#### GKE Node Service Account\{#gke-node-service-account}

GKE node サービスアカウントは、BYOC-I データプレーン用に作成された GKE node pool にアタッチされます。その権限は GKE node のランタイム動作用に付与されるものであり、`cloud-agent` やその他の Zilliz 管理 agent ワークロード用ではありません。

Terraform サンプルでは、以下を付与します。

- `roles/container.defaultNodeServiceAccount`。IAM condition により対象の BYOC-I GKE クラスターにスコープされます。

- `roles/logging.logWriter`。node レベルのログ書き込み用です。

- `roles/monitoring.metricWriter`。node レベルのメトリクス書き込み用です。

このサービスアカウントは、GKE node pool 上で node VM サービスアカウントとして設定されます。Zilliz はこのサービスアカウントを impersonate せず、BYOC-I agent もこれをアプリケーション identity として使用しません。

#### Maintenance Service Account\{#maintenance-service-account}

Maintenance サービスアカウントは、アップグレードやスケーリングなどの保守操作のために、GKE にデプロイされた Agent service が使用するお客様側のサービスアカウントです。Zilliz Cloud は、**お客様が許可しない限り、このサービスアカウントを impersonate することも、お客様の GKE にアクセスすることもありません**。

Terraform サンプルでは、以下を付与します。

- `container.clusters.get` と `container.clusters.update` を含むカスタム cluster maintenance role。IAM condition により対象の BYOC-I GKE クラスターにスコープされます。

- `container.operations.get` と `container.operations.list` を含むカスタム operation viewer role。対象の GKE ロケーションにスコープされます。

- `resourcemanager.projects.get` を含むカスタム project reader role。

- GKE node サービスアカウントに対する `roles/iam.serviceAccountUser`。これにより、保守ワークフローは設定された node identity で対象の node pool を操作できます。

Zilliz BYOC organization サービスアカウントには、この maintenance サービスアカウントに対してのみ `roles/iam.serviceAccountTokenCreator` が付与されます。GKE node、storage、または booter サービスアカウントを impersonate する権限は付与されません。

`enable_direct_mig_resize = true` の場合、Terraform サンプルでは、直接的な GKE 管理インスタンスグループのリサイズ用として、maintenance サービスアカウントに次のオプションのカスタム role も付与します。

- `compute.instanceGroupManagers.get`

- `compute.instanceGroupManagers.update`

- `compute.zoneOperations.get`

このオプションの role は、IAM condition により対象クラスターの GKE 管理インスタンスグループにスコープされます。

#### Storage Service Account\{#storage-service-account}

Storage サービスアカウントは、GKE Workload Identity を介して BYOC-I GCS bucket にアクセスする必要がある Kubernetes ワークロードによって使用されます。

Terraform サンプルでは、以下を付与します。

- `roles/storage.objectAdmin`。IAM condition により BYOC-I GCS bucket にスコープされます。

- `roles/storage.bucketViewer`。IAM condition により BYOC-I GCS bucket にスコープされます。

- bootstrap 中に使用される固定の BYOC-I Kubernetes サービスアカウントに対する `roles/iam.workloadIdentityUser`。

- 対象 GKE クラスターの Workload Identity principal set に対する `roles/iam.workloadIdentityUser`。これにより、後から作成されるランタイムインスタンスの名前空間とサービスアカウントが storage identity を使用できます。

Storage サービスアカウントは、Zilliz BYOC organization サービスアカウントによって直接 impersonate されることはありません。アクセスは、お客様の GKE クラスター内で実行されるワークロードからの GKE Workload Identity を通じて仲介されます。

### Booter VM の権限\{#booter-vm-permissions}

GCP BYOC-I では、プライベート GKE クラスターに `cloud-agent` をインストールするために、短期間のみ存在する booter VM を使用します。booter VM は専用の booter サービスアカウントを使用します。

booter サービスアカウントには、次の目的のためのスコープ付き権限が付与されます。

- GKE クラスター認証情報を取得する。

- `cloud-agent` に必要な Kubernetes リソースを作成および更新する。

- bootstrap 中に rollout status と pod logs を読み取る。

- bootstrap 後に設定済みの booter VM のみを削除する。

Resource Manager tags が有効な場合、booter 自己削除権限はさらに `vendor=zilliz-byoc` tag によって制限されます。
