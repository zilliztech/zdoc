---
title: "データのインポート（コンソール） | Cloud"
slug: /import-data-on-web-ui
sidebar_key: import-data-on-web-ui
sidebar_label: "コンソール"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールで準備したデータをインポートする方法を紹介します。"
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

# データインポート（コンソール）

このページでは、Zilliz Cloud コンソールで準備したデータをインポートする方法を紹介します。

## Web UI でデータをインポートする\{#import-data-on-the-web-ui}

データファイルの準備ができたら、ローカルドライブから直接インポートするか、AWS S3 や Google Cloud GCS、Azure Blob Storage などのオブジェクトストレージバケットにアップロートしてデータインポートを行うことができます。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>コレクション内で実行中または保留中のインポートジョブは最大 10,000 件まで作成できます。</p></li>
<li><p>Web コンソールでは、最大 1 GB のローカル JSON または Parquet ファイルのアップロードをサポートしています。より大きなファイルの場合は、代わりに<a href="./import-data-on-web-ui#remote-files-from-an-object-storage-bucket">オブジェクトストレージからのアップロード</a>を推奨します。データインポートで問題が発生した場合は、<a href="https://support.zilliz.com/hc/en-us">サポートチケットを作成</a>してください。</p></li>
</ul>

</Admonition>

### ローカルファイル\{#local-file}

Zilliz Cloud は、ローカルの JSON または Parquet ファイルからのデータインポートをサポートしています。データが NumPy 形式で準備されている場合は、[オブジェクトストレージバケット](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket)からインポートしてください。

ローカルファイルからデータをインポートするには、ファイルをアップロードエリアにドラッグまたはドロップし、**Import** をクリックします。

<Supademo id="cme7x3fgv388ch3pyymi6ek0q?utm_source=link" title=""  />

### オブジェクトストレージバケットからのリモートファイル\{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずリモートバケットにアップロードする必要があります。生データをサポートされている形式に簡単に変換し、[BulkWriter ツールを使用して](./use-bulkwriter)結果ファイルをアップロードできます。

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、リモートバケット内のファイルパスと、Zilliz Cloud がバケットからデータを取得するためのバケット認証情報を入力します。

データセキュリティ要件に応じて、データインポート時に長期認証情報または短期トークンのいずれかを使用できます。

認証情報の取得についての詳細は、以下を参照してください：

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

短期トークンの使用についての詳細は、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud では、クラスタをホストしているクラウドプロバイダに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスタにデータをインポートできるようになりました。たとえば、AWS S3 バケットから GCP にデプロイされた Zilliz Cloud クラスタにデータをインポートできます。</p>
<p>低レイテンシで安定したエクスペリエンスを確保するために、ターゲットクラスタと同じプロバイダ、同じリージョンのバケットまたは BLOB コンテナを使用することをお勧めします。</p>

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

### ボリュームから\{#from-a-volume}

- **マネージドボリューム**: ローカルファイルが非常に大きい場合（> 1GB）、[ファイルをマネージドボリュームにアップロード](./managed-volume)してからボリュームからインポートできます。準備したファイルをボリュームにアップロードしたら、ファイルパスをコピーして、コレクションにファイルをインポートし続けます。

- **外部ボリューム**: データファイルがクラウドオブジェクトストレージバケットにある場合は、そのバケットにマッピングする[外部ボリューム](./external-volume)を作成できます。その後、外部ボリュームから直接データをインポートでき、毎回認証情報を提供する必要はありません。

以下のデモでは、マネージドボリュームからデータをインポートする方法を示しています。

<Supademo id="cmidzr662adilb7b4d7l45rnf?utm_source=link" title=""  />

## 結果の確認\{#verify-results}

インポートジョブの進捗とステータスは、[ジョブ](./job-center)ページで確認できます。

## サポートされているオブジェクトパス\{#supported-object-paths}

適用可能なオブジェクトパスについては、[ストレージオプション](./data-import-storage-options)および[フォーマットオプション](./data-import-format-options)を参照してください。

## FAQ\{#faq}

**外部ボリュームと外部ストレージからの直接インポートの違いは何ですか？**

どちらも独自の S3 または GCS バケットからデータをインポートできます。主な違いは以下の通りです：

- 外部ボリュームでは、[AWS S3 バケット](./integrate-with-aws-s3)、[Google Cloud Storage バケット](./integrate-with-gcp)、または [Microsoft Azure BLOB ストレージコンテナ](./integrate-with-azure-blob-storage)を Zilliz Cloud と統合して認証情報を管理する必要があります。認証情報は一度設定され、複数のボリュームや操作で再利用されます。データエンジニアはクラウドストレージキーに直接アクセスする必要はありません。

- 直接の[外部ストレージインポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket)では、各インポートリクエストで認証情報（アクセスキー、シークレットキー）をインラインで提供する必要があります。これは一度きりのインポートにはシンプルですが、認証情報の分離や再利用性は提供しません。

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful API でデータをインポート](./import-data-via-restful-api)

- [SDK でデータをインポート](./import-data-via-sdks)

- [データインポート実践ガイド](./data-import-zero-to-hero)
