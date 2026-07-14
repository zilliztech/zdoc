---
title: "GCP に BYOC をデプロイ | BYOC"
slug: /deploy-byoc-gcp
sidebar_label: "GCP に BYOC をデプロイ"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud コンソールとカスタム GCP 構成を使用して、Google Cloud Platform (GCP) の Virtual Private Cloud (VPC) 内にフルマネージドの Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。 | BYOC"
type: origin
token: KmYgwHNOFiPQ9sk4bSDcMuIHnjC
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# GCP に BYOC をデプロイ

このページでは、Zilliz Cloud コンソールとカスタム GCP 構成を使用して、Google Cloud Platform (GCP) の Virtual Private Cloud (VPC) 内にフルマネージドの Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="注意">

- Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および導入の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) にお問い合わせください。

- このガイドでは、GCP コンソールで必要なリソースを段階的に作成する方法を示します。Terraform スクリプトを使用してインフラストラクチャをプロビジョニングしたい場合は、[Terraform Provider](./terraform-provider) を参照してください。 

</Admonition>

## 前提条件\{#prerequisites}

- BYOC 組織の所有者である必要があります。

- [必要な GCP API サービス](./required-api-services-gcp)を有効にしている必要があります。

## 手順\{#procedure}

GCP に BYOC をデプロイするには、Zilliz Cloud が顧客管理 VPC 内の Cloud Storage バケットと GKE クラスタにアクセスできるよう、お客様に代わって特定のロールを引き受ける必要があります。そのため、Zilliz Cloud は、これらのインフラストラクチャリソースにアクセスするために必要なロールとともに、Cloud Storage バケット、GKE クラスタ、VPC に関する情報を収集する必要があります。

BYOC 組織内で、**Create Project** ボタンをクリックしてデプロイを開始します。

