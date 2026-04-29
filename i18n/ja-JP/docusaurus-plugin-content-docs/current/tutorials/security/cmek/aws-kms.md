---
title: "AWS KMS | Cloud"
slug: /aws-kms
sidebar_key: aws-kms
sidebar_label: "AWS KMS"
beta: FALSE
notebook: FALSE
description: "AWS Key Management Service (KMS) は、データの暗号化や署名に使用するキーの作成と制御を容易にする、AWS が管理するサービスです。| Cloud"
type: origin
token: FOamwIi07ia7kpkBPW8cEuIpniu
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cmek
  - aws kms

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# AWS KMS

AWS キー Management Service (KMS) は、データの暗号化や署名に使用するキーの作成と制御を容易にする AWS 管理サービスです。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 概要\{#overview}

通常、Zilliz Cloud クラスター内のデータを暗号化するために直接 KMS キーを使用することはありません。代わりに、KMS キーを使用して暗号化ゾーンキー（EZK）を暗号化し、EZK を使用してデータ暗号化キー（DEK）を暗号化し、DEK を使用してデータを暗号化します。

![YJRcwu5BLhm8Hub1eiZcDiIdnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YJRcwu5BLhm8Hub1eiZcDiIdnDh.png)

暗号化の仕組みとその範囲の詳細については、[このセクション](./cmek#how-encryption-works) を参照してください。CMEK 機能の制限事項の詳細については、[このセクション](./cmek#limitations) を参照してください。CMEK 機能を使用するには、このページの手順に従ってください。

## 開始前に\{#before-you-start}

- AWS CLI がインストールされているか、AWS CloudShell にアクセスできること。

    詳細については、[このページ](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) を参照してください。

- KMS 関連のコマンドを実行するための十分な権限を持っていること。

## KMS キーの追加\{#add-a-kms-key}

各プロジェクトでは、KMS プロバイダーに関係なく最大 **20** 個のキーを追加できます。既存の KMS キーを追加するか、Zilliz Cloud コンソールの指示に従って KMS キーを作成し、Zilliz Cloud に追加することができます。

## 手順\{#procedures}

[Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、いずれかの **ビジネスクリティカル** プロジェクトに入り、左側のナビゲーションペインから **ネットワーク** > **CMEK** を選択し、**+ CMEK** をクリックして、**Add CMEK (AWS KMS)** ダイアログボックスの手順に従って処理を完了します。

開始する前に、この手順で使用する IAM ロールを決定する必要があります。IAM ロールは、KMS キーの追加に使用されると Zilliz Cloud に一覧表示されます。**Existing IAM ロール** タブの **Select AWS IAM ロール** ステップにあるドロップダウンリストを確認し、必要な IAM ロールが一覧表示されているかどうかを判断します。

- はいの場合、[既存のロールを使用して KMS キーを追加する](./aws-kms#add-a-kms-key-using-an-existing-role) に進みます。

- それ以外の場合、[新しいロールを使用して KMS キーを追加する](./aws-kms#add-a-kms-key-using-a-new-role) に進みます。

### 既存のロールを使用して KMS キーを追加する\{#add-a-kms-key-using-an-existing-role}

**Existing IAM ロール** タブの **Select AWS IAM ロール** にあるドロップダウンリストに必要な IAM ロールが含まれている場合は、このセクションの手順に従います。

<Procedures>

1. **Select AWS IAM ロール** ステップでドロップダウンをクリックし、IAM ロールを選択して **Next** をクリックします。

    ![O6IxwU89jhUTHDbShkfcHzZFn00](https://zdoc-images.s3.us-west-2.amazonaws.com/O6IxwU89jhUTHDbShkfcHzZFn00.png)

1. KMS キーを追加します。

    ![ENW6wuQVlhaRntbKYDDcrdegnNL](https://zdoc-images.s3.us-west-2.amazonaws.com/ENW6wuQVlhaRntbKYDDcrdegnNL.png)

    1. ステップ 1 で対象リージョンを選択します。

    1. **(オプション)** ステップ 2 のコマンドをコピーし、AWS CloudShell で実行します。

        このステップはオプションです。指定された IAM ロールで作成された KMS キーがすでに存在する場合は、このステップをスキップして次に進むことができます。これは、マルチリージョンレプリカキーを追加する場合に役立ちます。

        <Admonition type="info" icon="📘" title="Notes">

        <p>暗号化された Zilliz Cloud クラスターをあるクラウドリージョンから別のリージョンにバックアップした場合、ターゲットリージョンでバックアップを復号するには、元のクラスターを暗号化したのと同じキーを使用する必要があります。</p>
        <p>この場合、キーをバックアップをホストするリージョンにレプリケートし、既存の IAM ロールを使用して Zilliz Cloud に送信できます。</p>
        <p>マルチリージョンレプリカキーの作成の詳細については、AWS ドキュメントの<a href="https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-replicate.html">このページ</a>をお読みください。</p>

        </Admonition>

    1. 次の場所に KMS キー ARN をコピーして貼り付けます。

        - [AWS コンソール](https://console.aws.amazon.com/iam/home#/roles) 上の IAM ロールのポリシー。

            ロールリストでロールの名前をクリックし、**Permissions** タブでロールポリシーを見つけて、コピーした KMS キーを `Resource` ノードに追加します。

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

        - 上記の Zilliz Cloud のダイアログボックスのステップ 3。

    1. ダイアログボックスの下部にある **Validate KMS キー** をクリックします。

    1. 検証が成功したら、**Add** をクリックします。

</Procedures>

### 新しいロールを使用して KMS キーを追加する\{#add-a-kms-key-using-a-new-role}

**Existing IAM ロール** タブの **Select AWS IAM ロール** のドロップダウンリストに必要な IAM ロールが含まれていない場合は、このセクションの手順に従ってください。

<Procedures>

1. **New IAM ロール** をクリックします。

1. IAM ロールを作成し、その信頼ポリシーに Zilliz Cloud を追加します。

    Zilliz Cloud に一覧表示されていない場合は、IAM ロールを作成してください。これには、AWS CloudShell でコマンドを実行する必要があります。

    <Supademo id="cmkxdx3yy00txru0hopj1eiwg" title=""  />

    1. Zilliz Cloud コンソールから信頼ポリシーのファイル名をコピーし、AWS CloudShell で `vi` コマンドを実行して信頼ポリシーファイルを作成します。

        ```bash
        vi role-trust-policy.json
        ```

    1. **I** キーを押して挿入モードに入ります。

    1. **ステップ 1** の信頼ポリシー JSON をコピーし、ターミナルに貼り付けます。

    1. **ESC** キーを押し、`:wq` と入力して JSON ファイルを保存します。

    1. **ステップ 2** で作成するロールの名前を入力します。

    1. **ステップ 3** のコマンドをコピーし、ターミナルに貼り付けます。

    1. **Enter** キーを押してコマンドを実行します。

    1. コマンドの出力からロールの ARN をコピーし、**ステップ 4** のテキストボックスに貼り付けます。

    1. **次へ**をクリックします。

1. KMS キーを作成する

    <Supademo id="cmkxdwufl000isl0i5nfkxzvy" title=""  />

    1. **ステップ 1** でクラウドリージョンを選択します。

    1. **ステップ 2** のコマンドをコピーし、ターミナルに貼り付けます。

    1. **Enter** キーを押してコマンドを実行します。

    1. コマンドの出力からキーの ARN をコピーし、**ステップ 3** のテキストボックスに貼り付けます。

    1. **次へ**をクリックします。

1. KMS キーを IAM ロールに関連付ける

    <Supademo id="cmkxdx8eu00szs50igvo0f2ti" title=""  />

    1. `vi` コマンドを実行して、**ステップ 1** で必要なロールポリシー JSON ファイルを作成します。

    1. ステップ 2 のコマンドをコピーし、ターミナルに貼り付けます。

    1. **Enter** キーを押してコマンドを実行します。

    1. コマンドの実行が完了したら、ダイアログボックス下部の **KMS キーを検証** をクリックします。

    1. 検証が成功したら、**追加** をクリックします。

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<p>KMS キーを使用して Zilliz Cloud クラスターを暗号化する場合、クラスターは 10 分ごとにキーの可用性を確認します。キーが利用可能であると検出されて初めて、クラスターは利用可能になります。</p>

</Admonition>

## AWS KMS キーの管理\{#manage-aws-kms-keys}

Zilliz Cloud コンソールで追加された AWS KMS キーを表示できます。

![S3NKwZYR7hj6ocbkpIQcB66Unyg](https://zdoc-images.s3.us-west-2.amazonaws.com/S3NKwZYR7hj6ocbkpIQcB66Unyg.png)

Zilliz Cloud は、リストされたキーの可用性を 10 分ごとにスキャンします。また、リストされた KMS キーのステータスに関するプロジェクトアラートを作成することもできます。詳細については、[プロジェクトアラートの管理](./manage-project-alerts#create-a-project-alert) を参照してください。

KMS キーが不要になった場合、どのクラスターもそのキーを使用していない限り、削除できます。

## AWS KMS キーの使用\{#use-aws-kms-keys}

KMS キーを Zilliz Cloud に追加すると、それを使用して暗号化されたクラスターを作成したり、バックアップおよび復元を行ったりできます。

### 暗号化されたクラスターの作成\{#create-an-encrypted-cluster}

クラスターを作成したいリージョンで利用可能な KMS キーを選択して、そのクラスターを暗号化できます。

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

KMS キーを追加した後、以下の手順で暗号化されたクラスターを作成できます。

<Procedures>

1. **デプロイオプションの選択** セクションで **専用** をクリックします。

1. クラスターのクラウドプロバイダーとリージョンを選択します。

1. **CMEK による保存時の暗号化** を有効にし、既存の KMS キーを選択します。選択できるのは、作成するクラスターと同じリージョンにある KMS キーのみです。

1. 概要を確認し、**クラスターの作成** をクリックします。

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    暗号化されたクラスターの **概要** ページには、上記の図に示すように、クラスター名の右側にキーのアイコンが表示されます。暗号化されたクラスター内で作成されたすべてのコレクションは、デフォルトで暗号化されます。

</Procedures>

### 暗号化されたバックアップファイルからの復元\{#restore-from-an-encrypted-backup-file}

暗号化されたバックアップを新しいクラスターに復元する場合、Zilliz Cloud は復元前にバックアップファイルに関連付けられた KMS キーを使用してデータを復号します。したがって、バックアップを暗号化ありまたはなしで新しいクラスターに復元できます。

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

暗号化されたバックアップからの復元手順は、**CMEK による保存時の暗号化** を有効にするかどうかを除き、通常の復元とほぼ同じです。

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- このオプションを有効にした場合、復元後に作成されたクラスターは、以下で指定された KMS キーを使用して暗号化されます。

- このオプションを無効にした場合、復元後に作成されたクラスターは暗号化されません。

