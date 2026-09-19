---
title: "Microsoft Azure に BYOC-I をデプロイする | BYOC"
slug: /deploy-byoc-i-azure
sidebar_label: "Microsoft Azure に BYOC-I をデプロイする"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Microsoft Azure Virtual Network 内に BYOC エージェントを使用して Bring-Your-Own-Cloud（BYOC）データプレーンをデプロイする方法について説明します。 | BYOC"
type: origin
token: QuBiwrIJdiDw3ckVDKBcPofinfe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Microsoft Azure に BYOC-I をデプロイする

このページでは、Microsoft Azure Virtual Network 内に BYOC エージェントを使用して Bring-Your-Own-Cloud（BYOC）データプレーンをデプロイする方法について説明します。

<Admonition type="info" title="Notes">

- Zilliz BYOC は現在 **General Availability** で提供されています。アクセス方法および実装の詳細については、[Zilliz Cloud サポート](https://zilliz.com/contact-sales) までお問い合わせください。

- このガイドでは、Microsoft Azure コンソール上で必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 事前準備\{#prerequisites}

以下を満たしていることを確認してください。 

- BYOC-I 組織のオーナーであること。

- [必要な権限](./deploy-byoc-i-aws#required-permissions) に記載された権限が付与されていること。

## 適用可能なリージョン\{#applicable-regions}

次の表は、Zilliz Cloud BYOC ソリューションがサポートする AWS クラウドリージョンの一覧です。Zilliz Cloud コンソール上でお使いのクラウドリージョンが見つからない場合は、support@zilliz.com までお問い合わせください。

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

デプロイ環境とは、Terraform 設定ファイルを実行して BYOC-I プロジェクトのデータプレーンをデプロイするよう構成されたローカルマシン、仮想マシン（VM）、または CI/CD パイプラインのことです。このステップでは、以下を行う必要があります。 

- **Microsoft Azure 認証情報を設定します。**

    Microsoft Azure の認証情報には、サブスクリプション ID とリソースグループ名が含まれます。 

    **Azure Portal (UI)**

    - **Subscription ID:**

        ![UCcVbQX7boMNMLxoiK8ccyM9ngd](https://zdoc-images.s3.us-west-2.amazonaws.com/uccvbqx7bomnmlxoik8ccym9ngd.png "UCcVbQX7boMNMLxoiK8ccyM9ngd")

        <Procedures>

        1. 上部の検索バーまたはホームページから **Subscriptions** に移動します。

        1. 使用するサブスクリプションを選択します。

        1. Overview ページの **Essentials** セクションで `Subscription ID` を確認します。

        </Procedures>

    - **Resource Group Name:**

        リソースグループは、Azure ソリューションの関連リソースを保持するコンテナです。 

        ![HY2ybEyBHoOrwTxvvsxcvBDFnOe](https://zdoc-images.s3.us-west-2.amazonaws.com/hy2ybeybhoorwtxvvsxcvbdfnoe.png "HY2ybEyBHoOrwTxvvsxcvBDFnOe")

        <Procedures>

        1. 左側のメニューから **Resource groups** に移動します。

        1. 名前は **Name** 列に表示されます。 

            何も表示されない場合は、リソースグループを作成して Zilliz Cloud に提供する必要がある場合があります。後で Terraform スクリプトを実行すると、仮想マシン（VM）、仮想ネットワーク（VNet）、Azure Kubernetes Service（AKS）クラスターを含む、必要なすべてのリソースがリソースグループに追加されます。

        </Procedures>

- **アクセス制御（IAM）権限を追加します。**

    Terraform スクリプトを実行するロールに **Contributor** および **User Access Administrator** 権限を割り当てます。

    ![P0NbbtVyTofpGmxtk1jcpQYsnTe](https://zdoc-images.s3.us-west-2.amazonaws.com/p0nbbtvytofpgmxtk1jcpqysnte.png "P0NbbtVyTofpGmxtk1jcpQYsnTe")

    <Procedures>

    1. 左側のメニューから **Access control (IAM)** に移動します。

    1. **+ Add** をクリックし、ドロップダウンリストから **Add role assignment** を選択します。

    1. **Role** タブで **Privileged administrator roles** をクリックし、**Contributor** で絞り込んで **Next** をクリックします。

    1. **Members** タブの **Assign access to** で **User, group, or service principal** または **Managed entity** を選択し、**+ Select members** をクリックします。

        Terraform スクリプトの実行にユーザー、グループ、またはサービスプリンシパルを使用する場合は、**User, group, or service principal** を選択します。それ以外の場合は **Managed entity** を選択します。

    1. **Next** をクリックし、設定を確認してから **Review + assign** をクリックして保存します。

    1. 上記の手順を **User Access Administrator** ロールについて繰り返します。

    </Procedures>

- **最新の Terraform バイナリをインストールします。**

    Terraform のインストール方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform) を参照してください。

### ステップ 2: プロジェクトを作成する\{#step-2-create-a-project}

BYOC-I 組織内で **Create Project** ボタンをクリックしてデプロイを開始します。表示されるダイアログボックスで **Zilliz BYOC Project Name** を設定し、**Create and Next** をクリックします。

このステップの最後にプロジェクトが作成され、**Deploy Data Plane** ダイアログボックスにリダイレクトされます。

![Wc5KwW4BihKe17beYFccNdb3nCf](https://zdoc-images.s3.us-west-2.amazonaws.com/Wc5KwW4BihKe17beYFccNdb3nCf.png)

### ステップ 3: データプレーンを準備する\{#step-3-prepare-the-data-plane}

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイを停止します。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内でデータプレーンのデプロイはいつでも開始でき、1つのプロジェクトに複数のデータプレーンを追加できます。 

    ![M8EWwH1WJhTkVBbyJLOcWEDjnqN](https://zdoc-images.s3.us-west-2.amazonaws.com/M8EWwH1WJhTkVBbyJLOcWEDjnqN.png)

1. **Azure Private Service Connect** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用の VPC エンドポイントを作成する必要があります。

1. [ステップ 1](./deploy-byoc-i-azure#step-1-prepare-the-deployment-environment) で取得した Azure の **Subscription ID** と **Resource Group Name** を入力します。

1. **Architecture** で、アプリケーションに適したアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1. **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義した範囲内でプロジェクトのワークロードに基づき VM インスタンス数を Zilliz Cloud が自動調整できるようにし、効率的なリソース利用を実現します。

    1. **Initial Project Size** を構成します。 

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係で異なるタイプの VM インスタンスを使用します。これらのサービスおよびコンポーネントごとに、インスタンスタイプと台数を個別に設定できます。 

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な VM インスタンス数を対応する **Count** フィールドに指定するだけです。

        ![DYwHb4uOioMCbZxajkHc6unEn8f](https://zdoc-images.s3.us-west-2.amazonaws.com/dywhb4uoiomcbzxajkhc6unen8f.png "DYwHb4uOioMCbZxajkHc6unEn8f")

        **Auto-scaling** を有効にすると、対応する **Min** および **Max** フィールドを設定して、実際のプロジェクトワークロードに基づき Zilliz Cloud が VM インスタンス数を自動スケールできるように範囲を指定する必要があります。

        ![As6Ebvzaoo4iccxsxdlctOCRnpd](https://zdoc-images.s3.us-west-2.amazonaws.com/as6ebvzaoo4iccxsxdlctocrnpd.png "As6Ebvzaoo4iccxsxdlctOCRnpd")

        リソース設定を容易にするため、事前定義されたプロジェクトサイズオプションが 4つ用意されています。次の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成可能なクラスター数、および各クラスターに含めることができるエンティティ数との対応関係を示しています。

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

        **Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントの VM インスタンスタイプと台数を調整することで、設定をカスタマイズすることもできます。ご希望の VM インスタンスタイプが一覧にない場合は、追加のサポートについて [Zilliz サポート](https://zilliz.com/contact) までお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションは、階層型ストレージクラスターを作成できるかどうかを決定します。このオプションを選択すると、階層型クエリノードのインスタンスタイプと台数を設定できます。 

        ![Aolab6yB3o8Z3mxDFCycMzNqnTf](https://zdoc-images.s3.us-west-2.amazonaws.com/aolab6yb3o8z3mxdfcycmznqntf.png "Aolab6yB3o8Z3mxDFCycMzNqnTf")

        <Admonition type="info" title="Notes">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の台数と **Tiered Query Node** の台数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。

        </Admonition>

1. **Next** をクリックします。

</Procedures>

### ステップ 4: データプレーンをデプロイする\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成したプロジェクトのデータプレーンをデプロイします。

![X3s2bYas0o5ICVxZ18rcta5TnLd](https://zdoc-images.s3.us-west-2.amazonaws.com/x3s2byas0o5icvxz18rcta5tnld.png "X3s2bYas0o5ICVxZ18rcta5TnLd")

上記 Terraform スクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project) を参照してください。

プロジェクトのデータプレーンをデプロイしてクラスターを作成した後は、直接 VPC アクセスまたは Azure Private Link のいずれかを通じてこれらのクラスターに接続できます。詳細は、[BYOC クラスターへの接続](./prepare-for-cluster-connection) を参照してください。

## データプレーンを管理する\{#manage-dataplanes}

![IqvEwsg5ah4UaAb56tmcbOOlnIR](https://zdoc-images.s3.us-west-2.amazonaws.com/IqvEwsg5ah4UaAb56tmcbOOlnIR.png)

### Undeploy タグが付いたデータプレーン\{#data-planes-with-an-undeploy-tag}

プロジェクトカード右上のステータスタグが **Undeploy** と表示されている場合、いつでもプロジェクトカード上の **Deploy Data Plane** ボタンをクリックして再度開くことができます。プロジェクトの名前を変更または削除するには、プロジェクトカード内の **...** ボタンをクリックし、ドロップダウンメニューから **Rename** または **Delete** を選択します。  

### Deploying タグが付いたデータプレーン\{#data-planes-with-a-deploying-tag}

デプロイ環境を準備して表示されたコマンドを実行した後は、BYOC エージェントが有効化されるまで待つ必要があります。プロジェクトカード上のステータスタグが **Deploying** と表示され、進行率が示されている間は、データプレーンの配置が完了するまでプロジェクトの名前変更や削除はできません。

### Running タグが付いたデータプレーン\{#data-plans-with-a-running-tag}

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
