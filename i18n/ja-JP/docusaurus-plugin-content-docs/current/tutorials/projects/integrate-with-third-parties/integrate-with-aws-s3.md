---
title: "AWS S3との統合 | Cloud"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、Amazon Simple Storage Service（Amazon S3）と統合して、バックアップファイルまたは監査ログを指定されたS3バケットにエクスポートできます。 | Cloud"
type: origin
token: PAViwMSb3iVMzuk56z3c1zfRnwh
sidebar_position: 1
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - バックアップ
  - エクスポート
  - 統合
  - オブジェクト
  - ストレージ
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# AWS S3との統合

Zilliz Cloudでは、Amazon Simple Storage Service（Amazon S3）と統合して、バックアップファイルまたは監査ログを指定されたS3バケットにエクスポートできます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>エンタープライズ</strong>プロジェクト内の<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

![BUEcwkZiChJrTlbziBMc3V49nFe](/img/BUEcwkZiChJrTlbziBMc3V49nFe.png)

## 始める前に\{#before-you-start}

- Zilliz CloudをAWS S3と統合するには、プロジェクトに**組織オーナー**または**プロジェクト管理者**のアクセス権が必要です。必要な権限がない場合は、Zilliz Cloud組織オーナーに連絡してください。

- AWSマネジメントコンソールへの管理アクセス権が必要です。

## ステップ1：Zilliz Cloudコンソールで統合を開始\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmeibltu49co2h3pytvtdthb2" title="ステップ1：Zilliz Cloudコンソールで統合を開始" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページで、左側のナビゲーションペインから**統合**に移動します。

1. **Amazon S3**セクションで、**+ 統合**をクリックします。

1. 表示されるダイアログボックスで、**基本設定**を構成します：

    - **統合名**：この統合の一意の名前（例：`integration_0819`）。

    - **統合の説明**（オプション）：この統合の説明（例：`for export backupfile`）。

