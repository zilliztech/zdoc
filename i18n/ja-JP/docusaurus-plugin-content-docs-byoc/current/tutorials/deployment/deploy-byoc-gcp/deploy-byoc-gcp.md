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

<Admonition type="info" icon="📘" title="注意">

- Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) にお問い合わせください。

- このガイドでは、GCP コンソールで必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

- BYOC 組織のオーナーである必要があります。

- [必要な GCP API サービス](./required-api-services-gcp)を有効化している必要があります。

## 手順\{#procedure}

GCP に BYOC をデプロイするには、Zilliz Cloud が、お客様管理の VPC 内にある Cloud Storage バケットおよび GKE cluster にアクセスできるよう、特定のロールを引き受ける必要があります。そのため、Zilliz Cloud は、これらのインフラストラクチャリソースにアクセスするために必要なロールとともに、Cloud Storage バケット、GKE cluster、および VPC に関する情報を収集する必要があります。

BYOC 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。

![LyCiw8o03hUOnebv2CJc0vianpf](https://zdoc-images.s3.us-west-2.amazonaws.com/LyCiw8o03hUOnebv2CJc0vianpf.png)

### ステップ 1: データプレーンをデプロイ\{#step-1-deploy-the-data-plane}

このステップでは、Zilliz BYOC project 名を設定し、クラウドプロバイダーとリージョン、およびデプロイの初期 project サイズを決定する必要があります。

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックすると、データプレーンのデプロイを停止できます。ただし、上で作成した project 自体は引き続き利用可能です。project 内ではいつでもデータプレーンのデプロイを開始でき、1 つの project に複数のデータプレーンを追加できます。 

    ![SVVZwpbNphBfYGb5IgmckSkan6b](https://zdoc-images.s3.us-west-2.amazonaws.com/SVVZwpbNphBfYGb5IgmckSkan6b.png)

1. **GCP Private Service Connect** を有効にするかどうかを決定します。

    このオプションにより、現在の project 内の cluster へのプライベート接続が可能になります。このオプションを有効にする場合、プライベート接続のために Private Service Connect Endpoint を作成する必要があります。詳細については、[Prepare for Cluster Connection](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

1. **Architecture** で、アプリケーションに一致するアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1. **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義された範囲内で project のワークロードに基づき Zilliz Cloud が GCE インスタンス数を自動調整できるようにし、効率的なリソース利用を確保します。

    1. **Initial Project Size** を構成します。 

        BYOC project では、query node、index services、Milvus コンポーネント、および依存関係はそれぞれ異なる Google Compute Engine (GCE) インスタンスを使用します。これらのサービスおよびコンポーネントに対してインスタンスタイプを設定できます。 

        **Auto-scaling** が無効な場合は、各 project コンポーネントに必要な GCE インスタンス数を、対応する **Count** フィールドに指定するだけです。

        ![Tl4Zbuwi5oT1KdxKVaIcnf05nEr](https://zdoc-images.s3.us-west-2.amazonaws.com/tl4zbuwi5ot1kdxkvaicnf05ner.png "Tl4Zbuwi5oT1KdxKVaIcnf05nEr")

        **Auto-scaling** を有効にすると、対応する **Min** および **Max** フィールドを設定して、実際の project ワークロードに基づき Zilliz Cloud が GCE インスタンス数を自動スケーリングするための範囲を指定する必要があります。

        ![Gq0GbQWJxoJf85xg6KJcppLDnZS](https://zdoc-images.s3.us-west-2.amazonaws.com/gq0gbqwjxojf85xg6kjcppldnzs.png "Gq0GbQWJxoJf85xg6KJcppLDnZS")

        リソース設定を容易にするために、事前定義された 4 つの project サイズオプションがあります。次の表は、これらの project サイズオプションと、project 内で作成できる cluster 数、およびそれらの cluster に含められる entity 数との対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大 Cluster 数</p></th>
             <th colspan="3"><p>最大エンティティ数（百万）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8 ～ 16 CU の 3 clusters</p></td>
             <td><p>16 Million - 32 Million</p></td>
             <td><p>64 Million - 128 Million</p></td>
             <td><p>320 Million - 640 Million</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CU の 7 clusters</p></td>
             <td><p>32 Million - 128 Million</p></td>
             <td><p>128 Million - 512 Million</p></td>
             <td><p>640 Million - 2.6 Billion</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CU の 12 clusters</p></td>
             <td><p>128 Million - 384 Million</p></td>
             <td><p>512 Million - 1.5 Billion</p></td>
             <td><p>2.6 Billion - 7.7 Billion</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CU の 17 clusters</p></td>
             <td><p>384 Million - 1.2 Billion</p></td>
             <td><p>1.5 Billion -  4.6 Billion</p></td>
             <td><p>7.7 Billion - 23 Billion</p></td>
           </tr>
        </table>

        また、**Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントに対して GCE インスタンスタイプと台数を調整することで、設定をカスタマイズすることもできます。希望する GCE インスタンスタイプが一覧にない場合は、詳細なサポートについて [Zilliz support](https://zilliz.com/contact) にお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションは、tiered-storage cluster を作成できるかどうかを決定します。このオプションを選択すると、tiered query nodes のインスタンスタイプと台数を設定できます。 

        ![CFISbr4gloeeYoxStjuc7VuanM5](https://zdoc-images.s3.us-west-2.amazonaws.com/cfisbr4gloeeyoxstjuc7vuanm5.png "CFISbr4gloeeYoxStjuc7VuanM5")

        <Admonition type="info" icon="📘" title="注意">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の count と **Tiered Query Node** の count の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。

        </Admonition>

1. **Next** をクリックして認証情報を設定します。

</Procedures>

### ステップ 2: 認証情報を設定\{#step-2-set-up-credentials}

**Credential Settings** では、ストレージアクセス、GKE cluster 管理、およびデータプレーンデプロイ用のストレージと複数の service account を設定する必要があります。

![BbOOboWZAo5eu2xplJWcXyLonph](https://zdoc-images.s3.us-west-2.amazonaws.com/bboobowzao5eu2xpljwcxylonph.png "BbOOboWZAo5eu2xplJWcXyLonph")

<Procedures>

1. **Google Cloud Platform Project ID** に、GCP project の ID を入力します。

1. **Storage settings** で、GCP から取得した **Bucket Name** と **Service Account Email** を設定します。 

    Zilliz Cloud は、指定された bucket をデータプレーンストレージとして使用し、指定された service account を使ってお客様に代わってアクセスします。

    bucket の設定および service account の作成の詳細については、[Create Cloud Storage Bucket and Service Account](./create-bucket-and-service-account) を参照してください。

1. **GKE Settings** で、GKE 管理用の **GKE Cluster Name** と **Service Account Email** を設定します。 

    Zilliz Cloud は、指定された service account を使用して、指定された名前の GKE cluster をお客様に代わってデプロイし、その GKE cluster 内にデータプレーンをデプロイします。

    service account の作成の詳細については、[Create GKE Service Account](./create-gke-service-account) を参照してください。

1. **Cross-Account Settings** で、データプレーンデプロイ用の **Service Account Name** を設定します。

    service account の準備ができたら、下の読み取り専用テキストボックスに表示される Zilliz BYOC principal をコピーし、GCP コンソールに貼り付けて、Zilliz Cloud BYOC project のデータプレーンをデプロイするために必要な権限を Zilliz BYOC に付与します。

    クロスアカウント service account の作成の詳細については、[Create a Cross-Account Service Account](./create-cross-account-sa) を参照してください。

1. **Next** をクリックしてネットワーク設定を構成します。

</Procedures>

### ステップ 3: ネットワーク設定を構成\{#step-3-configure-network-settings}

**Network Settings** では、VPC と、サブネット名やオプションの Private Service Connect Endpoint など、VPC 内の複数種類のリソースを作成します。

![YVPNbLCjOoCkDTx9TEMcbV9LnPd](https://zdoc-images.s3.us-west-2.amazonaws.com/yvpnblcjoockdtx9temcbv9lnpd.png "YVPNbLCjOoCkDTx9TEMcbV9LnPd")

<Procedures>

1. **Network Settings** で、**VPC Name**、**Subnet Names**、およびオプションの **Private Service Connect Endpoint** を設定します。

    指定した VPC 内で、Zilliz Cloud には以下が必要です。 

    - 2 つのセカンダリサブネットを持つプライマリサブネット

    - ロードバランサーサブネット

    - オプションの Private Service Connect endpoint

    **Private Service Connect Endpoint** は、上記の **General Settings** で **GCP Private Service Connect** をオンにした場合にのみ利用可能である点に注意してください。 

1. **Next** をクリックして概要を表示します。

1. **Deployment Summary** で、構成設定を確認します。

1. すべて問題なければ **Create** をクリックします。

</Procedures>

## デプロイ詳細を表示\{#view-deployment-details}

project を作成した後、project ページでそのステータスを確認できます。

![BE13bnOpGo9ZAVxTx3acX2J8nEe](https://zdoc-images.s3.us-west-2.amazonaws.com/be13bnopgo9zavxtx3acx2j8nee.png "BE13bnOpGo9ZAVxTx3acX2J8nEe")

project のデータプレーンをデプロイして cluster を作成すると、ダイレクト VPC アクセスまたは GCP Private Service Connect を介してこれらの cluster に接続できます。詳細については、[Connect to BYOC Clusters](./prepare-for-cluster-connection) を参照してください。

## 一時停止と再開\{#suspend-and-resume}

project を一時停止すると、データプレーンが停止され、project を支える GKE cluster に関連付けられたすべての GCE インスタンスが終了されます。この操作は、project 内で一時停止されている Zilliz Cloud cluster には影響せず、データプレーンが復元されると再開できます。

![Lq7AwLshAh64ZObMKeFcIXBwn5g](https://zdoc-images.s3.us-west-2.amazonaws.com/Lq7AwLshAh64ZObMKeFcIXBwn5g.png)

実行中の project を一時停止できるのは、project 内に cluster が存在しない場合、またはすべての cluster がすでに一時停止されている場合のみです。

![SVLQbgURIoRqHBx2tWwc5caWnx7](https://zdoc-images.s3.us-west-2.amazonaws.com/svlqbguriorqhbx2twwc5cawnx7.png "SVLQbgURIoRqHBx2tWwc5caWnx7")

project カード上のステータスタグが **Suspended** になると、その project 内の cluster を操作できなくなります。この場合は、**Resume** をクリックして project を再開できます。ステータスタグが再び **Running** に変わると、project 内の cluster の操作を続けられます。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングや保守作業を支援するために、Zilliz Cloud ではデフォルトでテクニカルサポートが project のデータプレーンへアクセスできるようになっています。ガバナンスやセキュリティ要件に合わせて、これを無効にすることもできます。

以下の手順では、Zilliz Cloud テクニカルサポートから特定済みの問題について連絡を受けた際に、無効にしていたテクニカルサポートアクセスを再度有効にする方法を示します。

<Procedures>

1. Zilliz Cloud がデータプレーン上の問題を特定し、かつテクニカルサポートアクセスが無効になっている場合、当社はその旨をお知らせし、テクニカルサポートアクセスを申請します。

1. 対象のデータプレーンを見つけ、データプレーンカード右下の **...** をクリックし、ドロップダウンリストから **Technical Support Access** をクリックします。

    ![TKIEwRBp0hpQL5btdvwccQGKngZ](https://zdoc-images.s3.us-west-2.amazonaws.com/TKIEwRBp0hpQL5btdvwccQGKngZ.png)

1. 表示されたダイアログボックスで、**Technical Support Access** をオンにします。

    ![SLmCwHdrNhJiw3bzf9kc5gB4nAb](https://zdoc-images.s3.us-west-2.amazonaws.com/SLmCwHdrNhJiw3bzf9kc5gB4nAb.png)

1. すると、当社がアクセスを申請する理由と、Zilliz Cloud によって割り当てられた issue owner の ID に関する情報が表示されます。**Expected Duration** でアクセス期間を決定し、**Description** に任意の要件を入力できます。すべて設定したら、**Save** をクリックします。

    ![D8X5w8TZQhkN51bpoqHc09o0nue](https://zdoc-images.s3.us-west-2.amazonaws.com/D8X5w8TZQhkN51bpoqHc09o0nue.png)

1. トラブルシューティング中にこのダイアログボックスを開くと、このアクセスの終了時刻を確認できます。テクニカルサポートアクセスは、有効期限が切れるか、明示的に無効にすると再び無効になります。

    ![HL1OwXlTihXk9PbzvjbchIp0n3f](https://zdoc-images.s3.us-west-2.amazonaws.com/HL1OwXlTihXk9PbzvjbchIp0n3f.png)

</Procedures>

## 手順\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />
