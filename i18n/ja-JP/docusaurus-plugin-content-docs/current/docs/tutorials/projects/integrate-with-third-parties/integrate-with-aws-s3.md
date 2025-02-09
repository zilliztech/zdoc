---
title: "AWS S 3との統合 | Cloud"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S 3との統合"
beta: PRIVATE
notebook: FALSE
description: "Zilliz Cloudを使用すると、Amazon Simple Storage Service（Amazon S 3）と統合して、バックアップファイルを指定されたS 3バケットにエクスポートできます。 | Cloud"
type: origin
token: Ghq7wxbUVic7eekUrfzcthLOnfc
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - export
  - integrate
  - object
  - storage
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation

---

import Admonition from '@theme/Admonition';


# AWS S 3との統合

Zilliz Cloudを使用すると、Amazon Simple Storage Service（Amazon S 3）と統合して、バックアップファイルを指定されたS 3バケットにエクスポートできます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>プライベートプレビュー</strong>として<strong>Dedicated-Enterprise</strong>プランのクラスターで提供されています。この機能を有効にするか、関連するコストについては、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

![F4ERwUKVnh49aSbl4VGcLLJGnyh](/img/ja-JP/F4ERwUKVnh49aSbl4VGcLLJGnyh.png)

## 始める前に{#before-you-start}{#before-you-start}

- Zilliz CloudをAWS S 3に統合するには、**組織オーナー**また**はプロジェクト管理者**がプロジェクトにアクセスできる必要があります。必要な権限がない場合は、Zilliz Cloudの管理者にお問い合わせください。

- AWSマネジメントコンソールへの管理アクセスがあります。

## ステップ1: Zilliz Cloudでの統合を開始する{#step-1-start-integration-on-zilliz-cloud}{#1-zilliz-cloudstep-1-start-integration-on-zilliz-cloud}

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. 左側のナビゲーションペインから[**統合**]に移動します。

1. [**Amazon S 3**]セクションで、[**+Configuration**]をクリックします。

1. 表示されるダイアログボックスで、**基本設定**を完了します。

    - **構成名**:この統合の一意の名前(例:`bucket_for_backup`)。

    - **Configuration Description** *(オプション)*:この統合の説明(例:`バックアップファイルのエクスポート`)。

