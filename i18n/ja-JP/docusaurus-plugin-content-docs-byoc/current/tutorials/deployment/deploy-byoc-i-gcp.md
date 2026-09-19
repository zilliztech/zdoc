---
title: "GCP に BYOC-I をデプロイ | BYOC"
slug: /deploy-byoc-i-gcp
sidebar_label: "GCP に BYOC-I をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、GCP Virtual Private Cloud (VPC) 内に BYOC エージェントを使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。 | BYOC"
type: origin
token: JIZEwUFZJilFtVkhlS8cD8GRnyg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# GCP に BYOC-I をデプロイ

このページでは、GCP Virtual Private Cloud (VPC) 内に BYOC エージェントを使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。

<Admonition type="info" title="Notes">

- Zilliz BYOC は現在 **General Availability** で提供されています。アクセス方法および実装の詳細については、[Zilliz Cloud support](https://zilliz.com/contact-sales) までお問い合わせください。

- このガイドでは、GCP コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

以下を満たしていることを確認してください。

- BYOC-I 組織のオーナーであること。

- [Required permissions](./deploy-byoc-i-gcp#required-permissions) に記載された権限が付与されていること。

## 適用可能な VPC リージョン\{#applicable-vpc-regions}

次の表は、Zilliz Cloud BYOC ソリューションがサポートする Google Cloud Platform (GCP) リージョンの一覧です。Zilliz Cloud コンソール上でお使いのクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
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

デプロイ環境とは、Terraform 構成ファイルを実行して BYOC-I プロジェクトのデータプレーンをデプロイするよう構成されたローカルマシン、仮想マシン (GCE)、または CI/CD パイプラインのことです。このステップでは、以下を行う必要があります。 

- **GCP 認証情報（GCP サービスアカウントまたは access key）を設定します。**

    GCP 認証情報の設定方法の詳細については、[このドキュメント](https://docs.cloud.google.com/iam/docs/service-account-creds) を参照してください。

- **最新の Terraform バイナリをインストールします。**

    Terraform のインストール方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I 組織内で **Create Project** ボタンをクリックしてデプロイを開始します。表示されるダイアログボックスで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

このステップの最後にプロジェクトが作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![TU8UwHbqjh7ZXRb7dDLcxd4ynQh](https://zdoc-images.s3.us-west-2.amazonaws.com/TU8UwHbqjh7ZXRb7dDLcxd4ynQh.png)

### ステップ 3: データプレーンを準備する\{#step-3-prepare-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイを停止します。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内でデータプレーンのデプロイはいつでも開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。 

    ![LMSYw1erBhDRh6bN0QUc17VDndb](https://zdoc-images.s3.us-west-2.amazonaws.com/LMSYw1erBhDRh6bN0QUc17VDndb.png)

1. **GCP Private Service Connect** (PSC) を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合、プライベート接続用の Private Service Connect Endpoint を作成する必要があります。詳細については、[Prepare for クラスター Connection](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

1. **Architecture** で、アプリケーションに適したアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1.  **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義した範囲内でプロジェクトのワークロードに基づき GCE インスタンス数を Zilliz Cloud が自動調整できるようにし、効率的なリソース利用を実現します。

    1. **Initial Project Size** を構成します。 

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係で異なるタイプの GCE インスタンスを使用します。これらのサービスおよびコンポーネントごとに、インスタンスタイプと台数を個別に設定できます。 

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な GCE インスタンス数を対応する **Count** フィールドに指定するだけです。

        ![IHQ6wjryihsQS0b8ABEcVsAVn4f](https://zdoc-images.s3.us-west-2.amazonaws.com/IHQ6wjryihsQS0b8ABEcVsAVn4f.png)

        **Auto-scaling** を有効にすると、対応する **Min** および **Max** フィールドを設定して、実際のプロジェクトワークロードに基づき Zilliz Cloud が GCE インスタンス数を自動スケールできるように範囲を指定する必要があります。

        ![OaihwHBQshYxlWbvRpucpKMXnfc](https://zdoc-images.s3.us-west-2.amazonaws.com/OaihwHBQshYxlWbvRpucpKMXnfc.png)

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

        **Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントの GCE インスタンスタイプと台数を調整することで、設定をカスタマイズすることもできます。ご希望の GCE インスタンスタイプが一覧にない場合は、追加のサポートについて [Zilliz support](https://zilliz.com/contact) までお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションは、階層型ストレージクラスターを作成できるかどうかを決定します。このオプションを選択すると、階層型クエリノードのインスタンスタイプと台数を設定できます。 

        ![ZOTXbgWJgoPQbox8PyYcdlwDnqe](https://zdoc-images.s3.us-west-2.amazonaws.com/zotxbgwjgopqbox8pyycdlwdnqe.png "ZOTXbgWJgoPQbox8PyYcdlwDnqe")

        <Admonition type="info" title="Notes">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の台数と **Tiered Query Node** の台数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。
        
        - BYOC で Tiered Storage が利用可能になる前に作成されたクラスターについては、Tiered Storage を手動で有効化できます。詳細は、[Enable Tiered Storage for Exisiting クラスター](./enable-tiered-storage-aws) を参照してください。

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンをデプロイする\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![B6RbbG77do1gq7xqK1xc2BzAnYc](https://zdoc-images.s3.us-west-2.amazonaws.com/b6rbbg77do1gq7xqk1xc2bzanyc.png "B6RbbG77do1gq7xqK1xc2BzAnYc")

`terraform apply` を実行する際は、以下のようにコマンドの末尾に `-var="gcp_project_id=xxx"` を追加する必要がある点に注意してください。

```shell
terraform apply \
  -var="dataplane_id=zilliz-byoc-gcp-us-west1-74xxxx" \
  -var="project_id=project-xxxxx" \
  -var="gcp_project_id=YOUR_GCP_PROJECT_ID"
```

上記 Terraform スクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイしてクラスターを作成した後は、直接 VPC アクセスまたは GCP PSC のいずれかを通じてこれらのクラスターに接続できます。詳細は、[Prepare for クラスター Connection](./prepare-for-cluster-connection) を参照してください。

## データプレーンを管理する\{#manage-dataplanes}

![QT8cbuzztosfjUxLLUycQpvAnyg](https://zdoc-images.s3.us-west-2.amazonaws.com/qt8cbuzztosfjuxlluycqpvanyg.png "QT8cbuzztosfjUxLLUycQpvAnyg")

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

標準の Terraform サンプルでは、対象の GCP プロジェクトに対して Terraform runner に次のロールと同等の権限を付与します。

- `roles/serviceusage.serviceUsageAdmin`

- `roles/compute.networkAdmin`

- `roles/compute.instanceAdmin.v1`

- `roles/container.admin`

- `roles/storage.admin`

- `roles/iam.serviceAccountAdmin`

- `roles/iam.roleAdmin`

- `roles/resourcemanager.projectIamAdmin`

- `roles/iam.serviceAccountUser`

デフォルトでは、このサンプルは `vendor=zilliz-byoc` の Resource Manager タグも有効にします。Resource Manager タグが有効な場合、Terraform runner にはさらに次の権限も必要です。

- `roles/resourcemanager.tagAdmin`

- `roles/resourcemanager.tagUser`

Terraform runner が Resource Manager タグを管理できない場合は、`vendor_tag_key_id` および `vendor_tag_value_id` を通じて事前作成済みのタグ ID を指定するか、次を設定してください。

```plaintext
enable_resource_manager_tags = false
```

### Terraform によって作成されるサービスアカウント\{#service-accounts-created-by-terraform}

Terraform サンプルでは、お客様側に 4 つのサービスアカウントを作成します。

- GKE ノードのサービスアカウント

- メンテナンス用サービスアカウント

- ストレージ用サービスアカウント

- Booter 用サービスアカウント

#### GKE Node Service Account\{#gke-node-service-account}

GKE ノードのサービスアカウントは、BYOC-I データプレーン用に作成された GKE ノードプールにアタッチされます。その権限は GKE ノードのランタイム動作用に付与されるものであり、`cloud-agent` やその他の Zilliz 管理のエージェントワークロード用ではありません。

Terraform サンプルでは、以下を付与します。

- `roles/container.defaultNodeServiceAccount`。IAM 条件により対象の BYOC-I GKE クラスターにスコープされます。

- `roles/logging.logWriter`。ノードレベルのログ書き込み用です。

- `roles/monitoring.metricWriter`。ノードレベルのメトリクス書き込み用です。

このサービスアカウントは、GKE ノードプール上でノード VM のサービスアカウントとして設定されます。Zilliz はこのサービスアカウントを impersonate せず、BYOC-I エージェントもこれをアプリケーション ID として使用しません。

#### Maintenance Service Account\{#maintenance-service-account}

メンテナンス用サービスアカウントは、アップグレードやスケーリングなどの保守操作のために、GKE にデプロイされた Agent サービスが使用するお客様側のサービスアカウントです。Zilliz Cloud は、**お客様が許可しない限り、このサービスアカウントを impersonate することも、お客様の GKE にアクセスすることもありません**。

Terraform サンプルでは、以下を付与します。

- `container.clusters.get` と `container.clusters.update` を含むカスタムのクラスターメンテナンスロール。IAM 条件により対象の BYOC-I GKE クラスターにスコープされます。

- `container.operations.get` と `container.operations.list` を含むカスタムのオペレーション閲覧ロール。対象の GKE ロケーションにスコープされます。

- `resourcemanager.projects.get` を含むカスタムのプロジェクト閲覧ロール。

- GKE ノードのサービスアカウントに対する `roles/iam.serviceAccountUser`。これにより、保守ワークフローは設定されたノード ID で対象のノードプールを操作できます。

Zilliz BYOC 組織のサービスアカウントには、このメンテナンス用サービスアカウントに対してのみ `roles/iam.serviceAccountTokenCreator` が付与されます。GKE ノード、ストレージ、または booter のサービスアカウントを impersonate する権限は付与されません。

`enable_direct_mig_resize = true` の場合、Terraform サンプルでは、GKE 管理のインスタンスグループを直接リサイズするためのオプションのカスタムロールもメンテナンス用サービスアカウントに付与します。

- `compute.instanceGroupManagers.get`

- `compute.instanceGroupManagers.update`

- `compute.zoneOperations.get`

このオプションのロールは、IAM 条件により対象クラスターの GKE 管理インスタンスグループにスコープされます。

#### Storage Service Account\{#storage-service-account}

ストレージ用サービスアカウントは、GKE Workload Identity を介して BYOC-I GCS バケットにアクセスする必要がある Kubernetes ワークロードによって使用されます。

Terraform サンプルでは、以下を付与します。

- `roles/storage.objectAdmin`。IAM 条件により BYOC-I GCS バケットにスコープされます。

- `roles/storage.bucketViewer`。IAM 条件により BYOC-I GCS バケットにスコープされます。

- ブートストラップ中に使用される固定の BYOC-I Kubernetes サービスアカウントに対する `roles/iam.workloadIdentityUser`。

- 対象 GKE クラスターの Workload Identity プリンシパルセットに対する `roles/iam.workloadIdentityUser`。これにより、後から作成されるランタイムインスタンスの名前空間とサービスアカウントがストレージ ID を使用できます。

ストレージ用サービスアカウントは、Zilliz BYOC 組織のサービスアカウントによって直接 impersonate されることはありません。アクセスは、お客様の GKE クラスター内で実行されるワークロードからの GKE Workload Identity を通じて仲介されます。

### Booter VM の権限\{#booter-vm-permissions}

GCP BYOC-I では、プライベート GKE クラスターに `cloud-agent` をインストールするために、短期間のみ存在する booter VM を使用します。booter VM は専用の booter サービスアカウントを使用します。

booter サービスアカウントには、次の目的のためのスコープ付き権限が付与されます。

- GKE クラスターの認証情報を取得する。

- `cloud-agent` に必要な Kubernetes リソースを作成および更新する。

- ブートストラップ中にロールアウトステータスと Pod ログを読み取る。

- ブートストラップ後に、設定された booter VM のみを削除する。

Resource Manager タグが有効な場合、booter の自己削除権限はさらに `vendor=zilliz-byoc` タグによって制限されます。
