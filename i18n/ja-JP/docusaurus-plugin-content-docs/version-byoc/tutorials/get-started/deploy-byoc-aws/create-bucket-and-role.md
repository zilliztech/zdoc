---
title: "S3バケットとIAMロールの作成 | BYOC"
slug: /create-bucket-and-role
sidebar_label: "S3バケットとIAMロールの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、適切なアクセス許可を持つBring-Your-Own-Cloud(BYOC)プロジェクトのルートストレージを作成および構成する方法について説明します。 | BYOC"
type: origin
token: Xt6MwVyNjihD1pkJC04cUBhonqj
sidebar_position: 1
keywords: 
  - zilliz
  - byoc
  - aws
  - s3 bucket
  - IAM role
  - milvus
  - vector database
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector

---

import Admonition from '@theme/Admonition';


# S3バケットとIAMロールの作成

このページでは、適切なアクセス許可を持つBring-Your-Own-Cloud(BYOC)プロジェクトのルートストレージを作成および構成する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>一般提供</strong>中です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## S3バケットのベストプラクティス{#best-practices-for-the-s3-bucket}

プロジェクトのデプロイ中に指定したバケットは、プロジェクトで作成されたクラスターのルートストレージとして使用されます。S3バケットを作成する前に、以下のベストプラクティスを確認してください。

- S3バケットは、プロジェクトデプロイと同じAWSリージョンにある必要があります。

- プロジェクトのデプロイ中に作成されたS3バケットは、プロジェクト内のすべてのクラスタで共有されます。Zilliz Cloudは、プロジェクト専用のS3バケットを使用し、他のサービスやリソースと共有しないことを推奨しています。

## 手続き{#procedure}

AWSコンソールを使用してバケットとロールを作成できます。代わりに、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをAWS上でブートストラップすることもできます。

### ステップ1: S3バケットを作成する{#step-1-create-the-s3-bucket}

このステップでは、BYOCプロジェクトデプロイメント用にAWS上にS3バケットを作成します。既存のS3バケットを使用する場合は、バケットがBYOCプロジェクトと同じリージョンにあることを確認してください。Zilliz Cloudコンソールの**ストレージ設定**でバケット名を入力する必要があります。

1. 管理者権限を持つユーザーとしてAWSコンソールにログインし、**S3**サービスに移動します。

1. &#91;**汎用バケット**&#93;タブで、&#91;**バケットを作成**&#93;をクリックします。

    ![EDPzbdL3qoL07Zxn20scT2shnW4](/img/EDPzbdL3qoL07Zxn20scT2shnW4.png)

1. &#91;**バケット名**&#93;にバケットの名前を入力し、他の設定ではデフォルト値を維持します。

    ![As0YbBOo5orZD0x46Y2co4VQnqc](/img/As0YbBOo5orZD0x46Y2co4VQnqc.png)

1. 「**バケットを作成**」をクリックします。

    ![M84BbzFwNomzQSxnjoPcPUgWnLh](/img/M84BbzFwNomzQSxnjoPcPUgWnLh.png)

1. Zilliz**Cloudコンソール**に戻り、**バケット**の**ストレージ設定**にバケット名を貼り付けます。

    ![NDNeb6jePo9mQhxe9vzcmhcTn1g](/img/NDNeb6jePo9mQhxe9vzcmhcTn1g.png)

### ステップ2: S3バケットにアクセスするためのIAMロールを作成する{#step-2-create-an-iam-role-to-access-the-s3-bucket}

このステップでは、前のステップで作成したS3バケットにアクセスするために、Zilliz CloudのAWS上にIAMロールを作成します。

1. 管理者権限を持つユーザーとして**AWSコンソール**にログインし、**IAM**ダッシュボードに移動します。

1. アカウント情報を展開し、**AWSアカウントID**の前にあるコピーボタンをクリックしてください。

    ![A7vYbCzp1osavYxEx0wcPaZan1d](/img/A7vYbCzp1osavYxEx0wcPaZan1d.png)

1. 左サイドバーの&#91;**役割**&#93;タブをクリックし、&#91;**役割を作成**&#93;をクリックします。

    ![C5bbbRXxioqdrXxYhWiczehwndh](/img/C5bbbRXxioqdrXxYhWiczehwndh.png)

1. &#91;**信頼できるエンティティ**の選択&#93;で、&#91;**カスタム信頼ポリシー**&#93;タイルをクリックします。&#91;**共通信頼ポリシー**&#93;で、下の信頼JSONを&#91;**カスタム信頼ポリシー**&#93;セクションのエディタに貼り付け、`{account tId}`を**AWSアカウントID**に置き換えます。

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

    ![GYHgb2VNIocfN2xWCkXcuRhanCd](/img/GYHgb2VNIocfN2xWCkXcuRhanCd.png)

1. 「**次**へ」をクリックして、アクセス権の追加をスキップします。

1. 「**名前、レビュー、および作成**」ステップで、役割に名前を付け、信頼されたエンティティを確認し、「**役割を作成**」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>ロールに名前を付けるときは、プレフィックス<code>zilliz-byoc</code>を使用します。</p>

    </Admonition>

1. ロールが作成されたら、緑色のバーにある**View role**をクリックしてロールの詳細に移動します。

    ![XPKub0oMNoyGPgxntQpcLXJznRE](/img/XPKub0oMNoyGPgxntQpcLXJznRE.png)

1. ロールの**ARN**の前にあるコピーアイコンをクリックします。

    ![DgzNbw3WIoIbg9xGAJ5cVPFhngc](/img/DgzNbw3WIoIbg9xGAJ5cVPFhngc.png)

1. Zilliz Cloudコンソールに戻り、&#91;**IAM Role ARN**&#93;の&#91;**ストレージ設定**&#93;にARNロールを貼り付けます。

    ![FIVObWf57onQEpxJHbxczL8CnNg](/img/FIVObWf57onQEpxJHbxczL8CnNg.png)

### ステップ3:権限を追加する{#step-3-add-permissions}

このステップはAWSコンソール上でのみ行われます。このステップでは、[ステップ2](./create-bucket-and-role#step-2-create-an-iam-role-to-access-the-s3-bucket)で作成したロールのインラインポリシーを作成します。

1. 作成したロールの詳細ページに移動します。&#91;**権限ポリシー**&#93;セクションで、&#91;**権限を追加**&#93;をクリックし、&#91;**インラインポリシーを作成**&#93;を選択します。

    ![Iwf4b7aL0oPRHmxFf4ocpud6n9g](/img/Iwf4b7aL0oPRHmxFf4ocpud6n9g.png)

1. &#91;**権限の指定**&#93;ページで、&#91;ポリシーエディター&#93;セクションの&#91;**JSON**&#93;をクリックして**ポリシーエディター**を開きます。次に、下の権限をコピーしてポリシーエディターに貼り付けます。

    `{bucketName}`を[ステップ1](./create-bucket-and-role#step-1-create-the-s3-bucket)で作成したバケットに置き換え、変更したポリシーのJSONをコピーして、AWSの**ポリシーエディタ**に貼り付ける必要があります。

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

    ![TaqNb47MzonywUxQqBucQWcfn0D](/img/TaqNb47MzonywUxQqBucQWcfn0D.png)

1. &#91;**レビューと作成**&#93;で、ポリシー名を入力し、権限を確認して、&#91;**ポリシーを作成**&#93;をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>ポリシーに名前を付けるときは、プレフィックス<code>zilliz-byoc</code>を使用します。</p>

    </Admonition>

    ![HnCtbqVUrotnStxlp4nc2LqznNf](/img/HnCtbqVUrotnStxlp4nc2LqznNf.png)

    