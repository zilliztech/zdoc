---
title: "AWS S3 との連携 | Cloud"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、Amazon Simple Storage Service（Amazon S3）と連携して、バックアップファイルや監査ログを指定した S3 バケットにエクスポートできます。 | Cloud"
type: origin
token: PAViwMSb3iVMzuk56z3c1zfRnwh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS S3 との連携

Zilliz Cloud では、Amazon Simple Storage Service（Amazon S3）と連携して、バックアップファイルや監査ログを指定した S3 バケットにエクスポートできます。

![BUEcwkZiChJrTlbziBMc3V49nFe](https://zdoc-images.s3.us-west-2.amazonaws.com/BUEcwkZiChJrTlbziBMc3V49nFe.png)

## 事前準備\{#before-you-start}

- Zilliz Cloud と AWS S3 を連携させるには、プロジェクトに対する **Organization Owner** または **Project Admin** の権限を持っていること。必要な権限がない場合は、Zilliz Cloud の Organization Owner にお問い合わせください。

- AWS マネジメントコンソールへの管理者アクセス権を持っていること。

## ステップ 1: Zilliz Cloud コンソールで連携を開始する\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmeibltu49co2h3pytvtdthb2" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインします。

1. プロジェクトページで、左側のナビゲーションパネルから **Integrations** に移動します。

1. **Amazon S3** セクションで、**+ Integration** をクリックします。

1. 表示されたダイアログボックスで、**Basic Settings** を構成します。

    - **Integration Name**: この連携の一意の名前（例: `integration_0819`）。

    - **Integration Description** *（任意）*: この連携の説明（例: `for export backupfile`）。

    - **Bucket Permission**: Zilliz Cloud が S3 バケットに対して持つアクセスレベルを選択します。以下の表で各オプションについて説明します。

        | **権限** | **説明** |
        | --- | --- |
        | Read only | Zilliz Cloud はバケット内のファイルを読み取ることのみできます。外部コレクションを支える[外部ボリューム](./external-volume)に使用します。 |
        | Read write | Zilliz Cloud はバケットに対する読み取りと書き込みの両方を行うことができます。[バックアップのエクスポート](./export-backup-files)、[監査ログの転送](./audit-logs)、[アクセスログの転送](./configure-access-logs)に使用します。 |

1. **Next** をクリックします。**Create Amazon S3 Bucket** ステップにリダイレクトされます。

    1. **Zilliz Cloud クラスター** の **Region** フィールドで、Zilliz Cloud クラスターまたは外部ボリュームが存在するクラウドリージョンを選択します。後で作成するバケットは、Zilliz Cloud クラスターまたはボリュームと同じリージョンにある必要があります。

    1. [S3 コンソール](https://us-west-2.console.aws.amazon.com/s3/buckets) を開き、[ステップ 2](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 2: AWS コンソールで S3 バケットを作成する\{#step-2-create-s3-bucket-in-aws-console}

<Supademo id="cmeibt2wt9cx1h3pyrojdocrn" title="Step 2: Create S3 bucket (1)" />

<Procedures>

1. [Amazon S3 コンソール](https://console.aws.amazon.com/s3/) の右上隅で、Zilliz Cloud クラスターまたは外部ボリュームのリージョンと一致する AWS リージョンを選択します。

    <Admonition type="info" title="Notes">

    - バケットを作成する AWS リージョンは、Zilliz Cloud クラスターまたは外部ボリュームが存在するリージョンと一致させる必要があります。Zilliz Cloud がサポートするリージョンについては、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。
    
    - 異なるリージョンで実行されているクラスターの場合は、バックアップファイルまたは監査ログを正しくエクスポートできるように、リージョンごとに個別の連携を作成してください。

    </Admonition>

1. 左側のナビゲーションパネルで **General purpose buckets** を選択し、続いて **Create bucket** をクリックします。

1. バケットの設定を構成します。

    1. **Bucket type** で **General purpose** を選択します。

    1. **Bucket name** に、バケットの名前を入力します（例: `zilliz-bucket-for-integration-0819`）。このバケット名は後のステップで必要になるため、必ず覚えておいてください。

    1. その他の設定はデフォルトのままにして、**Create bucket** をクリックします。

    詳細については、[バケットの作成](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html) を参照してください。

</Procedures>

バケットが作成されたら、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) に戻り、次の操作を行います。

<Supademo id="cmeibwrd19d3xh3pyx4h7r3d4" title="Step 2: Create S3 bucket (2)" />

<Procedures>

1. **Bucket Name** フィールドに、先ほど作成したバケットの名前を入力します（この例では `zilliz-bucket-for-integration-0819`）。次に、**Next** をクリックします。

1. **Create IAM Policy** ステップで、JSON ポリシーをコピーします。これは[ステップ 3](./integrate-with-aws-s3) で必要になります。

1. 完了したら、[IAM コンソール](https://console.aws.amazon.com/iam/) を開き、[ステップ 3](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 3: AWS コンソールで IAM ポリシーを作成する\{#step-3-create-iam-policy-in-aws-console}

Zilliz Cloud に AWS S3 へのアクセス権を付与するには、IAM ポリシーを作成します。このポリシーには、Zilliz Cloud と S3 バケット間でのバックアップファイルの転送を円滑にするための、特定のアクションとリソースを含める必要があります。

<Supademo id="cmeibzhk09d4rh3pyaipwhqi7" title="Step 3: Create IAM policy (1)" />

ここでは簡便のため、JSON エディターを使用してポリシーを作成します。

<Procedures>

1. [IAM コンソール](https://console.aws.amazon.com/iam/) で、**Policies** > **Create policy** を選択します。

1. **Policy editor** セクションで、**JSON** オプションを選択します。

1. Zilliz Cloud から提供された JSON ポリシードキュメントをコピーして、ポリシーエディターに貼り付けます。次に、**Next** をクリックします。

    以下はサンプルの JSON ポリシードキュメントです。連携に合わせた正確なポリシーについては、Zilliz Cloud コンソールの **Create IAM Policy** ステップを参照してください。

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

    ただし、AWS KMS を使用してバケットのサーバー側暗号化を有効にしている場合は、`kms:GenerateDataKey` アクションを許可する別の IAM ポリシーを追加する必要があります。この場合は、以下の JSON ポリシーを使用します。

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

    <Admonition type="info" title="Notes">

    - `<bucket>` は、実際の S3 バケットの名前に置き換える必要があります。
    
    - `<region>`、`<account_id>`、`<key_id>` は、それぞれ実際の値に置き換える必要があります。詳細については、AWS ドキュメントの [キー識別子](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-id) を参照してください。

    </Admonition>

1. **Review and create** ページで、作成するポリシーの **Policy Name**（例: `zilliz-policy-for-integration-0819`）と **Description**（任意）を入力し、**Permissions defined in this policy** を確認します。ポリシー名は後のステップで必要になるため、必ず覚えておいてください。

1. **Create policy** を選択して新しいポリシーを保存します。完了したら、[ステップ 4](./integrate-with-aws-s3) に進みます。

</Procedures>

## ステップ 4: IAM ロールを作成する\{#step-4-create-iam-role}

AWS コンソールで IAM ロールを作成する前に、Zilliz Cloud コンソールで次の操作を行います。

<Supademo id="cmeic3fab9dajh3pyzp50jnck" title="Step 4: Create IAM role (1)" />

<Procedures>

1. Zilliz Cloud コンソールで **Next** をクリックし、**Create IAM Role** ステップに進みます。

1. **Select trusted entity** で JSON の内容をコピーし、[IAM コンソール](https://console.aws.amazon.com/iam/) に移動します。

</Procedures>

完了したら、次の手順で IAM ロールを作成します。

<Supademo id="cmeic6bis9dgth3pybfmk8143" title="Step 4: Create IAM role (2)" />

<Procedures>

1. [IAM コンソール](https://console.aws.amazon.com/iam/) で、**Roles** > **Create role** を選択します。

1. **Custom trust policy** ロールタイプを選択します。

1. **Custom trust policy** セクションで、ロールのカスタム信頼ポリシーをコピーして貼り付けます。次に、**Next** をクリックします。

    以下はサンプルの JSON 信頼ポリシーです。連携に合わせた正確な信頼ポリシーについては、Zilliz Cloud コンソールの **Create IAM Role** ステップを参照してください。

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

    <Admonition type="info" title="Notes">

    `965570967084` と `my-external-id` は、Zilliz Cloud コンソールの **Create IAM Role** ステップに表示される実際の AWS アカウント ID と外部 ID に置き換える必要があります。

    </Admonition>

1. **Add permissions** ステップの **Permissions policies** で、[ステップ 3](./integrate-with-aws-s3) で作成したポリシーを検索して選択し、権限を追加します。次に、**Next** をクリックします。

1. **Name, review, and create** ステップで、ロール名（例: `zilliz-integration-role-0819`）を入力し、設定を確認します。次に、**Create role** をクリックします。

1. 作成したロールの詳細ページに移動し、そのロールに対応する **ARN** をコピーします。これは [ステップ 5](./integrate-with-aws-s3#step-5-validate-and-add-integration) で Zilliz Cloud コンソールにおいて必要になります。

</Procedures>

## ステップ 5: 連携を検証して追加する\{#step-5-validate-and-add-integration}

<Supademo id="cmeicbdyz9dprh3py2wwbguvn" title="Step 5: Validate and add integration" />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) の **Create IAM Role** ステップで、前のステップで IAM コンソールからコピーした **ARN** を貼り付けます。

1. 次に、**Validate Integration** をクリックして、S3 バケットと IAM ロールの設定を確認します。

1. ステータスが **Successful** に変わると、連携が機能します。次に、**Add** をクリックします。

    <Admonition type="info" title="Notes">

    IAM の変更が反映されるまでに時間がかかる場合があります。構成直後に検証が失敗した場合は、待ってから再試行してください。

    </Admonition>

</Procedures>

これで、この連携を使用してバックアップファイルをエクスポートしたり、監査ログを Amazon S3 バケットに転送したりできるようになりました。詳細については、[バックアップファイルのエクスポート](./export-backup-files) または [監査ログ](./audit-logs) を参照してください。

## ストレージ連携をプログラムで作成する\{#create-storage-integration-programmatically}

Zilliz Cloud コンソールでの操作の代わりに、ストレージ連携をプログラムから作成することもできます。

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

    上記のリクエストは、AWS コンソールで権限、ポリシー、ロールを作成するために必要な認証情報を生成します。

    応答の例は以下の通りです。

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

    パラメーターの説明の詳細については、[Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2) を参照してください。

1. 返された `readonly`、`readwrite`、`iamPolicy`、`trustPolicy`、`zillizAccount` を使用して、バケットを操作するための十分な権限を持つ IAM ロールを作成します。

    ロール ARN を書き留めてください。これは `arn:aws:iam::123456789012:role/zilliz-bucket-role` のような形式です。ロールの作成方法の詳細については、上記の [AWS コンソールで IAM ポリシーを作成する](./integrate-with-aws-s3#step-3-create-iam-policy-in-aws-console) および [IAM ロールを作成する](./integrate-with-aws-s3#step-4-create-iam-role) を参照してください。

1. 取得した認証情報を検証します。

    リクエストで、`externalCred.roleArn` に前のステップで書き留めたロール ARN を設定し、`externalCred.externalId` に取得した認証情報に表示された値を設定します。

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
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

    検証が成功した場合の応答は以下の通りです。

    ```bash
    {
        "code": 0,
        "data": {
            "success": true,
            "message": ""
        }
    }
    ```

    パラメーターの説明の詳細については、[Validate Storage Integration](/reference/restful/validate-storage-integration-v2) を参照してください。

1. ストレージ連携を作成します。

    このリクエストは、description 以外は検証リクエストとほとんどのパラメーターが共通です。

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
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

    応答は以下の通りです。

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-s3"
        }
    }
    ```

    パラメーターの説明の詳細については、[Create Storage Integration](/reference/restful/create-storage-integration-v2) を参照してください。

</Procedures>

## 連携を管理する\{#manage-integrations}

連携を追加すると、必要に応じてその詳細を表示したり、連携を削除したりできます。

![YODhb5leToWLsjxGRrpcyuZNnPb](https://zdoc-images.s3.us-west-2.amazonaws.com/yodhb5letowlsjxgrrpcyuznnpb.png "YODhb5leToWLsjxGRrpcyuZNnPb")

### 連携 ID を取得する\{#obtain-the-integration-id}

RESTful API を使用して、Zilliz Cloud と連携した AWS S3 バケットのいずれかにバックアップファイルをエクスポートする必要がある場合は、**View Details** をクリックして連携の詳細を表示し、その連携 ID をコピーします。

または、次のコマンドを実行して連携 ID を取得することもできます。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

応答は以下の通りです。

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

パラメーターの説明の詳細については、[List Storage Integrations](/reference/restful/list-storage-integrations-v2) を参照してください。

### 連携の詳細を表示する\{#view-integration-details}

次のコマンドを使用して連携の詳細を表示できます。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

応答は以下の通りです。

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

パラメーターの説明の詳細については、[Describe Storage Integration](/reference/restful/describe-storage-integration-v2) を参照してください。

### ストレージ連携を削除する\{#delete-storage-integration}

Zilliz Cloud コンソールで **Remove** をクリックする代わりの方法として、次のコマンドを使用して不要なストレージ連携を削除できます。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request DELETE \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

応答は以下の通りです。

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-s3"
    }
}
```

パラメーターの説明の詳細については、[Delete Storage Integration](/reference/restful/delete-storage-integration-v2) を参照してください。

## トラブルシューティング\{#troubleshooting}

連携のプロセスで問題が発生した場合に備えて、よくあるエラーメッセージとその解決策を以下に示します。

### バケットリージョンの不一致\{#bucket-region-mismatch}

**説明**: 次のエラー例は、S3 バケットのリージョンが Zilliz Cloud クラスターのリージョンと一致しない場合に発生します。

```plaintext
"bucket region not match, want[us-west-1] got[us-west-2]"
```

**解決策**:

- S3 バケットが配置されている AWS リージョンが、Zilliz Cloud クラスターのリージョンと一致していることを確認します。

- 必要に応じて、正しいリージョンに新しいバケットを作成するか、バケットのリージョンに合わせてクラスターのリージョンを変更します。

### バケットが見つからない\{#bucket-not-found}

**説明**: このエラーは、指定した S3 バケットが存在しないか、バケット名が正しくない場合に発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 404, RequestID: ..., HostID: ..., api error NoSuchBucket: The specified bucket does not exis
```

**解決策**:

- Zilliz Cloud コンソールと AWS S3 コンソールの両方で、バケット名を再確認します。

- バケットが存在すること、および Zilliz Cloud の構成で名前が正しく入力されていることを確認します。

### バケットのロケーションに対するアクセス拒否\{#access-denied-for-bucket-location}

**説明**: このエラーは、IAM ロールに S3 バケットのロケーションにアクセスするために必要な権限がない場合に発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 403 ...
```

**解決策**:

- Zilliz Cloud が使用しているロールにアタッチされている IAM ポリシーを確認します。

- ポリシーに `s3:GetBucketLocation` 権限が、`s3:GetObject`、`s3:PutObject`、`s3:ListBucket` などの他の必要な権限とともに含まれていることを確認します。

### ロールの引き受けエラー\{#role-assumption-failure}

**説明**: このエラーは、ロール ARN、外部 ID、または信頼ポリシーが正しくないために IAM ロールの引き受けに問題がある場合に発生します。

```sql
try assume role from[zilliz-role] to [arn:aws:iam::041623484421:role/testoss121703] with externalId[zilliz-external-1umVCIK7q96kzDE] failed
```

**解決策**:

- Zilliz Cloud コンソールのロール ARN と外部 ID が、IAM 信頼ポリシーの対応する値と一致していることを確認します。

- IAM ロールの信頼ポリシーが Zilliz Cloud にそのロールの引き受けを許可していることを確認します。

### 権限の反映の遅延\{#permission-propagation-delay}

IAM ロールまたはポリシーを作成または更新した直後に **AccessDenied** エラーが発生した場合は、待ってから再試行してください。AWS IAM の変更は結果整合性があり、反映までの最大時間は保証されていません。
