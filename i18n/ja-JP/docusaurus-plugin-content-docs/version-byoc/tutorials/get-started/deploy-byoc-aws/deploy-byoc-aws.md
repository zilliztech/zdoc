---
title: "AWSでBYOCをデプロイする | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "AWSでBYOCをデプロイする"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz CloudコンソールとカスタムAWS設定を使用して、AWS Virtual Private Cloud(VPC)でフルマネージドBring-Your-Own-Cloud(BYOC)データプレーンを手動で作成する方法について説明します。 | BYOC"
type: origin
token: DsqzwjegpiYSdtk1k75c1zXsnZc
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

このページでは、Zilliz CloudコンソールとカスタムAWS設定を使用して、AWS Virtual Private Cloud(VPC)でフルマネージドBring-Your-Own-Cloud(BYOC)データプレーンを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## 前提条件{#prerequisites}

- あなたはBYOC組織のオーナーでなければなりません。

## 手続き{#procedure}

AWSにBYOCを展開するには、Zilliz Cloudは、お客様が管理するVPC内のS 3バケットとEKSクラスターにアクセスするための特定の役割を担う必要があります。そのため、Zilliz Cloudは、S 3バケット、EKSクラスター、VPCに関する情報と、これらのインフラストラクチャリソースにアクセスするために必要な役割を収集する必要があります。

BYOC組織内で、**プロジェクトの作成とデータプレーンのデプロイ**ボタンをクリックしてデプロイを開始してください。

![XtlJbBTIboHNbixzfqpc7H3nnvb](/img/XtlJbBTIboHNbixzfqpc7H3nnvb.png)

### ステップ1:プロジェクトを作成する{#step-1-create-a-project}

このステップでは、プロジェクト名を設定し、クラウドプロバイダーとリージョン、初期プロジェクト体格を決定し、Zilliz Cloudがプロジェクトを作成し、データプレーンをデプロイする方法を選択する必要があります。

![ECYSboT8XojmfKxXFZqcxUxrnXf](/img/ECYSboT8XojmfKxXFZqcxUxrnXf.png)

1. **プロジェクト名**を設定します。

1. 「クラウドプロバイダー」と「地域」を選択してください。

1. **AWS PrivateLink**を有効にするかどうかを決定してください。

    このオプションを有効にすると、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用のVPCエンドポイントを作成する必要があります。

1. **アーキテクチャ**でアプリケーションに合ったアーキテクチャタイプを選択してください。 

    使用するZilliz BYOCイメージのアーキテクチャタイプを決定します。利用可能なオプションはX 86とARMです。

