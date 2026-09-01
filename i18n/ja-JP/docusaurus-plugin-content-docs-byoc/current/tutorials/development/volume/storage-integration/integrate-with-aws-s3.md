---
title: "AWS S3 との連携 | BYOC"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud を Amazon Simple Storage Service (Amazon S3) と連携させ、監査ログを指定した S3 バケットにエクスポートできます。 | BYOC"
type: origin
token: PAViwMSb3iVMzuk56z3c1zfRnwh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS S3 との連携

Zilliz Cloud を Amazon Simple Storage Service (Amazon S3) と連携させ、監査ログを指定した S3 バケットにエクスポートできます。

![BUEcwkZiChJrTlbziBMc3V49nFe](https://zdoc-images.s3.us-west-2.amazonaws.com/BUEcwkZiChJrTlbziBMc3V49nFe.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud と AWS S3 を連携させるには、プロジェクトに対する **Organization Owner** または **Project Admin** の権限が必要です。必要な権限がない場合は、Zilliz Cloud の Organization Owner にお問い合わせください。

- AWS Management Console への管理者アクセス権を持っていること。

## ステップ 1: Zilliz Cloud コンソールで連携を開始する\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmeibltu49co2h3pytvtdthb2" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. プロジェクト ページの左側ナビゲーション パネルから **Integrations** を選択します。

1. **Amazon S3** セクションで **+ Integration** をクリックします。

1. 表示されるダイアログ ボックスで **Basic Settings** を設定します。

    - **Integration Name**: この連携の一意な名前（例: `integration_0819`）。

    - **Integration Description** *(任意)*: この連携の説明（例: `for export backupfile`）。

    - **Bucket Permission**: Zilliz Cloud が S3 バケットに対して持つアクセス レベルを選択します。各オプションの詳細は以下の表を参照してください。

        | **Permission** | **Description** |
        | --- | --- |
        | Read only | Zilliz Cloud はバケットからのファイル読み取りのみ可能です。外部コレクションの基盤となる [external volumes](./external-volume) に使用します。 |
        | Read write | Zilliz Cloud はバケットの読み取りと書き込みの両方が可能です。[audit log forwarding](./audit-logs) や [access log forwarding](./configure-access-logs) に使用します。 |

1. **Next** をクリックすると、**Create Amazon S3 Bucket** ステップに移動します。

    1. **Zilliz Cloud クラスター** の **Region** フィールドで、Zilliz Cloud クラスターまたは外部ボリュームが存在するクラウド リージョンを選択します。後で作成するバケットは、Zilliz Cloud クラスターまたはボリュームと同じリージョンである必要があります。

    1. [S3 console](https://us-west-2.console.aws.amazon.com/s3/buckets) を開き、[step 2](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 2: AWS コンソールで S3 バケットを作成する\{#step-2-create-s3-bucket-in-aws-console}

<Supademo id="cmeibt2wt9cx1h3pyrojdocrn" title="Step 2: Create S3 bucket (1)" />

<Procedures>

1. [Amazon S3 console](https://console.aws.amazon.com/s3/) の右上隅で、Zilliz Cloud クラスターまたは外部ボリュームと同じ AWS リージョンを選択します。

    <Admonition type="info" icon="📘" title="Notes">

    - バケットを作成する AWS リージョンは、Zilliz Cloud クラスターまたは外部ボリュームが存在するリージョンと一致している必要があります。Zilliz Cloud でサポートされているリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

    - 異なるリージョンで稼働するクラスターがある場合は、監査ログが正しくエクスポートされるよう、リージョンごとに個別の連携設定を作成してください。

    </Admonition>

1. 左側のナビゲーション パネルで **General purpose buckets** を選択し、**Create bucket** をクリックします。

1. バケットの設定を行います。

    1. **Bucket type** で **General purpose** を選択します。

    1. **Bucket name** にバケット名を入力します（例: `zilliz-bucket-for-integration-0819`）。このバケット名は後の手順で必要になりますので、控えておいてください。

    1. その他の設定はデフォルトのままにし、**Create bucket** をクリックします。

    詳細については、[Creating a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html) を参照してください。

</Procedures>

バケットの作成後、[Zilliz Cloud console](https://cloud.zilliz.com/login) に戻り、以下の操作を行います。

<Supademo id="cmeibwrd19d3xh3pyx4h7r3d4" title="Step 2: Create S3 bucket (2)" />

<Procedures>

1. **Bucket Name** フィールドに、先ほど作成したバケットの名前を入力します（この例では `zilliz-bucket-for-integration-0819`）。その後、**Next** をクリックします。

1. **Create IAM Policy** ステップで JSON ポリシーをコピーします。これは [step 3](./integrate-with-aws-s3) で必要になります。

1. 完了したら、[IAM console](https://console.aws.amazon.com/iam/) を開き、[step 3](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 3: AWS コンソールで IAM ポリシーを作成する\{#step-3-create-iam-policy-in-aws-console}

Zilliz Cloud に AWS S3 へのアクセスを許可するには、IAM ポリシーを作成します。このポリシーには、Zilliz Cloud と S3 バケット間のデータ転送を可能にするための特定のアクションとリソースを含める必要があります。

<Supademo id="cmeibzhk09d4rh3pyaipwhqi7" title="Step 3: Create IAM policy (1)" />

ここでは簡便のため、JSON エディターを使用してポリシーを作成します。

<Procedures>

1. [IAM コンソール](https://console.aws.amazon.com/iam/) で、**Policies** > **Create policy** の順に選択します。

1. **Policy editor** セクションで、**JSON** オプションを選択します。

1. Zilliz Cloud から提供された JSON ポリシードキュメントをコピーし、ポリシーエディターに貼り付けます。その後、**Next** をクリックします。

    以下は JSON ポリシードキュメントのサンプルです。連携内容に合わせた正確なポリシーについては、Zilliz Cloud コンソールの **Create IAM Policy** ステップを参照してください。

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
                    "arn:aws:s3:::<bucket>",
                    "arn:aws:s3:::<bucket>/*"
                ]
            }
        ]
    }
    ```

    ただし、AWS KMS を使用してバケットのサーバー側暗号化を有効にしている場合は、`kms:GenerateDataKey` アクションを許可する追加の IAM ポリシーが必要です。この場合、以下の JSON ポリシーを使用してください。

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
                    "arn:aws:s3:::<bucket>",
                    "arn:aws:s3:::<bucket>/*"
                ]
            },
            {
                "Sid": "AllowKMSGenerateDataKey",
                "Effect": "Allow",
                "Action": [
                    "kms:GenerateDataKey"
                ],
                "Resource": "arn:aws:kms:<region>:<account_id>:key/<key_id>"
            }
        ]
    }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    - `<bucket>` は、実際の S3 バケット名に置き換えてください。

    - `<region>`、`<account_id>`、および `<key_id>` は、それぞれの実際の値に置き換えてください。詳細については、AWS ドキュメントの [Key identifiers](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-id) を参照してください。

    </Admonition>

1. **Review and create** ページで、作成するポリシーの **Policy Name**（例: `zilliz-policy-for-integration-0819`）と **Description**（任意）を入力し、**Permissions defined in this policy** を確認します。ポリシー名は後のステップで必要になるため、控えておいてください。

1. **Create policy** を選択して新しいポリシーを保存します。完了したら、[ステップ 4](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 4: IAM ロールを作成する\{#step-4-create-iam-role}

AWS コンソールで IAM ロールを作成する前に、Zilliz Cloud コンソールで以下の操作を行ってください。

<Supademo id="cmeic3fab9dajh3pyzp50jnck" title="Step 4: Create IAM role (1)" />

<Procedures>

1. Zilliz Cloud コンソールで **Next** をクリックし、**Create IAM Role** ステップに進みます。

1. **Select trusted entity** で JSON コンテンツをコピーし、[IAM コンソール](https://console.aws.amazon.com/iam/) に移動します。

</Procedures>

上記の準備ができたら、以下の手順で IAM ロールを作成します。

<Supademo id="cmeic6bis9dgth3pybfmk8143" title="Step 4: Create IAM role (2)" />

<Procedures>

1. [IAM コンソール](https://console.aws.amazon.com/iam/) で、**Roles** > **Create role** の順に選択します。

1. ロールタイプとして **Custom trust policy** を選択します。

1. **Custom trust policy** セクションに、ロール用のカスタム信頼ポリシーをコピーして貼り付けます。その後、**Next** をクリックします。

    以下は JSON 信頼ポリシーのサンプルです。連携内容に合わせた正確な信頼ポリシーについては、Zilliz Cloud コンソールの **Create IAM Role** ステップを参照してください。

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

    <Admonition type="info" icon="📘" title="Notes">

    `965570967084` および `my-external-id` は、Zilliz Cloud コンソールの **Create IAM Role** ステップに表示される実際の AWS アカウント ID および外部 ID に置き換えてください。

    </Admonition>

1. **Add permissions** ステップの **Permissions policies** で、[ステップ 3](./integrate-with-aws-s3) で作成したポリシーを検索して選択し、権限を追加します。その後、**Next** をクリックします。

1. **Name, review, and create** ステップで、ロール名（例: `zilliz-integration-role-0819`）を入力し、設定を確認してから **Create role** をクリックします。

1. 作成したロールの詳細ページに移動し、そのロールに対応する **ARN** をコピーします。この ARN は、[ステップ 5](./integrate-with-aws-s3#step-5-validate-and-add-integration) で Zilliz Cloud コンソールに入力する必要があります。

</Procedures>

## ステップ 5: 統合の検証と追加\{#step-5-validate-and-add-integration}

<Supademo id="cmeicbdyz9dprh3py2wwbguvn" title="Step 5: Validate and add integration" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) の **Create IAM Role** ステップで、前のステップで IAM コンソールからコピーした **ARN** を貼り付けます。

1. 次に、**Validate Integration** をクリックして、S3 バケットと IAM ロールの設定を検証します。

1. ステータスが **Successful** に変われば、統合は正常に機能しています。**Add** をクリックしてください。

    <Admonition type="info" icon="📘" title="Notes">

    IAM の変更が反映されるまでには時間がかかる場合があります。設定直後に検証が失敗した場合は、しばらく待ってから再試行してください。

    </Admonition>

</Procedures>

これで、この統合を使用して監査ログを Amazon S3 バケットに転送できるようになりました。詳細については、[Audit Logging](./audit-logs) を参照してください。

## トラブルシューティング\{#troubleshooting}

統合作業中に問題が発生した場合は、以下の一般的なエラーメッセージと解決策を参照してください。

### バケットリージョンの不一致\{#bucket-region-mismatch}

**説明**: S3 バケットのリージョンが Zilliz Cloud クラスターのリージョンと一致しない場合に、以下の例のようなエラーが発生します。

```plaintext
"bucket region not match, want[us-west-1] got[us-west-2]"
```

**解決策**:

- S3 バケットが存在する AWS リージョンが、Zilliz Cloud クラスターのリージョンと一致していることを確認してください。

- 必要に応じて、正しいリージョンに新しいバケットを作成するか、クラスターのリージョンをバケットのリージョンに合わせて変更してください。

### バケットが見つからない\{#bucket-not-found}

**説明**: 指定された S3 バケットが存在しないか、バケット名が誤っている場合にこのエラーが発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 404, RequestID: ..., HostID: ..., api error NoSuchBucket: The specified bucket does not exis
```

**解決策**:

- Zilliz Cloud コンソールと AWS S3 コンソールの両方で、バケット名を再確認してください。

- バケットが実際に存在し、Zilliz Cloud の設定に名前が正しく入力されていることを確認してください。

### バケットの場所へのアクセス拒否\{#access-denied-for-bucket-location}

**説明**: IAM ロールに S3 バケットの場所へアクセスするために必要な権限が付与されていない場合に、このエラーが発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 403 ...
```

**解決策**:

- Zilliz Cloud が使用しているロールにアタッチされた IAM ポリシーを確認してください。

- ポリシーに `s3:GetBucketLocation` 権限が含まれていること、および `s3:GetObject`、`s3:PutObject`、`s3:ListBucket` などその他の必要な権限も含まれていることを確認してください。

### ロールの引き受け失敗\{#role-assumption-failure}

**説明**: ロール ARN、外部 ID、または信頼ポリシーの不備により IAM ロールの引き受けに問題がある場合に、このエラーが発生します。

```sql
try assume role from[zilliz-role] to [arn:aws:iam::041623484421:role/testoss121703] with externalId[zilliz-external-1umVCIK7q96kzDE] failed
```

**解決策**:

- Zilliz Cloud コンソール上のロール ARN と外部 ID が、IAM 信頼ポリシー内の対応する値と一致していることを確認してください。

- IAM ロールの信頼ポリシーにおいて、Zilliz Cloud がロールを引き受けることが許可されていることを確認してください。

### 権限反映の遅延\{#permission-propagation-delay}

IAM ロールまたはポリシーの作成・更新直後に **AccessDenied** エラーが表示された場合は、しばらく待ってから再試行してください。AWS IAM の変更は結果整合性モデルに従うため、反映までの最大時間は保証されていません。
