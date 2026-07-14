---
title: "データのインポート（Console） | Cloud"
slug: /import-data-on-web-ui
sidebar_label: "Console"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、準備したデータを Zilliz Cloud コンソールでインポートする方法を紹介します。 | Cloud"
type: origin
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# データのインポート（Console）

このページでは、準備したデータを Zilliz Cloud コンソールでインポートする方法を紹介します。

## Web UI でデータをインポートする\{#import-data-on-the-web-ui}

データファイルの準備ができたら、ローカルドライブから直接インポートするか、AWS S3、Google Cloud GCS、Azure Blob Storage などのオブジェクトストレージバケットにアップロードしてデータをインポートできます。

<Admonition type="info" icon="📘" title="📘 注意">

- 1 つの collection では、実行中または保留中のインポートジョブを最大 10,000 件まで保持できます。

- Web コンソールでは、最大 1 GB のローカル JSON または Parquet ファイルのアップロードをサポートしています。より大きいファイルについては、代わりに[オブジェクトストレージからアップロード](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket)することを推奨します。データのインポートで問題が発生した場合は、[サポートチケットを作成](https://support.zilliz.com/hc/en-us)してください。

</Admonition>

### ローカルファイル\{#local-file}

Zilliz Cloud は、ローカルの JSON または Parquet ファイルからのデータインポートをサポートしています。データが NumPy 形式で準備されている場合は、[オブジェクトストレージバケット](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket)からインポートしてください。

ローカルファイルからデータをインポートするには、アップロード領域にファイルをドラッグ＆ドロップして、**Import** をクリックします。

<Supademo id="cme7x3fgv388ch3pyymi6ek0q?utm_source=link" title=""  />

### オブジェクトストレージバケット内のリモートファイル\{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずそれらをリモートバケットにアップロードする必要があります。生データをサポートされている形式に簡単に変換し、結果ファイルを [BulkWriter ツールを使用して](./use-bulkwriter)アップロードできます。 

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、リモートバケット内のファイルパスと、Zilliz Cloud がバケットからデータを取得するためのバケット認証情報を入力します。 

データセキュリティ要件に応じて、データインポート時に長期認証情報または短期トークンのいずれかを使用できます。 

認証情報の取得方法の詳細については、次を参照してください。

- Amazon S3: [長期認証情報を使用して認証する](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーを管理する](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーを表示する](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

短期トークンの使用に関する詳細については、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud では現在、cluster をホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud cluster にデータをインポートできます。たとえば、AWS S3 バケットから GCP 上にデプロイされた Zilliz Cloud cluster にデータをインポートできます。

低レイテンシで安定した体験を確保するため、ターゲット cluster と同じプロバイダーかつ同じリージョンのバケットまたは blob container を使用することを推奨します。

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

### volume から\{#from-a-volume}

- **Managed volume**: ローカルファイルが非常に大きい場合（> 1GB）は、まず[ファイルを managed volume にアップロード](./managed-volume)してから、volume からインポートできます。準備したファイルを volume にアップロードしたら、ファイルパスをコピーし、そのまま collection へのファイルのインポートを続行します。

- **External volume**: データファイルがクラウドオブジェクトストレージバケット内にある場合は、そのバケットにマッピングされる [external volume](./external-volume) を作成できます。その後、毎回認証情報を指定することなく、external volume から直接データをインポートできます。

次のデモは、managed volume からデータをインポートする方法を示しています。

<Supademo id="cmidzr662adilb7b4d7l45rnf?utm_source=link" title=""  />

## 結果を確認する\{#verify-results}

インポートジョブの進行状況とステータスは、[Jobs](./job-center) ページで確認できます。

## サポートされているオブジェクトパス\{#supported-object-paths}

適用可能なオブジェクトパスについては、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。

## FAQ\{#faq}

**external volume と external storage からの直接インポートの違いは何ですか？**

どちらも、自分の S3 または GCS バケットからデータをインポートできます。主な違いは次のとおりです。

- external volume では、認証情報管理のために [AWS S3 bucket](./integrate-with-aws-s3)、[Google Cloud Storage bucket](./integrate-with-gcp)、または [Microsoft Azure blob storage container](./integrate-with-azure-blob-storage) を Zilliz Cloud と統合する必要があります。認証情報は一度設定すれば、複数の volume や操作で再利用できます。データエンジニアはクラウドストレージキーに直接アクセスする必要がありません。

- 直接の [external storage import](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、インポート要求ごとに認証情報（access key と secret key）を指定する必要があります。これは一度きりのインポートには簡単ですが、認証情報の分離や再利用性は提供されません。

## 関連トピック\{#related-topics}

- [Storage Options](./data-import-storage-options)

- [Format Options](./data-import-format-options)

- [RESTful API 経由でデータをインポート](./import-data-via-restful-api)

- [SDK 経由でデータをインポート](./import-data-via-sdks)

- [データインポート ハンズオン](./data-import-zero-to-hero)

