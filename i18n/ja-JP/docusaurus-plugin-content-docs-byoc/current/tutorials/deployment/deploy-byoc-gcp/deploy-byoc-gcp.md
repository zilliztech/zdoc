---
title: "GCP に BYOC をデプロイ | BYOC"
slug: /deploy-byoc-gcp
sidebar_label: "GCP に BYOC をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールとカスタム GCP 構成を使用して、Google Cloud Platform (GCP) Virtual Private Cloud (VPC) に完全マネージドの Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。 | BYOC"
type: origin
token: KmYgwHNOFiPQ9sk4bSDcMuIHnjC
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# GCP に BYOC をデプロイ

このページでは、Zilliz Cloud コンソールとカスタム GCP 構成を使用して、Google Cloud Platform (GCP) Virtual Private Cloud (VPC) に完全マネージドの Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。

<Admonition type="info" title="Notes">

- Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) にお問い合わせください。

- このガイドでは、GCP コンソールで必要なリソースを段階的に作成する方法を説明します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングする場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 事前準備\{#prerequisites}

- BYOC 組織のオーナーであること。

- [必要な GCP API サービス](./required-api-services-gcp) を有効化していること。

## 手順\{#procedure}

GCP に BYOC をデプロイするには、Zilliz Cloud が、お客様が管理する VPC 内の Cloud Storage バケットと GKE クラスターにアクセスするために、お客様に代わって特定のロールを引き受ける必要があります。そのため、Zilliz Cloud は、お客様の Cloud Storage バケット、GKE クラスター、および VPC に関する情報と、これらのインフラストラクチャリソースへのアクセスに必要なロールを収集する必要があります。

BYOC 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。

![LyCiw8o03hUOnebv2CJc0vianpf](https://zdoc-images.s3.us-west-2.amazonaws.com/LyCiw8o03hUOnebv2CJc0vianpf.png)

### ステップ 1: データプレーンをデプロイする\{#step-1-deploy-the-data-plane}

このステップでは、Zilliz BYOC プロジェクト名を設定し、クラウドプロバイダーとリージョン、およびデプロイの初期プロジェクトサイズを決定する必要があります。

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックすると、データプレーンのデプロイを停止できます。ただし、上記で作成したプロジェクトは引き続き利用可能です。プロジェクト内ではいつでもデータプレーンのデプロイを開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。 

    ![SVVZwpbNphBfYGb5IgmckSkan6b](https://zdoc-images.s3.us-west-2.amazonaws.com/SVVZwpbNphBfYGb5IgmckSkan6b.png)

1. **GCP Private Service Connect** を有効にするかどうかを決定します。

    このオプションを使用すると、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用の Private Service Connect Endpoint を作成する必要があります。詳細については、[Prepare for クラスター Connection](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

1. **Architecture** で、アプリケーションに一致するアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1. **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、プロジェクトのワークロードに基づき、定義された範囲内で GCE インスタンス数を Zilliz Cloud が自動的に調整できるようにし、効率的なリソース利用を確保します。

    1. **Initial Project Size** を構成します。 

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係がそれぞれ異なる Google Compute Engine (GCE) インスタンスを使用します。これらのサービスおよびコンポーネントにインスタンスタイプを設定できます。 

        **Auto-scaling** が無効な場合は、各プロジェクトコンポーネントに必要な GCE インスタンス数を、対応する **Count** フィールドに指定するだけです。

        ![Tl4Zbuwi5oT1KdxKVaIcnf05nEr](https://zdoc-images.s3.us-west-2.amazonaws.com/tl4zbuwi5ot1kdxkvaicnf05ner.png "Tl4Zbuwi5oT1KdxKVaIcnf05nEr")

        **Auto-scaling** を有効にすると、対応する **Min** フィールドと **Max** フィールドを設定して、実際のプロジェクトワークロードに基づき Zilliz Cloud が GCE インスタンス数を自動的にスケーリングするための範囲を指定する必要があります。

        ![Gq0GbQWJxoJf85xg6KJcppLDnZS](https://zdoc-images.s3.us-west-2.amazonaws.com/gq0gbqwjxojf85xg6kjcppldnzs.png "Gq0GbQWJxoJf85xg6KJcppLDnZS")

        リソース設定を容易にするため、4 つの事前定義されたプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションと、プロジェクト内で作成できるクラスター数、およびそれらのクラスターに含めることができるエンティティ数との対応関係を示しています。

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
             <td><p>8 ～ 16 CU のクラスターを 3 つ</p></td>
             <td><p>1600 万 - 3200 万</p></td>
             <td><p>6400 万 - 1 億 2800 万</p></td>
             <td><p>3 億 2000 万 - 6 億 4000 万</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CU のクラスターを 7 つ</p></td>
             <td><p>3200 万 - 1 億 2800 万</p></td>
             <td><p>1 億 2800 万 - 5 億 1200 万</p></td>
             <td><p>6 億 4000 万 - 26 億</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CU のクラスターを 12 つ</p></td>
             <td><p>1 億 2800 万 - 3 億 8400 万</p></td>
             <td><p>5 億 1200 万 - 15 億</p></td>
             <td><p>26 億 - 77 億</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CU のクラスターを 17 つ</p></td>
             <td><p>3 億 8400 万 - 12 億</p></td>
             <td><p>15 億 - 46 億</p></td>
             <td><p>77 億 - 230 億</p></td>
           </tr>
        </table>

        また、**Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントの GCE インスタンスタイプと数を調整して設定をカスタマイズすることもできます。希望する GCE インスタンスタイプが一覧にない場合は、追加のサポートについて [Zilliz support](https://zilliz.com/contact) にお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションにより、階層型ストレージクラスターを作成できるかどうかが決まります。このオプションを選択すると、階層型クエリノードのインスタンスタイプと数を設定できます。 

        ![CFISbr4gloeeYoxStjuc7VuanM5](https://zdoc-images.s3.us-west-2.amazonaws.com/cfisbr4gloeeyoxstjuc7vuanm5.png "CFISbr4gloeeYoxStjuc7VuanM5")

        <Admonition type="info" title="Notes">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の数と **Tiered Query Node** の数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。

        </Admonition>

1. **Next** をクリックして、認証情報を設定します。

</Procedures>

### ステップ 2: 認証情報を設定する\{#step-2-set-up-credentials}

**Credential Settings** では、ストレージアクセス、GKE クラスター管理、およびデータプレーンのデプロイのために、ストレージと複数のサービスアカウントを設定する必要があります。

![BbOOboWZAo5eu2xplJWcXyLonph](https://zdoc-images.s3.us-west-2.amazonaws.com/bboobowzao5eu2xpljwcxylonph.png "BbOOboWZAo5eu2xplJWcXyLonph")

<Procedures>

1. **Google Cloud Platform Project ID** に、GCP プロジェクトの ID を入力します。

1. **Storage settings** で、GCP から取得した **Bucket Name** と **Service Account Email** を設定します。 

    Zilliz Cloud は、指定したバケットをデータプレーンのストレージとして使用し、指定したサービスアカウントを使用してお客様に代わってアクセスします。

    バケットの設定およびサービスアカウントの作成の詳細については、[Create Cloud Storage Bucket and Service Account](./create-bucket-and-service-account) を参照してください。

1. **GKE Settings** で、GKE 管理用の **GKE クラスター Name** と **Service Account Email** を設定します。 

    Zilliz Cloud は、指定したサービスアカウントを使用して、指定した名前の GKE クラスターをお客様に代わってデプロイし、その GKE クラスターにデータプレーンをデプロイします。

    サービスアカウントの作成の詳細については、[Create GKE Service Account](./create-gke-service-account) を参照してください。

1. **Cross-Account Settings** で、データプレーンのデプロイ用に **Service Account Name** を設定します。

    サービスアカウントの準備ができたら、下の読み取り専用テキストボックスに表示される Zilliz BYOC プリンシパルをコピーし、GCP コンソールに貼り付けて、Zilliz Cloud BYOC プロジェクトのデータプレーンをデプロイするために必要な権限を Zilliz BYOC に付与します。

    クロスアカウントサービスアカウントの作成の詳細については、[Create a Cross-Account Service Account](./create-cross-account-sa) を参照してください。

1. **Next** をクリックして、ネットワーク設定を構成します。

</Procedures>

### ステップ 3: ネットワーク設定を構成する\{#step-3-configure-network-settings}

**Network Settings** では、VPC と、サブネット名や VPC 内のオプションの Private Service Connect Endpoint など、いくつかの種類のリソースを作成します。

![YVPNbLCjOoCkDTx9TEMcbV9LnPd](https://zdoc-images.s3.us-west-2.amazonaws.com/yvpnblcjoockdtx9temcbv9lnpd.png "YVPNbLCjOoCkDTx9TEMcbV9LnPd")

<Procedures>

1. **Network Settings** で、**VPC Name**、**Subnet Names**、およびオプションの **Private Service Connect Endpoint** を設定します。

    指定した VPC 内で、Zilliz Cloud には以下が必要です。 

    - 2 つのセカンダリサブネットを持つプライマリサブネット

    - ロードバランサーサブネット

    - オプションの Private Service Connect エンドポイント

    **Private Service Connect Endpoint** は、上記の **General Settings** で **GCP Private Service Connect** をオンにした場合にのみ利用可能であることに注意してください。 

1. **Next** をクリックしてサマリーを表示します。

1. **Deployment Summary** で、構成設定を確認します。

1. すべて問題なければ、**Create** をクリックします。

</Procedures>

## デプロイの詳細を表示する\{#view-deployment-details}

プロジェクトを作成すると、プロジェクトページでそのステータスを確認できます。

![BE13bnOpGo9ZAVxTx3acX2J8nEe](https://zdoc-images.s3.us-west-2.amazonaws.com/be13bnopgo9zavxtx3acx2j8nee.png "BE13bnOpGo9ZAVxTx3acX2J8nEe")

プロジェクトのデータプレーンをデプロイしてクラスターを作成すると、直接 VPC アクセスまたは GCP Private Service Connect を介してこれらのクラスターに接続できます。詳細については、[Connect to BYOC Clusters](./prepare-for-cluster-connection) を参照してください。

## 一時停止と再開\{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、そのプロジェクトを支える GKE クラスターに関連付けられているすべての GCE インスタンスが終了します。この操作は、プロジェクト内で一時停止されている Zilliz Cloud クラスターには影響しません。これらのクラスターは、データプレーンが復元されると再開できます。

![Lq7AwLshAh64ZObMKeFcIXBwn5g](https://zdoc-images.s3.us-west-2.amazonaws.com/Lq7AwLshAh64ZObMKeFcIXBwn5g.png)

実行中のプロジェクトを一時停止できるのは、プロジェクト内にクラスターが存在しない場合、またはすべてのクラスターがすでに一時停止されている場合のみです。

![SVLQbgURIoRqHBx2tWwc5caWnx7](https://zdoc-images.s3.us-west-2.amazonaws.com/svlqbguriorqhbx2twwc5cawnx7.png "SVLQbgURIoRqHBx2tWwc5caWnx7")

プロジェクトカードのステータスタグが **Suspended** と表示されると、そのプロジェクト内のクラスターを操作できなくなります。その場合は、**Resume** をクリックしてプロジェクトを再開できます。ステータスタグが再び **Running** に変わると、プロジェクト内のクラスターの操作を続行できます。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス作業を支援するため、Zilliz Cloud ではデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようになっています。ガバナンス要件およびセキュリティ要件を満たすために、これを無効にすることもできます。

以下の手順では、特定された問題について Zilliz Cloud テクニカルサポートから連絡があった際に、無効にしていたテクニカルサポートアクセスを再度有効にする方法を説明します。

<Procedures>

1. Zilliz Cloud がデータプレーン上の問題を特定し、テクニカルサポートアクセスが無効になっている場合は、当社がその旨をお知らせし、テクニカルサポートアクセスを申請します。

1. 対象のデータプレーンを探し、データプレーンカードの右下にある **...** をクリックして、ドロップダウンリストから **Technical Support Access** をクリックします。

    ![TKIEwRBp0hpQL5btdvwccQGKngZ](https://zdoc-images.s3.us-west-2.amazonaws.com/TKIEwRBp0hpQL5btdvwccQGKngZ.png)

1. 表示されたダイアログボックスで、**Technical Support Access** をオンにします。

    ![SLmCwHdrNhJiw3bzf9kc5gB4nAb](https://zdoc-images.s3.us-west-2.amazonaws.com/SLmCwHdrNhJiw3bzf9kc5gB4nAb.png)

1. すると、当社がアクセスを申請する理由と、Zilliz Cloud によって割り当てられた issue owner の ID に関する情報が表示されます。**Expected Duration** でアクセス期間を設定し、**Description** に任意の要件を入力できます。すべて設定したら、**Save** をクリックします。

    ![D8X5w8TZQhkN51bpoqHc09o0nue](https://zdoc-images.s3.us-west-2.amazonaws.com/D8X5w8TZQhkN51bpoqHc09o0nue.png)

1. トラブルシューティング中にこのダイアログボックスを開くと、このアクセスの終了時刻を確認できます。テクニカルサポートアクセスは、有効期限が切れるか、明示的に無効にすると再び無効になります。

    ![HL1OwXlTihXk9PbzvjbchIp0n3f](https://zdoc-images.s3.us-west-2.amazonaws.com/HL1OwXlTihXk9PbzvjbchIp0n3f.png)

</Procedures>

## 手順\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />
