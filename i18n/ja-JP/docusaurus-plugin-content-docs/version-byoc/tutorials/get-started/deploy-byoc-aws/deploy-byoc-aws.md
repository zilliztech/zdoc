---
title: "AWS に BYOC を展開 | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "AWS に BYOC を展開"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールとカスタム AWS 構成を使用して、AWS Virtual Private Cloud (VPC) で完全に管理された Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。 | BYOC"
type: origin
token: DsqzwjegpiYSdtk1k75c1zXsnZc
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


# AWS に BYOC を展開

このページでは、Zilliz Cloud コンソールとカスタム AWS 構成を使用して、AWS Virtual Private Cloud (VPC) で完全に管理された Bring-Your-Own-Cloud (BYOC) データプレーンを手動で作成する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p></li>
<li><p>このガイドでは、AWS コンソールで必要なリソースをステップバイステップで作成する方法を示しています。インフラストラクチャをプロビジョニングするために Terraform スクリプトを使用する場合は、<a href="./terraform-provider">Terraform プロバイダー</a>を参照してください。</p></li>
</ul>

</Admonition>

## 前提条件\{#prerequisites}

- BYOC 組織の所有者でなければなりません。

## 手順\{#procedure}

AWS に BYOC を展開するには、Zilliz Cloud が代理で S3 バケットと顧客管理 VPC 内の EKS クラスターにアクセスするために特定のロールを想定する必要があります。したがって、Zilliz Cloud は S3 バケット、EKS クラスター、VPC の情報およびこれらのインフラストラクチャリソースにアクセスするために必要なロールを収集する必要があります。

BYOC 組織内で **プロジェクトを作成してデータプレーンを展開** ボタンをクリックして展開を開始します。

![XtlJbBTIboHNbixzfqpc7H3nnvb](/img/XtlJbBTIboHNbixzfqpc7H3nnvb.png)

### ステップ1: プロジェクトを作成\{#step-1-create-a-project}

このステップでは、プロジェクト名を設定し、クラウドプロバイダーとリージョンを決定するとともに初期プロジェクトサイズを設定し、Zilliz Cloud がプロジェクトを作成してデータプレーンを展開する方法を選択する必要があります。

![ObsWbiWhxo4IQHx7pPacHUl2nuh](/img/ObsWbiWhxo4IQHx7pPacHUl2nuh.png)

1. **プロジェクト名** を設定します。

1. **クラウドプロバイダー** および **リージョン** を選択します。

1. **AWS PrivateLink** を有効にするかどうかを決定します。

   このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用に VPC エンドポイントを作成する必要があります。

1. **アーキテクチャ** で、アプリケーションに一致するアーキテクチャタイプを選択します。

   これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは **X86** および **ARM** です。

