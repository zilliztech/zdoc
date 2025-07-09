---
title: "AWSでBYOC-Iをデプロイする | BYOC"
slug: /deploy-byoc-i-aws
sidebar_label: "AWSでBYOC-Iをデプロイする"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、AWS Virtual Private Cloud(VPC)にBYOCエージェントを使用してBring-Your-Own-Cloud(BYOC)データプレーンをデプロイする方法について説明します。 | BYOC"
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
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


# AWSでBYOC-Iをデプロイする

このページでは、AWS Virtual Private Cloud(VPC)にBYOCエージェントを使用してBring-Your-Own-Cloud(BYOC)データプレーンをデプロイする方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## 前提条件{#prerequisites}

確実に 

- あなたはBYOC-I組織のオーナーです。

## 手続き{#procedures}

### ステップ1:デプロイ環境を準備する{#step-1-prepare-the-deployment-environment}

デプロイ環境とは、Terraformの設定ファイルを実行し、BYOC-Iプロジェクトのデータプレーンをデプロイするために設定されたローカルマシン、仮想マシン（VM）、またはCI/CDパイプラインのことです。このステップでは、 

- **AWSの資格情報(AWSプロファイルまたはアクセスキー)を設定します。**

    AWSの認証情報の設定方法の詳細については、[この文書](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)を参照してください。

- **最新のTerraformバイナリをインストールしてください。**

    Terraformのインストール方法については、[この文書](https://developer.hashicorp.com/terraform/install?product_intent=terraform)を参照してください。

### ステップ2:プロジェクトを作成する{#step-2-create-a-project}

BYOC-I組織内で、**プロジェクトの作成とデータプレーンのデプロイ**ボタンをクリックしてデプロイを開始してください。

![Xd4ObksJao97jdxSFVTclO4Fno6](/img/Xd4ObksJao97jdxSFVTclO4Fno6.png)

### ステップ3:一般的な設定を行う{#step-3-set-up-the-general-settings}

**一般設定**では、プロジェクト名を設定し、Zilliz Cloudがプロジェクトのデータプレーンを展開するクラウドプロバイダーとリージョンを決定する必要があります。

![WdrwbpyHMoTR5qxSth2cLfybnid](/img/WdrwbpyHMoTR5qxSth2cLfybnid.png)

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

        ![G3kCbsMnEo2BSWx6cVXcuJvRnqg](/img/G3kCbsMnEo2BSWx6cVXcuJvRnqg.png)

        「オートスケーリング」が有効になったら、Zilliz Cloudが実際のプロジェクトのワークロードに基づいてEC 2インスタンスの数を自動的にスケーリングする範囲を指定する必要があります。これには、対応する「最小」と「最大」のフィールドを設定します。

        ![Grkub50kkoPJe7xeYxyczsaTnUc](/img/Grkub50kkoPJe7xeYxyczsaTnUc.png)

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

1. 「次へ」をクリックしてください。

### ステップ4:データプレーンをデプロイする{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成されているプロジェクトのデータプレーンをデプロイします。

![GHGqbw4UroKPu7xoEWmcDQaDnEd](/img/GHGqbw4UroKPu7xoEWmcDQaDnEd.png)

上記のTerraformスクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-I Projectセットアップガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)を参照してください。

## プロジェクトを管理する{#manage-projects}

![AHEybTRhto0gcKxnKIucbm3inte](/img/AHEybTRhto0gcKxnKIucbm3inte.png)

### アンデプロイタグを持つプロジェクト{#projects-with-an-undeploy-tag}

プロジェクトカードの右隅にあるステータスタグが「展開解除」と表示されている場合、プロジェクトカードの「データプレーンの展開」ボタンをクリックして再度開くことができます。プロジェクトの名前を変更または削除するには、「」をクリックしてください。。。プロジェクトカードのボタンをクリックし、ドロップダウンメニューから「名前の変更」または「削除」を選択してください。  

### Deployingタグのあるプロジェクト{#projects-with-a-deploying-tag}

デプロイ環境を準備し、表示されたコマンドを実行したら、BYOCエージェントがアクティブになるのを待つ必要があります。プロジェクトカードのステータスタグが「デプロイ中」と表示され、進捗率が表示される場合、データプレーンが配置されるまでプロジェクトの名前を変更または削除することはできません。

### Runningタグのあるプロジェクト{#projects-with-a-running-tag}

プロジェクトカードのステータスタグが「実行中」と表示されたら、プロジェクト内にクラスターを作成できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクトにクラスターがないことを確認してください。

## 初期プロジェクトサイズ{#initial-project-sizes}

Zilliz BYOCプロジェクトのデータプレーンには、異なるEC 2インスタンスを使用する**Search Services**、**Fundamental Database Components**、**Core Support Services**の3種類のコンポーネントが含まれています。 

![EDY4bdBPdoPv2KxOEvHcQIAtnGF](/img/EDY4bdBPdoPv2KxOEvHcQIAtnGF.png)

**一般設定**では、上記の3つのデータプレーンコンポーネントのEC 2インスタンスタイプを決定する必要があります。さらに、**Core Support Services**のEC 2インスタンス数を指定する必要があります。これにより、プロジェクト内で作成できるクラスタの最大数が決定されます。

定義済みのプロジェクト体格オプションは4つあります。

<table>
   <tr>
     <th rowspan="2"><p>サイズ</p></th>
     <th rowspan="2"><p>最大クラスタ数</p></th>
     <th colspan="2"><p>エンティティの最大数</p></th>
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

「初期プロジェクトサイズ」で「カスタム」を選択し、すべてのデータプレーンコンポーネントのEC 2インスタンスタイプとカウントを調整することで、設定をカスタマイズすることもできます。希望のEC 2インスタンスタイプがリストされていない場合は、[Zillizサポートに連絡する](https://zilliz.com/contact)をクリックしてください。 