---
title: "AWSでBYOCをデプロイする | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "AWSでBYOCをデプロイする"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz CloudコンソールとカスタムAWS設定を使用して、Zilliz Cloud Bring-Your-Own-Cloud (BYOC)組織内でプロジェクトを手動で作成する方法について説明します。 | BYOC"
type: origin
token: Etl1wNppoi5f7BkA0cKcULxvnGg
sidebar_position: 3
keywords: 
  - zilliz
  - byoc
  - aws
  - milvus
  - vector database
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db

---

import Admonition from '@theme/Admonition';


# AWSでBYOCをデプロイする

このページでは、Zilliz CloudコンソールとカスタムAWS設定を使用して、Zilliz Cloud Bring-Your-Own-Cloud (BYOC)組織内でプロジェクトを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>一般提供</strong>中です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## 前提条件{#prerequisites}

- あなたはBYOC組織のオーナーでなければなりません。

## 手続き{#procedure}

AWSにBYOCを展開するには、Zilliz Cloudは、お客様が管理するVPC内のS 3バケットとEKSクラスターにアクセスするための特定の役割を担う必要があります。そのため、Zilliz Cloudは、S 3バケット、EKSクラスター、VPCに関する情報と、これらのインフラストラクチャリソースにアクセスするために必要な役割を収集する必要があります。

BYOC組織内で、[**プロジェクトの作成とデータプレーンのデプロイ**]ボタンをクリックしてデプロイを開始します。

![YSBFbBGscoLGykx4dx1cMs4LnTd](/img/YSBFbBGscoLGykx4dx1cMs4LnTd.png)

### 一般の設定{#general-settings}

「**一般設定**」では、プロジェクト名を設定し、クラウドプロバイダーとリージョンを決定し、Zilliz Cloudがプロジェクトを作成し、データプレーンを展開する方法を選択する必要があります。

![UxkPbaWqpoE67Tx8yL2cE9EVnUe](/img/UxkPbaWqpoE67Tx8yL2cE9EVnUe.png)

1. [**プロジェクト名**]を設定します。

1. [**クラウドプロバイダー**]と[**リージョン**]を選択します。

