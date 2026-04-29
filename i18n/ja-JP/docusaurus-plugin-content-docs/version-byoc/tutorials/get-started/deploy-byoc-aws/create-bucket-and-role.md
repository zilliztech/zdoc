---
title: "S3 バケットと IAM ロールの作成 | BYOC"
slug: /create-bucket-and-role
sidebar_key: create-bucket-and-role
sidebar_label: "S3 バケットと IAM ロールの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、適切な権限を持つ Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および設定する手順について説明します。| BYOC"
type: origin
token: Lv1Pw8lORiaX44kjGL0cNnpPnub
sidebar_position: 1
keywords: 
  - zilliz
  - byoc
  - aws
  - s3 バケット
  - IAM ロール
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# S3 バケットと IAM ロールの作成

このページでは、適切な権限を持つ Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および設定する手順について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当者</a>までお問い合わせください。</p>

</Admonition>

## S3 バケットのベストプラクティス\{#best-practices-for-the-s3-bucket}

プロジェクトデプロイメント中に指定するバケットは、そのプロジェクトで作成されるクラスターのルートストレージとして使用されます。S3 バケットを作成する前に、以下のベストプラクティスを確認してください。

- S3 バケットは、プロジェクトデプロイメントと同じ AWS リージョンにある必要があります。

- プロジェクト内のすべてのクラスターは、プロジェクトデプロイメント中に作成された S3 バケットを共有します。Zilliz Cloud では、プロジェクト専用の S3 バケットを使用し、他のサービスやリソースと共有しないことを推奨します。

## 手順\{#procedure}

AWS コンソールを使用してバケットとロールを作成できます。代替方法として、Zilliz Cloud が提供する Terraform スクリプトを使用して、AWS 上の Zilliz Cloud プロジェクトのインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: S3 バケットの作成\{#step-1-create-the-s3-bucket}

このステップでは、BYOC プロジェクトデプロイメント用に AWS で S3 バケットを作成します。既存の S3 バケットを使用する場合は、そのバケットが BYOC プロジェクトと同じリージョンにあることを確認してください。作成したら、Zilliz Cloud コンソールの**ストレージ設定**でバケット名を入力します。

<Supademo id="cmb5xlhej39irppkpeihkx9eg" title=""  />

<Procedures>

1. 管理者権限を持つユーザーとして AWS コンソールにログインし、S3 サービスに移動します。

1. **汎用バケット**タブで、**バケットの作成**をクリックします。

1. **バケット名**にバケットの名前を入力し、他の設定はデフォルト値のままにします。

1. **バケットの作成**をクリックします。

1. **Zilliz Cloud コンソール**に戻り、**ストレージ設定**の下の**バケット**にバケット名を貼り付けます。

</Procedures>

### ステップ 2: S3 バケットにアクセスするための IAM ロールの作成\{#step-2-create-an-iam-role-to-access-the-s3-bucket}

このステップでは、Zilliz Cloud が前のステップで作成した S3 バケットに代わってアクセスできるように、AWS で IAM ロールを作成します。

<Supademo id="cmb5y39ss39r5ppkplsrz1nqd" title=""  />

<Procedures>

1. 管理者権限を持つユーザーとして**AWS コンソール**にログインし、**IAM**ダッシュボードに移動します。

1. アカウント情報を展開し、**AWS アカウント ID** の前のコピーボタンをクリックします。

1. 左側のサイドバーで**ロール**タブをクリックし、次に**ロールの作成**をクリックします。

1. **信頼できるエンティティの選択**で、**カスタム信頼ポリシー**タイルをクリックします。**共通信頼ポリシー**で、以下の信頼 JSON を**カスタム信頼ポリシー**セクションのエディターに貼り付け、`{accountId}` をお使いの**AWS アカウント ID**に置き換えます。

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Federated": "arn:aws:iam::{accountId}:oidc-provider/eks_oidc_url"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                    "StringLike": {
                        "eks_oidc_url:sub": [
                            "system:serviceaccount:milvus-*:milvus*",
                            "system:serviceaccount:loki:loki*",
                            "system:serviceaccount:index-pool:milvus*"
                        ],
                        "eks_oidc_url:aud": "sts.amazonaws.com"
                    }
                }
            }
        ]
    }
    ```

1. **次へ**をクリックし、権限の追加をスキップします。

1. **名前を付けて確認し、作成**ステップで、ロールに名前を付け、信頼されたエンティティを確認して、**ロールの作成**をクリックします。

1. ロールが作成されたら、緑色のバーにある**ロールの表示**をクリックしてロールの詳細ページへ移動します。

1. ロールの**ARN**の横にあるコピーアイコンをクリックします。

1. Zilliz Cloud コンソールに戻り、**ストレージ設定**の**IAM ロール ARN**にロールの ARN を貼り付けます。

</Procedures>

### Step 3: Add permissions\{#step-3-add-permissions}

このステップは AWS コンソールでのみ実行します。このステップでは、[ステップ 2](./create-bucket-and-role#step-2-create-an-iam-role-to-access-the-s3-bucket) で作成したロールに対してインラインポリシーを作成します。

<Supademo id="cmb65arpv3e11ppkpgy2d4q1v" title=""  />

<Procedures>

1. 作成したロールの詳細ページへ移動します。**権限ポリシー**セクションで**権限の追加**をクリックし、**インラインポリシーの作成**を選択します。

1. **権限の指定**ページで、**ポリシーエディター**セクションの**JSON**をクリックしてポリシーエディターを開きます。その後、以下の権限をコピーしてポリシーエディターに貼り付けます。

    `{bucketName}` を [ステップ 1](./create-bucket-and-role#step-1-create-the-s3-bucket) で作成したバケットの名前に置き換え、変更後のポリシー JSON をコピーして、AWS の**ポリシーエディター**に貼り付ける必要があります。

    ```json
    {
        "Version": "2012-10-17",
         "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "s3:ListBucket"
              ],
              "Resource": "arn:aws:s3:::{bucketName}"
            },
            {
                "Sid": "AllowS3ReadWrite",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject"
                ],
                "Resource": [
                    "arn:aws:s3:::{bucketName}/*"
                ]
            }
        ]
    }
    ```

1. **Review and create** で、ポリシー名を入力し、権限を確認して、**Create policy** をクリックします。

</Procedures>