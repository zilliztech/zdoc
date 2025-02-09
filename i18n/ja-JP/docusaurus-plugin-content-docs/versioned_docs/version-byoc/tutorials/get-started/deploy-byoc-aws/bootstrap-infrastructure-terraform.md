---
title: "Bootstrapインフラストラクチャ（Terraform） | BYOC"
slug: /bootstrap-infrastructure-terraform
sidebar_label: "Bootstrapインフラストラクチャ（Terraform）"
beta: PRIVATE
notebook: FALSE
description: "このページでは、Terraformを使用してZilliz Cloud BYOCプロジェクトのインフラストラクチャをブートストラップする方法を示しています。これには、S 3バケット、関連するすべての役割、および資格のあるVPCの作成が含まれます。 | BYOC"
type: origin
token: QaZWwHvOdiuHKvkxxKwcbn29nHb
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - aws
  - terraform
  - milvus
  - vector database
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search

---

import Admonition from '@theme/Admonition';


# Bootstrapインフラストラクチャ（Terraform）

このページでは、Terraformを使用してZilliz Cloud BYOCプロジェクトのインフラストラクチャをブートストラップする方法を示しています。これには、S 3バケット、関連するすべての役割、および資格のあるVPCの作成が含まれます。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>Zilliz BYOCは現在<strong>一般提供</strong>中です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p></li>
<li><p>Terraformスクリプトを実行するには、コンピューターに<a href="https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli">Terraform</a>と<a href="https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html">AWS CLI</a>をインストールし、VPCを作成するための関連する資格情報を持つAWSアカウントが必要です。</p></li>
</ul>

</Admonition>

## スクリプトリポジトリをクローンする{#clone-the-script-repository}{#clone-the-script-repository}

このステップでは、次のコマンドを使用してスクリプトリポジトリをクローンしてプルします。

```shell
$ git clone https://github.com/zilliztech/zilliz-byoc-prepare.git
```

## 資格情報を準備する{#prepare-the-credentials}{#prepare-the-credentials}

このステップでは、client_initフォルダー内のterraform. tfvars`.`jsonファイルを編集`しま`す。

```shell
$ cd byoc-prepare
$ vi terraform.tfvars.json
```

このファイルは次のようなものです。

