---
title: "AWS に BYOC-I を展開 | BYOC"
slug: /deploy-byoc-i-aws
sidebar_label: "AWS に BYOC-I を展開"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、AWS Virtual Private Cloud (VPC) に BYOC エージェントを含む Bring-Your-Own-Cloud (BYOC) データプレーンを展開する方法について説明します。 | BYOC"
type: origin
token: D1E4wLr5xiuHoFkJgblcHZ1FnLb
sidebar_position: 4
keywords:
  - zilliz
  - byoc
  - byoc-i
  - aws
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data

---

import Admonition from '@theme/Admonition';


# AWS に BYOC-I を展開

このページでは、AWS Virtual Private Cloud (VPC) に BYOC エージェントを含む Bring-Your-Own-Cloud (BYOC) データプレーンを展開する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud サポート</a>にお問い合わせください。</p></li>
<li><p>このガイドでは、AWS コンソールで必要なリソースをステップバイステップで作成する方法を示しています。インフラストラクチャをプロビジョニングするために Terraform スクリプトを使用する場合は、<a href="./terraform-provider">Terraform プロバイダー</a>を参照してください。</p></li>
</ul>

</Admonition>

## 前提条件\{#prerequisites}

以下のことを確認してください：

- BYOC-I 組織の所有者であること。

## 手順\{#procedures}

### ステップ1: 展開環境を準備\{#step-1-prepare-the-deployment-environment}

展開環境は、Terraform 設定ファイルを実行して BYOC-I プロジェクトのデータプレーンを展開するように構成されたローカルマシン、仮想マシン (VM)、または CI/CD パイプラインです。このステップでは、以下のことを行う必要があります：

- **AWS 認証情報 (AWS プロファイルまたはアクセスキー) を構成します。**

    AWS 認証情報を構成する方法の詳細については、[このドキュメント](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)を参照してください。

- **最新の Terraform バイナリをインストールします。**

    Terraform をインストールする方法の詳細については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform)を参照してください。

### ステップ2: プロジェクトを作成\{#step-2-create-a-project}

BYOC-I 組織内で、**プロジェクトを作成してデータプレーンを展開** ボタンをクリックして展開を開始します。

![Xd4ObksJao97jdxSFVTclO4Fno6](/img/Xd4ObksJao97jdxSFVTclO4Fno6.png)

### ステップ3: 全般設定を構成\{#step-3-set-up-the-general-settings}

**全般設定** で、プロジェクト名を設定し、Zilliz Cloud がプロジェクト用のデータプレーンを展開するクラウドプロバイダーとリージョンを決定する必要があります。

![Xejfbdz6PockHsxn5uacw3OTnVc](/img/Xejfbdz6PockHsxn5uacw3OTnVc.png)

1. **プロジェクト名** を設定します。

1. **クラウドプロバイダー** および **リージョン** を選択します。

1. **AWS PrivateLink** を有効にするかどうかを決定します。

    このオプションにより、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用に VPC エンドポイントを作成する必要があります。

1. **アーキテクチャ** で、アプリケーションに一致するアーキテクチャタイプを選択します。

    これにより、使用する Zilliz BYOC イメージのアーキテクチャタイプが決定されます。利用可能なオプションは **X86** および **ARM** です。

1.  **リソース設定** では、以下を行う必要があります：

    1. **自動スケーリング** を有効または無効にして、Zilliz Cloud がプロジェクトワークロードに基づいて定義された範囲内で EC2 インスタンスの数を自動的に調整できるようにし、効率的なリソース使用を確保できます。

    1. **初期プロジェクトサイズ** を構成します。

        BYOC プロジェクトでは、クエリノード、インデックスサービス、Milvus コンポーネント、および依存関係が異なるタイプの EC2 インスタンスを使用します。これらのサービスおよびコンポーネントに対してインスタンスタイプと数を個別に設定できます。

        **自動スケーリング** が無効になっている場合は、対応する **数** フィールドに各プロジェクトコンポーネントに必要な EC2 インスタンスの数を単純に指定します。

        ![VHLHbZrT1oNG03xAJMgcFVKAnCh](/img/VHLHbZrT1oNG03xAJMgcFVKAnCh.png)

        **自動スケーピング** が有効になると、実際のプロジェクトワークロードに基づいて EC2 インスタンス数を自動的にスケーリングするために、対応する **最小** および **最大** フィールドを設定して Zilliz Cloud が使用する範囲を指定する必要があります。

        ![VVjXbGaS3ovyZdxEPcacd6Vnnkh](/img/VVjXbGaS3ovyZdxEPcacd6Vnnkh.png)

        リソース設定を容易にするために、4つの事前定義されたプロジェクトサイズオプションがあります。以下の表は、これらのプロジェクトサイズオプションとプロジェクトで作成できるクラスター数、およびこれらのクラスターに含まれるエンティティ数との対応を示しています。

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

        **初期プロジェクトサイズ** で **カスタム** を選択し、すべてのデータプレーンコンポーネントの EC2 インスタンスタイプと数を調整することで、設定をカスタマイズすることもできます。希望する EC2 インスタンスタイプがリストにない場合は、追加の支援のために[Zilliz サポート](https://zilliz.com/contact)までお問い合わせください。

1. **次へ** をクリックします。

### ステップ4: データプレーンを展開\{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成されたプロジェクトのデータプレーンを展開します。

![GHGqbw4UroKPu7xoEWmcDQaDnEd](/img/GHGqbw4UroKPu7xoEWmcDQaDnEd.png)

上記の Terraform スクリプトを実行する方法の詳細については、[Zilliz Cloud BYOC-I プロジェクトセットアップガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)を参照してください。

## プロジェクトの管理\{#manage-projects}

![AHEybTRhto0gcKxnKIucbm3inte](/img/AHEybTRhto0gcKxnKIucbm3inte.png)

### 「Undeploy」タグ付きプロジェクト\{#projects-with-an-undeploy-tag}

プロジェクトカードの右隅のステータスタグが **Undeploy** である場合、プロジェクトカードの **データプレーンを展開** ボタンをクリックして常に戻すことができます。プロジェクトの名前変更または削除を行うには、プロジェクトカードの **...** ボタンをクリックし、ドロップダウンメニューから **名前の変更** または **削除** を選択します。

### 「Deploying」タグ付きプロジェクト\{#projects-with-a-deploying-tag}

展開環境を準備して表示されたコマンドを実行すると、BYOC エージェントがアクティブになるまで待つ必要があります。プロジェクトカードのステータスタグが **Deploying** になり、進行状況のパーセンテージが表示されている間は、データプレーンが配置されるまでプロジェクトの名前変更や削除はできません。

### 「Running」タグ付きプロジェクト\{#projects-with-a-running-tag}

プロジェクトカードのステータスタグが **Running** になったら、プロジェクト内でクラスターを作成し始めることができます。実行中のプロジェクトの名前変更や削除を行うには、プロジェクト内にクラスターがないことを確認してください。
