---
title: "S3 バケットと IAM ロールの作成 | BYOC"
slug: /create-bucket-and-role
sidebar_label: "S3 バケットと IAM ロールの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、適切な権限を持つ Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および設定する手順について説明します。 | BYOC"
type: origin
token: Lv1Pw8lORiaX44kjGL0cNnpPnub
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# S3 バケットと IAM ロールの作成

このページでは、適切な権限を持つ Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および設定する手順について説明します。

<Admonition type="info" icon="📘" title="注記">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud の営業担当](https://zilliz.com/contact-sales)までお問い合わせください。

</Admonition>

## S3 バケットのベストプラクティス\{#best-practices-for-the-s3-bucket}

プロジェクトのデプロイ時に指定するバケットは、そのプロジェクト内で作成されるクラスターのルートストレージとして使用されます。S3 バケットを作成する前に、以下のベストプラクティスを確認してください。

- S3 バケットは、プロジェクトのデプロイと同じ AWS リージョン内に存在する必要があります。

- プロジェクト内のすべてのクラスターは、プロジェクトのデプロイ時に作成された S3 バケットを共有します。Zilliz Cloud では、そのプロジェクト専用の S3 バケットを使用し、他のサービスやリソースと共有しないことを推奨します。

## 手順\{#procedure}

AWS コンソールを使用してバケットとロールを作成できます。代替手段として、Zilliz Cloud が提供する Terraform スクリプトを使用して、AWS 上の Zilliz Cloud プロジェクト向けインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: S3 バケットを作成する\{#step-1-create-the-s3-bucket}

このステップでは、BYOC プロジェクトのデプロイ用に AWS 上で S3 バケットを作成します。既存の S3 バケットを使用したい場合は、そのバケットが BYOC プロジェクトと同じリージョン内にあることを確認してください。作成後、Zilliz Cloud コンソールの **Storage settings** にある **Bucket** にバケット名を入力します。

<Supademo id="cmb5xlhej39irppkpeihkx9eg" title=""  />

<Procedures>

1. 管理者権限を持つユーザーとして AWS コンソールにログインし、S3 サービスに移動します。

1. **General purpose bucket** タブで、**Create bucket** をクリックします。

1. **Bucket name** にバケット名を入力し、他の設定はデフォルト値のままにします。

1. **Create bucket** をクリックします。

1. **Zilliz Cloud console** に戻り、**Storage settings** の **Bucket** にバケット名を貼り付けます。

</Procedures>

### ステップ 2: S3 バケットにアクセスするための IAM ロールを作成する\{#step-2-create-an-iam-role-to-access-the-s3-bucket}

このステップでは、前のステップで作成した S3 バケットに Zilliz Cloud がユーザーに代わってアクセスできるようにするため、AWS 上で IAM ロールを作成します。

<Supademo id="cmb5y39ss39r5ppkplsrz1nqd" title=""  />

<Procedures>

1. 管理者権限を持つユーザーとして **AWS Console** にログインし、**IAM** ダッシュボードに移動します。

1. アカウント情報を展開し、**AWS Account ID** の前にあるコピーボタンをクリックします。

1. 左側のサイドバーで **Roles** タブをクリックし、次に **Create Role** をクリックします。

1. **Select trusted entity** で、**Custom trust policy** タイルをクリックします。**Common trust policy** で、以下の trust JSON を **Custom trust policy** セクションのエディターに貼り付け、`{accountId}` を自身の **AWS Account ID** に置き換えます。

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

1. **Next** をクリックし、権限の追加はスキップします。

1. **Name, review, and create** ステップで、ロールに名前を付け、信頼されたエンティティを確認して、**Create role** をクリックします。

1. ロールが作成されたら、緑色のバーにある **View role** をクリックしてロールの詳細に移動します

1. ロールの **ARN** の前にあるコピーアイコンをクリックします。

1. Zilliz Cloud コンソールに戻り、**Storage settings** の **IAM Role ARN** にロール ARN を貼り付けます。

</Procedures>

### ステップ 3: 権限を追加する\{#step-3-add-permissions}

このステップは AWS コンソール上でのみ実施します。このステップでは、[ステップ 2](./create-bucket-and-role#step-2-create-an-iam-role-to-access-the-s3-bucket) で作成したロールに対して inline policy を作成します。

<Supademo id="cmb65arpv3e11ppkpgy2d4q1v" title=""  />

<Procedures>

1. 作成したロールの詳細ページに移動します。**Permissions policies** セクションで **Add permissions** をクリックし、**Create inline policy** を選択します。

1. **Specify permissions** ページで、**Policy editor** セクションの **JSON** をクリックしてポリシーエディターを開きます。次に、以下の権限をコピーしてポリシーエディターに貼り付けます。

    `{bucketName}` を [ステップ 1](./create-bucket-and-role#step-1-create-the-s3-bucket) で作成したバケット名に置き換え、修正した policy JSON をコピーして AWS の **Policy editor** に貼り付ける必要があります。

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

1. **Review and create** でポリシー名を入力し、権限を確認して、**Create policy** をクリックします。

</Procedures>