1. (オプション)**インスタンス設定**を構成します。

    BYOCプロジェクトでは、検索サービス、基本的なデータベースコンポーネント、およびコアサポートサービスが異なるインスタンスを使用します。これらのサービスとコンポーネントのインスタンスタイプを設定できます。

    詳細は、[インスタンス設定](./deploy-byoc-aws#instance-settings)を参照してください。

1. **AWS PrivateLink**を有効にするかどうかを決定します。

    このオプションを有効にすると、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用のVPCエンドポイントを作成する必要があります。

1. Zilliz Cloudが**デプロイ方法**でタスクを実行する方法を選択してください。

    AWS上でBYOCプロジェクトのインフラストラクチャをプロビジョニングするには、3つのオプションがあります。

    - **AWS CloudFormationを使用してインフラストラクチャをプロビジョニングします。**

        AWS CloudFormationを使用してプロジェクトのデータプレーンインフラストラクチャをプロビジョニングする場合は、[**クイックスタート**]タイルを[**デプロイ方法**]セクションで選択します。これは、BYOCプロジェクトを開始するためにも推奨される方法です。

    - **Terraformスクリプトを使用してインフラストラクチャをプロビジョニングします。**

        インフラストラクチャのプロビジョニングにTerraformスクリプトを使用する場合は、スクリプトの出力をZilliz Cloudにコピー&ペーストする必要があります。詳細については、[Bootstrapインフラストラクチャ（Terraform）](./bootstrap-infrastructure-terraform)を参照してください。

    - **AWSコンソールを使用して、必要なリソースとロールを作成します。**

        必要なリソース(ストレージバケットや複数のIAMロールなど)をAWSコンソールで作成する必要があります。その後、名前とIDをコピーしてZilliz Cloudコンソールに貼り付けます。この方法でプロジェクトを作成する場合は、**手動**タイルを**デプロイ方法**セクションで選択してください。

        設定を容易にするために、Zilliz Cloudは以下の過程に分けています:

        - [クレデンシャル設定](./deploy-byoc-aws#credential-settings)、および

        - [ネットワーク設定](./deploy-byoc-aws#credential-settings)。

### クレデンシャル設定{#credential-settings}

[**資格情報設定**]では、ストレージアクセス、EKSクラスター管理、およびデータプレーンデプロイのために、ストレージと複数のIAMロールを設定する必要があります。

![SqYDbdYcropfGnxMsOhcSeACnag](/img/SqYDbdYcropfGnxMsOhcSeACnag.png)

1. 以下の手順に従って、ストレージ、EKS、およびクロスアカウント設定を構成します。

    1. [**ストレージ設定**]で、AWSから取得した**バケット名**と**IAMロールARN**を設定します。

        Zilliz Cloudは、指定されたバケットをデータプレーンストレージとして使用し、指定されたIAMロールを使用してあなたの代わりにアクセスします。

        S 3バケットを作成する手順の詳細については、[S3バケットとIAMロールの作成](./create-bucket-and-role)するを参照してください。

    1. [**EKS設定**]で、EKS管理の**IAMロールARN**を設定します。

        Zilliz Cloudは、指定されたロールを使用してEKSクラスターをデプロイし、EKSクラスターにデータプレーンをデプロイします。

        EKSロールを作成する手順の詳細については、「[EKS IAMロールの作成](./create-eks-role)」を参照してください。

    1. [**クロスアカウント設定**]で、データプレーンデプロイの**IAMロールARN**を設定します。

        Zilliz Cloudは、指定された役割を使用して、Zilliz Cloud BYOCプロジェクトのデータプレーンを展開します。

        クロス勘定ロールを作成する手順の詳細については、「[クロスアカウントIAMロールの作成](./create-cross-account-role)」を参照してください。

1. [**次**へ]をクリックしてネットワーク設定を構成します。

### ネットワーク設定{#network-settings}

ネットワーク設定では、VPCと、サブネット、セキュリティグループ、VPC内のオプションのVPCエンドポイントなど、複数の種類のリソースを作成する必要があります。

![G9iEbGNd2oMhbSxWmAccCAnkn0g](/img/G9iEbGNd2oMhbSxWmAccCAnkn0g.png)

1. [**ネットワーク設定**]で、**VPC ID**、**サブネットID**、**セキュリティグループID**、およびオプションの**VPCエンドポイントID**を設定します。

    指定されたVPCでは、Zilliz Cloudが必要です。

    - パブリックサブネットと3つのプライベートサブネット。

    - セキュリティグループ、そして

    - オプションのVPCエンドポイント。

    VPCの作成手順とリソースの詳細については、「[顧客管理型VPCの設定](./configure-vpc)」を参照してください。

1. [**次**へ]をクリックして概要を表示します。

1. [**Deployment Summary**]で構成を確認します。

1. すべてが期待どおりであれば、[**作成**]をクリックします。

## インスタンス設定{#instance-settings}

Zilliz BYOCプロジェクトのデータプレーンには、**Search Services**、**Fundamental Database Components**、**Core Support Services**の3種類のコンポーネントがあり、それぞれ異なるEC 2インスタンスを使用しています。 

![C7RmbHtWjoFrczxFOAnctnNYnDc](/img/C7RmbHtWjoFrczxFOAnctnNYnDc.png)

**一般設定**では、上記の3つのデータプレーンコンポーネントのEC 2インスタンスタイプを決定する必要があります。さらに、Core Support ServicesのEC 2インスタンス数を指定する必要があります。これにより、プロジェクト内で作成できるクラスターの最大数が決定されます。

定義済みのプロジェクト体格オプションは4つあります。

<table>
   <tr>
     <th rowspan="2"><p>サイズ</p></th>
     <th rowspan="2"><p>最大クラスタ数</p></th>
     <th colspan="2"><p>エンティティの最大数（百万）</p></th>
   </tr>
   <tr>
     <td><p>Performance-optimized CU</p></td>
     <td><p>Capacity-optimized CU</p></td>
   </tr>
   <tr>
     <td><p>Small</p></td>
     <td><p>8～16個のCUを持つ3つのクラスタ</p></td>
     <td><p>10百万-25百万の</p></td>
     <td><p>40百万-80百万の</p></td>
   </tr>
   <tr>
     <td><p>Medium</p></td>
     <td><p>16～64個のCUを持つ7つのクラスタ</p></td>
     <td><p>25百万-100百万の</p></td>
     <td><p>80百万-350百万の</p></td>
   </tr>
   <tr>
     <td><p>Large</p></td>
     <td><p>64～192個のCUを持つ12つのクラスタ</p></td>
     <td><p>100百万-300百万の</p></td>
     <td><p>350百万-10億</p></td>
   </tr>
   <tr>
     <td><p>X-Large</p></td>
     <td><p>192～576個のCUを持つ17つのクラスタ</p></td>
     <td><p>300百万-900百万の</p></td>
     <td><p>10億-30億</p></td>
   </tr>
</table>

## デプロイの詳細を表示する{#view-deployment-details}

プロジェクトを作成したら、プロジェクトページでステータスを閲覧可能です。

![QJ57bgqmjoIP0Qx5niSc4SJHnab](/img/QJ57bgqmjoIP0Qx5niSc4SJHnab.png)

## 一時停止と再開 {#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、プロジェクトをサポートするEKSクラスターに関連するすべてのEC 2インスタンスが終了します。このアクションは、プロジェクト内の一時停止されたZilliz Cloudクラスターには影響しません。データプレーンが復元されたら再開できます。

![KgmubOHigoPnlHx7ID9cJmeWn8b](/img/KgmubOHigoPnlHx7ID9cJmeWn8b.png)

実行中のプロジェクトを一時停止できるのは、プロジェクトにクラスターがない場合、またはすべてのクラスターがすでに一時停止されている場合のみです。

![JEMybaDxEoIAS6xT0vdc2vm2nzb](/img/JEMybaDxEoIAS6xT0vdc2vm2nzb.png)

プロジェクトカードのステータスタグが**Suspended**になると、プロジェクト内のクラスタを操作できなくなります。その場合は、**Resume**をクリックしてプロジェクトを再開できます。ステータスタグが再び**Running**に変わると、プロジェクト内のクラスタの操作を続けることができます。

## 手続き{#procedures}

import DocCardList from '@theme/DocCardList';

<DocCardList />