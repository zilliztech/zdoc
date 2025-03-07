---
title: "AWSでBYOCをデプロイする | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "AWSでBYOCをデプロイする"
beta: PRIVATE
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
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database

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

AWSにBYOCを展開するには、Zilliz Cloudは、お客様が管理するVPC内のS3バケットとEKSクラスターにアクセスするための特定の役割を担う必要があります。そのため、Zilliz Cloudは、S3バケット、EKSクラスター、VPCに関する情報と、これらのインフラストラクチャリソースにアクセスするために必要な役割を収集する必要があります。

[**Create Project and Deploy Data Plane**]ボタンをクリックして、デプロイを開始します。

### 一般の設定{#general-settings}

「**一般設定**」では、プロジェクト名を設定し、クラウドプロバイダーとリージョンを決定し、Zilliz Cloudがプロジェクトを作成し、データプレーンを展開する方法を選択する必要があります。

![H44BbcnpZoL5m3xqVV8chqqonyb](/byoc/ja-JP/H44BbcnpZoL5m3xqVV8chqqonyb.png)

1. [**プロジェクト名**]を設定します。

1. [**クラウドプロバイダー**]と[**リージョン**]を選択します。

1. (オプション)**インスタンス設定**を構成します。

    BYOCプロジェクトでは、検索サービス、基本的なデータベースコンポーネント、およびコアサポートサービスが異なるインスタンスを使用します。これらのサービスとコンポーネントのインスタンスタイプを設定できます。

    詳細は、[インスタンス設定](./deploy-byoc-aws#instance-settings)を参照してください。

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

![SqYDbdYcropfGnxMsOhcSeACnag](/byoc/ja-JP/SqYDbdYcropfGnxMsOhcSeACnag.png)

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

![G9iEbGNd2oMhbSxWmAccCAnkn0g](/byoc/ja-JP/G9iEbGNd2oMhbSxWmAccCAnkn0g.png)

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

プロジェクトのデプロイ中、Zilliz Cloudは基本的なデータベースコンポーネントとコアサポートサービスを作成します。プロジェクトの準備ができたら、プロジェクト内にクラスターを作成できます。この時点で、Zilliz Cloudはあなたの代わりに検索サービスのインスタンスを作成します。

![C7RmbHtWjoFrczxFOAnctnNYnDc](/byoc/ja-JP/C7RmbHtWjoFrczxFOAnctnNYnDc.png)

デプロイ中に、以下に示す各コンポーネントに対して作成するインスタンスの種類を決定する必要があります。

<table>
   <tr>
     <th><p>コンポーネント</p></th>
     <th><p>インスタンスごとに消費されるライセンス</p></th>
     <th><p>インスタンスタイプ</p></th>
     <th><p>初期デプロイに必要なインスタンス</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>検索サービス</p></td>
     <td><p>16</p></td>
     <td><p>m 6 id.4 xlargeファイル</p></td>
     <td><p>0</p></td>
     <td><p>クエリサービス専用のインスタンス</p></td>
   </tr>
   <tr>
     <td><p>基本的なデータベースコンポーネント</p></td>
     <td><p>8</p></td>
     <td><p>m 6 i.2 xlarge</p></td>
     <td><p>1</p></td>
     <td><p>インデックスプールとして主に使用される基本的なデータベースコンポーネントに使用されるインスタンス</p></td>
   </tr>
   <tr>
     <td><p>コアサポートサービス</p></td>
     <td><p>0</p></td>
     <td><p>m 6 i.2 xlarge</p></td>
     <td><p>3</p></td>
     <td><p>Milvus Operator、Zilliz Cloud Agent、およびMilvusの依存関係を含む周辺サポートサービスに使用されるインスタンスは、ログ、モニタリング、アラートに使用されます。</p></td>
   </tr>
</table>

インスタンス設定が構成されていない場合、上記のデフォルト設定が適用されます。

## デプロイの詳細を表示する{#view-deployment-details}

プロジェクトを作成したら、プロジェクトページでステータスを閲覧可能です。

![QJ57bgqmjoIP0Qx5niSc4SJHnab](/byoc/ja-JP/QJ57bgqmjoIP0Qx5niSc4SJHnab.png)



import DocCardList from '@theme/DocCardList';

<DocCardList />