1.  **リソース設定** では、

    1. **自動スケーリング** を有効または無効にして、Zilliz Cloud がプロジェクトワークロードに基づいて定義された範囲内で EC2 インスタンスの数を自動的に調整できるようにします。

    1. **初期プロジェクトサイズ** を構成します。

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なるタイプの EC2 インスタンスを使用します。これらのサービスおよびコンポーネントのインスタンスタイプおよび数を個別に設定できます。

        **自動スケーリング** が無効になっている場合は、対応する **数** フィールドに各プロジェクトコンポーネントに必要な EC2 インスタンスの数を指定するだけです。

        ![V1r0b6PDzokWRqxaA4ccrTs2nEd](/img/V1r0b6PDzokWRqxaA4ccrTs2nEd.png)

        **自動スケーリング** が有効になると、実際のプロジェクトワークロードに基づいて EC2 インスタンスの数を自動的にスケーリングするために、対応する **最小** および **最大** フィールドを設定して Zilliz Cloud が使用する範囲を指定する必要があります。

        ![XYW9bj1qfoKEXMx9L4DchlE7nHh](/img/XYW9bj1qfoKEXMx9L4DchlE7nHh.png)

        リソース設定を容易にするために、4つの事前定義されたプロジェクトサイズオプションがあります。以下の表は、これらのプロジェクトサイズオプションとプロジェクトで作成できるクラスターの数、およびこれらのクラスターが含むことができるエンティティ数との対応を示しています。

        <table>
           <tr>
             <th rowspan="2"><p>サイズ</p></th>
             <th rowspan="2"><p>最大クラスター数</p></th>
             <th colspan="2"><p>最大エンティティ数 (百万)</p></th>
           </tr>
           <tr>
             <td><p>パフォーマンス最適化 CU</p></td>
             <td><p>容量最適化 CU</p></td>
           </tr>
           <tr>
             <td><p>小</p></td>
             <td><p>8〜16 CU の 3 クラスター</p></td>
             <td><p>1000万 - 2500万</p></td>
             <td><p>4000万 - 8000万</p></td>
           </tr>
           <tr>
             <td><p>中</p></td>
             <td><p>16〜64 CU の 7 クラスター</p></td>
             <td><p>2500万 - 1億</p></td>
             <td><p>8000万 - 3.5億</p></td>
           </tr>
           <tr>
             <td><p>大</p></td>
             <td><p>64〜192 CU の 12 クラスター</p></td>
             <td><p>1億 - 3億</p></td>
             <td><p>3.5億 - 10億</p></td>
           </tr>
           <tr>
             <td><p>特大</p></td>
             <td><p>192〜576 CU の 17 クラスター</p></td>
             <td><p>3億 - 9億</p></td>
             <td><p>10億 - 30億</p></td>
           </tr>
        </table>

        **初期プロジェクトサイズ** で **カスタム** を選択し、すべてのデータプレーンコンポーネントの EC2 インスタンスタイプおよび数を調整することで、設定をカスタマイズすることもできます。お好みの EC2 インスタンスタイプがリストにない場合は、追加の支援のために[Zilliz サポート](https://zilliz.com/contact)までお問い合わせください。

1. **展開方法** で Zilliz Cloud がタスクを実行する方法を選択します。

    AWS で BYOC プロジェクト用のインフラストラクチャをプロビジョニングするための3つのオプションがあります。以下から選択できます。

    - **AWS CloudFormation を使用してインフラストラクチャをプロビジョニングします。**

        プロジェクト用のデータプレーンインフラストラクチャを AWS CloudFormation を使用してプロビジョニングする場合は、**展開方法** セクションで **クイックスタート** タイルを選択します。これは BYOC プロジェクトを開始するためにお勧めの方法でもあります。

        AWS CloudFormation を使用することにした場合は、**次へ** をクリックすると、プロジェクトを新しい VPC または既存の VPC に展開するかどうかを選択するための以下のダイアログボックスが表示されます。

        ![EWCsb9An2oM6dkxjCuOcM5hRnCe](/img/EWCsb9An2oM6dkxjCuOcM5hRnCe.png)

        次に、**CloudFormation でスタックを作成** をクリックしてプロジェクトの展開を開始できます。

    - **Terraform スクリプトを使用してインフラストラクチャをプロビジョニングします。**

        インフラストラクチャをプロビジョニングするために Terraform スクリプトを使用する場合は、スクリプトの出力を Zilliz Cloud にコピーして貼り付ける必要があります。詳細については、[Terraform プロバイダー](./terraform-provider)を参照してください。

        Terraform スクリプトが Zilliz Cloud コンソールに返す情報を [認証設定](./deploy-byoc-aws#step-2-set-up-credentials) および [ネットワーク設定](./deploy-byoc-aws#step-3-configure-network-settings) で指定するように Zilliz Cloud コンソールに記入する必要があることに注意してください。

    - **AWS コンソールを使用して** **必要なリソースとロールを作成します。**

        AWS コンソールでストレージバケットといくつかの IAM ロールなどの必要なリソースを作成する必要があります。次に、それらの名前と ID を Zilliz Cloud コンソールにコピーして貼り付けます。この方法でプロジェクトを作成する場合は、**展開方法** セクションで **手動** タイルを選択し、**次へ** をクリックします。

        Zilliz Cloud は、設定を容易にするためにプロセスを [認証設定](./deploy-byoc-aws#step-2-set-up-credentials) および [ネットワーク設定](./deploy-byoc-aws#step-3-configure-network-settings) に分割します。

1. **次へ** をクリックして認証情報を設定します。

### ステップ2: 認証情報を設定\{#step-2-set-up-credentials}

**認証設定** では、ストレージとストレージアクセス、EKS クラスターマネジメント、およびデータプレーン展開用のいくつかの IAM ロールを設定する必要があります。

![LEGhbUbZwoPdwSx1PjxcHBjQnab](/img/LEGhbUbZwoPdwSx1PjxcHBjQnab.png)

1. **ストレージ設定** で、AWS から取得した **バケット名** および **IAM ロール ARN** を設定します。

    Zilliz Cloud は、指定したバケットをデータプレーンストレージとして使用し、指定した IAM ロールを使用して代理でアクセスします。

     S3 バケットを作成する手順の詳細については、[S3 バケットと IAM ロールの作成](./create-bucket-and-role)を参照してください。

1. **EKS 設定** で、EKS マネジメント用の **IAM ロール ARN** を設定します。

    Zilliz Cloud は、指定したロールを使用して EKS クラスターを代理で展開し、EKS クラスターにデータプレーンを展開します。

    EKS ロールを作成する手順の詳細については、[EKS IAM ロールの作成](./create-eks-role)を参照してください。

1. **クロスアカウント設定** で、データプレーン展開用の **IAM ロール ARN** を設定します。

    ダイアログボックスで提供される **外部 ID** をコピーする必要があります。Zilliz Cloud は、指定したロールを使用して Zilliz Cloud BYOC プロジェクトのデータプレーンを展開します。

    クロスアカウントロールを作成する手順の詳細については、[クロスアカウント IAM ロールの作成](./create-cross-account-role)を参照してください。

1. **次へ** をクリックしてネットワーク設定を構成します。

### ステップ3: ネットワーク設定を構成\{#step-3-configure-network-settings}

**ネットワーク設定** では、VPC とサブネット、セキュリティグループ、およびオプションの VPC エンドポイントなど、いくつかのタイプのリソースを作成します。

![NeKmbmKVhoNWcOx18IjcC1eLnDb](/img/NeKmbmKVhoNWcOx18IjcC1eLnDb.png)

1. **ネットワーク設定** で、**VPC ID**、**サブネット ID**、**セキュリティグループ ID**、およびオプションの **VPC エンドポイント ID** を設定します。

    指定した VPC で Zilliz Cloud には以下のものが必要です。

    - パブリックサブネットおよび3つのプライベートサブネット。

    - セキュリティグループ、および

    - オプションの VPC エンドポイント。

    **VPC エンドポイント ID** は、上記の **全般設定** で **AWS PrivateLink** をオンにした場合にのみ利用可能であることに注意してください。VPC および関連リソースを作成する手順の詳細については、[顧客管理 VPC の構成](./configure-vpc)を参照してください。

1. **次へ** をクリックして要約を表示します。

1. **展開要約** で、構成設定を確認します。

1. すべてが期待通りであれば、**作成** をクリックします。

## 展開の詳細を表示\{#view-deployment-details}

プロジェクトを作成した後、プロジェクトページでそのステータスを表示できます。

![Bw2Xb6wIKoXWAuxU4jOcDdAnn2e](/img/Bw2Xb6wIKoXWAuxU4jOcDdAnn2e.png)

## 一時停止 & 再開\{#suspend-and-resume}

プロジェクトを一時停止すると、データプレーンが停止し、プロジェクトをサポートする EKS クラスターに関連付けられたすべての EC2 インスタンスが終了します。この操作は、プロジェクト内の一時停止された Zilliz Cloud クラスターには影響せず、データプレーンが復元されれば再開できます。

![BN8KbqawgoErlZxtNYFcEvrjne4](/img/BN8KbqawgoErlZxtNYFcEvrjne4.png)

プロジェクトが実行中の場合、プロジェクト内にクラスターが存在しないか、すべてのクラスターがすでに一時停止している場合にのみプロジェクトを一時停止できます。

![QXK1bRewYoasCzx1AHNcpbSBnhe](/img/QXK1bRewYoasCzx1AHNcpbSBnhe.png)

プロジェクトカードのステータスタグが **一時停止中** と表示されると、プロジェクト内のクラスターを操作できなくなります。その場合は、**再開** をクリックしてプロジェクトを再開できます。ステータスタグが再び **実行中** に変わるまで、プロジェクト内のクラスターを操作し続けることができます。

## 手順\{#procedures}

import DocCardList from '@theme/DocCardList';

<DocCardList />