```json
{
  "aws_region": "us-west-2",
  "vpc_cidr": "10.0.0.0/16",
  "name": "test-byoc-lcf",
  "ExternalId": "cid-xxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

<table>
   <tr>
     <th><p>バリアブル</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>AWSリージョン</code></p></td>
     <td><p>Zilliz BYOCを展開するクラウドリージョン。</p><p>現在、<code>us-west-2</code>にBYOCプロジェクトをデプロイすることができます。他のクラウドリージョンにBYOCプロジェクトをデプロイする必要がある場合は、support@zilliz.comにメールでお問い合わせください。</p></td>
   </tr>
   <tr>
     <td><p><code>vpc_cidrとは</code></p></td>
     <td><p>顧客が管理するVPC内で割り当てるCIDRブロック。例えば、<strong>10.0.0.0/16</strong>。</p></td>
   </tr>
   <tr>
     <td><p><code>お名前</code></p></td>
     <td><p>作成するBYOCプロジェクトの名前。</p><p>以下のフォームに入力した値に合わせてください。</p><p><img src="/byoc/ja-JP/AYsNb67nEow59LxVqwEcCtt3ndh.png" alt="AYsNb67nEow59LxVqwEcCtt3ndh" /></p></td>
   </tr>
   <tr>
     <td><p><code>ExternalIdの外部ID</code></p></td>
     <td><p>作成するBYOCプロジェクトの<strong>外部ID</strong>です。この値はZilliz Cloudコンソールから取得できます。</p><p><img src="/byoc/ja-JP/JRRTbSoFkoarIGxp9ShcURDcngd.png" alt="JRRTbSoFkoarIGxp9ShcURDcngd" /></p></td>
   </tr>
</table>

## Bootstrapインフラストラクチャ{#bootstrap-infrastructure}{#bootstrapbootstrap-infrastructure}

上記の資格情報を準備したら、次のようにプロジェクトのインフラストラクチャをブートストラップします。

1. envを準備するために`terraform init`を実行します。

1. エラーがある場合は`terraform plan`を実行し、修正してから再度コマンドを実行してください。

1. VPCを作成するには、`terraform apply`を実行してください。

    結果は次のようになる可能性があります:

    ```bash
    bootstrap_role_arn = "arn:aws:iam::xxxxxxxxxxxx:role/zilliz-byoc-boostrap-role"
    bucket_name = "zilliz-byoc-bucket"
    eks-role-arn = "arn:aws:iam::xxxxxxxxxxxx:role/zilliz-byoc-eks-role"
    external_id = "cid-xxxxxxxxxxxxxxxxxxxxxxxxx"
    security_group_id = "sg-xxxxxxxxxxxxxxxxx"
    storage_role_arn = "arn:aws:iam::xxxxxxxxxxxx:role/zilliz-byoc-storage-role"
    subnet_id = [
      "subnet-xxxxxxxxxxxxxxxxx",
      "subnet-xxxxxxxxxxxxxxxxx",
      "subnet-xxxxxxxxxxxxxxxxx",
    ]
    vpc_id = "vpc-xxxxxxxxxxxxxxxxx"
    ```

1. 以下の情報を収集し、Zilliz Cloudコンソールのフォームに記入してください。

    <table>
       <tr>
         <th><p>パラメータ</p></th>
         <th><p>価値から</p></th>
       </tr>
       <tr>
         <td colspan="2"><p><strong>ストレージの設定</strong></p></td>
       </tr>
       <tr>
         <td><p>バケット名</p></td>
         <td><p>コマンド出力で<code>bucket_name</code>変数の値を使用してください。</p><p>Zilliz Cloudはバケットをデータプレーンストレージとして使用しています。</p></td>
       </tr>
       <tr>
         <td><p>IAMロールARN</p></td>
         <td><p>コマンド出力で<code>storage_role_arn変数</code>の値を使用します。</p><p>この役割を担うことで、Zilliz Cloudはあなたの代わりに上記のバケットをアクセス可能にします。</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>EKSの設定</strong></p></td>
       </tr>
       <tr>
         <td><p>IAMロールARN</p></td>
         <td><p>コマンド出力で<code>eks_role_arn変数</code>の値を使用します。</p><p>役割を引き受けることで、Zilliz Cloudはあなたの代わりにEKSクラスターを作成および管理できます。</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>クロスアカウント設定</strong></p></td>
       </tr>
       <tr>
         <td><p>IAMロールARN</p></td>
         <td><p>コマンド出力で<code>cross_account_role_arn変数</code>の値を使用します。</p><p>役割を引き受けることで、Zilliz Cloudはあなたの代わりにデータプレーンをプロビジョニングできます。</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>ネットワーク設定</strong></p></td>
       </tr>
       <tr>
         <td><p>VPC ID</p></td>
         <td><p>コマンド出力の<code>vpc_id</code>の値を使用してください。</p><p>Zilliz Cloudは、このVPCでBYOCプロジェクトのデータプレーンとクラスタをプロビジョニングします。</p></td>
       </tr>
       <tr>
         <td><p>サブネット</p></td>
         <td><p>コマンド出力で<code>subnet_id</code>変数の値を使用します。</p><p>Zilliz Cloudは、パブリックサブネットと3つのプライベートサブネットを必要とし、パブリックサブネットにNATゲートウェイをデプロイして、各アベイラビリティゾーンのプライベートサブネットのネットワークトラフィックをルーティングします。</p><p>subnet_xxxxxxxxxxxxxxx、subnet_xxxxxxxxxxxxxxx、subnet_<code>xxxxxxxxxxxxxxx、subnet_xxxxxxxxxxxxxxxのように、3つのサブネットIDをカンマで連結する必要があります</code>。</p></td>
       </tr>
    </table>
