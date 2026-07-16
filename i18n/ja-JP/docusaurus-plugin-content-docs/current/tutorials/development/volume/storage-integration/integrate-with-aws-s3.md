---
title: "AWS S3 と連携する | Cloud"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、Amazon Simple Storage Service (Amazon S3) と連携して、バックアップファイルまたは監査ログを指定した S3 バケットにエクスポートできます。 | Cloud"
type: origin
token: PAViwMSb3iVMzuk56z3c1zfRnwh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS S3 と連携する

Zilliz Cloud では、Amazon Simple Storage Service (Amazon S3) と連携して、バックアップファイルまたは監査ログを指定した S3 バケットにエクスポートできます。

![BUEcwkZiChJrTlbziBMc3V49nFe](https://zdoc-images.s3.us-west-2.amazonaws.com/BUEcwkZiChJrTlbziBMc3V49nFe.png)

## 始める前に\{#before-you-start}

- Zilliz Cloud を AWS S3 と連携するには、プロジェクトに対する **Organization Owner** または **Project Admin** アクセス権限が必要です。必要な権限がない場合は、Zilliz Cloud Organization Owner にお問い合わせください。

- AWS Management Console への管理者アクセス権限を持っていること。

## ステップ 1: Zilliz Cloud コンソールで連携を開始する\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmeibltu49co2h3pytvtdthb2" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページで、左側のナビゲーションペインから **Integrations** に移動します。

1. **Amazon S3** セクションで、**+ Integration** をクリックします。

1. 表示されるダイアログボックスで、**Basic Settings** を設定します。

    - **Integration Name**: この連携の一意の名前（例: `integration_0819`）。

    - **Integration Description** *(任意)*: この連携の説明（例: `for export backupfile`）。

    - **Bucket Permission**: Zilliz Cloud が S3 バケットに対して持つアクセスレベルを選択します。以下の表で各オプションを説明します。

        | **Permission** | **Description** |
        | --- | --- |
        | Read only | Zilliz Cloud はバケット内のファイルを読み取ることのみできます。外部 collection を支える[外部ボリューム](./external-volume)に使用します。 |
        | Read write | Zilliz Cloud はバケットからの読み取りとバケットへの書き込みの両方を行えます。[バックアップのエクスポート](./export-backup-files)、[監査ログ転送](./audit-logs)、または[アクセスログ転送](./configure-access-logs)に使用します。 |

1. **Next** をクリックします。**Create Amazon S3 Bucket** ステップにリダイレクトされます。

    1. **Zilliz Cloud Cluster** **Region** フィールドで、Zilliz Cloud cluster または外部ボリュームが存在するクラウドリージョンを選択します。後で作成するバケットは、Zilliz Cloud cluster またはボリュームと同じリージョンに存在する必要があります。

    1. [S3 コンソール](https://us-west-2.console.aws.amazon.com/s3/buckets)を開き、[ステップ 2](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 2: AWS コンソールで S3 バケットを作成する\{#step-2-create-s3-bucket-in-aws-console}

<Supademo id="cmeibt2wt9cx1h3pyrojdocrn" title="Step 2: Create S3 bucket (1)" />

<Procedures>

1. [Amazon S3 コンソール](https://console.aws.amazon.com/s3/)の右上隅で、Zilliz Cloud cluster または外部ボリュームのリージョンと一致する AWS リージョンを選択します。

    <Admonition type="info" icon="📘" title="注意">

    - バケットを作成する AWS リージョンは、Zilliz Cloud cluster または外部ボリュームが存在するリージョンと一致している必要があります。Zilliz Cloud がサポートするリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。
    
    - 異なるリージョンで実行されている cluster については、バックアップファイルまたは監査ログを正しくエクスポートできるよう、リージョンごとに個別の連携を作成してください。

    </Admonition>

1. 左側のナビゲーションペインで **General purpose buckets** を選択し、**Create bucket** をクリックします。

1. バケット設定を構成します。

    1. **Bucket type** で **General purpose** を選択します。

    1. **Bucket name** に、バケット名を入力します（例: `zilliz-bucket-for-integration-0819`）。このバケット名は後続の手順で必要になるため、覚えておいてください。

    1. 他の設定はデフォルトのままにして、**Create bucket** をクリックします。

    詳細については、[Creating a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html) を参照してください。

</Procedures>

バケットが作成されたら、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login)に戻り、以下を行います。

<Supademo id="cmeibwrd19d3xh3pyx4h7r3d4" title="Step 2: Create S3 bucket (2)" />

<Procedures>

1. **Bucket Name** フィールドに、作成したバケットの名前を入力します（この例では `zilliz-bucket-for-integration-0819`）。その後、**Next** をクリックします。

1. **Create IAM Policy** ステップで、JSON ポリシーをコピーします。これは[ステップ 3](./integrate-with-aws-s3) で必要になります。

1. 完了したら、[IAM コンソール](https://console.aws.amazon.com/iam/)を開き、[ステップ 3](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 3: AWS コンソールで IAM policy を作成する\{#step-3-create-iam-policy-in-aws-console}

Zilliz Cloud に AWS S3 へのアクセス権を付与するには、IAM policy を作成します。この policy には、Zilliz Cloud と S3 バケット間でバックアップファイルを転送できるようにするための特定のアクションとリソースを含める必要があります。

<Supademo id="cmeibzhk09d4rh3pyaipwhqi7" title="Step 3: Create IAM policy (1)" />

簡単にするため、JSON エディタを使用して policy を作成します。

<Procedures>

1. [IAM コンソール](https://console.aws.amazon.com/iam/)で、**Policies** > **Create policy** を選択します。

1. **Policy editor** セクションで、**JSON** オプションを選択します。

1. Zilliz Cloud から提供された JSON policy ドキュメントを policy エディタにコピーして貼り付けます。その後、**Next** をクリックします。

    以下は JSON policy ドキュメントのサンプルです。ご利用の連携向けに調整された正確な policy については、Zilliz Cloud コンソールの **Create IAM Policy** ステップを参照してください。

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

    ただし、AWS KMS を使用したサーバー側暗号化をバケットで有効にしている場合は、`kms:GenerateDataKey` アクションを許可する別の IAM policy を追加する必要があります。この場合は、以下の JSON policy を使用してください。

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

    <Admonition type="info" icon="📘" title="注意">

    - `<bucket>` は実際の S3 バケット名に置き換えてください。
    
    - `<region>`、`<account_id>`、`<key_id>` は実際の値に置き換えてください。詳細については、AWS ドキュメントの [Key identifiers](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-id) を参照してください。

    </Admonition>

1. **Review and create** ページで、作成する policy の **Policy Name**（例: `zilliz-policy-for-integration-0819`）と **Description**（任意）を入力し、**Permissions defined in this policy** を確認します。この policy 名は後続の手順で必要になるため、覚えておいてください。

1. **Create policy** を選択して新しい policy を保存します。完了したら、[ステップ 4](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 4: IAM role を作成する\{#step-4-create-iam-role}

AWS コンソールで IAM role を作成する前に、Zilliz Cloud コンソールで以下を行います。

<Supademo id="cmeic3fab9dajh3pyzp50jnck" title="Step 4: Create IAM role (1)" />

<Procedures>

1. Zilliz Cloud コンソールで **Next** をクリックし、**Create IAM Role** ステップに進みます。

1. **Select trusted entity** で JSON コンテンツをコピーし、[IAM コンソール](https://console.aws.amazon.com/iam/)に移動します。

</Procedures>

これが完了したら、IAM role を作成するために以下を行います。

<Supademo id="cmeic6bis9dgth3pybfmk8143" title="Step 4: Create IAM role (2)" />

<Procedures>

1. [IAM コンソール](https://console.aws.amazon.com/iam/)で、**Roles** > **Create role** を選択します。

1. **Custom trust policy** role タイプを選択します。

1. **Custom trust policy** セクションで、その role のカスタム trust policy をコピーして貼り付けます。その後、**Next** をクリックします。

    以下は JSON trust policy のサンプルです。ご利用の連携向けに調整された正確な trust policy については、Zilliz Cloud コンソールの **Create IAM Role** ステップを参照してください。

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

    <Admonition type="info" icon="📘" title="注意">

    `965570967084` と `my-external-id` は、Zilliz Cloud コンソールの **Create IAM Role** ステップに表示される実際の AWS アカウント ID と external ID に置き換えてください。

    </Admonition>

1. **Add permissions** ステップの **Permissions policies** で、[ステップ 3](./integrate-with-aws-s3) で作成した policy を検索して選択し、権限を追加します。その後、**Next** をクリックします。

1. **Name, review, and create** ステップで role 名（例: `zilliz-integration-role-0819`）を入力し、設定を確認します。その後、**Create role** をクリックします。

1. 作成した role の詳細ページに移動し、その role に対応する **ARN** をコピーします。これは Zilliz Cloud コンソールの[ステップ 5](./integrate-with-aws-s3#step-5-validate-and-add-integration) で必要になります。

</Procedures>

## ステップ 5: 連携を検証して追加する\{#step-5-validate-and-add-integration}

<Supademo id="cmeicbdyz9dprh3py2wwbguvn" title="Step 5: Validate and add integration" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login)の **Create IAM Role** ステップで、前のステップで IAM コンソールからコピーした **ARN** を貼り付けます。

1. 次に、**Validate Integration** をクリックして、S3 バケットと IAM role の設定を確認します。

1. ステータスが **Successful** に変わったら、連携は機能しています。その後、**Add** をクリックします。

</Procedures>

これで、この連携を使用してバックアップファイルをエクスポートしたり、監査ログを Amazon S3 バケットに転送したりできます。詳細については、[Export Backup Files](./export-backup-files) または [Audit Logging](./audit-logs) を参照してください。

## ストレージ連携をプログラムで作成する\{#create-storage-integration-programmatically}

Zilliz Cloud コンソールで操作する代わりに、プログラムでストレージ連携を作成することもできます。

<Procedures>

1. S3 バケットを作成します。

    詳細については、上記の [AWS コンソールで S3 バケットを作成する](./integrate-with-aws-s3#step-2-create-s3-bucket-in-aws-console) または [CreateBucket](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html) API ドキュメントを参照してください。

1. 認証情報を生成します。

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/authorizationMaterials" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "bucketName": "my-bucket"
    }'
    ```

    上記のリクエストは、AWS コンソールで権限、policy、role を作成するために必要な認証情報を生成します。 

    返されるレスポンスの例は次のとおりです。

    ```bash
    {
      "code": 0,
      "data": {
        "readonly": "{...}",
        "readwrite": "{...}",
        "iamPolicy": "{...}",
        "trustPolicy": "{...}",
        "zillizAccount": "306787409409",
        "externalId": "zilliz-external-AbCdEf12345678"
      }
    }
    ```

    パラメータの説明については、[Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2) を参照してください。

1. 返された `readonly`、`readwrite`、`iamPolicy`、`trustPolicy`、および `zillizAccount` を使用して、バケットを操作するのに十分な権限を持つ IAM role を作成します。 

    `arn:aws:iam::123456789012:role/zilliz-bucket-role` のような role ARN を控えておいてください。role の作成方法の詳細については、上記の [AWS コンソールで IAM policy を作成する](./integrate-with-aws-s3#step-3-create-iam-policy-in-aws-console) および [IAM role を作成する](./integrate-with-aws-s3#step-4-create-iam-role) を参照してください。

1. 取得した認証情報を検証します。

    リクエストでは、`externalCred.roleArn` を前のステップで控えた role ARN に設定し、`externalCred.externalId` を取得した認証情報に表示されるものに設定します。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/validate" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "arn:aws:iam::123456789012:role/zilliz-bucket-role",
            "externalId": "zilliz-external-AbCdEf12345678"
        }
    }'
    ```

    検証成功時のレスポンスは次のとおりです。

    ```bash
    {
        "code": 0,
        "data": {
            "success": true,
            "message": ""
        }
    }
    ```

    パラメータの説明については、[Validate Storage Integration](/reference/restful/validate-storage-integration-v2) を参照してください。

1. ストレージ連携を作成します。

    このリクエストは、説明を除き、検証リクエストとほとんどのパラメータを共有しています。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "name": "analytics-s3",
        "description": "S3 bucket for external tables",
        "regionId": "aws-us-west-2",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "arn:aws:iam::123456789012:role/zilliz-bucket-role",
            "externalId": "zilliz-external-AbCdEf12345678"
        }
    }'
    ```

    レスポンスは次のようになります。

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-s3"
        }
    }
    ```

    パラメータの説明については、[Create Storage Integration](/reference/restful/create-storage-integration-v2) を参照してください。

</Procedures>

## 連携を管理する\{#manage-integrations}

連携が追加されると、必要に応じて詳細を表示したり、連携を削除したりできます。

![YODhb5leToWLsjxGRrpcyuZNnPb](https://zdoc-images.s3.us-west-2.amazonaws.com/yodhb5letowlsjxgrrpcyuznnpb.png "YODhb5leToWLsjxGRrpcyuZNnPb")

### 連携 ID を取得する\{#obtain-the-integration-id}

Zilliz Cloud と連携済みの AWS S3 バケットの 1 つにバックアップファイルをエクスポートするために RESTful API を使用する必要がある場合は、**View Details** をクリックして連携の詳細を表示し、その連携 ID をコピーします。

または、次のコマンドを実行して連携 ID を取得することもできます。

```bash
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

レスポンスは次のようになります。

```bash
{
    "code": 0,
    "data": {
        "storageIntegrations": [
            {
                "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
                "name": "analytics-s3",
                "status": "ACTIVE",
                "message": "",
                "regionId": "aws-us-west-2",
                "bucketName": "my-bucket"
            }
        ],
        "count": 1,
        "currentPage": 1,
        "pageSize": 10
    }
}
```

パラメータの説明については、[List Storage Integrations](/reference/restful/list-storage-integrations-v2) を参照してください。

### 連携の詳細を表示する\{#view-integration-details}

次のコマンドを使用して連携の詳細を表示できます

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

レスポンスは次のようになります。

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-s3",
        "description": "S3 bucket for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "aws-us-west-2",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "arn:aws:iam::123456789012:role/zilliz-bucket-role",
            "externalId": "zilliz-external-AbCdEf12345678"
        },
        "createTime": "2024-07-30T16:49:50Z"
    }
}
```

パラメータの説明については、[Describe Storage Integration](/reference/restful/describe-storage-integration-v2) を参照してください。

### ストレージ連携を削除する\{#delete-storage-integration}

Zilliz Cloud コンソールで **Remove** をクリックする代替方法として、次のコマンドを使用して不要なストレージ連携を削除できます。

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request DELETE \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

レスポンスは次のようになります。

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-s3"
    }
}
```

パラメータの説明については、[Delete Storage Integration](/reference/restful/delete-storage-integration-v2) を参照してください。

## トラブルシューティング\{#troubleshooting}

連携プロセス中に問題が発生した場合、以下は一般的なエラーメッセージとその解決策です。

### バケットのリージョン不一致\{#bucket-region-mismatch}

**説明**: 次のエラー例は、S3 バケットのリージョンが Zilliz Cloud cluster のリージョンと一致しない場合に発生します。

```plaintext
"bucket region not match, want[us-west-1] got[us-west-2]"
```

**解決策**:

- S3 バケットが存在する AWS リージョンが、Zilliz Cloud cluster のリージョンと一致していることを確認してください。

- 必要に応じて、正しいリージョンに新しいバケットを作成するか、バケットのリージョンに合わせて cluster のリージョンを調整してください。

### バケットが見つからない\{#bucket-not-found}

**説明**: このエラーは、指定した S3 バケットが存在しない場合、またはバケット名が正しくない場合に発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 404, RequestID: ..., HostID: ..., api error NoSuchBucket: The specified bucket does not exis
```

**解決策**:

- Zilliz Cloud コンソールと AWS S3 コンソールの両方でバケット名を再確認してください。

- バケットが存在し、その名前が Zilliz Cloud の設定に正しく入力されていることを確認してください。

### バケットロケーションへのアクセス拒否\{#access-denied-for-bucket-location}

**説明**: このエラーは、IAM role に S3 バケットのロケーションへアクセスするために必要な権限がない場合に発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 403 ...
```

**解決策**:

- Zilliz Cloud が使用している role にアタッチされている IAM policy を確認してください。

- policy に `s3:GetBucketLocation` 権限が含まれていること、および `s3:GetObject`、`s3:PutObject`、`s3:ListBucket` などの他の必要な権限も含まれていることを確認してください。

### role 引き受けの失敗\{#role-assumption-failure}

**説明**: このエラーは、不正な role ARN、external ID、または trust policy が原因で IAM role の引き受けに問題がある場合に発生します。

```sql
try assume role from[zilliz-role] to [arn:aws:iam::041623484421:role/testoss121703] with externalId[zilliz-external-1umVCIK7q96kzDE] failed
```

**解決策**:

- Zilliz Cloud コンソール上の role ARN と external ID が、IAM trust policy 内の対応する値と一致していることを確認してください。

- IAM role の trust policy が、Zilliz Cloud にその role の引き受けを許可していることを確認してください。

