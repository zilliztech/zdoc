---
title: "GCP に BYOC-I をデプロイ | BYOC"
slug: /deploy-byoc-i-gcp
sidebar_label: "GCP に BYOC-I をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、GCP Virtual Private Cloud (VPC) に BYOC agent を使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法を説明します。 | BYOC"
type: origin
token: JIZEwUFZJilFtVkhlS8cD8GRnyg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# GCP に BYOC-I をデプロイ

このページでは、GCP Virtual Private Cloud (VPC) に BYOC agent を使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法を説明します。

<Admonition type="info" icon="📘" title="注意">

- Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud support](https://zilliz.com/contact-sales) にお問い合わせください。

- このガイドでは、GCP コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

以下を確認してください。

- あなたが BYOC-I organization の所有者であること。

- [Required permissions](./deploy-byoc-i-gcp#required-permissions) に記載されている権限が付与されていること。

## 適用可能な VPC リージョン\{#applicable-vpc-regions}

次の表は、Zilliz Cloud BYOC ソリューションがサポートする Google Cloud Platform (GCP) リージョンを示しています。Zilliz Cloud コンソール上にご利用のクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

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

デプロイ環境とは、Terraform 構成ファイルを実行して BYOC-I プロジェクトのデータプレーンをデプロイするように構成されたローカルマシン、仮想マシン (GCE)、または CI/CD パイプラインのことです。このステップでは、以下を行う必要があります。 

- **GCP 認証情報（GCP service account または access key）を構成する。**

    GCP 認証情報の構成方法の詳細については、[こちらのドキュメント](https://docs.cloud.google.com/iam/docs/service-account-creds)を参照してください。

- **最新の Terraform バイナリをインストールする。**

    Terraform のインストール方法の詳細については、[こちらのドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform)を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I organization 内で **Create Project** ボタンをクリックしてデプロイを開始します。表示されたダイアログボックスで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

このステップの最後にプロジェクトが作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![TU8UwHbqjh7ZXRb7dDLcxd4ynQh](https://zdoc-images.s3.us-west-2.amazonaws.com/TU8UwHbqjh7ZXRb7dDLcxd4ynQh.png)

### ステップ 3: データプレーンを準備する\{#step-3-prepare-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイを停止します。ただし、上記で作成したプロジェクトは引き続き利用可能です。プロジェクト内ではいつでもデータプレーンのデプロイを開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。 

    ![LMSYw1erBhDRh6bN0QUc17VDndb](https://zdoc-images.s3.us-west-2.amazonaws.com/LMSYw1erBhDRh6bN0QUc17VDndb.png)

1. **GCP Private Service Connect** (PSC) を有効にするかどうかを決定します。

    このオプションを使用すると、現在のプロジェクト内の cluster へのプライベート接続が可能になります。このオプションを有効にした場合、プライベート接続のために Private Service Connect Endpoint を作成する必要があります。詳細については、[Prepare for Cluster Connection](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

1. **Architecture** で、アプリケーションに一致するアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1.  **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、プロジェクトのワークロードに基づき、定義された範囲内で GCE インスタンス数を Zilliz Cloud が自動的に調整できるようにし、効率的なリソース利用を確保します。

    1. **Initial Project Size** を構成します。 

        BYOC プロジェクトでは、query node、index services、Milvus コンポーネント、および依存関係で異なる種類の GCE インスタンスを使用します。これらのサービスおよびコンポーネントごとに、インスタンスタイプと数を個別に設定できます。 

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な GCE インスタンス数を、対応する **Count** フィールドに指定するだけです。

        ![IHQ6wjryihsQS0b8ABEcVsAVn4f](https://zdoc-images.s3.us-west-2.amazonaws.com/IHQ6wjryihsQS0b8ABEcVsAVn4f.png)

        **Auto-scaling** を有効にすると、対応する **Min** および **Max** フィールドを設定することで、実際のプロジェクトワークロードに基づいて Zilliz Cloud が GCE インスタンス数を自動スケーリングするための範囲を指定する必要があります。

        ![OaihwHBQshYxlWbvRpucpKMXnfc](https://zdoc-images.s3.us-west-2.amazonaws.com/OaihwHBQshYxlWbvRpucpKMXnfc.png)

        リソース設定を容易にするために、事前定義された 4 つのプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションと、そのプロジェクト内で作成可能な cluster 数、およびそれらの cluster に含められる entity 数の対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大 Cluster 数</p></th>
             <th colspan="3"><p>最大 Entity 数（百万）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8 ～ 16 CU の cluster を 3 つ</p></td>
             <td><p>1600 万 - 3200 万</p></td>
             <td><p>6400 万 - 1 億 2800 万</p></td>
             <td><p>3 億 2000 万 - 6 億 4000 万</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CU の cluster を 7 つ</p></td>
             <td><p>3200 万 - 1 億 2800 万</p></td>
             <td><p>1 億 2800 万 - 5 億 1200 万</p></td>
             <td><p>6 億 4000 万 - 26 億</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CU の cluster を 12 つ</p></td>
             <td><p>1 億 2800 万 - 3 億 8400 万</p></td>
             <td><p>5 億 1200 万 - 15 億</p></td>
             <td><p>26 億 - 77 億</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CU の cluster を 17 つ</p></td>
             <td><p>3 億 8400 万 - 12 億</p></td>
             <td><p>15 億 - 46 億</p></td>
             <td><p>77 億 - 230 億</p></td>
           </tr>
        </table>

        **Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントの GCE インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する GCE インスタンスタイプが一覧にない場合は、追加のサポートについて [Zilliz support](https://zilliz.com/contact) にお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションにより、tiered-storage cluster を作成できるかどうかが決まります。このオプションを選択すると、tiered query node のインスタンスタイプと数を設定できます。 

        ![ZOTXbgWJgoPQbox8PyYcdlwDnqe](https://zdoc-images.s3.us-west-2.amazonaws.com/zotxbgwjgopqbox8pyycdlwdnqe.png "ZOTXbgWJgoPQbox8PyYcdlwDnqe")

        <Admonition type="info" icon="📘" title="注意">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の数と **Tiered Query Node** の数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。
        
        - Tiered Storage が BYOC で利用可能になる前に作成された cluster については、Tiered Storage を手動で有効にできます。詳細については、[Enable Tiered Storage for Exisiting Clusters](./enable-tiered-storage-aws) を参照してください。

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

プロジェクトのデータプレーンをデプロイして cluster を作成した後は、直接 VPC アクセスまたは GCP PSC を通じてこれらの cluster に接続できます。詳細については、[Prepare for Cluster Connection](./prepare-for-cluster-connection) を参照してください。

## データプレーンを管理する\{#manage-dataplanes}

![QT8cbuzztosfjUxLLUycQpvAnyg](https://zdoc-images.s3.us-west-2.amazonaws.com/qt8cbuzztosfjuxlluycqpvanyg.png "QT8cbuzztosfjUxLLUycQpvAnyg")

### Undeploy タグが付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカードの右隅にあるステータスタグが **Undeploy** と表示されている場合、プロジェクトカード上の **Deploy Data Plane** ボタンをクリックしていつでも再度開くことができます。プロジェクト名の変更または削除を行うには、プロジェクトカード内の **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。  

### Deploying タグが付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境を準備し、表示されたコマンドを実行した後は、BYOC agent がアクティブになるまで待つ必要があります。プロジェクトカード上のステータスタグが **Deploying** と表示され、進捗率が表示されている間は、データプレーンの配置が完了するまでプロジェクト名の変更や削除はできません。

### Running タグが付いたデータプレーン\{#data-planes-with-a-running-tag}

プロジェクトカード上のステータスタグが **Running** と表示されたら、そのプロジェクト内で cluster の作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクト内に cluster が存在しないことを確認してください。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよび保守作業を支援するため、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンへアクセスできるようにしています。ガバナンスおよびセキュリティ要件を満たすために、これを無効にすることもできます。

次の手順では、Zilliz Cloud テクニカルサポートが特定された問題について連絡してきた際に、無効化した後で再びテクニカルサポートアクセスを有効にする方法を示します。

<Procedures>

1. Zilliz Cloud がデータプレーン上の問題を特定し、あなたがテクニカルサポートアクセスを無効にしている場合、当社はそのことを通知し、テクニカルサポートアクセスを申請します。

1. 対象のデータプレーンを見つけ、データプレーンカードの右下にある **...** をクリックし、ドロップダウンリストから **Technical Support Access** をクリックします。

    ![TKIEwRBp0hpQL5btdvwccQGKngZ](https://zdoc-images.s3.us-west-2.amazonaws.com/TKIEwRBp0hpQL5btdvwccQGKngZ.png)

1. 表示されたダイアログボックスで、**Technical Support Access** をオンにします。

    ![SLmCwHdrNhJiw3bzf9kc5gB4nAb](https://zdoc-images.s3.us-west-2.amazonaws.com/SLmCwHdrNhJiw3bzf9kc5gB4nAb.png)

1. すると、当社がアクセスを申請する理由と、Zilliz Cloud によって割り当てられた issue owner の ID に関する情報が表示されます。**Expected Duration** でアクセス期間を決定し、**Description** に任意の要件を入力できます。すべて設定したら、**Save** をクリックします。

    ![D8X5w8TZQhkN51bpoqHc09o0nue](https://zdoc-images.s3.us-west-2.amazonaws.com/D8X5w8TZQhkN51bpoqHc09o0nue.png)

1. トラブルシューティング中にダイアログボックスを開くと、このアクセスの終了時刻が表示されます。テクニカルサポートアクセスは、有効期限が切れるか、あなたが明示的に無効化すると再び無効になります。

    ![HL1OwXlTihXk9PbzvjbchIp0n3f](https://zdoc-images.s3.us-west-2.amazonaws.com/HL1OwXlTihXk9PbzvjbchIp0n3f.png)

</Procedures>

## 必要な権限\{#required-permissions}

このセクションでは、GCP に BYOC-I をデプロイするために必要な主要な権限をすべて確認できます。

### 必要な API\{#required-apis}

GCP BYOC-I データプレーンをデプロイするには、顧客の GCP プロジェクトで以下の API を有効にする必要があります。

- Cloud Resource Manager API: `cloudresourcemanager.googleapis.com`

- Artifact Registry API: `artifactregistry.googleapis.com`

- Compute Engine API: `compute.googleapis.com`

- Kubernetes Engine API: `container.googleapis.com`

- IAM API: `iam.googleapis.com`

- Cloud Storage API: `storage.googleapis.com`

- Service Usage API: `serviceusage.googleapis.com`

### Terraform Runner の権限\{#terraform-runner-permissions}

Terraform runner には、顧客の GCP プロジェクト内で networking、GKE、GCS、IAM、Private Service Connect、および一時的な booter VM リソースを作成するための十分な権限が必要です。

標準の Terraform 例では、Terraform runner に対して、対象の GCP プロジェクト上で以下のロールと同等の権限を付与してください。

- `roles/serviceusage.serviceUsageAdmin`

- `roles/compute.networkAdmin`

- `roles/compute.instanceAdmin.v1`

- `roles/container.admin`

- `roles/storage.admin`

- `roles/iam.serviceAccountAdmin`

- `roles/iam.roleAdmin`

- `roles/resourcemanager.projectIamAdmin`

- `roles/iam.serviceAccountUser`

デフォルトでは、この例は `vendor=zilliz-byoc` の Resource Manager タグも有効にします。Resource Manager タグが有効な場合、Terraform runner にはさらに以下も必要です。

- `roles/resourcemanager.tagAdmin`

- `roles/resourcemanager.tagUser`

Terraform runner が Resource Manager タグを管理できない場合は、事前に作成されたタグ ID を `vendor_tag_key_id` と `vendor_tag_value_id` で指定するか、以下を設定してください。

```plaintext
enable_resource_manager_tags = false
```

### Terraform によって作成される Service Account\{#service-accounts-created-by-terraform}

Terraform の例では、顧客側に 4 つの service account を作成します。

- GKE node service account

- Maintenance service account

- Storage service account

- Booter service account

#### GKE Node Service Account\{#gke-node-service-account}

GKE node service account は、BYOC-I データプレーン用に作成される GKE node pool にアタッチされます。その権限は GKE node のランタイム動作のために付与されるものであり、`cloud-agent` やその他の Zilliz 管理の agent ワークロードのためではありません。

Terraform の例では、以下を付与します。

- `roles/container.defaultNodeServiceAccount`。対象の BYOC-I GKE cluster に対して IAM 条件でスコープ設定されます。

- `roles/logging.logWriter`。node レベルのログ書き込み用。

- `roles/monitoring.metricWriter`。node レベルのメトリクス書き込み用。

この service account は、GKE node pool 上で node VM service account として構成されます。Zilliz はこの service account を偽装せず、BYOC-I agent もこれをアプリケーション ID として使用しません。

#### メンテナンス Service Account\{#maintenance-service-account}

メンテナンス service account は、お客様側の service account であり、GKE にデプロイされた Agent service が、アップグレードやスケーリングなどのメンテナンス操作に使用します。Zilliz Cloud は、**お客様が許可しない限り、この service account を impersonate することも、お客様の GKE にアクセスすることもありません**。

Terraform の例では、この service account に以下を付与します。

- `container.clusters.get` および `container.clusters.update` を含むカスタム cluster maintenance ロール。IAM condition により対象の BYOC-I GKE cluster にスコープされます。

- `container.operations.get` および `container.operations.list` を含むカスタム operation viewer ロール。対象の GKE ロケーションにスコープされます。

- `resourcemanager.projects.get` を含むカスタム project reader ロール。

- GKE node service account に対する `roles/iam.serviceAccountUser`。これにより、メンテナンスワークフローは設定済みの node identity を使用して対象 node pool を操作できます。

Zilliz BYOC organization service account には、この maintenance service account に対してのみ `roles/iam.serviceAccountTokenCreator` が付与されます。GKE node、storage、または booter service account を impersonate する権限は付与されません。

`enable_direct_mig_resize = true` の場合、Terraform の例では、GKE 管理の instance group を直接リサイズするためのオプションのカスタムロールも maintenance service account に付与します。

- `compute.instanceGroupManagers.get`

- `compute.instanceGroupManagers.update`

- `compute.zoneOperations.get`

このオプションロールは、IAM condition により対象 cluster の GKE 管理 instance group にスコープされます。

#### Storage Service Account\{#storage-service-account}

storage service account は、GKE Workload Identity を通じて BYOC-I GCS bucket へのアクセスが必要な Kubernetes ワークロードで使用されます。

Terraform の例では、この service account に以下を付与します。

- `roles/storage.objectAdmin`。IAM condition により BYOC-I GCS bucket にスコープされます。

- `roles/storage.bucketViewer`。IAM condition により BYOC-I GCS bucket にスコープされます。

- ブートストラップ中に使用される固定の BYOC-I Kubernetes service account に対する `roles/iam.workloadIdentityUser`。

- 対象 GKE cluster の Workload Identity principal set に対する `roles/iam.workloadIdentityUser`。これにより、後で作成されるランタイム instance namespace と service account が storage identity を使用できます。

storage service account は、Zilliz BYOC organization service account によって直接 impersonate されることはありません。アクセスは、お客様の GKE cluster で実行されるワークロードからの GKE Workload Identity を介して仲介されます。

### Booter VM 権限\{#booter-vm-permissions}

GCP BYOC-I は、プライベート GKE cluster に `cloud-agent` をインストールするために、短期間のみ存在する booter VM を使用します。booter VM は専用の booter service account を使用します。

booter service account には、以下を行うためのスコープ付き権限が付与されます。

- GKE cluster の認証情報を取得する。

- `cloud-agent` に必要な Kubernetes リソースを作成および更新する。

- ブートストラップ中に rollout status と pod logs を読み取る。

- ブートストラップ後に、設定された booter VM のみを削除する。

Resource Manager タグが有効な場合、booter の自己削除権限はさらに `vendor=zilliz-byoc` タグによって制限されます。
