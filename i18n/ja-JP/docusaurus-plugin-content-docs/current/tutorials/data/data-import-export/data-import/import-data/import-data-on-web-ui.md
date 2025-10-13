---
title: "データのインポート(コンソール) | Cloud"
slug: /import-data-on-web-ui
sidebar_label: "データのインポート(コンソール)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、準備したデータをZilliz Cloudコンソールにインポートする方法を紹介します。 | Cloud"
type: origin
token: IYSWwKyhAif6wrkkQLJclF2InGc
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - console
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';


# データのインポート(コンソール)

このページでは、準備したデータをZilliz Cloudコンソールにインポートする方法を紹介します。

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- クラスタが作成されました。詳細については、「[クラスタ作成](./create-cluster)」を参照してください。

- サポートされている形式のいずれかでデータを準備していること。

    データの準備方法の詳細については、「[ストレージオプション](./data-import-storage-options)」と「[書式オプション](./data-import-format-options)」を参照してください。詳細については、エンドツーエンドのノートブック「[データインポートハンズオン](./data-import-zero-to-hero)」を参照することもできます。

- サンプルデータセットに一致するスキーマを持つコレクションを作成して読み込んでいます。コレクションの作成の詳細については、「[コレクションの管理(コンソール)](./manage-collections-console)」を参照してください。

## ウェブ上のデータをインポートする{#import-data-on-the-web-ui}

データファイルが準備できたら、ローカルドライブから直接インポートするか、オブジェクトストレージバケットにアップロードしてくださいデータのインポートには、AWS S 3やGoogle Cloud GCS、Azure Blob Storageなどがあります。

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>コレクションには、最大10,000件の実行中または保留中のインポートジョブを含めることができます。</p></li>
<li><p>ウェブコンソールは、最大1 GBのローカルJSONファイルのアップロードをサポートしています。より大きなファイルの場合は、代わりに<a href="./import-data-on-web-ui#remote-files-from-an-object-storage-bucket">オブジェクトストレージからアップロードする</a>ことをお勧めします。データのインポートに問題がある場合は、<a href="https://support.zilliz.com/hc/en-us">サポートチケットを作成</a>してください。</p></li>
</ul>

</Admonition>

### ローカルJSONファイル{#local-json-file}

データをインポートするには、ローカルファイルをアップロードエリアにドラッグアンドドロップして、&#91;**インポート**&#93;をクリックします。

![data-import-on-console](/img/data-import-on-console.png)

### オブジェクトストレージバケットからのリモートファイル{#remote-files-from-an-object-storage-bucket}

リモートファイルをインポートするには、まずリモートバケットにアップロードする必要があります。[BulkWriterツールを使用して](./use-bulkwriter)、生データをサポートされている形式に簡単に変換し、結果ファイルをアップロードできます。

準備したファイルをリモートバケットにアップロードしたら、オブジェクトストレージサービスを選択し、リモートバケット内のファイルへのパスと、Zilliz Cloudがバケットからデータを取得するためのバケットの認証情報を入力します。

データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。

資格情報の取得に関する詳細については、次を参照してください:

- Amazon S 3:[長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage:[サービスアカウントのHMACキーを管理する](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage:[アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用方法については、[FAQを](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、クラスタをホストするクラウドプロバイダに関係なく、任意のオブジェクトストレージサービスから任意のZilliz Cloudクラスタにデータをインポートできるようになりました。例えば、AWS S 3バケットからGCPにデプロイされたZilliz Cloudクラスタにデータをインポートすることができます。</p>

</Admonition>

![data-import-on-console-remote](/img/data-import-on-console-remote.png)

## 結果を検証する{#verify-resultes}

インポートジョブの進捗状況やステータスは「**[Job](./job-center)**」ページで閲覧可能です。

## サポートされるオブジェクトパス{#supported-object-paths}

適用可能なオブジェクトパスについては、「[ストレージオプション](./data-import-storage-options)」と「[書式オプション](./data-import-format-options)」を参照してください。

## 関連するトピック{#related-topics}

- [ストレージオプション](./data-import-storage-options)

- [書式オプション](./data-import-format-options)

- [データのインポート(RESTful API)](./import-data-via-restful-api)

- [データのインポート(SDK)](./import-data-via-sdks)

- [データインポートハンズオン](./data-import-zero-to-hero)

