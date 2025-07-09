---
title: "S 3バケットとIAMロールの作成 | BYOC"
slug: /create-bucket-and-role
sidebar_label: "S 3バケットとIAMロールの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、適切なアクセス許可を持つBring-Your-Own-Cloud(BYOC)プロジェクトのルートストレージを作成および構成する手順について説明します。 | BYOC"
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
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# S 3バケットとIAMロールの作成

このページでは、適切なアクセス許可を持つBring-Your-Own-Cloud(BYOC)プロジェクトのルートストレージを作成および構成する手順について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## S 3バケットのベストプラクティス{#best-practices-for-the-s3-bucket}

プロジェクトのデプロイ中に指定したバケットは、プロジェクトで作成されたクラスターのルートストレージとして使用されます。S 3バケットを作成する前に、以下のベストプラクティスを確認してください。

- S 3バケットは、プロジェクトデプロイと同じAWSリージョンにある必要があります。

- プロジェクトのデプロイ中に作成されたS 3バケットは、プロジェクト内のすべてのクラスタで共有されます。Zilliz Cloudは、プロジェクト専用のS 3バケットを使用し、他のサービスやリソースと共有しないことを推奨しています。

## 手続き{#procedure}

AWSコンソールを使用してバケットとロールを作成できます。代わりに、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをAWS上でブートストラップすることもできます。詳細については、[テラフォームプロバイダName](./terraform-provider)を参照してください。

### ステップ1: S 3バケットを作成する{#step-1-create-the-s3-bucket}

このステップでは、BYOCプロジェクトの展開のためにAWS上にS 3バケットを作成します。既存のS 3バケットを使用する場合は、バケットがBYOCプロジェクトと同じリージョンにあることを確認してください。作成されたら、Zilliz Cloudコンソールの**ストレージ設定**にバケット名を入力してください。

<Supademo id="cmb5xlhej39irppkpeihkx9eg" title=""  />

1. 管理者権限を持つユーザーとしてAWSコンソールにログインし、S 3サービスに移動してください。

1. 「汎用バケット」タブで、「バケットの作成」をクリックしてください。

1. **バケット名**にバケットの名前を入力し、他の設定ではデフォルト値を維持してください。

1. 「バケットを作成」をクリックしてください。

1. **Zilliz Cloudコンソール**に戻り、**ストレージ設定**の**バケット**にバケット名を貼り付けてください。

### ステップ2: S 3バケットにアクセスするためのIAMロールを作成する{#step-2-create-an-iam-role-to-access-the-s3-bucket}

このステップでは、前のステップで作成したS 3バケットにアクセスするために、Zilliz CloudのAWS上にIAMロールを作成します。

<Supademo id="cmb5y39ss39r5ppkplsrz1nqd" title=""  />

1. 管理者権限を持つユーザーとしてAWSコンソールにログインし、IAMダッシュボードに移動してください。

1. アカウント情報を展開し、**AWSアカウントID**の前にあるコピーボタンをクリックしてください。

1. 左サイドバーの「ロール」タブをクリックし、「ロールの作成」をクリックしてください。

1. 「信頼できるエンティティを選択」で、「カスタム信頼ポリシー」タイルをクリックしてください。「共通信頼ポリシー」で、以下の信頼JSONを「カスタム信頼ポリシー」セクションのエディタに貼り付け、`{accountId}`を「AWSアカウントID」に置き換えてください。

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

1. 「次へ」をクリックして、権限の追加をスキップしてください。

1. 「名前を付け、確認し、作成する」ステップで、役割に名前を付け、信頼できるエンティティを確認し、「役割を作成する」をクリックしてください。

1. 役割が作成されたら、緑色のバーにある**役割を表示**をクリックして、役割の詳細に移動してください

1. 役割の**ARN**の前にあるコピーアイコンをクリックしてください。

1. Zilliz Cloudコンソールに戻り、**ストレージ設定**の**IAMロールARN**に役割ARNを貼り付けてください。

### ステップ3:権限を追加する{#step-3-add-permissions}

このステップはAWSコンソール上でのみ行われます。このステップでは、[ステップ2](./create-bucket-and-role#step-2-create-an-iam-role-to-access-the-s3-bucket)で作成されたロールのインラインポリシーを作成します。

<Supademo id="cmb65arpv3e11ppkpgy2d4q1v" title=""  />

1. 作成したロールの詳細ページに移動します。**権限ポリシー**セクションで、**権限の追加**をクリックし、**インラインポリシーの作成**を選択します。

1. 「権限の指定」ページで、「ポリシーエディター」セクションの「JSON」をクリックしてポリシーエディターを開きます。その後、以下の権限をコピーしてポリシーエディターに貼り付けます。

    `{bucketName}`を[ステップ1](./create-bucket-and-role#step-1-create-the-s3-bucket)で作成したバケットのものに置き換え、変更したポリシーJSONをコピーして、AWSの**ポリシーエディタ**に貼り付ける必要があります。

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

1. 「レビューと作成」で、ポリシー名を入力し、権限を確認して、「ポリシーの作成」をクリックしてください。

    