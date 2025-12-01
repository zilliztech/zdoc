---
title: "S3バケットとIAMロールの作成 | BYOC"
slug: /create-bucket-and-role
sidebar_label: "S3バケットとIAMロールの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および構成するための手順と適切な権限について説明します。 | BYOC"
type: origin
token: Lv1Pw8lORiaX44kjGL0cNnpPnub
sidebar_position: 1
keywords:
  - zilliz
  - byoc
  - aws
  - s3 bucket
  - IAM role
  - milvus
  - vector database
  - Unstructured Data
  - vector database
  - IVF
  - knn

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# S3バケットとIAMロールの作成

このページでは、Bring-Your-Own-Cloud (BYOC) プロジェクトのルートストレージを作成および構成するための手順と適切な権限について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## S3バケットのベストプラクティス\{#best-practices-for-the-s3-bucket}

プロジェクト展開中に指定するバケットは、プロジェクトで作成されたクラスターのルートストレージとして使用されます。S3バケットを作成する前に、以下のベストプラクティスを確認してください：

- S3バケットは、プロジェクト展開と同じAWSリージョンに存在する必要があります。

- プロジェクト内のすべてのクラスターは、プロジェクト展開中に作成されたS3バケットを共有します。Zilliz Cloud は、プロジェクト専用のS3バケットを使用し、他のサービスやリソースと共有しないことを推奨します。

## 手順\{#procedure}

AWSコンソールを使用してバケットとロールを作成できます。別の方法として、Zilliz Cloud が提供するTerraformスクリプトを使用して、AWS 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップできます。詳細については、[Terraform プロバイダー](./terraform-provider) を参照してください。

### ステップ1: S3バケットを作成\{#step-1-create-the-s3-bucket}

このステップでは、BYOCプロジェクト展開用にAWS上にS3バケットを作成します。既存のS3バケットを使用することを選択した場合は、バケットがBYOCプロジェクトと同じリージョンにあることを確認してください。作成後に、Zilliz Cloud コンソールの **ストレージ設定** にバケット名を入力します。

<Supademo id="cmb5xlhej39irppkpeihkx9eg" title=""  />

1. 管理者権限を持つユーザーとしてAWSコンソールにログインし、S3サービスに移動します。

1. **汎用バケット** タブで、**バケットを作成** をクリックします。

1. **バケット名** にバケット名を入力し、他の設定はデフォルト値を維持します。

1. **バケットを作成** をクリックします。

1. **Zilliz Cloud コンソール** に戻り、**ストレージ設定** の **バケット** にバケット名を貼り付けます。

### ステップ2: S3バケットにアクセスするためのIAMロールを作成\{#step-2-create-an-iam-role-to-access-the-s3-bucket}

このステップでは、Zilliz Cloud が先のステップで作成したS3バケットに代理でアクセスするためにAWS上にIAMロールを作成します。

<Supademo id="cmb5y39ss39r5ppkplsrz1nqd" title=""  />

1. 管理者権限を持つユーザーとして **AWSコンソール** にログインし、**IAM** ダッシュボードに移動します。

1. アカウント情報を展開し、**AWSアカウントID** の前にあるコピーボタンをクリックします。

1. 左側のサイドバーで **ロール** タブをクリックし、次に **ロールを作成** をクリックします。

1. **信頼されたエンティティの選択** で、**カスタム信頼ポリシー** タイルをクリックします。**共通信頼ポリシー** で、以下の信頼JSONを **カスタム信頼ポリシー** セクションのエディタに貼り付け、`{accountId}` を自分の **AWSアカウントID** に置き換えます。

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

1. **次へ** をクリックし、権限の追加をスキップします。

1. **名前、レビュー、作成** ステップで、ロールに名前を付け、信頼されたエンティティを確認し、**ロールを作成** をクリックします。

1. ロールが作成されたら、緑色のバーの **ロールを表示** をクリックしてロールの詳細に移動します。

1. ロールの **ARN** の前にあるコピーアイコンをクリックします。

1. Zilliz Cloud コンソールに戻り、**ストレージ設定** の **IAMロールARN** にロールARNを貼り付けます。

### ステップ3: 権限を追加\{#step-3-add-permissions}

このステップは完全にAWSコンソール上での作業です。このステップでは、[ステップ2](./create-bucket-and-role#step-2-create-an-iam-role-to-access-the-s3-bucket) で作成したロールのインラインポリシーを作成します。

<Supademo id="cmb65arpv3e11ppkpgy2d4q1v" title=""  />

1. 作成したロールの詳細ページに移動します。**権限ポリシー** セクションで、**権限を追加** をクリックし、**インラインポリシーを作成** を選択します。

1. **権限の指定** ページで、**ポリシーエディター** セクションの **JSON** をクリックしてポリシーエディターを開きます。次に、以下の権限をコピーし、ポリシーエディターに貼り付けます。

    `{bucketName}` を [ステップ1](./create-bucket-and-role#step-1-create-the-s3-bucket) で作成したバケットの名前に置き換え、変更したポリシーJSONをコピーし、AWSの **ポリシーエディター** に貼り付けます。

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

1. **レビューと作成** で、ポリシー名を入力し、権限を確認し、**ポリシーを作成** をクリックします。
