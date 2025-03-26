---
title: "AWSでBYOC-Iをデプロイする | BYOC"
slug: /deploy-byoc-i-aws
sidebar_label: "AWSでBYOC-Iをデプロイする"
beta: CONTACT SALES
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
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db

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

BYOC-I組織内で、[**プロジェクトの作成とデータプレーンのデプロイ**]ボタンをクリックしてデプロイを開始します。

![TzN1b6TOSoGfJ9xrQV8c6rqznNf](/byoc/ja-JP/TzN1b6TOSoGfJ9xrQV8c6rqznNf.png)

### ステップ3:一般的な設定を行う{#step-3-set-up-the-general-settings}

一般設定では、プロジェクト名を設定し、Zilliz Cloudがプロジェクトのデータプレーンをデプロイするクラウドプロバイダーとリージョンを決定する必要があります。

![KpCMb8qJ6oc5wXxeiOFcpb2onnd](/byoc/ja-JP/KpCMb8qJ6oc5wXxeiOFcpb2onnd.png)

1. **プロジェクト名**を設定します。

1. **クラウドプロバイダー**と**リージョン**を選択します。

1. (オプション)**インスタンス設定**を構成します。 

    BYOCプロジェクトでは、検索サービス、基本的なデータベースコンポーネント、およびコアサポートサービスが異なるインスタンスを使用します。これらのサービスとコンポーネントのインスタンスタイプを設定できます。 

    詳細については、インスタンス設定を参照してください。

1. **作成して次へ**をクリックします。

### ステップ4:データプレーンをデプロイする{#step-4-deploy-the-data-plane}

ダイアログに表示される手順に従って、現在作成されているプロジェクトのデータプレーンをデプロイします。

![X8K3bwWlcoakPIxEqZJcfWSQnEg](/byoc/ja-JP/X8K3bwWlcoakPIxEqZJcfWSQnEg.png)

上記のTerraformスクリプトの実行方法の詳細については、[Zilliz Cloud BYOC-Iプロジェクトセットアップガイド](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project)を参照してください。

## プロジェクトを管理する{#manage-projects}

![NCD9bER2hovY5pxsAdPc7UwPn9Z](/byoc/ja-JP/NCD9bER2hovY5pxsAdPc7UwPn9Z.png)

### Undeployタグのあるプロジェクト{#undeploy}

プロジェクトカードの右隅にあるステータスタグに「**展開解除**」と表示されている場合は、プロジェクトカードの「**データプレーンを展開**」ボタンをクリックして再度開くことができます。プロジェクトの名前を変更または削除するには、をクリックしてください... プロジェクトカードのボタンをクリックし、ドロップダウンメニューから**名前の変更**または**削除**を選択してください。  

### Deployingタグのあるプロジェクト{#deploying}

デプロイ環境を準備し、表示されたコマンドを実行したら、BYOCエージェントがアクティブになるのを待つ必要があります。プロジェクトカードのステータスタグが「**デプロイ中**」と表示され、進捗率が表示される場合、データプレーンがインになるまでプロジェクトの名前を変更または削除することはできません。

### Runningタグのあるプロジェクト{#running}

プロジェクトカードのステータスタグに「**実行中**」と表示されたら、プロジェクト内でクラスターの作成を開始できます。実行中のプロジェクトの名前を変更または削除するには、プロジェクトにクラスターがないことを確認します。

## インスタンス設定{#instance-settings}

プロジェクトのデプロイ中、Zilliz Cloudは基本的なデータベースコンポーネントとコアサポートサービスを作成します。プロジェクトの準備ができたら、プロジェクト内にクラスターを作成できます。この時点で、Zilliz Cloudはあなたの代わりに検索サービスのインスタンスを作成します。

![Dga6bcpFxo6ZgaxONVEcXLOVnuf](/byoc/ja-JP/Dga6bcpFxo6ZgaxONVEcXLOVnuf.png)

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