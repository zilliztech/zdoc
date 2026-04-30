---
title: "データのインポート (コンソール) | BYOC"
slug: /import-data-on-web-ui
sidebar_key: import-data-on-web-ui
sidebar_label: "コンソール"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールで準備済みのデータをインポートする方法について説明します。| BYOC"
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

データファイルの準備が整ったら、オブジェクトストレージバケットにアップロードしてデータインポートを実行できます。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>コレクション内で実行中または保留中のインポートジョブは、最大 10,000 件まで保有できます。</p></li>
<li><p>Web コンソールでは、最大 1 GB のローカル JSON ファイルまたは Parquet ファイルをアップロードできます。より大きなファイルの場合は、[オブジェクトストレージからのアップロード](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) を推奨します。データインポートでお困りの場合は、[サポートチケットを作成](https://support.zilliz.com/hc/en-us) してください。</p></li>
</ul>

</Admonition>

### オブジェクトストレージバケットからのリモートファイル\{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずそれらをリモートバケットにアップロードする必要があります。生データをサポートされている形式に簡単に変換し、[BulkWriter ツールを使用して](./use-bulkwriter) 結果ファイルをアップロードできます。

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、Zilliz Cloud がバケットからデータを取得できるよう、リモートバケット内のファイルへのパスとバケットの認証情報を入力します。

データのセキュリティ要件に応じて、データインポート時に長期認証情報または短期トークンのいずれかを使用できます。

認証情報の取得方法の詳細については、以下を参照してください：

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

短期トークンの使用方法の詳細については、[こちらの FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud では、クラスターをホストするクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターへデータをインポートできるようになりました。たとえば、GCP にデプロイされた Zilliz Cloud クラスターに AWS S3 バケットからデータをインポートできます。</p>

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

## 結果の確認\{#verify-results}

インポートジョブの進捗状況とステータスは、[ジョブ](./job-center) ページで確認できます。

## サポートされるオブジェクトパス\{#supported-object-paths}

利用可能なオブジェクトパスについては、[ストレージオプション](./data-import-storage-options) および [フォーマットオプション](./data-import-format-options) を参照してください。

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful API 経由でのデータのインポート](./import-data-via-restful-api)

- [SDK 経由でのデータのインポート](./import-data-via-sdks)

- [データインポートハンズオン](./data-import-zero-to-hero)