1.  **リソース設定**で、あなたはする必要があります

    1. **オートスケーリング**を有効または無効にすると、Zilliz Cloudがプロジェクトのワークロードに基づいて定義された範囲内でEC 2インスタンスの数を自動的に調整し、リソースの効率的な使用を確保できます。

    1. **初期プロジェクトサイズ**を設定します。 

        BYOCプロジェクトでは、検索サービス、インデックスサービス、その他のデータベースコンポーネント、およびコアサポートサービスが、異なるタイプのEC 2インスタンスを使用します。これらのサービスとコンポーネントに対して、インスタンスタイプとカウントを個別に設定できます。 

        **自動スケーリング**が無効になっている場合は、対応する**Count**フィールドに各プロジェクトコンポーネントに必要なEC 2インスタンスの数を指定してください。

        ![MYuIbxUTcosGtjxYcEdckzKznRb](/img/MYuIbxUTcosGtjxYcEdckzKznRb.png)

        「オートスケーリング」が有効になったら、Zilliz Cloudが実際のプロジェクトのワークロードに基づいてEC 2インスタンスの数を自動的にスケーリングする範囲を指定する必要があります。これには、対応する「最小」と「最大」のフィールドを設定します。

        ![CgI2bJva0oyf2TxR77lcPsIunih](/img/CgI2bJva0oyf2TxR77lcPsIunih.png)

        リソース設定を容易にするために、4つの定義済みプロジェクト体格オプションがあります。次の表は、これらのプロジェクト体格オプションとプロジェクトで作成できるクラスターの数、およびこれらのクラスターに含めることができるエンティティの数とのマッピングを示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスタ数</p></th>
             <th colspan="2"><p>エンティティの最大数（百万）</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimizedCU</p></td>
             <td><p>容量最適化されたCU</p></td>
           </tr>
           <tr>
             <td><p>小さい</p></td>
             <td><p>8～16個のCUを持つ3つのクラスタ</p></td>
             <td><p>10百万-25百万の</p></td>
             <td><p>40ミリオン-80ミリオン</p></td>
           </tr>
           <tr>
             <td><p>ミディアム</p></td>
             <td><p>16から64個のCUを持つ7つのクラスタ</p></td>
             <td><p>25ミリオン-100ミリオン</p></td>
             <td><p>80百万-350百万の</p></td>
           </tr>
           <tr>
             <td><p>大きい</p></td>
             <td><p>64～192 CUの12クラスタ</p></td>
             <td><p>100ミリオン-300ミリオン</p></td>
             <td><p>350ミリオン-10億</p></td>
           </tr>
           <tr>
             <td><p>Xラージ</p></td>
             <td><p>192～576 CUの17クラスタ</p></td>
             <td><p>300ミリオン-900ミリオン</p></td>
             <td><p>10億から30億</p></td>
           </tr>
        </table>

        「Initial Project Size」で「Custom」を選択し、すべてのデータプレーンコンポーネントのEC 2インスタンスタイプとカウントを調整することで、設定をカスタマイズすることもできます。希望のEC 2インスタンスタイプがリストされていない場合は、[Zillizサポートに連絡する](https://zilliz.com/contact)を使用して詳細を確認してください。 

1. 「デプロイ方法」でZilliz Cloudがタスクを実行する方法を選択してください。

    AWS上でBYOCプロジェクトのインフラストラクチャをプロビジョニングするための3つのオプションがあります。

    - インフラストラクチャをプロビジョニングするためにAWS CloudFormationを使用してください。

        プロジェクトのデータプレーンインフラストラクチャをプロビジョニングするためにAWS CloudFormationを使用する場合は、「デプロイ方法」セクションで「クイックスタート」タイルを選択してください。これはBYOCプロジェクトを開始するための推奨方法でもあります。

        AWS CloudFormationを使用する場合は、**次へ**をクリックすると、新しいVPCまたは既存のVPCにプロジェクトをデプロイするかどうかを選択するダイアログボックスが表示されます。

        ![EWCsb9An2oM6dkxjCuOcM5hRnCe](/img/EWCsb9An2oM6dkxjCuOcM5hRnCe.png)

        その後、**Create Stack with CloudFormation**をクリックして、プロジェクトのデプロイを開始できます。

    - インフラストラクチャをプロビジョニングするためにTerraformスクリプトを使用してください

        インフラストラクチャをプロビジョニングするためにTerraformスクリプトを使用する場合は、スクリプトの出力をZilliz Cloudにコピー&ペーストする必要があります。詳細については、[テラフォームプロバイダName](./terraform-provider)を参照してください。 

        [クレデンシャル設定](./deploy-byoc-aws#step-2-set-up-credentials)と[ネットワーク設定](./deploy-byoc-aws#step-3-configure-network-settings)で指定されたように、TerraformスクリプトによってZilliz Cloudコンソールに返される情報を入力する必要があることに注意してください。

    - AWSコンソールを使用して、必要なリソースとロールを作成してください

        必要なリソース(ストレージバケットや複数のIAMロールなど)をAWSコンソールで作成する必要があります。その後、名前とIDをコピーしてZilliz Cloudコンソールに貼り付けます。この方法でプロジェクトを作成する場合は、「デプロイ方法」セクションの「手動」タイルを選択し、「次へ」をクリックしてください。 

        Zilliz Cloudは、設定を容易にするために、過程を[クレデンシャル設定](./deploy-byoc-aws#step-2-set-up-credentials)と[ネットワーク設定](./deploy-byoc-aws#step-3-configure-network-settings)に分割します。 

1. 資格情報を設定するには、**次へ**をクリックしてください。

### ステップ2:資格情報を設定する{#step-2-set-up-credentials}

**資格情報設定**では、ストレージアクセス、EKSクラスター管理、およびデータプレーン展開のために、ストレージといくつかのIAMロールを設定する必要があります。

![LEGhbUbZwoPdwSx1PjxcHBjQnab](/img/LEGhbUbZwoPdwSx1PjxcHBjQnab.png)

1. 「ストレージ設定」で、AWSから取得した「バケット名」と「IAMロールARN」を設定してください。 

    Zilliz Cloudは、指定されたバケットをデータプレーンストレージとして使用し、指定されたIAMロールを使用してあなたの代わりにアクセスします。

     S 3バケットを作成する手順の詳細については、[S 3バケットとIAMロールの作成](./create-bucket-and-role)を参照してください。 

1. 「EKS設定」で、EKS管理のために「IAMロールARN」を設定してください。 

    Zilliz Cloudは、指定されたロールを使用してEKSクラスターをデプロイし、EKSクラスターにデータプレーンをデプロイします。

    EKSロールを作成する手順の詳細については、[EKS IAMロールの作成](./create-eks-role)を参照してください。

1. 「クロスアカウント設定」で、データプレーン展開のために「IAMロールARN」を設定してください。

    ダイアログボックスで提供された**外部ID**をコピーする必要があります。Zilliz Cloudは、指定されたロールを使用して、Zilliz Cloud BYOCプロジェクトのデータプレーンを展開します。 

    クロスアカウントロールを作成する手順の詳細については、[クロスアカウントIAMロールの作成](./create-cross-account-role)を参照してください。

1. ネットワーク設定を構成するには、**次へ**をクリックしてください。

### ステップ3:ネットワーク設定を構成する{#step-3-configure-network-settings}

「ネットワーク設定」で、VPCとサブネット、セキュリティグループ、オプションのVPCエンドポイントなど、複数の種類のリソースをVPCに作成してください。

![NeKmbmKVhoNWcOx18IjcC1eLnDb](/img/NeKmbmKVhoNWcOx18IjcC1eLnDb.png)

1. 「ネットワーク設定」で、「VPC ID」、「サブネットID」、「セキュリティグループID」、およびオプションの「VPCエンドポイントID」を設定してください。

    指定されたVPCでは、Zilliz Cloudが必要です。 

    - パブリックサブネットと3つのプライベートサブネット。

    - セキュリティグループ、そして

    - オプションのVPCエンドポイント。

    **VPCエンドポイントID**は、上記の**一般設定**で**AWS PrivateLink**をオンにした場合にのみ利用可能であることに注意してください。VPCとその関連リソースを作成する手順の詳細については、[顧客管理型VPCの設定](./configure-vpc)を参照してください。

1. サマリーを表示するには、**次へ**をクリックしてください。

1. **Deployment Summary**で、構成設定を確認してください。

1. すべてが予想通りであれば、**作成**をクリックしてください。

## デプロイの詳細を表示する{#view-deployment-details}

プロジェクトを作成したら、プロジェクトページでステータスを閲覧可能です。

![Wstab2JghoTZ51xdSFQc2JHknJb](/img/Wstab2JghoTZ51xdSFQc2JHknJb.png)

## 一時停止と再開{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、プロジェクトをサポートするEKSクラスターに関連するすべてのEC 2インスタンスが終了します。このアクションは、プロジェクト内の一時停止されたZilliz Cloudクラスターには影響しません。データプレーンが復元されたら再開できます。

![BN8KbqawgoErlZxtNYFcEvrjne4](/img/BN8KbqawgoErlZxtNYFcEvrjne4.png)

実行中のプロジェクトを一時停止できるのは、プロジェクトにクラスターがない場合、またはすべてのクラスターがすでに一時停止されている場合のみです。

![QXK1bRewYoasCzx1AHNcpbSBnhe](/img/QXK1bRewYoasCzx1AHNcpbSBnhe.png)

プロジェクトカードのステータスタグが「一時停止」と表示されると、プロジェクト内のクラスターを操作することはできません。そのような場合は、「再開」をクリックしてプロジェクトを再開できます。ステータスタグが再び「実行中」に変わったら、プロジェクト内のクラスターを操作し続けることができます。

## 手続き{#procedures}

import DocCardList from '@theme/DocCardList';

<DocCardList />