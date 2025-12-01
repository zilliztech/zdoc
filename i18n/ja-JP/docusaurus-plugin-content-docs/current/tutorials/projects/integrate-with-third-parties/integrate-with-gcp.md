---
title: "Google Cloud Storageとの統合 | Cloud"
slug: /integrate-with-gcp
sidebar_label: "Google Cloud Storage"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、Google Cloud Storageと統合して、監査ログまたはバックアップファイルを指定されたバケットにエクスポートできます。 | Cloud"
type: origin
token: INoRwFTjfiindPkaNlwc9XAgnkh
sidebar_position: 2
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - サードパーティ
  - サービス
  - google
  - クラウド
  - ストレージ
  - ベクトル埋め込みとは
  - ベクターデータベースチュートリアル
  - ベクターデータベースの仕組み
  - ベクターデータベース比較

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Google Cloud Storageとの統合

Zilliz Cloudでは、[Google Cloud Storage](https://cloud.google.com/storage)と統合して、監査ログまたはバックアップファイルを指定されたバケットにエクスポートできます。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>エンタープライズ</strong>プロジェクト内の<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

以下の図は、Zilliz CloudおよびGoogle管理コンソールで必要な手順を示しています。

![UNmxw6LdCh60Dob3j7KcHGxynkg](/img/UNmxw6LdCh60Dob3j7KcHGxynkg.png)

## 始める前に\{#before-you-start}

- Zilliz CloudをGCPと統合するには、プロジェクトに**組織オーナー**または**プロジェクト管理者**のアクセス権が必要です。必要な権限がない場合は、Zilliz Cloud管理者に連絡してください。

- Google管理コンソールへの管理アクセス権が必要です。

## ステップ1：Zilliz Cloudコンソールで統合を開始\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmdzpf4ze0t2bh5wkphtbn39l" title="ステップ1：Zilliz Cloudコンソールで統合を開始" />

1. [Zilliz Cloudコンソール](https://cloud.zilliz.com/login)にログインします。

1. プロジェクトページで、左側のナビゲーションペインから**統合**に移動します。

1. **Google Cloud Storageバケット**セクションで、**+ 統合**をクリックします。

1. 表示されるダイアログボックスで、**基本設定**を完了します：

    - **統合名**：この統合の一意の名前（例：`bucket_for_auditlog`）。

    - **統合の説明**（オプション）：この統合の説明（例：`for auditlog export`）。

    次に、**次へ**をクリックして[ステップ2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console)に進みます。

## ステップ2：Google管理コンソールでロールを作成\{#step-2-create-a-role-in-google-admin-console}

<Supademo id="cmdzqastn0uw1h5wklj65425w" title="ステップ2：Google管理コンソールでロールを作成" />

1. [Google管理コンソール](https://admin.google.com/)にログインします。

1. [IAM＆管理/ロール](https://console.cloud.google.com/iam-admin/roles)ページに移動し、**+ ロールの作成**をクリックします。

1. 表示されるページで、ロール設定を構成し、ロールに権限を追加します：

    1. ロールの**タイトル**と**ID**をカスタマイズします（例：`ZillizBucketRole`）およびオプションで**説明**を追加

    1. **+ 権限の追加**をクリックし、ロールに以下の最小限の権限を割り当てます：

        - `storage.buckets.get`

        - `storage.objects.create`

        - `storage.objects.list`

        - `storage.objects.get`

1. **作成**をクリックします。

## ステップ3：Google管理コンソールでバケットを作成\{#step-3-create-a-bucket-in-google-admin-console}

<Supademo id="cme0qzcy102dbg56jx7ucft1c" title="ステップ3：Google管理コンソールでバケットを作成（1）" />

1. Google Cloud Storageの**[バケット](https://console.cloud.google.com/storage/browser)**ページに移動します。

1. **+ 作成**をクリックします。

1. **バケットの作成**ページで、バケット情報入力します。以下の各手順ごとに**次へ**をクリックして、次の手順に進みます：

    1. **開始**セクションで、[バケット名の要件](https://cloud.google.com/storage/docs/buckets#naming)を満たすグローバルに一意な名前を入力します。Zilliz Cloudコンソールでバケット名を入力する必要があるため、バケット名を記憶してください。

    1. **データを保存する場所を選択**セクションで：

        1. [場所の種類](https://cloud.google.com/storage/docs/locations)として**リージョン**を選択します。**マルチリージョン**または**デュアルリージョン**オプションを選択しないでください。

        1. 次に、バケットを作成するリージョンを選択します。選択した場所は、Zilliz Cloudクラスターが存在するクラウドリージョンと同じでなければなりません。

1. **作成**をクリックします。

バケットが作成されたら、[Zilliz Cloudコンソール](https://cloud.zilliz.com/login)に戻り、以下のことを行ってください：

<Supademo id="cme0rnexv02mng56joiwb4wrg" title="ステップ3：Google管理コンソールでバケットを作成（2）" />

1. **Google Cloud Storage統合の追加**ダイアログボックスで、**ステップ3 - Google Cloud Storageバケットの作成**に進みます

    1. **Zilliz Cloudクラスターリージョン**で、Zilliz Cloudクラスターのクラウドリージョンを選択します。このリージョンは、バケットが作成されたリージョンと同じでなければなりません。

    1. **バケット名**で、作成したバケットの名前を入力します。

1. 次に、**次へ**をクリックします。

1. 次に、Zilliz CloudコンソールからGoogle Cloudサービスアカウントをコピーします。これは[ステップ4](./integrate-with-gcp#step-4-grant-access-to-bucket-in-google-admin-console)でバケットへのアクセスを許可するときに必要になります。

## ステップ4：Google管理コンソールでバケットへのアクセスを許可\{#step-4-grant-access-to-bucket-in-google-admin-console}

<Supademo id="cme0s7wmr02phg56jw9hix3q1" title="ステップ4：Google管理コンソールでバケットへのアクセスを許可" />

1. [Google管理コンソール](https://console.cloud.google.com/storage/)で、[ステップ3](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console)で作成したバケットの詳細ページに移動します。

1. **権限**タブで、**アクセスの許可**をクリックします。

1. **プリンシパルの追加**エリアで、Zilliz Cloudコンソールから取得した**Googleサービスアカウント**を貼り付けます。

1. **ロールの割り当て**エリアで、[ステップ2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console)で作成したロールを選択します。

1. **保存**をクリックします。

## ステップ5：検証して統合を追加\{#step-5-validate-and-add-integration}

<Supademo id="cme0siceh02thg56jeh3wlbgw" title="ステップ5：検証して統合を追加" />

バケットへのアクセスを許可すると、Zilliz Cloudコンソールに戻り、以下のことを行ってください：

1. **統合の検証**をクリックして、コンテナーとロール割り当ての設定が有効であることを確認します。

1. 検証が成功すると、**追加**をクリックして統合を確定します。

Google Cloud Storageは、監査ログまたはバックアップファイルをエクスポートするためにZilliz Cloudと統合されました。詳細については、[監査ログ](./audit-logs)または[バックアップファイルのエクスポート](./export-backup-files)を参照してください。

## 統合の管理\{#manage-integrations}

統合が追加されると、その詳細を表示したり、必要に応じて統合を削除したりできます。

![FKLYbB02LoDDA9xENiYccBTun5e](/img/FKLYbB02LoDDA9xENiYccBTun5e.png)

## FAQ\{#faq}

### 検証中に「バケットリージョンが一致しません」エラーが発生するのはなぜですか？\{#why-do-i-get-a-bucket-region-not-match-error-during-validation}

このエラーは2つの理由で発生する可能性があります：

1. バケットの**場所の種類**として**マルチリージョン**または**デュアルリージョン**を選択しました。Zilliz Cloudはシングル**リージョン**バケットのみをサポートします。

1. **場所の種類**として**リージョン**を選択しましたが、選択したリージョンがZilliz Cloudクラスターのリージョンと正確に一致していません。

たとえば、Zilliz Cloudクラスターが`us-east1`にある場合、`us-east1`リージョンにバケットを作成する必要があります。マルチリージョンの「米国」ではなく、`us-west1`のような異なるリージョンでもありません。

バケットが間違った**場所の種類**またはリージョンで作成された場合は、削除して正しいシングルリージョン設定で再作成してください。