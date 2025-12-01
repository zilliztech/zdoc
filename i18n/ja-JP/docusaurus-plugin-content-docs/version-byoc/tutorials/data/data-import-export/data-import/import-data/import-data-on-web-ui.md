---
title: "データのインポート（コンソール） | BYOC"
slug: /import-data-on-web-ui
sidebar_label: "コンソール"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloudコンソールで準備したデータをインポートする方法を紹介します。| BYOC"
type: origin
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - data import
  - console
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# データのインポート（コンソール）

このページでは、Zilliz Cloudコンソールで準備したデータをインポートする方法を紹介します。

## Web UIでのデータインポート\{#import-data-on-the-web-ui}

データファイルの準備ができたら、データインポート用にオブジェクトストレージバケットにアップロードできます。

<Admonition type="info" icon="📘" title="注意">

<ul>
<li><p>1つのコレクションには最大10,000個の実行中または保留中のインポートジョブを持つことができます。</p></li>
<li><p>Webコンソールは最大1GBのローカルJSONまたはParquetファイルのアップロードをサポートしています。それより大きなファイルについては、代わりに<a href="./import-data-on-web-ui#remote-files-from-an-object-storage-bucket">オブジェクトストレージからのアップロード</a>を使用することを推奨します。データインポートに関する問題がある場合は、<a href="https://support.zilliz.com/hc/en-us">サポートチケットを作成</a>してください。</p></li>
</ul>

</Admonition>

### オブジェクトストレージバケットからのリモートファイル\{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずリモートバケットにアップロードする必要があります。[バッチライターツール](./use-bulkwriter)を使用して、生データをサポートされている形式に変換し、結果のファイルをアップロードできます。

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、リモートバケット内のファイルへのパスとバケットの認証情報を入力して、Zilliz Cloudがバケットからデータを取得できるようにします。

データセキュリティ要件に基づき、データインポート中に長期認証情報または短期トークンのいずれかを使用できます。

認証情報の取得方法については、以下を参照してください。

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントのHMACキーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

短期トークンの使用方法については、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>Zilliz Cloudでは、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意のZilliz Cloudクラスターへのデータインポートが可能になりました。たとえば、AWS S3バケットからGCPにデプロイされたZilliz Cloudクラスターにデータをインポートできます。</p>

</Admonition>

<Supademo id="cme7xfbw40096xf0irz21196r?utm_source=link" title=""  />

## 結果の確認\{#verify-results}

インポートジョブの進行状況とステータスは、[ジョブ](./job-center)ページで確認できます。

## サポートされているオブジェクトパス\{#supported-object-paths}

適用可能なオブジェクトパスについては、[ストレージオプション](./data-import-storage-options)および[フォーマットオプション](./data-import-format-options)を参照してください。

## 関連トピック\{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [フォーマットオプション](./data-import-format-options)

- [RESTful API経由でのデータインポート](./import-data-via-restful-api)

- [SDK経由でのデータインポート](./import-data-via-sdks)

- [データインポートハンズオン](./data-import-zero-to-hero)
