---
title: "BYOC-I を Microsoft Azure にデプロイ | BYOC"
slug: /deploy-byoc-i-azure
sidebar_key: deploy-byoc-i-azure
sidebar_label: "BYOC-I を Microsoft Azure にデプロイ"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Microsoft Azure Virtual Network に BYOC エージェントを持つ Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法を説明します。 | BYOC"
type: origin
token: QuBiwrIJdiDw3ckVDKBcPofinfe
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - microsoft azure
  - 権限
  - 最小限の権限
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Microsoft Azure 上での BYOC-I のデプロイ

このページでは、Microsoft Azure Virtual ネットワーク 内に BYOC エージェントを持つ Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC は現在 <strong>一般提供</strong> されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud サポート</a>までお問い合わせください。</p></li>
<li><p>このガイドでは、Microsoft Azure コンソール上で必要なリソースを段階的に作成する方法を説明します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングする場合は、<a href="./terraform-provider">Terraform Provider</a> を参照してください。</p></li>
</ul>

</Admonition>

## 前提条件\{#prerequisites}

以下を確認してください。

- BYOC-I 組織のオーナーであること。

- [必要な権限](./deploy-byoc-i-aws#required-permissions) に記載された権限が付与されていること。

## 手順\{#procedures}

### ステップ 1: デプロイ環境の準備\{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraform 構成ファイルを実行し、BYOC-I プロジェクトのデータプレーンをデプロイするために構成されたローカルマシン、仮想マシン (VM)、または CI/CD パイプラインです。このステップでは、以下が必要です。

- **Microsoft Azure 認証情報の構成**

    Microsoft Azure 認証情報には、サブスクリプション ID とリソースグループ名が含まれます。

    **Azure Portal (UI)**

    - **サブスクリプション ID:**

        ![UCcVbQX7boMNMLxoiK8ccyM9ngd](https://zdoc-images.s3.us-west-2.amazonaws.com/uccvbqx7bomnmlxoik8ccym9ngd.png "UCcVbQX7boMNMLxoiK8ccyM9ngd")

        <Procedures>

        1. 上部の検索バーまたはホームページから **サブスクリプション** に移動します。

        1. サブスクリプションを選択します。

        1. 概要ページの **Essentials** セクションで `Subscription ID` を確認します。

        </Procedures>

    - **リソースグループ名:**

        リソースグループは、Azure ソリューションの関連リソースを保持するコンテナです。

        ![HY2ybEyBHoOrwTxvvsxcvBDFnOe](https://zdoc-images.s3.us-west-2.amazonaws.com/hy2ybeybhoorwtxvvsxcvbdfnoe.png "HY2ybEyBHoOrwTxvvsxcvBDFnOe")

        <Procedures>

        1. 左側のメニューから **リソースグループ** に移動します。

        1. **Name** 列に名前が表示されます。

            表示されていない場合は、新規作成して Zilliz Cloud に提供する必要があります。後で Terraform スクリプトを実行すると、仮想マシン (VM)、仮想ネットワーク (VNet)、Azure Kubernetes Service (AKS) クラスターを含むすべての必要なリソースがリソースグループに追加されます。

        </Procedures>

- **アクセス制御 (IAM) 権限の追加**

    Terraform スクリプトを実行するロールに **Contributor** および **User Access Administrator** の権限を割り当てます。

    ![P0NbbtVyTofpGmxtk1jcpQYsnTe](https://zdoc-images.s3.us-west-2.amazonaws.com/p0nbbtvytofpgmxtk1jcpqysnte.png "P0NbbtVyTofpGmxtk1jcpQYsnTe")

    <Procedures>

    1. 左側のメニューから **アクセス制御 (IAM)** に移動します。

    1. **+ 追加** をクリックし、ドロップダウンリストから **ロールの割り当ての追加** を選択します。

    1. **ロール** タブで **Privileged administrator roles** をクリックし、**Contributor** でフィルタリングして **Next** をクリックします。

    1. **メンバー** タブで、**アクセスの割り当て先** で **User, group, or service principal** または **Managed entity** を選択し、**+ メンバーの選択** をクリックします。

        ユーザー、グループ、またはサービスプリンシパルが Terraform スクリプトの実行に使用される場合は **User, group, or service principal** を選択します。それ以外の場合は **Managed entity** を選択します。

    1. **Next** をクリックし、設定を確認して **Review + assign** をクリックして保存します。

    1. 上記の手順を **User Access Administrator** ロールについても繰り返します。

    </Procedures>

- **最新の Terraform バイナリのインストール**

    Terraform のインストールの詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトの作成\{#step-2-create-a-project}

BYOC-I 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。表示されたダイアログで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

プロジェクトはこのステップの最後で作成され、**Deploy Data Plane** ダイアログにリダイレクトされます。

![Wc5KwW4BihKe17beYFccNdb3nCf](https://zdoc-images.s3.us-west-2.amazonaws.com/Wc5KwW4BihKe17beYFccNdb3nCf.png)

### ステップ 3: データプレーンをデプロイする\{#step-3-deploy-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイは中止されますが、上記で作成したプロジェクトは保持されます。プロジェクトでは後からいつでもデータプレーンのデプロイを開始でき、1つのプロジェクトに複数のデータプレーンを追加できます。

    ![M8EWwH1WJhTkVBbyJLOcWEDjnqN](https://zdoc-images.s3.us-west-2.amazonaws.com/M8EWwH1WJhTkVBbyJLOcWEDjnqN.png)

1. **Azure プライベート Service Connect** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用の VPC エンドポイントを作成する必要があります。

1. [ステップ 1](./deploy-byoc-i-azure#step-1-prepare-the-deployment-environment) で取得した Azure の **サブスクリプション ID** と **リソースグループ名** を入力します。

1. **Architecture** で、アプリケーションに合ったアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは **X86** と **ARM** です。

1. **リソース設定** では、以下が必要です。

    1. **オートスケーリング** を有効または無効にして、Zilliz Cloud がプロジェクトのワークロードに基づいて定義された範囲内で VM インスタンスの数を自動的に調整し、効率的なリソース使用を確保できるようにします。

    1. **初期プロジェクトサイズ** を構成します。

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なるタイプの VM インスタンスを使用します。これらのサービスとコンポーネントのインスタンスタイプと数を個別に設定できます。

        **オートスケーリング** が無効の場合は、各プロジェクトコンポーネントに必要な VM インスタンスの数を対応する **Count** フィールドに指定するだけです。

        ![MzcibkvtSoZZK6xcsFncpd0Gn2f](https://zdoc-images.s3.us-west-2.amazonaws.com/mzcibkvtsozzk6xcsfncpd0gn2f.png "MzcibkvtSoZZK6xcsFncpd0Gn2f")

        **オートスケーリング** を有効にすると、実際のプロジェクトワークロードに基づいて Zilliz Cloud が VM インスタンスの数を自動的にスケーリングする範囲を、対応する **Min** および **Max** フィールドを設定して指定する必要があります。

        ![IbqMbM0lGoNweKxba4Hcw0Ien4e](https://zdoc-images.s3.us-west-2.amazonaws.com/ibqmbm0lgonwekxba4hcw0ien4e.png "IbqMbM0lGoNweKxba4Hcw0Ien4e")

        リソース設定を容易にするため、4 つの定義済みプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションとプロジェクト内で作成できるクラスターの数、および各クラスターが含めることができるエンティティの数の対応関係を示しています。

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
             <td><p>8 ～ 16 CU のクラスター 3 つ</p></td>
             <td><p>2000 万 ～ 4000 万</p></td>
             <td><p>6400 万 ～ 1.28 億</p></td>
             <td><p>3.2 億 ～ 6.4 億</p></td>
           </tr>
           <tr>
             <td><p>中</p></td>
             <td><p>16 ～ 64 CU のクラスター 7 つ</p></td>
             <td><p>4000 万 ～ 1.6 億</p></td>
             <td><p>1.28 億 ～ 5.12 億</p></td>
             <td><p>6.4 億 ～ 26 億</p></td>
           </tr>
           <tr>
             <td><p>大</p></td>
             <td><p>64 ～ 192 CU のクラスター 12 つ</p></td>
             <td><p>1.6 億 ～ 4.8 億</p></td>
             <td><p>5.12 億 ～ 15 億</p></td>
             <td><p>26 億 ～ 77 億</p></td>
           </tr>
           <tr>
             <td><p>特大</p></td>
             <td><p>192 ～ 576 CU のクラスター 17 つ</p></td>
             <td><p>4.8 億 ～ 14.4 億</p></td>
             <td><p>15 億 ～ 46 億</p></td>
             <td><p>77 億 ～ 230 億</p></td>
           </tr>
        </table>

        **初期プロジェクトサイズ** で **Custom** を選択し、すべてのデータプレーンコンポーネントの VM インスタンスタイプと数を調整して、設定をカスタマイズすることもできます。希望する VM インスタンスタイプがリストにない場合は、[Zilliz サポートにお問い合わせ](https://zilliz.com/contact) ください。

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションにより、階層型ストレージクラスターを作成できるかどうかが決まります。このオプションを選択すると、階層型クエリノードのインスタンスタイプと数を設定できます。

        ![Aolab6yB3o8Z3mxDFCycMzNqnTf](https://zdoc-images.s3.us-west-2.amazonaws.com/aolab6yb3o8z3mxdfcycmznqntf.png "Aolab6yB3o8Z3mxDFCycMzNqnTf")

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p><strong>Project Size</strong> での選択は、<strong>Tiered Storage Node</strong> の設定には影響しません。</p></li>
        <li><p><strong>Auto-scaling</strong> が無効の場合、<strong>Default Query Node</strong> の数と <strong>Tiered Query Node</strong> の数の合計は正の整数である必要があります。</p></li>
        <li><p><strong>Auto-scaling</strong> が有効の場合、<strong>Default Query Node</strong> と <strong>Tiered Query Node</strong> の両方の <strong>Min</strong> 値の合計は正の整数である必要があります。</p></li>
        </ul>

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンのデプロイ\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![X3s2bYas0o5ICVxZ18rcta5TnLd](https://zdoc-images.s3.us-west-2.amazonaws.com/x3s2byas0o5icvxz18rcta5tnld.png "X3s2bYas0o5ICVxZ18rcta5TnLd")

上記の Terraform スクリプトの実行の詳細については、[Zilliz Cloud BYOC-I プロジェクト設定ガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイし、クラスターを作成したら、直接 VPC アクセスまたは Azure プライベート Link を介してこれらのクラスターに接続できます。詳細については、[BYOC クラスターへの接続](./prepare-for-cluster-connection) を参照してください。

## データプレーンの管理\{#manage-dataplanes}

![IqvEwsg5ah4UaAb56tmcbOOlnIR](https://zdoc-images.s3.us-west-2.amazonaws.com/IqvEwsg5ah4UaAb56tmcbOOlnIR.png)

### Undeploy タグの付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカードの右上隅のステータスタグが **デプロイ解除** と表示されている場合は、プロジェクトカードの **Deploy データプレーン** ボタンをクリックしていつでも再度開くことができます。プロジェクトの名前を変更または削除するには、プロジェクトカードの **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。

### Deploying タグの付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境の準備が完了し、表示されたコマンドを実行したら、BYOC エージェントがアクティブ化するのを待つ必要があります。プロジェクトカードのステータスタグが **デプロイ中** と表示され、進行状況のパーセンテージが表示されている場合は、データプレーンが準備できるまでプロジェクトの名前を変更または削除することはできません。

### Running タグの付いたデータプラン\{#data-plans-with-a-running-tag}

プロジェクトカードのステータスタグが **Running** と表示されると、プロジェクト内でクラスターの作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクト内にクラスターが存在しないことを確認してください。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス操作を支援するため、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようにしています。

![LozAb735eoX00UxLYAKcWqY2nkG](https://zdoc-images.s3.us-west-2.amazonaws.com/lozab735eox00uxlyakcwqy2nkg.png "LozAb735eoX00UxLYAKcWqY2nkG")

対象プロジェクトのドロップダウンメニューから **テクニカルサポートアクセス** をクリックして、現在の設定を確認します。

![NdnSbwFbkokOPpxaW1ocGwklnab](https://zdoc-images.s3.us-west-2.amazonaws.com/ndnsbwfbkokoppxaw1ocgwklnab.png "NdnSbwFbkokOPpxaW1ocGwklnab")

データガバナンスおよびセキュリティ要件を満たすために、これを無効にすることができます。