1. **次へ**をクリックします。**Amazon S3バケットの作成**ステップにリダイレクトされます：

    1. **Zilliz Cloudクラスター** **リージョン**フィールドで、Zilliz Cloudクラスターが存在するクラウドリージョンを選択します。後で作成するバケットは、Zilliz Cloudクラスターと同じリージョンにある必要があります。

    1. [S3コンソール](https://us-west-2.console.aws.amazon.com/s3/buckets)を開き、[ステップ2](./integrate-with-aws-s3)に進みます。

## ステップ2：AWSコンソールでS3バケットを作成\{#step-2-create-s3-bucket-in-aws-console}

<Supademo id="cmeibt2wt9cx1h3pyrojdocrn" title="ステップ2：S3バケットを作成（1）" />

1. [Amazon S3コンソール](https://console.aws.amazon.com/s3/)の右上隅で、Zilliz Cloudクラスターのリージョンと一致するAWSリージョンを選択します。

    <Admonition type="info" icon="📘" title="ノート">

    <ul>
    <li><p>バケットを作成するAWSリージョンは、Zilliz Cloudクラスターが存在するリージョンと一致している必要があります。Zilliz Cloudがサポートするリージョンについては、<a href="./cloud-providers-and-regions">クラウドプロバイダーとリージョン</a>を参照してください。</p></li>
    <li><p>異なるリージョンで実行されているクラスターについては、各リージョンに個別の統合を作成し、バックアップファイルまたは監査ログが適切にエクスポートされるようにします。</p></li>
    </ul>

    </Admonition>

1. 左側のナビゲーションペインで、**汎用バケット**を選択し、**バケットの作成**をクリックします。

1. バケット設定を構成します：

    1. **バケットタイプ**で、**汎用**を選択します。

    1. **バケット名**には、バケットの名前を入力します（例：`zilliz-bucket-for-integration-0819`）。このバケット名を覚えておいてください。今後のステップで必要になります。

    1. 他の設定はデフォルトのままにして、**バケットの作成**をクリックします。

    詳細については、[バケットの作成](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)を参照してください。

バケットが作成されたら、[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、以下のことを行ってください：

<Supademo id="cmeibwrd19d3xh3pyx4h7r3d4" title="ステップ2：S3バケットを作成（2）" />

1. **バケット名**フィールドに、 vừa作成したバケットの名前を入力します（この例では`zilliz-bucket-for-integration-0819`）。次に、**次へ**をクリックします。

1. **IAMポリシーの作成**ステップで、JSONポリシーをコピーします。これは[ステップ3](./integrate-with-aws-s3)で必要になります。

1. 完了したら、[IAMコンソール](https://console.aws.amazon.com/iam/)を開き、[ステップ3](./integrate-with-aws-s3)に進みます。

## ステップ3：AWSコンソールでIAMポリシーを作成\{#step-3-create-iam-policy-in-aws-console}

Zilliz CloudがAWS S3にアクセスできるようにするには、IAMポリシーを作成します。このポリシーには、Zilliz CloudとS3バケット間でバックアップファイルを転送するために必要な特定のアクションとリソースが含まれている必要があります。

<Supademo id="cmeibzhk09d4rh3pyaipwhqi7" title="ステップ3：IAMポリシーを作成（1）" />

簡単にするために、JSONエディターを使用してポリシーを作成します。

1. [IAMコンソール](https://console.aws.amazon.com/iam/)で、**ポリシー** > **ポリシーの作成**を選択します。

1. **ポリシー エディター**セクションで、**JSON**オプションを選択します。

1. Zilliz Cloudで提供されたJSONポリシードキュメントをポリシー エディターにコピーして貼り付けます。次に、**次へ**をクリックします。

    以下はJSONポリシードキュメントのサンプルです。統合に合わせた正確なポリシーについては、Zilliz Cloudコンソールの**IAMポリシーの作成**ステップを参照してください。

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

    ただし、AWS KMSを使用してバケットでサーバー側暗号化を有効にしている場合は、`kms:GenerateDataKey`アクションを許可する別のIAMポリシーを追加する必要があります。この場合、以下のJSONポリシーを使用してください。

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

    <Admonition type="info" icon="📘" title="ノート">

    <ul>
    <li><p><code>&lt;bucket&gt;</code>は、S3バケットの実際の名前に置き換えてください。</p></li>
    <li><p><code>&lt;region&gt;</code>、<code>&lt;account_id&gt;</code>、および<code>&lt;key_id&gt;</code>は、それぞれの実際の値に置き換えてください。詳細については、AWSドキュメントの<a href="https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-id">キー識別子</a>を参照してください。</p></li>
    </ul>

    </Admonition>

1. **レビューと作成**ページで、作成しているポリシーの**ポリシー名**（例：`zilliz-policy-for-integration-0819`）と**説明**（オプション）を入力し、**このポリシーで定義された権限**を確認してください。ポリシー名を覚えておいてください。今後のステップで必要になります。

1. **ポリシーの作成**を選択して、新しいポリシーを保存します。完了したら、[ステップ4](./integrate-with-aws-s3)に進みます。

## ステップ4：IAMロールを作成\{#step-4-create-iam-role}

AWSコンソールでIAMロールを作成する前に、Zilliz Cloudコンソールで以下のことを行ってください：

<Supademo id="cmeic3fab9dajh3pyzp50jnck" title="ステップ4：IAMロールを作成（1）" />

1. Zilliz Cloudコンソールで、**次へ**をクリックして**IAMロールの作成**ステップに進みます。

1. **信頼されたエンティティの選択**で、JSONコンテンツをコピーし、[IAMコンソール](https://console.aws.amazon.com/iam/)に移動します。

それが完了したら、IAMロールを作成するために以下のことを行ってください：

<Supademo id="cmeic6bis9dgth3pybfmk8143" title="ステップ4：IAMロールを作成（2）" />

1. [IAMコンソール](https://console.aws.amazon.com/iam/)で、**ロール** > **ロールの作成**を選択します。

1. **カスタム信頼ポリシー**ロールタイプを選択します。

1. **カスタム信頼ポリシー**セクションで、ロール用のカスタム信頼ポリシーをコピーして貼り付けます。次に、**次へ**をクリックします。

    以下はJSON信頼ポリシーのサンプルです。統合に合わせた正確な信頼ポリシーについては、Zilliz Cloudコンソールの**IAMロールの作成**ステップを参照してください。

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

    <p><code>965570967084</code>と<code>my-external-id</code>は、Zilliz Cloudコンソールの<strong>ロールの作成</strong>ステップに表示される実際のAWSアカウントIDと外部IDに置き換えてください。</p>

    </Admonition>

1. **権限の追加**ステップの**アクセス許可ポリシー**で、[ステップ3](./integrate-with-aws-s3)で作成したポリシーを検索して選択し、アクセス許可を追加します。次に、**次へ**をクリックします。

1. **名前、レビュー、および作成**ステップで、ロール名（例：`zilliz-integration-role-0819`）を入力し、設定を確認します。次に、**ロールの作成**をクリックします。

1. 作成されたロールの詳細ページに移動し、ロールに対応する**ARN**をコピーします。これは、[ステップ5](./integrate-with-aws-s3#step-5-validate-and-add-integration)のZilliz Cloudコンソールで必要になります。

## ステップ5：統合の検証と追加\{#step-5-validate-and-add-integration}

<Supademo id="cmeicbdyz9dprh3py2wwbguvn" title="ステップ5：統合の検証と追加" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)の**IAMロールの作成**ステップで、前のステップでIAMコンソールからコピーした**ARN**を貼り付けます。

1. 次に、**統合の検証**をクリックして、S3バケットとIAMロールの設定を確認します。

1. ステータスが**成功**に変わったら、統合は正常に動作しています。次に、**追加**をクリックします。

これで、この統合を使用してバックアップファイルをエクスポートしたり、監査ログをAmazon S3バケットに転送したりできるようになりました。詳細については、[バックアップファイルのエクスポート](./export-backup-files)または[監査ログ](./audit-logs)を参照してください。

## 統合の管理\{#manage-integrations}

統合が追加されると、その詳細を表示したり、必要に応じて統合を削除したりできます。

![YODhb5leToWLsjxGRrpcyuZNnPb](/img/YODhb5leToWLsjxGRrpcyuZNnPb.png)

### 統合IDの取得\{#obtain-the-integration-id}

RESTful APIを使用してZilliz Cloudと統合されたAWS S3バケットのいずれかにバックアップファイルをエクスポートする必要がある場合は、**詳細の表示**をクリックして統合の詳細を表示し、統合IDをコピーしてください。

## トラブルシューティング\{#troubleshooting}

統合プロセス中に問題が発生した場合は、以下に示す一般的なエラーメッセージとその解決策を参考にしてください。

### バケットリージョンの不一致\{#bucket-region-mismatch}

**説明**：S3バケットのリージョンがZilliz Cloudクラスターのリージョンと一致しない場合、以下の例のようなエラーが発生します。

```plaintext
"bucket region not match, want[us-west-1] got[us-west-2]"
```

**解決策**：

- S3バケットが存在するAWSリージョンが、Zilliz Cloudクラスターのリージョンと一致していることを確認します。

- 必要に応じて、正しいリージョンに新しいバケットを作成するか、バケットのリージョンに合わせてクラスターのリージョンを調整してください。

### バケットが見つからない\{#bucket-not-found}

**説明**：指定されたS3バケットが存在しないか、バケット名が間違っている場合にこのエラーが発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 404, RequestID: ..., HostID: ..., api error NoSuchBucket: The specified bucket does not exis
```

**解決策**：

- Zilliz CloudコンソールとAWS S3コンソールの両方でバケット名を再確認してください。

- バケットが存在し、Zilliz Cloud構成に正しく入力されていることを確認してください。

### バケットの場所へのアクセスが拒否された\{#access-denied-for-bucket-location}

**説明**：IAMロールにS3バケットの場所にアクセスするための必要な権限がない場合にこのエラーが発生します。

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 403 ...
```

**解決策**：

- Zilliz Cloudが使用しているロールにアタッチされたIAMポリシーを確認してください。

- ポリシーに`s3:GetBucketLocation`権限とその他必要な権限（例：`s3:GetObject`、`s3:PutObject`、`s3:ListBucket`）が含まれていることを確認してください。

### ロールの想定に失敗\{#role-assumption-failure}

**説明**：ロールARN、外部ID、または信頼ポリシーが正しくない場合、IAMロールの想定に問題が発生します。

```sql
try assume role from[zilliz-role] to [arn:aws:iam::041623484421:role/testoss121703] with externalId[zilliz-external-1umVCIK7q96kzDE] failed
```

**解決策**：

- Zilliz CloudコンソールのロールARNと外部IDがIAM信頼ポリシーの対応する値と一致していることを確認してください。

- IAMロールの信頼ポリシーがZilliz Cloudがロールを想定できるようにしていることを確認してください。