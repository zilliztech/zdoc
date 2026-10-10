---
title: "AWS KMS | Cloud"
slug: /aws-kms
sidebar_label: "AWS KMS"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AWS Key Management Service（KMS）は、データの暗号化と署名に使用するキーを簡単に作成および管理できる AWS マネージドサービスです。 | Cloud"
type: origin
token: FOamwIi07ia7kpkBPW8cEuIpniu
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS KMS

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイでのみ使用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は AWS で使用できます。Google Cloud と Microsoft Azure では使用できません。

</FeatureNote>

AWS Key Management Service（KMS）は、データの暗号化と署名に使用するキーを簡単に作成および管理できる AWS マネージドサービスです。

## 概要\{#overview}

通常のケースでは、Zilliz Cloud クラスター内のデータを暗号化するために KMS キーは使用しません。代わりに、KMS キーを使用して暗号化ゾーンキー（EZK）を暗号化し、EZK を使用してデータ暗号化キー（DEK）を暗号化し、DEK を使用してデータを暗号化します。

![YJRcwu5BLhm8Hub1eiZcDiIdnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YJRcwu5BLhm8Hub1eiZcDiIdnDh.png)

暗号化の仕組みとその適用範囲の詳細については、[このセクション](./cmek#how-encryption-works) を参照してください。CMEK 機能の制限事項の詳細については、[このセクション](./cmek#limitations) を参照してください。CMEK 機能を使用するには、このページの手順に従ってください。

## 事前準備\{#before-you-start}

- AWS CLI をインストールしているか、AWS CloudShell にアクセスできること。

    詳細については、[このページ](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) を参照してください。

- キー管理コマンドを実行するための十分な権限があること。

## KMS キーを追加する\{#add-a-kms-key}

各プロジェクトでは、KMS プロバイダーに関係なく、最大 **20** 個のキーを追加できます。既存の KMS キーを追加するか、Zilliz Cloud コンソールの指示に従って KMS キーを作成し、Zilliz Cloud に追加することができます。

## 手順\{#procedures}

AWS KMS キーを追加するには、[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、左側のナビゲーションペインで **Network** > **CMEK** を選択し、該当する AWS リージョンにある **Business Critical** プロジェクトのいずれかに移動して、**+ CMEK** をクリックし、**Add CMEK (AWS KMS)** ダイアログボックスの手順に従ってプロセスを完了します。

開始する前に、この手順で使用する IAM ロールを決定する必要があります。IAM ロールは、KMS キーの追加に使用すると Zilliz Cloud に一覧表示されます。**Existing IAM Role** タブの **Select AWS IAM Role** ステップにあるドロップダウンリストを確認し、必要な IAM ロールが一覧に表示されているかどうかを判断してください。

- 表示されている場合は、[既存のロールを使用して KMS キーを追加する](./aws-kms#add-a-kms-key-using-an-existing-role) に進みます。

- 表示されていない場合は、[新しいロールを使用して KMS キーを追加する](./aws-kms#add-a-kms-key-using-a-new-role) に進みます。

### 既存のロールを使用して KMS キーを追加する\{#add-a-kms-key-using-an-existing-role}

**Existing IAM Role** タブの **Select AWS IAM Role** のドロップダウンリストに必要な IAM ロールが含まれている場合は、このセクションの手順に従ってください。

<Procedures>

1. **Select AWS IAM Role** ステップのドロップダウンをクリックし、IAM ロールを選択して、**Next** をクリックします。

    ![O6IxwU89jhUTHDbShkfcHzZFn00](https://zdoc-images.s3.us-west-2.amazonaws.com/O6IxwU89jhUTHDbShkfcHzZFn00.png)

1. KMS キーを追加します。

    ![ENW6wuQVlhaRntbKYDDcrdegnNL](https://zdoc-images.s3.us-west-2.amazonaws.com/ENW6wuQVlhaRntbKYDDcrdegnNL.png)

    1. ステップ 1 で対象のリージョンを選択します。

    1. **（オプション）** ステップ 2 のコマンドをコピーし、AWS CloudShell で実行します。

        このステップはオプションです。指定した IAM ロールで作成済みの KMS キーがすでにある場合は、このステップをスキップして次に進むことができます。これは、マルチリージョンレプリカキーを追加する場合に便利です。

        <Admonition type="info" title="Notes">

        暗号化された Zilliz Cloud クラスターをあるクラウドリージョンから別のリージョンにバックアップした後、対象リージョンでバックアップを復号するには、元のクラスターを暗号化したのと同じキーを使用する必要があります。

        この場合、キーをバックアップをホストするリージョンにレプリケートし、既存の IAM ロールを使用して Zilliz Cloud に送信できます。

        マルチリージョンレプリカキーの作成の詳細については、AWS ドキュメントの[このページ](https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-replicate.html) を参照してください。

        </Admonition>

    1. KMS キー ARN を次の場所にコピーして貼り付けます。

        - [AWS コンソール](https://console.aws.amazon.com/iam/home#/roles) 上の IAM ロールのポリシー。

            ロール一覧でロールの名前をクリックし、**Permissions** タブでロールポリシーを見つけて、コピーした KMS キーを `Resource` ノードに追加します。

            ```json
            {
                    "Version": "2012-10-17",
                    "Statement": [
                            {
                                    "Effect": "Allow",
                                    "Action": [
                                            "kms:Decrypt",
                                            "kms:Encrypt",
                                            "kms:DescribeKey"
                                    ],
                                    "Resource": [
                                            // highlight-start
                                            "arn:aws:kms:us-west-2:xxxx:key/mrk-...",
                                            "PASTE-THE-COPIED-KEY-ARN-HERE"
                                            // highlight-end
                                    ]
                            }
                    ]
            }
            ```

        - Zilliz Cloud の上記のダイアログボックスのステップ 3。

    1. ダイアログボックス下部の **Validate KMS Key** をクリックします。

    1. 検証が成功したら、**Add** をクリックします。

</Procedures>

### 新しいロールを使用して KMS キーを追加する\{#add-a-kms-key-using-a-new-role}

**Existing IAM Role** タブの **Select AWS IAM Role** のドロップダウンリストに必要な IAM ロールが含まれていない場合は、このセクションの手順に従ってください。

<Procedures>

1. **New IAM Role** をクリックします。

1. IAM ロールを作成し、その信頼ポリシーに Zilliz Cloud を追加します。

    Zilliz Cloud に一覧表示されている IAM ロールがない場合は作成します。これには、AWS CloudShell でコマンドを実行する必要があります。

    <Supademo id="cmkxdx3yy00txru0hopj1eiwg" title=""  />

    1. Zilliz Cloud コンソールから信頼ポリシーのファイル名をコピーし、AWS CloudShell で `vi` コマンドを実行して信頼ポリシーファイルを作成します。

        ```bash
        vi role-trust-policy.json
        ```

    1. **I** を押して挿入モードに入ります。

    1. **Step 1** の信頼ポリシー JSON をコピーし、ターミナルに貼り付けます。

    1. **ESC** を押して `:wq` を入力し、JSON ファイルを保存します。

    1. **Step 2** で作成するロールの名前を入力します。

    1. **Step 3** のコマンドをコピーし、ターミナルに貼り付けます。

    1. **Enter** を押してコマンドを実行します。

    1. コマンド出力でロールの ARN をコピーし、**Step 4** のテキストボックスに貼り付けます。

    1. **Next** をクリックします。

1. KMS キーを作成します

    <Supademo id="cmkxdwufl000isl0i5nfkxzvy" title=""  />

    1. **Step 1** でクラウドリージョンを選択します。

    1. **Step 2** のコマンドをコピーし、ターミナルに貼り付けます。

    1. **Enter** を押してコマンドを実行します。

    1. コマンド出力でキーの ARN をコピーし、**Step 3** のテキストボックスに貼り付けます。

    1. **Next** をクリックします。

1. KMS キーを IAM ロールに関連付けます。

    <Supademo id="cmkxdx8eu00szs50igvo0f2ti" title=""  />

    1. `vi` コマンドを実行し、**Step 1** で必要なロールポリシー JSON ファイルを作成します。

    1. Step 2 のコマンドをコピーし、ターミナルに貼り付けます。

    1. **Enter** を押してコマンドを実行します。

    1. コマンドが実行されたら、ダイアログボックス下部の **Validate KMS Key** をクリックします。

    1. 検証が成功したら、**Add** をクリックします。

</Procedures>

<Admonition type="info" title="Notes">

KMS キーを使用して Zilliz Cloud クラスターを暗号化すると、クラスターは 10 分ごとにキーの可用性を確認します。キーが利用可能であることを検出した後にのみ、使用可能になります。

</Admonition>

## AWS KMS キーを管理する\{#manage-aws-kms-keys}

追加した AWS KMS キーは、Zilliz Cloud コンソールで確認できます。

![S3NKwZYR7hj6ocbkpIQcB66Unyg](https://zdoc-images.s3.us-west-2.amazonaws.com/S3NKwZYR7hj6ocbkpIQcB66Unyg.png)

Zilliz Cloud は、一覧表示されているキーの可用性を 10 分ごとにスキャンします。また、一覧表示されている KMS キーのステータスに関するプロジェクトアラートを作成することもできます。詳細については、[Manage Project Alerts](./manage-project-alerts#create-a-project-alert) を参照してください。

KMS キーが不要になった場合は、どのクラスターもそのキーを使用していなければ削除できます。

## AWS KMS キーを使用する\{#use-aws-kms-keys}

KMS キーを Zilliz Cloud に追加すると、それを使用して暗号化されたクラスターを作成し、バックアップおよび復元できます。

### 暗号化されたクラスターを作成する\{#create-an-encrypted-cluster}

クラスターを暗号化するには、作成するクラスターのリージョンで利用可能な KMS キーを選択できます。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加すると、次のようにして暗号化されたクラスターを作成できます。

<Procedures>

1. **Choose Deployment Option** セクションで **Dedicated** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **Encryption at Rest with CMEK** を有効にし、既存の KMS キーを選択します。作成するクラスターと同じリージョンにある KMS キーのみを選択できます。

1. 概要を確認して、**Create Cluster** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **Overview** ページでは、上の図に示すように、クラスター名の右側にキーアイコンが表示されます。暗号化されたクラスターで作成されたすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

### 暗号化されたバックアップファイルから復元する\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud はバックアップファイルに関連付けられた KMS キーを使用して、復元する前にデータを復号します。そのため、暗号化の有無にかかわらず、バックアップを新しいクラスターに復元できます。

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、**Encryption at Rest with CMEK** を有効にするかどうかを除いて、通常の復元とほぼ同じです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にすると、復元後に作成されるクラスターは、以下で指定した KMS キーを使用して暗号化されます。

- このオプションを無効にすると、復元後に作成されるクラスターは暗号化されません。
