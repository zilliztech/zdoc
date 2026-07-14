---
title: "データのインポート（Console） | BYOC"
slug: /import-data-on-web-ui
sidebar_label: "Console"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールで準備済みデータをインポートする方法を紹介します。 | BYOC"
type: origin
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# データのインポート（Console）

このページでは、Zilliz Cloud コンソールで準備済みデータをインポートする方法を紹介します。

## Web UI でデータをインポートする\{#import-data-on-the-web-ui}

データファイルの準備ができたら、データインポート用にオブジェクトストレージバケットへアップロードできます。

<Admonition type="info" icon="📘" title="📘 注意">

- 1 つのコレクションでは、実行中または保留中のインポートジョブを最大 10,000 件まで保持できます。

- Web コンソールでは、最大 1 GB のローカル JSON または Parquet ファイルのアップロードをサポートしています。より大きなファイルについては、代わりに[オブジェクトストレージからアップロードする](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket)ことをおすすめします。データインポートで問題が発生した場合は、[サポートチケットを作成](https://support.zilliz.com/hc/en-us)してください。

</Admonition>

### オブジェクトストレージバケット上のリモートファイル\{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずそれらをリモートバケットにアップロードする必要があります。生データをサポート対象の形式に簡単に変換し、結果ファイルを[BulkWriter ツールを使用して](./use-bulkwriter)アップロードできます。 

準備済みファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、リモートバケット内のファイルへのパスと、Zilliz Cloud がそのバケットからデータを取得するためのバケット認証情報を入力します。 

データセキュリティ要件に応じて、データインポート時には長期認証情報または短期トークンのいずれかを使用できます。 

認証情報の取得方法の詳細については、以下を参照してください。

- Amazon S3: [長期認証情報を使用して認証する](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービス アカウントの HMAC キーを管理する](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウント アクセス キーを表示する](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

短期トークンの使用方法の詳細については、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud では現在、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターにデータをインポートできます。たとえば、AWS S3 バケットから GCP 上にデプロイされた Zilliz Cloud クラスターへデータをインポートできます。

低レイテンシで安定した体験を確保するため、ターゲットクラスターと同じプロバイダーかつ同じリージョンにあるバケットまたは BLOB コンテナーを使用することをおすすめします。

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

## 結果を確認する\{#verify-results}

インポートジョブの進行状況とステータスは、[Jobs](./job-center) ページで確認できます。

## サポートされるオブジェクトパス\{#supported-object-paths}

適用可能なオブジェクトパスについては、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。

## 関連トピック\{#related-topics}

- [Storage Options](./data-import-storage-options)

- [Format Options](./data-import-format-options)

- [RESTful API によるデータのインポート](./import-data-via-restful-api)

- [SDK によるデータのインポート](./import-data-via-sdks)

- [データインポート ハンズオン](./data-import-zero-to-hero)