![LyCiw8o03hUOnebv2CJc0vianpf](https://zdoc-images.s3.us-west-2.amazonaws.com/LyCiw8o03hUOnebv2CJc0vianpf.png)

### ステップ 1: データプレーンをデプロイする\{#step-1-deploy-the-data-plane}

このステップでは、Zilliz BYOC プロジェクト名を設定し、クラウドプロバイダーとリージョン、およびデプロイの初期プロジェクトサイズを決定する必要があります。

<Procedures>

1. **Data Plane Name** と **Cloud Region** を設定し、**Next** をクリックします。

    **Cancel** をクリックするとデータプレーンのデプロイを停止できます。ただし、上で作成したプロジェクトは引き続き利用可能です。プロジェクト内ではいつでもデータプレーンのデプロイを開始でき、1 つのプロジェクトに複数のデータプレーンを追加できます。 

    ![SVVZwpbNphBfYGb5IgmckSkan6b](https://zdoc-images.s3.us-west-2.amazonaws.com/SVVZwpbNphBfYGb5IgmckSkan6b.png)

1. **GCP Private Service Connect** を有効にするかどうかを決定します。

    このオプションを使用すると、現在のプロジェクト内のクラスタへのプライベート接続が可能になります。このオプションを有効にした場合、プライベート接続用の Private Service Connect Endpoint を作成する必要があります。詳細については、[Prepare for Cluster Connection](./prepare-for-cluster-connection#private-endpoint-access) を参照してください。

1. **Architecture** で、アプリケーションに一致するアーキテクチャタイプを選択します。 

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決まります。利用可能なオプションは **X86** と **ARM** です。

1. **Resource Settings** では、以下を行う必要があります。

    1. **Auto-scaling** を有効または無効にして、定義された範囲内で Zilliz Cloud がプロジェクトのワークロードに基づき GCE インスタンス数を自動調整し、リソースを効率的に使用できるようにします。

    1. **Initial Project Size** を構成します。 

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なる Google Compute Engine (GCE) インスタンスを使用します。これらのサービスおよびコンポーネントに対してインスタンスタイプを設定できます。 

        **Auto-scaling** が無効な場合は、対応する **Count** フィールドで各プロジェクトコンポーネントに必要な GCE インスタンス数を指定するだけです。

        ![Tl4Zbuwi5oT1KdxKVaIcnf05nEr](https://zdoc-images.s3.us-west-2.amazonaws.com/tl4zbuwi5ot1kdxkvaicnf05ner.png "Tl4Zbuwi5oT1KdxKVaIcnf05nEr")

        **Auto-scaling** を有効にすると、対応する **Min** フィールドと **Max** フィールドを設定して、実際のプロジェクトワークロードに基づき Zilliz Cloud が GCE インスタンス数を自動スケールするための範囲を指定する必要があります。

        ![Gq0GbQWJxoJf85xg6KJcppLDnZS](https://zdoc-images.s3.us-west-2.amazonaws.com/gq0gbqwjxojf85xg6kjcppldnzs.png "Gq0GbQWJxoJf85xg6KJcppLDnZS")

        リソース設定を容易にするため、4 つの事前定義されたプロジェクトサイズオプションがあります。次の表は、これらのプロジェクトサイズオプションと、プロジェクト内に作成できるクラスタの数、およびそれらのクラスタに含めることができるエンティティ数との対応関係を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスタ数</p></th>
             <th colspan="3"><p>最大エンティティ数（Million）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>8 ～ 16 CUs の 3 クラスタ</p></td>
             <td><p>16 Million - 32 Million</p></td>
             <td><p>64 Million - 128 Million</p></td>
             <td><p>320 Million - 640 Million</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>16 ～ 64 CUs の 7 クラスタ</p></td>
             <td><p>32 Million - 128 Million</p></td>
             <td><p>128 Million - 512 Million</p></td>
             <td><p>640 Million - 2.6 Billion</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>64 ～ 192 CUs の 12 クラスタ</p></td>
             <td><p>128 Million - 384 Million</p></td>
             <td><p>512 Million - 1.5 Billion</p></td>
             <td><p>2.6 Billion - 7.7 Billion</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>192 ～ 576 CUs の 17 クラスタ</p></td>
             <td><p>384 Million - 1.2 Billion</p></td>
             <td><p>1.5 Billion -  4.6 Billion</p></td>
             <td><p>7.7 Billion - 23 Billion</p></td>
           </tr>
        </table>

        また、**Initial Project Size** で **Custom** を選択し、すべてのデータプレーンコンポーネントの GCE インスタンスタイプと数を調整して設定をカスタマイズすることもできます。希望する GCE インスタンスタイプが一覧にない場合は、追加の支援について [Zilliz support](https://zilliz.com/contact) にお問い合わせください。 

    1. **Tiered Query Node** を有効にするかどうかを決定します。

        このオプションにより、階層型ストレージクラスタを作成できるかどうかが決まります。このオプションを選択すると、階層型クエリノードのインスタンスタイプと数を設定できます。 

        ![CFISbr4gloeeYoxStjuc7VuanM5](https://zdoc-images.s3.us-west-2.amazonaws.com/cfisbr4gloeeyoxstjuc7vuanm5.png "CFISbr4gloeeYoxStjuc7VuanM5")

        <Admonition type="info" icon="📘" title="注意">

        - **Project Size** での選択は、**Tiered Storage Node** の設定には影響しません。
        
        - **Auto-scaling** が無効な場合、**Default Query Node** の数と **Tiered Query Node** の数の合計は正の整数である必要があります。
        
        - **Auto-scaling** が有効な場合、**Default Query Node** と **Tiered Query Node** の両方の **Min** 値の合計は正の整数である必要があります。

        </Admonition>

1. **Next** をクリックして認証情報を設定します。

</Procedures>

### ステップ 2: 認証情報を設定する\{#step-2-set-up-credentials}

**Credential Settings** では、ストレージアクセス、GKE クラスタ管理、データプレーンデプロイメント用に、ストレージと複数のサービスアカウントを設定する必要があります。

![BbOOboWZAo5eu2xplJWcXyLonph](https://zdoc-images.s3.us-west-2.amazonaws.com/bboobowzao5eu2xpljwcxylonph.png "BbOOboWZAo5eu2xplJWcXyLonph")

<Procedures>

1. **Google Cloud Platform Project ID** に、GCP プロジェクトの ID を入力します。

1. **Storage settings** で、GCP から取得した **Bucket Name** と **Service Account Email** を設定します。 

    Zilliz Cloud は、指定したバケットをデータプレーンストレージとして使用し、指定したサービスアカウントを使ってお客様に代わってアクセスします。

    バケットの設定およびサービスアカウントの作成の詳細については、[Create Cloud Storage Bucket and Service Account](./create-bucket-and-service-account) を参照してください。

1. **GKE Settings** で、GKE 管理用の **GKE Cluster Name** と **Service Account Email** を設定します。 

    Zilliz Cloud は、指定したサービスアカウントを使用して、指定した名前の GKE クラスタをお客様に代わってデプロイし、その GKE クラスタ内にデータプレーンをデプロイします。

    サービスアカウントの作成の詳細については、[Create GKE Service Account](./create-gke-service-account) を参照してください。

1. **Cross-Account Settings** で、データプレーンデプロイメント用の **Service Account Name** を設定します。

    サービスアカウントの準備ができたら、下の読み取り専用テキストボックスに表示される Zilliz BYOC プリンシパルをコピーし、GCP コンソールに貼り付けて、Zilliz Cloud BYOC プロジェクトのデータプレーンをデプロイするために必要な権限を Zilliz BYOC に付与します。

    クロスアカウントサービスアカウントの作成の詳細については、[Create a Cross-Account Service Account](./create-cross-account-sa) を参照してください。

1. **Next** をクリックしてネットワーク設定を構成します。

</Procedures>

### ステップ 3: ネットワーク設定を構成する\{#step-3-configure-network-settings}

**Network Settings** で、VPC と、サブネット名やオプションの Private Service Connect Endpoint など、VPC 内のいくつかの種類のリソースを作成します。

![YVPNbLCjOoCkDTx9TEMcbV9LnPd](https://zdoc-images.s3.us-west-2.amazonaws.com/yvpnblcjoockdtx9temcbv9lnpd.png "YVPNbLCjOoCkDTx9TEMcbV9LnPd")

<Procedures>

1. **Network Settings** で、**VPC Name**、**Subnet Names**、およびオプションの **Private Service Connect Endpoint** を設定します。

    指定した VPC では、Zilliz Cloud は以下を必要とします。 

    - 2 つのセカンダリサブネットを持つ 1 つのプライマリサブネット

    - 1 つのロードバランサーサブネット

    - オプションの Private Service Connect エンドポイント

    **Private Service Connect Endpoint** は、上記の **General Settings** で **GCP Private Service Connect** をオンにした場合にのみ利用可能であることに注意してください。 

1. **Next** をクリックしてサマリーを表示します。

1. **Deployment Summary** で、構成設定を確認します。

1. すべて問題なければ **Create** をクリックします。

</Procedures>

## デプロイの詳細を表示する\{#view-deployment-details}

プロジェクトを作成した後、プロジェクトページでそのステータスを確認できます。

![BE13bnOpGo9ZAVxTx3acX2J8nEe](https://zdoc-images.s3.us-west-2.amazonaws.com/be13bnopgo9zavxtx3acx2j8nee.png "BE13bnOpGo9ZAVxTx3acX2J8nEe")

プロジェクトのデータプレーンをデプロイし、クラスタを作成した後は、直接 VPC アクセスまたは GCP Private Service Connect を通じてこれらのクラスタに接続できます。詳細については、[Connect to BYOC Clusters](./prepare-for-cluster-connection) を参照してください。

## 一時停止と再開\{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンは停止し、そのプロジェクトを支える GKE クラスタに関連付けられたすべての GCE インスタンスが終了します。この操作は、プロジェクト内で一時停止中の Zilliz Cloud クラスタには影響しません。これらはデータプレーンが復元されると再開できます。

![Lq7AwLshAh64ZObMKeFcIXBwn5g](https://zdoc-images.s3.us-west-2.amazonaws.com/Lq7AwLshAh64ZObMKeFcIXBwn5g.png)

実行中のプロジェクトを一時停止できるのは、そのプロジェクト内にクラスタが存在しない場合、またはすべてのクラスタがすでに一時停止されている場合のみです。

![SVLQbgURIoRqHBx2tWwc5caWnx7](https://zdoc-images.s3.us-west-2.amazonaws.com/svlqbguriorqhbx2twwc5cawnx7.png "SVLQbgURIoRqHBx2tWwc5caWnx7")

プロジェクトカード上のステータスタグが **Suspended** と表示されると、そのプロジェクト内のクラスタを操作できなくなります。その場合は、**Resume** をクリックしてプロジェクトを再開できます。ステータスタグが再び **Running** に変わると、プロジェクト内のクラスタの操作を続けることができます。

## テクニカルサポートアクセス\{#technical-support-access}

トラブルシューティングおよびメンテナンス作業を支援するため、Zilliz Cloud はデフォルトでテクニカルサポートがプロジェクトのデータプレーンにアクセスできるようにしています。 

![OHNUwYrFHhEUeIbgOW9coc5hngb](https://zdoc-images.s3.us-west-2.amazonaws.com/OHNUwYrFHhEUeIbgOW9coc5hngb.png)

対象プロジェクトのドロップダウンメニューから **Technical Support Access** をクリックすると、現在の設定を表示できます。

データガバナンスおよびセキュリティ要件に対応するため、これを無効にすることもできます。

## 手順\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />
