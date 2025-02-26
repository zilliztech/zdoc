---
title: "データに接続する | Cloud"
slug: /connectors
sidebar_label: "データに接続する"
beta: FALSE
notebook: FALSE
description: "コネクターは、様々なデータソースをベクターデータベースに簡単に接続できる無料のツールです。このガイドでは、コネクターの概念を説明し、Zilliz Cloud Pipelinesでコネクターを作成および管理する方法について説明します。 | Cloud"
type: origin
token: Vw7zwhnd7ifEWAk6w9vcYR6lnQe
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - connect
  - data
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb

---

import Admonition from '@theme/Admonition';


# データに接続する

コネクターは、様々なデータソースをベクターデータベースに簡単に接続できる無料のツールです。このガイドでは、コネクターの概念を説明し、Zilliz Cloud Pipelinesでコネクターを作成および管理する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloud Pipelinesは、2025年第2四半期の終わりまでに廃止され、「Data In, Data Out」という新しい機能に置き換えられます。これにより、MilvusとZilliz Cloudの両方で埋め込み生成が効率化されます。2024年12月24日現在、新規ユーザー登録は受け付けられていません。現在のユーザーは、日没日まで月額20ドルの無料手当内でサービスを継続して利用できますが、SLAは提供されていません。モデルプロバイダーまたはオープンソースモデルの埋め込みAPIを使用してベクトル埋め込みを生成することを検討してください。</p>

</Admonition>

## コネクターの理解{#understanding-connectors}

コネクタは、オブジェクトストレージ、Kafka(近日公開予定)など、さまざまなデータソースからZilliz Cloudにデータを取り込むためのツールです。オブジェクトストレージコネクタを例にとると、コネクタはオブジェクトストレージバケット内のディレクトリを監視し、PDFやHTMLなどのファイルをZilliz Cloudパイプラインに同期して、ベクトル表現に変換してベクトルデータベースに保存して検索できます。インジェストおよび削除パイプラインを使用すると、Zilliz Cloud内のファイルとそのベクトル表現が同期されます。オブジェクトストレージ内のファイルの追加または削除は、ベクトルデータベースコレクションにマップされます。

![connector-overview](/img/ja-JP/connector-overview.png)

### なぜコネクタを使用するのですか?{#why-use-a-connector}

1. **リアルタイムデータ取り込み**

    リアルタイムでデータを楽々と取り込み、インデックス化することで、すべての検索問い合わせに対して最新のコンテンツが即座にアクセス可能になります。

1. **スケーラブルで適応性がある**

    DevOpsの手間をかけずに、データ取り込みパイプラインを簡単に拡張できます。アダプティブコネクタは、変動するトラフィック負荷をシームレスに処理し、スムーズなスケーラビリティを確保します。

1. **異種ソースと同期された検索インデックス**

    ドキュメントの追加と削除を検索インデックスに自動的に同期します。また、すべての一般的なデータソースを融合します（近日公開予定）。

1. **可観測性**

    詳細なログを記録し、透明性を確保し、発生する可能性のある異常を検出することで、データフローの洞察を得ることができます。

## コネクタの作成{#create-connector}

Zilliz Cloud Pipelinesは、コネクタを作成する際に柔軟なオプションを提供します。コネクタが作成されると、定期的にデータソースをスキャンし、定期的な間隔でベクトルデータベースにデータを取り込みます。

### 前提条件{#prerequisites}

- 必ず[コレクションを作成し](./manage-collections-sdks)てください。

- 作成されたコレクションには、文書の取り込みパイプラインと削除パイプラインがあることを確認してください。

<Admonition type="info" icon="📘" title="ノート">

<p>現在、Zilliz Cloud Connectorは文書データの処理のみをサポートしています。</p>

</Admonition>

### 手続き{#procedures}

1. プロジェクトに移動します。ナビゲーションパネルから[**パイプライン**]をクリックします。次に、[**コネクタ**]タブに切り替えます。[**+コネクタ**]をクリックします。

    ![create-connector](/img/ja-JP/create-connector.png)

1. データソースへのリンク。

    1. コネクタの基本情報を設定します。

        <table>
           <tr>
             <th><p><strong>パラメータ</strong></p></th>
             <th><p><strong>説明する</strong></p></th>
           </tr>
           <tr>
             <td><p>コネクタ名</p></td>
             <td><p>作成するコネクタの名前。</p></td>
           </tr>
           <tr>
             <td><p>説明（オプション）</p></td>
             <td><p>コネクタの説明。</p></td>
           </tr>
        </table>

    1. データソース情報を構成します。

        <table>
           <tr>
             <th><p><strong>パラメータ</strong></p></th>
             <th><p><strong>説明する</strong></p></th>
           </tr>
           <tr>
             <td><p>オブジェクトストレージサービス</p></td>
             <td><p>データソースのオブジェクトストレージサービスを選択してください。利用可能なオプションには、次のものがあります:</p><ul><li><p>AWSのS 3</p></li><li><p>Google Cloud Storageです。</p></li></ul></td>
           </tr>
           <tr>
             <td><p>バケットURL</p></td>
             <td><p>ソースデータにアクセスするために使用するバケットURLを指定してください。特定のファイルではなく、ファイルディレクトリのURLを入力してください。また、ルートディレクトリはサポートされていません。 URLを取得する方法の詳細については、以下を参照してください:</p><ul><li><p><a href="https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/access-bucket-intro.html">Amazon S 3バケットへのアクセスとリスティング</a></p></li><li><p><a href="https://cloud.google.com/storage/docs/discover-object-storage-console?hl=ja#share_the_object">Google Cloudコンソールでオブジェクトストレージを発見する</a></p></li></ul></td>
           </tr>
           <tr>
             <td><p>認証のためのアクセスキー（任意）</p></td>
             <td><p>必要に応じて、承認のために以下の情報を提供してください</p><ul><li><p>AWS S 3の場合、<a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey">アクセスキーとシークレットキー</a>を提供してください。</p></li><li><p>Google Cloud Storageの場合、<a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys">アクセスキーIDとシークレットアクセスキー</a>を提供してください。</p></li></ul></td>
           </tr>
        </table>

        次のステップに進むには**、リンクと続行**をクリックしてください。

        <Admonition type="info" icon="📘" title="ノート">

        <p>次のステップに進む前に、Zilliz Cloudはデータソースへの接続を確認します。</p>

        </Admonition>

        ![link-data-source](/img/ja-JP/link-data-source.png)

1. ターゲットパイプラインを追加します。

    まず、ターゲットクラスタを選択し、次に1つのインジェストパイプラインと削除パイプラインを持つコレクションを選択します。ターゲットインジェストパイプラインにはINDEX_DOC関数**のみ**が必要です。複数の削除パイプラインが利用可能な場合は、適切なものを手動で選択してください。

    <Admonition type="info" icon="📘" title="ノート">

    <p>スキャンを開始する前に、このステップをスキップして後で完了することができます。</p>

    </Admonition>

    ![add-target-pipelines](/img/ja-JP/add-target-pipelines.png)

1. 自動スキャンを有効にするかどうかを選択します。

    - 無効になっている場合、ソースデータに更新がある場合は、手動でスキャンをトリガーする必要があります。

    - 有効にすると、Zilliz Cloudは定期的にデータソースをスキャンし、指定された取り込み/削除パイプラインを介してベクトルデータベースコレクションにファイルの追加/削除を同期します。自動スキャンスケジュールを設定する必要があります。

        <table>
           <tr>
             <th><p><strong>パラメータ</strong></p></th>
             <th><p><strong>説明する</strong></p></th>
           </tr>
           <tr>
             <td><p>周波数</p></td>
             <td><p>システムがスキャンを実行する頻度を設定します。</p><ul><li><p>デイリー: 1から7までの数字を選択してください。</p></li><li><p>毎時:オプションは1、6、12、または18時間です。</p></li></ul></td>
           </tr>
           <tr>
             <td><p>次のRun at</p></td>
             <td><p>次のスキャンの時間を指定します。タイムゾーンは、<a href="./organization-settings#manage-timezone">システムタイムゾーン</a>と組織設定で一致しています。</p></td>
           </tr>
        </table>

        ![enable-auto-scan](/img/ja-JP/enable-auto-scan.png)

1. [**作成**]をクリックします。

## コネクタの管理{#manage-connector}

コネクタを効率的に管理することは、スムーズなデータ統合過程を維持するために不可欠です。このガイドでは、コネクタの管理方法について詳しく説明します。

### コネクタを有効または無効にする{#enable-or-disable-a-connector}

1. 管理するコネクタを探します。

1. クリック**。。。**下の**アクション**。

1. [**有効**]または[**無効**]を選択します。

<Admonition type="info" icon="📘" title="ノート">

<p>コネクタをアクティブにするには、ターゲットパイプラインが構成されていることを確認します。</p>

</Admonition>

![enable-connector](/img/ja-JP/enable-connector.png)

### 手動スキャンをトリガーする{#trigger-a-manual-scan}

自動スキャン機能がオフの場合は、手動スキャンを実行してください。

をクリック**。。。**"ターゲットコネクタの横にある**アクション**の下で、**スキャン**をクリックします。

<Admonition type="info" icon="📘" title="ノート">

<p>手動スキャンを開始する前に、コネクタが有効になっていることを確認してください。</p>

</Admonition>

### コネクタの設定{#configure-a-connector}

コネクタの次の設定を変更できます。

- ストレージバケットのアクセス資格情報:

    - （AWS S 3の場合）アクセスキーとシークレットキー

    - (Google Cloud Storageの場合)アクセスキーIDとシークレットアクセスキー

- 自動スキャンスケジュール。詳細については、[コネクタの作成手順の](./connectors#procedures)ステップ4を参照してください。

![configure-connector](/img/ja-JP/configure-connector.png)

### コネクタを落とす{#drop-a-connector}

必要がなくなった場合は、コネクタを取り外すことができます。

<Admonition type="info" icon="📘" title="ノート">

<p>コネクタはドロップする前に無効にする必要があります。</p>

</Admonition>

![drop-connector](/img/ja-JP/drop-connector.png)

### コネクタログの表示{#view-connector-logs}

コネクタのアクティビティを監視し、問題をトラブルシューティングする:

1. コネクタのアクティビティページにアクセスしてログを表示します。

    ![view-connector-logs](/img/ja-JP/view-connector-logs.png)

1. ステータスが`異常`な場合はエラーを示します。詳細なエラーメッセージを表示するには、ステータスの横にある「?」アイコンをクリックしてください。

### パイプライン内の関連コネクタを表示する{#view-related-connectors-in-a-pipeline}

パイプライン内のすべてのリンクされたコネクタを表示するには、[パイプラインの詳細を確認](./pipelines-text-data#view-pipeline)してください。