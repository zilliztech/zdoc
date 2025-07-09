---
title: "データのインポート(コンソール) | BYOC"
slug: /import-data-on-web-ui
sidebar_label: "Console"
beta: FALSE
notebook: FALSE
description: "このページでは、準備したデータをZilliz Cloudコンソールにインポートする方法を紹介します。 | BYOC"
type: origin
token: KkdswLx2bi4bgCkY6bEc7Do9neh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - console
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system

---

import Admonition from '@theme/Admonition';


# データのインポート(コンソール)

このページでは、準備したデータをZilliz Cloudコンソールにインポートする方法を紹介します。

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- クラスタが作成されました。詳細については、[クラスタ作成](./create-cluster)を参照してください。

- サポートされている形式のいずれかでデータを準備していること。 

    データの準備方法の詳細については、[ストレージオプション](./data-import-storage-options)と[書式オプション](./data-import-format-options)を参照してください。詳細については、エンドツーエンドのノートブック[データインポートハンズオン](./data-import-zero-to-hero)を参照してください。

- サンプルデータセットに一致するスキーマを持つコレクションを作成しました。 

    コレクションの作成の詳細については、[コレクションの管理(コンソール)](./manage-collections-console)を参照してください。

</include>

## ウェブUI上でデータをインポートする{#import-data-on-the-web-ui}

データファイルが準備できたら、オブジェクトストレージバケットにアップロードしてくださいデータのインポート

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>コレクションには、最大10,000件の実行中または保留中のインポートジョブを含めることができます。</p></li>
<li><p>ウェブコンソールは、最大1 GBのローカルJSONファイルのアップロードをサポートしています。より大きなファイルの場合は、<a href="./import-data-on-web-ui#remote-files-from-an-object-storage-bucket">オブジェクトストレージからのアップロード</a>を使用することをお勧めします。データのインポートに問題がある場合は、<a href="https://support.zilliz.com/hc/en-us">サポートチケットを作成する</a>を使用してください。</p></li>
</ul>

</Admonition>

### ローカルJSONファイル{#local-json-file}

データをインポートするには、ローカルファイルをアップロードエリアにドラッグアンドドロップして、**インポート**をクリックします。

![data-import-on-console](/img/data-import-on-console.png)

</exclude>

### オブジェクトストレージバケットからのリモートファイル{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずリモートバケットにアップロードする必要があります。RAWデータをサポートされている形式に簡単に変換し、結果ファイル[BulkWriterツールを使用する](./use-bulkwriter)をアップロードすることができます。 

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、リモートバケット内のファイルへのパスと、Zilliz Cloudがバケットからデータを取得するためのバケットの認証情報を入力します。 

データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。 

資格情報の取得に関する詳細については、次を参照してください:

- タグ: Amazon S 3:[長期的な資格情報を使用して認証する](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- タグ: Google Cloud Storage

- Azure Blob Storage: [アカウントのアクセスキーを表示する](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) Azureブログまとめ

セッショントークンの使用方法の詳細については、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、クラスタをホストするクラウドプロバイダに関係なく、任意のオブジェクトストレージサービスから任意のZilliz Cloudクラスタにデータをインポートできるようになりました。例えば、AWS S 3バケットからGCPにデプロイされたZilliz Cloudクラスタにデータをインポートすることができます。</p>

</Admonition>

![data-import-on-console-remote](/img/data-import-on-console-remote.png)

</exclude>

![byoc-data-import-on-console-remote](/img/byoc-data-import-on-console-remote.png)

</include>

## 結果を検証する{#verify-resultes}

インポートジョブの進捗状況は、[仕事](./job-center)ページで閲覧可能です。

## サポートされるオブジェクトパス{#supported-object-paths}

適用可能なオブジェクトパスについては、[ストレージオプション](./data-import-storage-options)と[書式オプション](./data-import-format-options)を参照してください。

## 関連するトピック{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [書式オプション](./data-import-format-options)

- [RESTful APIを使用してデータをインポートする](./import-data-via-restful-api)

- [SDKを使用してデータをインポートする](./import-data-via-sdks)

- [データインポートハンズオン](./data-import-zero-to-hero)

