---
title: "Microsoft Azure に BYOC-I をデプロイ | BYOC"
slug: /deploy-byoc-i-azure
sidebar_label: "Microsoft Azure に BYOC-I をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Microsoft Azure Virtual Network 内に BYOC エージェントを使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。 | BYOC"
type: origin
token: QuBiwrIJdiDw3ckVDKBcPofinfe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Microsoft Azure に BYOC-I をデプロイ

このページでは、Microsoft Azure Virtual Network 内に BYOC エージェントを使用して Bring-Your-Own-Cloud (BYOC) データプレーンをデプロイする方法について説明します。

<Admonition type="info" icon="📘" title="注意">

- Zilliz BYOC は現在 **General Availability** で提供されています。利用方法および実装の詳細については、[Zilliz Cloud サポート](https://zilliz.com/contact-sales)までお問い合わせください。

- このガイドでは、Microsoft Azure コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

以下を確認してください。 

- BYOC-I 組織のオーナーであること。

- [Required permissions](./deploy-byoc-i-aws#required-permissions) に記載されている権限が付与されていること。

## 適用可能なリージョン\{#applicable-regions}

次の表は、Zilliz Cloud BYOC ソリューションがサポートする AWS クラウドリージョンを示しています。Zilliz Cloud コンソールでお使いのクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>East US</p></td>
     <td><p>米国バージニア州</p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>米国バージニア州</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>米国アイオワ州</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>Germany West Central</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>アイルランド</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>Central India</p></td>
     <td><p>インド、プネー</p></td>
   </tr>
</table>

## 手順\{#procedures}

### ステップ 1: デプロイ環境を準備する\{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraform 設定ファイルを実行して BYOC-I プロジェクトのデータプレーンをデプロイするように構成されたローカルマシン、仮想マシン (VM)、または CI/CD パイプラインです。このステップでは、以下を行う必要があります。 

- **Microsoft Azure 認証情報を設定します。**

    Microsoft Azure 認証情報には、サブスクリプション ID とリソースグループ名が含まれます。 

    **Azure Portal (UI)**

    - **Subscription ID:**

        ![UCcVbQX7boMNMLxoiK8ccyM9ngd](https://zdoc-images.s3.us-west-2.amazonaws.com/uccvbqx7bomnmlxoik8ccym9ngd.png "UCcVbQX7boMNMLxoiK8ccyM9ngd")

        <Procedures>

        1. 上部の検索バーまたはホームページから **Subscriptions** に移動します。

        1. 対象のサブスクリプションを選択します。

        1. Overview ページの **Essentials** セクションで `Subscription ID` を確認します。

        </Procedures>

    - **Resource Group Name:**

        リソースグループは、Azure ソリューションに関連するリソースを保持するコンテナです。 

        ![HY2ybEyBHoOrwTxvvsxcvBDFnOe](https://zdoc-images.s3.us-west-2.amazonaws.com/hy2ybeybhoorwtxvvsxcvbdfnoe.png "HY2ybEyBHoOrwTxvvsxcvBDFnOe")

        <Procedures>

        1. 左側のメニューから **Resource groups** に移動します。

        1. 名前は **Name** 列に表示されます。 

            何も表示されない場合は、リソースグループを作成して、その名前を Zilliz Cloud に提供する必要がある場合があります。後で Terraform スクリプトを実行すると、仮想マシン (VM)、仮想ネットワーク (VNet)、Azure Kubernetes Service (AKS) クラスターなど、必要なすべてのリソースがリソースグループに追加されます。

        </Procedures>

- **アクセス制御 (IAM) 権限を追加します**

    Terraform スクリプトを実行するロールに、**Contributor** および **User Access Administrator** 権限を割り当てます。

    ![P0NbbtVyTofpGmxtk1jcpQYsnTe](https://zdoc-images.s3.us-west-2.amazonaws.com/p0nbbtvytofpgmxtk1jcpqysnte.png "P0NbbtVyTofpGmxtk1jcpQYsnTe")

    <Procedures>

    1. 左側のメニューから **Access control (IAM)** に移動します。

    1. **+ Add** をクリックし、ドロップダウンリストから **Add role assignment** を選択します。

    1. **Role** タブで **Privileged administrator roles** をクリックし、**Contributor** で絞り込んで **Next** をクリックします。

    1. **Members** タブで、**Assign access to** の **User, group, or service principal** または **Managed entity** を選択し、**+ Select members** をクリックします。

        Terraform スクリプトの実行にユーザー、グループ、またはサービスプリンシパルを使用する場合は **User, group, or service principal** を選択します。そうでない場合は **Managed entity** を選択します。

    1. **Next** をクリックし、設定を確認してから **Review + assign** をクリックして保存します。

    1. 上記の手順を **User Access Administrator** ロールについても繰り返します。

    </Procedures>

- **最新の Terraform バイナリをインストールします。**

    Terraform のインストール方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。表示されるダイアログボックスで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

このステップの最後にプロジェクトが作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![Wc5KwW4BihKe17beYFccNdb3nCf](https://zdoc-images.s3.us-west-2.amazonaws.com/Wc5KwW4BihKe17beYFccNdb3nCf.png)

### ステップ 3: データプレーンを準備する\{#step-3-prepare-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックすると、データプレーンのデプロイを中止できます。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内ではいつでもデータプレーンのデプロイを開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。 

    ![M8EWwH1WJhTkVBbyJLOcWEDjnqN](https://zdoc-images.s3.us-west-2.amazonaws.com/M8EWwH1WJhTkVBbyJLOcWEDjnqN.png)

1. **Azure Private Service Connect** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続のために VPC Endpoint を作成する必要があります。

1. [ステップ 1](./deploy-byoc-i-azure#step-1-prepare-the-deployment-environment) で取得した Azure の **Subscription ID** と **Resource Group Name** を入力します。

1. **Architecture** で、アプリケーションに一致するアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。使用可能なオプションは **X86** と **ARM** です。

1.  **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義した範囲内でプロジェクトのワークロードに基づいて VM インスタンス数を Zilliz Cloud が自動調整できるようにし、効率的なリソース使用を実現します。

    1. **Initial Project Size** を設定します。 

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なる種類の VM インスタンスを使用します。これらのサービスおよびコンポーネントごとに、インスタンスタイプと数を個別に設定できます。 

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な VM インスタンス数を、対応する **Count** フィールドに指定するだけです。

        ![DYwHb4uOioMCbZxajkHc6unEn8f](https://zdoc-images.s3.us-west-2.amazonaws.com/dywhb4uoiomcbzxajkhc6unen8f.png "DYwHb4uOioMCbZxajkHc6unEn8f")

        **Auto-scaling** を有効にした場合は、実際のプロジェクトワークロードに基づいて Zilliz Cloud が VM インスタンス数を自動スケーリングできるよう、対応する **Min** フィールドと **Max** フィールドを設定して範囲を指定する必要があります。

        ![As6Ebvzaoo4iccxsxdlctOCRnpd](https://zdoc-images.s3.us-west-2.amazonaws.com/as6ebvzaoo4iccxsxdlctocrnpd.png "As6Ebvzaoo4iccxsxdlctOCRnpd")

        リソース設定を容易にするために、あらかじめ定義された 4 つのプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成可能なクラスター数、および各クラスターに含めることができるエンティティ数との対応を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスター数</p></th>
             <th colspan="3"><p>最大エンティティ数 (百万)</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8～16 CU のクラスターを 3 つ</p></td>
             <td><p>16 Million - 32 Million</p></td>
             <td><p>64 Million - 128 Million</p></td>
             <td><p>320 Million - 640 Million</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16～64 CU のクラスターを 7 つ</p></td>
             <td><p>32 Million - 128 Million</p></td>
             <td><p>128 Million - 512 Million</p></td>
             <td><p>640 Million - 2.6 Billion</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64～192 CU のクラスターを 12 個</p></td>
             <td><p>128 Million - 384 Million</p></td>
             <td><p>512 Million - 1.5 Billion</p></td>
             <td><p>2.6 Billion - 7.7 Billion</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192～576 CU のクラスターを 17 個</p></td>
             <td><p>384 Million - 1.2 Billion</p></td>
             <td><p>1.5 Billion -  4.6 Billion</p></td>
             <td><p>7.7 Billion - 23 Billion</p></td>
           </tr>
        </table>

        **Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントに対して VM インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する VM インスタンスタイプが一覧にない場合は、さらにサポートを受けるために [Zilliz support にお問い合わせ](https://zilliz.com/contact)ください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションにより、階層型ストレージクラスターを作成できるかどうかが決まります。このオプションを選択すると、階層型クエリノードのインスタンスタイプと数を設定できます。 

        ![Aolab6yB3o8Z3mxDFCycMzNqnTf](https://zdoc-images.s3.us-west-2.amazonaws.com/aolab6yb3o8z3mxdfcycmznqntf.png "Aolab6yB3o8Z3mxDFCycMzNqnTf")

        <Admonition type="info" icon="📘" title="注意">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の数と **Tiered Query Node** の数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンをデプロイする\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![X3s2bYas0o5ICVxZ18rcta5TnLd](https://zdoc-images.s3.us-west-2.amazonaws.com/x3s2byas0o5icvxz18rcta5tnld.png "X3s2bYas0o5ICVxZ18rcta5TnLd")

上記の Terraform スクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイしてクラスターを作成したら、直接 VPC アクセスまたは Azure Private Link 経由でこれらのクラスターに接続できます。詳細については、[Connect to BYOC Clusters](./prepare-for-cluster-connection) を参照してください。

## データプレーンの管理\{#manage-dataplanes}

![IqvEwsg5ah4UaAb56tmcbOOlnIR](https://zdoc-images.s3.us-west-2.amazonaws.com/IqvEwsg5ah4UaAb56tmcbOOlnIR.png)

### Undeploy タグが付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカードの右上にあるステータスタグが **Undeploy** と表示されている場合は、プロジェクトカードの **Deploy Data Plane** ボタンをいつでもクリックして再度開くことができます。プロジェクトの名前変更または削除を行うには、プロジェクトカードの **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。  

### Deploying タグが付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境を準備して表示されたコマンドを実行したら、BYOC エージェントが有効化されるまで待つ必要があります。プロジェクトカードのステータスタグが **Deploying** と表示され、進行率が示されている間は、データプレーンの配置が完了するまでプロジェクトの名前変更または削除はできません。

### Running タグが付いたデータプレーン\{#data-plans-with-a-running-tag}

プロジェクトカードのステータスタグが **Running** と表示されたら、そのプロジェクトでクラスターの作成を開始できます。実行中のプロジェクトの名前変更または削除を行うには、プロジェクト内にクラスターが存在しないことを確認してください。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス作業を支援するため、Zilliz Cloud ではデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようになっています。 

![LozAb735eoX00UxLYAKcWqY2nkG](https://zdoc-images.s3.us-west-2.amazonaws.com/lozab735eox00uxlyakcwqy2nkg.png "LozAb735eoX00UxLYAKcWqY2nkG")

対象プロジェクトのドロップダウンメニューから **Technical Support Access** をクリックすると、現在の設定を確認できます。

![NdnSbwFbkokOPpxaW1ocGwklnab](https://zdoc-images.s3.us-west-2.amazonaws.com/ndnsbwfbkokoppxaw1ocgwklnab.png "NdnSbwFbkokOPpxaW1ocGwklnab")

データガバナンスおよびセキュリティ要件に対応するために、これを無効にすることができます。

