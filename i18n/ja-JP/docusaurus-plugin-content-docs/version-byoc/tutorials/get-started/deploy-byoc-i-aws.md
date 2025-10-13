---
title: "AWSでBYOC-Iをデプロイする | BYOC"
slug: /deploy-byoc-i-aws
sidebar_label: "AWSでBYOC-Iをデプロイする"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、AWS Virtual Private Cloud(VPC)でBYOCエージェントを使用してBring-Your-Own-Cloud(BYOC)データプレーンを作成する方法について説明します。 | BYOC"
type: origin
token: RMhbwx7ewiGxfUkiaDDc9PC6nWh
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
  - IVF
  - knn
  - Image Search
  - LLMs

---

import Admonition from '@theme/Admonition';


# AWSでBYOC-Iをデプロイする

このページでは、AWS Virtual Private Cloud(VPC)でBYOCエージェントを使用してBring-Your-Own-Cloud(BYOC)データプレーンを作成する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>一般提供中</strong>です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポートに</a>お問い合わせください。</p>

</Admonition>

## 前提条件{#prerequisites}

- あなたはBYOC組織のオーナーでなければなりません。

## 手続き{#procedure}

### ステップ1:デプロイ環境を準備する{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraformの設定ファイルを実行し、BYOC-Iプロジェクトのデータプレーンをデプロイするために設定されたローカルマシン、仮想マシン（VM）、またはCI/CDパイプラインのことです。このステップでは、 

- **AWSの認証情報（AWSプロファイルまたはアクセスキー）を設定します。**

    AWSの認証情報の設定方法の詳細については、[このドキュメント](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)を参照してください。

- **最新のTerraformバイナリをインストールします。**

    Terraformのインストール方法については、[このドキュメント](https://developer.hashicorp.com/terraform/install?product_intent=terraform)を参照してください。

### ステップ2:プロジェクトを作成する{#step-2-create-a-project}

BYOC-I組織内で、&#91;**プロジェクトの作成とデータプレーンのデプロイ**&#93;ボタンをクリックしてデプロイを開始します。

![TzN1b6TOSoGfJ9xrQV8c6rqznNf](/img/TzN1b6TOSoGfJ9xrQV8c6rqznNf.png)

### ステップ3:一般的な設定を行う{#step-3-set-up-the-general-settings}

一般設定では、プロジェクト名を設定し、Zilliz Cloudがプロジェクトのデータプレーンをデプロイするクラウドプロバイダーとリージョンを決定する必要があります。

![TJw1bLl1colGw6x5B38cUQ6InDh](/img/TJw1bLl1colGw6x5B38cUQ6InDh.png)

1. **プロジェクト名**を設定します。

1. **クラウドプロバイダー**と**リージョン**を選択します。

1. (オプション)**インスタンス設定**を構成します。 

    BYOCプロジェクトでは、検索サービス、基本的なデータベースコンポーネント、およびコアサポートサービスが異なるインスタンスを使用します。これらのサービスとコンポーネントのインスタンスタイプを設定できます。 

    詳細については、[インスタンス設定](./deploy-byoc-i-aws#instance-settings)を参照してください。

1. **AWS PrivateLink**を有効にするかどうかを決定します。

    このオプションを有効にすると、現在のプロジェクト内のクラスターへのプライベート接続が可能になります。このオプションを有効にする場合は、プライベート接続用のVPCエンドポイントを作成する必要があります。

1. **作成して次へ**をクリックします。

### ステップ4:データプレーンをデプロイする{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成されているプロジェクトのデータプレーンをデプロイします。

![X8K3bwWlcoakPIxEqZJcfWSQnEg](/img/X8K3bwWlcoakPIxEqZJcfWSQnEg.png)

上記のTerraformスクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-Iプロジェクトセットアップガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)を参照してください。

## プロジェクトを管理する{#manage-projects}

![NCD9bER2hovY5pxsAdPc7UwPn9Z](/img/NCD9bER2hovY5pxsAdPc7UwPn9Z.png)

### Undeployタグのあるプロジェクト{#undeploy}

プロジェクトカードの右隅にあるステータスタグに「**展開解除**」と表示されている場合は、プロジェクトカードの「**データプレーンを展開**」ボタンをクリックして再度開くことができます。プロジェクトの名前を変更または削除するには、をクリックしてください... プロジェクトカードのボタンをクリックし、ドロップダウンメニューから**名前の変更**または**削除**を選択してください。  

### Deployingタグのあるプロジェクト{#deploying}

デプロイ環境を準備し、表示されたコマンドを実行したら、BYOCエージェントがアクティブになるのを待つ必要があります。プロジェクトカードのステータスタグが「**デプロイ中**」と表示され、進捗率が表示される場合、データプレーンがインになるまでプロジェクトの名前を変更または削除することはできません。

### Runningタグのあるプロジェクト{#running}

プロジェクトカードのステータスタグに「**実行中**」と表示されたら、プロジェクト内でクラスターの作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクトにクラスターがないことを確認します。

## インスタンス設定{#instance-settings}

Zilliz BYOCプロジェクトのデータプレーンには、**Search Services**、**Fundamental Database Components**、**Core Support Services**の3種類のコンポーネントがあり、それぞれ異なるEC 2インスタンスを使用しています。 

![ZJyhbVpVioi2M2xDmVFc07SCn4c](/img/ZJyhbVpVioi2M2xDmVFc07SCn4c.png)

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

