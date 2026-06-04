---
title: "データのインポート（コンソール） | BYOC"
slug: /import-data-on-web-ui
sidebar_key: import-data-on-web-ui
sidebar_label: "コンソール"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud コンソールで準備したデータをインポートする方法を紹介します。 | BYOC"
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

このページでは、Zilliz Cloud コンソールで準備済みのデータをインポートする方法を紹介します。

## Web UI でデータをインポートする\{#import-data-on-the-web-ui}

データファイルの準備ができたら、オブジェクトストレージバケットにアップロードしてデータインポートを行うことができます。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>コレクション内で実行中または保留中のインポートジョブは最大 10,000 件まで設定できます。</p></li>
<li><p>Web コンソールでは、最大 1 GB のローカル JSON または Parquet ファイルをアップロードできます。より大きなファイルの場合は、代わりに<a href="./import-data-on-web-ui#remote-files-from-an-object-storage-bucket">オブジェクトストレージからのアップロード</a>を推奨します。データインポートで問題が発生した場合は、<a href="https://support.zilliz.com/hc/en-us">サポートチケットを作成</a>してください。</p></li>
</ul>

</Admonition>

### オブジェクトストレージバケットのリモートファイル\{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずリモートバケットにアップロードする必要があります。生データをサポートされている形式に変換し、[BulkWriter ツールを使用して](./use-bulkwriter)結果ファイルをアップロードできます。

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、リモートバケット内のファイルパスと、Zilliz Cloud がバケットからデータを取得するためのバケット認証情報を入力します。

データセキュリティ要件に応じて、データインポート時に長期認証情報または短期トークンのいずれかを使用できます。

認証情報の取得についての詳細は、以下を参照してください：

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

短期トークンの使用についての詳細は、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud では、クラスタをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスタにデータをインポートできるようになりました。たとえば、AWS S3 バケットから GCP にデプロイされた Zilliz Cloud クラスタにデータをインポートできます。</p>
<p>低レイテンシで安定したエクスペリエンスを確保するために、ターゲットクラスタと同じプロバイダ、同じリージョンのバケットまたは BLOB コンテナを使用することをお勧めします。</p>

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

## 結果の確認\{#verify-results}

インポートジョブの進捗状況とステータスは、[ジョブ](./job-center)ページで確認できます。

## サポートされているオブジェクトパス\{#supported-object-paths}

適用可能なオブジェクトパスについては、[ストレージオプション](./data-import-storage-options)および[フォーマットオプション](./data-import-format-options)を参照してください。

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful API でデータをインポート](./import-data-via-restful-api)

- [SDK でデータをインポート](./import-data-via-sdks)

- [データインポート実践ガイド](./data-import-zero-to-hero)