1. 次の[ステップ2](./integrate-with-aws-s3#2-s-3step-2-create-s3-bucket)に進みます。

![integrate-with-aws-1](/img/ja-JP/integrate-with-aws-1.png)

## ステップ2: S 3バケットを作成する{#step-2-create-s3-bucket}{#2-s-3step-2-create-s3-bucket}

1. まず、**AWSマネジメントコンソール**にログインし、[Amazon S 3コンソール](https://console.aws.amazon.com/s3/)を開きます。

1. ページの上部で、Zilliz Cloudクラスターのリージョンに一致するAWSリージョンを選択してください。

    <Admonition type="info" icon="📘" title="ノート">

    <ul>
    <li><p>バケットを作成するAWSリージョンは、Zilliz Cloudクラスターが存在するリージョンと一致する必要があります。Zilliz Cloudがサポートするリージョンについては、「<a href="./cloud-providers-and-regions">クラウドプロバイダー&地域</a>」を参照してください。</p></li>
    <li><p>異なるリージョンで実行されているクラスターの場合、バックアップファイルを適切にエクスポートできるように、リージョンごとに個別の統合を作成します。</p></li>
    </ul>

    </Admonition>

1. 左側のナビゲーションウィンドウで、[**汎用バケット]**を選択し、[**バケットを作成**]をクリックします。

1. バケットの設定を行う:

    1. [**バケットタイプ**]で[**汎用]**を選択します。

    1. [**バケット名**]には、バケットの名前を入力します（例:`bucket-for-backup`）。このバケット名は、今後の手順で必要になるため、必ず覚えておいてください。

    1. 他の設定はデフォルトのままにして、**バケットを作成**をクリックしてください。

    詳細については、[バケットを作成するを](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)参照してください。

1. [[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)]に戻ります。[**バケット名**]と[**バケット地域**]を[**Amazon S 3バケット作成**]のステップで入力します。完了したら、[ステップ3](./integrate-with-aws-s3#3-iamstep-3-create-iam-policy)に進みます。

![integrate-with-aws-2](/img/ja-JP/integrate-with-aws-2.png)

## ステップ3: IAMポリシーを作成する{#step-3-create-iam-policy}{#3-iamstep-3-create-iam-policy}

Zilliz CloudにAWS S 3へのアクセスを許可するには、IAMポリシーを作成してください。このポリシーには、Zilliz CloudとS 3バケット間でバックアップファイルを転送するための具体的なアクションとリソースが含まれている必要があります。

シンプルにするために、JSONエディタを使用してポリシーを作成してください。

1. まず、**AWSマネジメントコンソール**にログインし、[IAMコンソール](https://console.aws.amazon.com/iam/)を開きます。

1. コンソールで、[**ポリシー**]>[**ポリシーを作成**]を選択します。

1. [**ポリシーエディター**]セクションで、[**JSON**]オプションを選択します。

1. Zilliz Cloudが提供するJSONポリシードキュメントをポリシーエディターにコピー&ペーストして、**次**へをクリックしてください。

    以下はサンプルのJSONポリシードキュメントです。統合に合わせた正確なポリシーについては、Zilliz Cloudコンソールの**Create IAM Policy**ステップを参照してください。

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "Statement1",
          "Effect": "Allow",
          "Action": [
            "s3:GetObject",
            "s3:PutObject",
            "s3:ListBucket",
            "s3:GetBucketLocation"
          ],
          "Resource": [
            "arn:aws:s3:::$bucket",
            "arn:aws:s3:::$bucket/*"
          ]
        }
      ]
    }
    ```

    <Admonition type="info" icon="📘" title="ノート">

    <p><code>$bucket</code>は、S 3バケットの実際の名前に置き換えてください。</p>

    </Admonition>

1. [**レビューと作成**]ページで、作成するポリシーの**ポリシー名**(例:`policy-for-backup`)と**説明**(オプション)を入力し、**このポリシーで定義された権限**を確認します。今後の手順で必要になるため、ポリシー名を覚えておいてください。

1. [**ポリシーを作成**]を選択して、新しいポリシーを保存します。完了したら、[ステップ4](./integrate-with-aws-s3#4-iamstep-4-create-iam-role)に進みます。

![integrate-with-aws-3](/img/ja-JP/integrate-with-aws-3.png)

## ステップ4: IAMロールを作成する{#step-4-create-iam-role}{#4-iamstep-4-create-iam-role}

1. IAMコンソールで、[**ロール**]>[**ロールを作成**]を選択します。

1. [**カスタム信頼ポリシー**]役割タイプを選択します。

1. [**カスタム信頼ポリシー**]セクションで、ロールのカスタム信頼ポリシーをコピーして貼り付けます。次に、[**次**へ]をクリックします。

    以下はJSONの信頼ポリシーのサンプルです。統合に合わせた正確な信頼ポリシーについては、Zilliz Cloudコンソールの「**Create IAM Role**」ステップを参照してください。

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Principal": {
                    "AWS": "965570967084"
                },
                "Condition": {
                    "StringEquals": {
                        "sts:ExternalId": "my-external-id"
                    }
                }
            }
        ]
    }
    ```

    <Admonition type="info" icon="📘" title="ノート">

    <p><code>9655 7 0 9670 8 4</code>と<code>my-outside-id</code>は、Zilliz Cloudコンソールの<strong>Create IAM Role</strong>ステップで表示される実際のAWSアカウントIDと外部IDに置き換えてください。</p>

    </Admonition>

1. 「**アクセス許可ポリシー**」の「**アクセス許可を追加**」ステップで、[ステップ3](./integrate-with-aws-s3#3-iamstep-3-create-iam-policy)で作成したポリシーを検索して選択し、「**次**へ」をクリックします。

1. [**名前、レビュー、および作成**]ステップで、役割名を入力して設定を確認します。次に、[**役割を作成**]をクリックします。

    ![integrate-with-aws-4](/img/ja-JP/integrate-with-aws-4.png)

1. 作成したロールの詳細ページに移動し、ロールに対応する**ARN**をコピーします。これはZilliz Cloudで必要となります。

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)に戻ります。**Role ARN**を**Create IAM Role**のステップで入力します。その後、設定を完了します。

    ![integrate-with-aws-5](/img/ja-JP/integrate-with-aws-5.png)

## ステップ5:検証して統合を作成する{#step-5-validate-and-create-integration}{#5step-5-validate-and-create-integration}

1. Zilliz[Cloudコンソール](https://cloud.zilliz.com/login)で、[**連携の検証**]をクリックして、S 3バケットとIAMロールの設定を確認します。

1. 検証が成功したら、**統合を作成**をクリックします。

この統合を使用して、バックアップファイルをAmazon S 3バケットにエクスポートできるようになりました。詳細については、「[バックアップファイルのエクスポート](./export-backup-files)のエクスポート」を参照してください。

## インテグレーションの管理{#manage-integrations}{#manage-integrations}

統合が追加されると、その詳細を閲覧可能になり、必要に応じて統合を削除できます。

![integrate-with-aws-6](/img/ja-JP/integrate-with-aws-6.png)

## トラブルシューティング{#troubleshooting}{#troubleshooting}

統合の過程で問題が発生した場合は、一般的なエラーメッセージとその解決策を以下に示します。

### バケット領域の不一致{#bucket-region-mismatch}{#bucket-region-mismatch}

**説明**:次の例のエラーは、S 3バケットのリージョンがZilliz Cloudクラスタのリージョンと一致しない場合に発生します。

```plaintext
"bucket region not match, want[us-west-1] got[us-west-2]"
```

**ソリューション**:

- S 3バケットが配置されているAWSリージョンが、Zilliz Cloudクラスターのリージョンと一致していることを確認してください。

- 必要に応じて、適切なリージョンに新しいバケットを作成するか、バケットのリージョンに合わせてクラスターのリージョンを調整します。

### バケットが見つかりません{#bucket-not-found}{#bucket-not-found}

**説明**:このエラーは、指定されたS 3バケットが存在しないか、バケット名が正しくない場合に発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 404, RequestID: ..., HostID: ..., api error NoSuchBucket: The specified bucket does not exis
```

**ソリューション**:

- Zilliz CloudコンソールとAWS S 3コンソールの両方でバケット名を再確認してください。

- バケットが存在し、Zilliz Cloudの設定に名前が正しく入力されていることを確認してください。

### バケットの場所へのアクセスが拒否されました{#access-denied-for-bucket-location}{#access-denied-for-bucket-location}

**説明**:このエラーは、IAMロールにS 3バケットの場所にアクセスするために必要な権限がない場合に発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 403 ...
```

**ソリューション**:

- Zilliz Cloudで使用されているロールに添付されているIAMポリシーを確認してください。

- ポリシーに`s 3: GetBucketLocation`権限と、s 3:GetObject、`s 3:GetObject`、`s 3:PutObject`、`s 3:ListBucket`などの必要な権限が含まれていることを確認します。

### ロール仮定の失敗{#role-assumption-failure}{#role-assumption-failure}

**説明**:このエラーは、誤ったロールARN、外部ID、または信頼ポリシーによりIAMロールの想定に問題がある場合に発生します。

```sql
try assume role from[zilliz-role] to [arn:aws:iam::041623484421:role/testoss121703] with externalId[zilliz-external-1umVCIK7q96kzDE] failed
```

**ソリューション**:

- Zilliz Cloudコンソール上のロールARNと外部IDが、IAM信頼ポリシーの対応する値と一致していることを確認します。

- IAMロールの信頼ポリシーにより、Zilliz Cloudがロールを引き継ぐことができるようにしてください。

