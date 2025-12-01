---
title: "データのインポート（コンソール） | Cloud"
slug: /import-data-on-web-ui
sidebar_label: "コンソール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloudコンソールで準備したデータをインポートする方法を紹介します。 | Cloud"
type: origin
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - data import
  - console
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# データのインポート（コンソール）

このページでは、Zilliz Cloudコンソールで準備したデータをインポートする方法を紹介します。

## Web UIでのデータインポート\{#import-data-on-the-web-ui}

データファイルの準備ができたら、ローカルドライブから直接インポートするか、AWS S3やGoogle Cloud GCS、Azure Blob Storageなどのオブジェクトストレージバケットにアップロードしてデータインポートを行うことができます。

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p>コレクションには最大で10,000件の実行中または保留中のインポートジョブを持つことができます。</p></li>
<li><p>Webコンソールでは、最大1 GBのローカルJSONファイルまたはParquetファイルのアップロードをサポートしています。より大きなファイルの場合は、代わりに<a href="./import-data-on-web-ui#remote-files-from-an-object-storage-bucket">オブジェクトストレージからのアップロード</a>を推奨します。データインポートに関する問題が発生した場合は、<a href="https://support.zilliz.com/hc/en-us">サポートチケットを作成</a>してください。</p></li>
</ul>

</Admonition>

### ローカルファイル\{#local-file}

Zilliz Cloudは、ローカルJSONファイルまたはParquetファイルからのデータインポートをサポートしています。データがNumPy形式で準備されている場合は、[オブジェクトストレージバケット](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket)からのインポートを行ってください。

ローカルファイルからデータをインポートするには、ファイルをアップロード領域にドラッグ&ドロップして、**インポート**をクリックしてください。

<Supademo id="cme7x3fgv388ch3pyymi6ek0q?utm_source=link" title=""  />

### オブジェクトストレージバケットからのリモートファイル\{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずリモートバケットにアップロードする必要があります。生データをサポートされている形式に変換し、[BulkWriterツール](./use-bulkwriter)を使用して結果のファイルをアップロードできます。

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、リモートバケット内のファイルパスとバケットの認証情報を入力して、Zilliz Cloudがバケットからデータをプルできるようにします。

データセキュリティ要件に応じて、データインポート中に長期認証情報または短期トークンのいずれかを使用できます。

認証情報の取得方法の詳細については、以下を参照してください：

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントのHMACキーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

短期トークンの使用方法の詳細については、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>Zilliz Cloudでは、クラスターをホストしているクラウドプロバイダに関係なく、任意のオブジェクトストレージサービスから任意のZilliz Cloudクラスターにデータをインポートできます。たとえば、AWS S3バケットからGCPに展開されたZilliz Cloudクラスターにデータをインポートできます。</p>

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

## 結果の確認\{#verify-results}

インポートジョブの進行状況とステータスは、[ジョブ](./job-center)ページで確認できます。

## サポートされているオブジェクトパス\{#supported-object-paths}

対応するオブジェクトパスについては、[ストレージオプション](./data-import-storage-options)および[フォーマットオプション](./data-import-format-options)を参照してください。

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful APIを使用したデータのインポート](./import-data-via-restful-api)

- [SDKを使用したデータのインポート](./import-data-via-sdks)

- [データインポートハンズオン](./data-import-zero-to-hero)
