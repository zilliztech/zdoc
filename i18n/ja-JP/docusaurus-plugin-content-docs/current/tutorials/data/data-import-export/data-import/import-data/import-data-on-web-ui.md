---
title: "データのインポート（コンソール） | Cloud"
slug: /import-data-on-web-ui
sidebar_key: import-data-on-web-ui
sidebar_label: "コンソール"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールで準備済みのデータをインポートする方法について説明します。 | Cloud"
type: origin
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - データインポート
  - コンソール

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# データのインポート (コンソール)

このページでは、Zilliz Cloud コンソールで準備済みのデータをインポートする方法について説明します。

## Web UI でのデータのインポート\{#import-data-on-the-web-ui}

データファイルの準備が整ったら、ローカルドライブから直接インポートするか、AWS S3、Google Cloud GCS、Azure Blob Storage などのオブジェクトストレージバケットにアップロードして データインポート に使用できます。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>コレクション内で実行中または保留中のインポートジョブは最大 10,000 件まで可能です。</p></li>
<li><p>Web コンソールでは、最大 1 GB のローカル JSON ファイルまたは Parquet ファイルをアップロードできます。より大きなファイルの場合は、[オブジェクトストレージからアップロード](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) することをお勧めします。データのインポートに関して問題がある場合は、[サポートチケットを作成](https://support.zilliz.com/hc/en-us) してください。</p></li>
</ul>

</Admonition>

### ローカルファイル\{#local-file}

Zilliz Cloud は、ローカルの JSON ファイルまたは Parquet ファイルからのデータのインポートをサポートしています。データが NumPy 形式で準備されている場合は、[オブジェクトストレージバケット](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) からインポートしてください。

ローカルファイルからデータをインポートするには、ファイルをアップロードエリアにドラッグアンドドロップし、**Import** をクリックします。

<Supademo id="cme7x3fgv388ch3pyymi6ek0q?utm_source=link" title=""  />

### オブジェクトストレージバケットからのリモートファイル\{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずそれらをリモートバケットにアップロードする必要があります。生データをサポートされている形式に簡単に変換し、[BulkWriter ツールを使用して](./use-bulkwriter) 結果のファイルをアップロードできます。

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、Zilliz Cloud がバケットからデータを取得できるように、リモートバケット内のファイルへのパスとバケットの認証情報を入力します。

データのセキュリティ要件に基づき、データのインポート時に長期認証情報または短期トークンのいずれかを使用できます。

認証情報の取得方法の詳細については、以下を参照してください：

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

短期トークンの使用方法の詳細については、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud では、クラスターをホストするクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターへデータをインポートできるようになりました。たとえば、GCP にデプロイされた Zilliz Cloud クラスターに AWS S3 バケットからデータをインポートできます。</p>

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

### ボリュームから\{#from-a-volume}

- **マネージドボリューム**: ローカルファイルが非常に大きい (> 1GB) 場合、まず [ファイルをマネージドボリュームにアップロード](null) し、その後ボリュームからインポートできます。準備したファイルをボリュームにアップロードしたら、ファイルパスをコピーし、コレクションへのファイルのインポートを続行します。

- **外部ボリューム**: データファイルがクラウドオブジェクトストレージバケットにある場合、そのバケットにマップする [外部ボリューム](null) を作成できます。これにより、毎回認証情報を提供することなく、外部ボリュームから直接データをインポートできます。

以下のデモでは、マネージドボリュームからデータをインポートする方法を示しています。

<Supademo id="cmidzr662adilb7b4d7l45rnf?utm_source=link" title=""  />

## 結果の確認\{#verify-results}

[ジョブ](./job-center) ページで、インポートジョブの進捗状況とステータスを確認できます。

## サポートされるオブジェクトパス\{#supported-object-paths}

適用可能なオブジェクトパスについては、[ストレージオプション](./data-import-storage-options) および [フォーマットオプション](./data-import-format-options) を参照してください。

## FAQ\{#faq}

**外部ボリュームと外部ストレージからの直接インポートの違いは何ですか？**

どちらも、独自の S3 または GCS バケットからデータをインポートできます。主な違いは以下の通りです：

- 外部ボリュームは、認証情報管理のために [ストレージ統合](null) を使用します。認証情報は一度設定され、複数のボリュームおよび操作間で再利用されます。データエンジニアはクラウドストレージキーに直接アクセスする必要はありません。

- 直接 [外部ストレージインポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、各インポートリクエストとともに認証情報（アクセスキー、シークレットキー）をインラインで提供する必要があります。これはワンタイムのインポートにはシンプルですが、認証情報の分離や再利用性は提供されません。

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful API 経由でのデータのインポート](./import-data-via-restful-api)

- [SDK 経由でのデータのインポート](./import-data-via-sdks)

- [データインポートハンズオン](./data-import-zero-to-hero)

