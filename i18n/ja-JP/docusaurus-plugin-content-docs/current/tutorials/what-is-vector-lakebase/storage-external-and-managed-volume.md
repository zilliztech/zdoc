---
title: "ストレージ：外部および管理ボリューム | Cloud"
slug: /storage-external-and-managed-volume
sidebar_key: storage-external-and-managed-volume
sidebar_label: "ストレージ：外部および管理ボリューム"
beta: FALSE
notebook: FALSE
description: "ボリュームは、Zilliz Cloud におけるストレージ抽象化のレイヤーです。これは、Parquet などの構造化形式や画像・PDF などの非構造化ファイルといったデータファイルを格納するオブジェクトストアです。ボリュームから、コレクションへ直接データをインポートまたは移行したり、ETL パイプラインを実行して非構造化データを埋め込みベクトルに変換し、コレクションにロードしたりできます。ボリュームは単一のクラスターではなくプロジェクトに所属するため、同じプロジェクト内の任意のクラスターからアクセス可能です。 | Cloud"
type: origin
token: NsVXwIAC4ihZbpkcvVscoUI7n9b
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - ストレージ
  - 外部ボリューム
  - 管理ボリューム
  - ボリューム

---

import Admonition from '@theme/Admonition';


# ストレージ：外部ボリュームとマネージドボリューム

ボリュームは、Zilliz Cloud におけるストレージ抽象化のレイヤーです。これは、Parquet などの構造化形式や画像・PDF などの非構造化ファイルといったデータファイルを格納するオブジェクトストアです。ボリュームからは、データを直接コレクションにインポートまたは移行したり、ETL パイプラインを実行して非構造化データを埋め込みに変換し、コレクションにロードしたりできます。ボリュームは単一のクラスターではなくプロジェクトに属するため、同じプロジェクト内の任意のクラスターからアクセスできます。

Zilliz Cloud では、ボリュームには次の 2 つのタイプがあります：

- **マネージドボリューム**：データが物理的に格納され、Zilliz Cloud によって管理される、プラットフォームによってプロビジョニングされたストレージスペース。

- **外部ボリューム**：ユーザー自身のクラウドオブジェクトストレージ内の場所へのポインター。データはユーザーのクラウドオブジェクトストレージに残ったまま、リモートからアクセスされます。

どちらのタイプのボリュームもフォーマットに依存せず、スキーマ情報を持ちません。フォーマットとスキーマはボリューム層ではなく、コレクション層で定義されます。

## ボリュームが必要な理由\{#why-volumes}

多くの AI およびデータワークフローでは、検索可能にする前に埋め込みへ変換する必要がある文書、画像、音声ファイルなどの非構造化データを扱います。ボリューム層がない場合、生ファイル用のオブジェクトストア、ETL 用の計算環境、提供用のベクトルデータベースという別々のインフラストラクチャを組み合わせる必要があります。それぞれの部品には独自の認証情報、アクセス管理、ライフサイクルがあります。

ボリュームにより、ストレージがコレクション、インデックス、検索クエリが存在するのと同じプラットフォーム内に統合されます。生ファイル、中間出力、準備済みのデータセットはすべてボリューム内に存在し、プロジェクト内の任意のクラスターからアクセスできます。非構造化データから検索可能な埋め込みまでのパイプライン全体が、別のストレージインフラストラクチャを必要とせずに Zilliz Cloud 内で実行されます。

すでにユーザー自身のクラウドストレージに存在するデータの場合、外部ボリュームを使用すれば、ファイルをコピーまたは移動することなく Zilliz Cloud に接続できます。ストレージ統合により認証情報が一元管理されるため、データエンジニアはすべてのスクリプトでアクセスキーを管理する代わりに、名前によってボリュームを参照できます。

## 2 つのボリュームタイプ\{#two-types-of-volumes}

Zilliz Cloud は、データライフサイクルにおいて異なる役割を果たす 2 つのボリュームタイプをサポートしています。

![EX9ewYFIQhHXAibLjVVcuM0pnvg](https://zdoc-images.s3.us-west-2.amazonaws.com/EX9ewYFIQhHXAibLjVVcuM0pnvg.png)

- **マネージドボリューム**：データを Zilliz Cloud が管理するストレージに格納します。外部の認証情報やストレージパスは不要で、プラットフォームが自動的にストレージを割り当てます。ローカルファイルシステムからファイルやフォルダーをアップロードし、それをインポート、移行、または ETL パイプラインを実行してデータをコレクションにロードします。マネージドボリュームを削除すると、格納されているデータも同時に削除されます。独自のクラウドオブジェクトストレージを維持していないユーザーに最適です。

- **外部ボリューム**：ユーザー自身のクラウドオブジェクトストレージ（Amazon S3 または Google Cloud Storage）内のパスにマッピングされます。認証情報のアクセスのためにストレージ統合を参照します。Zilliz Cloud は指定されたパスからデータを直接読み取り、コピーまたは移動しません。データはユーザーのバケット内に残ります。データをマネージドコレクションにインポートまたは移行したり、インポートせずにデータを直接参照する外部コレクションを作成したりできます。外部ボリュームを削除しても、Zilliz Cloud からボリュームメタデータが削除されるだけであり、データはクラウドオブジェクトストレージ内に無傷のまま残ります。データを独自のストレージに保持したまま Zilliz Cloud で使用したいユーザーに最適です。

次の表は、これら 2 つのボリュームタイプを比較したものです。

<table>
   <tr>
     <th></th>
     <th><p><strong>マネージドボリューム</strong></p></th>
     <th><p><strong>外部ボリューム</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>データの場所</strong></p></td>
     <td><p>Zilliz Cloud が管理するストレージ</p></td>
     <td><p>ユーザー自身の S3 または GCS バケット</p></td>
   </tr>
   <tr>
     <td><p><strong>推奨ユーザー</strong></p></td>
     <td><p>独自のクラウドオブジェクトストレージを維持していないユーザー。</p></td>
     <td><p>データを独自のストレージに保持したまま Zilliz Cloud で使用したいユーザー。</p></td>
   </tr>
   <tr>
     <td><p><strong>アクセス制御</strong></p></td>
     <td><p>Zilliz Cloud RBAC、API キーによる認証</p></td>
     <td><p>クラウドプロバイダー IAM、<a href="null">ストレージ統合</a>による認証</p></td>
   </tr>
   <tr>
     <td><p><strong>データファイル操作</strong></p></td>
     <td><p>読み取り、書き込み、削除</p></td>
     <td><p>読み取り専用</p><Admonition type="info" icon="📘" title="Notes"> <p>外部ボリュームの場合、データはユーザーのバケット内に残ります。ファイル（作成、更新、削除）はユーザーのクラウドオブジェクトストレージ内で直接管理します。Zilliz Cloud はパスから読み取るのみです。</p> </Admonition></td>
   </tr>
   <tr>
     <td><p><strong>ユースケース</strong></p></td>
     <td><p>インポート、移行、データ ETL</p></td>
     <td><p>インポート、移行、データ ETL、および外部コレクション</p></td>
   </tr>
</table>

## アーキテクチャ\{#architecture}

ボリュームは単一のクラスターではなくプロジェクトに属します。同じプロジェクト内の任意のクラスターがボリュームにアクセスできます。 

```plaintext
Organization  
  └─ Project
     ├─ Serving Clusters                                                                                                                                                                                    
     │   └─ Cluster Databases
     │       └─ Collections                                                                                                                                                                                 
     ├─  Databases in on-demand compute                                         
     │   └─ Collections
     ├─ Volumes                                                                                                                                                                                             
     │   ├─ Managed Volumes → Data files (Zilliz-hosted)
     │   └─ External Volumes → Maps to your cloud storage bucket (via Storage Integration)                                                                                                                  
     └─ Storage Integrations      
```

3 つのリソースタイプは、それぞれ異なる責任層を処理します。

<table>
   <tr>
     <th><p><strong>Layer</strong></p></th>
     <th><p><strong>Resource</strong></p></th>
     <th><p><strong>Responsibility</strong></p></th>
   </tr>
   <tr>
     <td><p>Credential</p></td>
     <td><p>ストレージ統合</p></td>
     <td><p>外部ストレージへのアクセス方法（IAM ロール、クラウドプロバイダー）</p></td>
   </tr>
   <tr>
     <td><p>Storage</p></td>
     <td><p>ボリューム</p></td>
     <td><p>データの場所（ストレージパス + ホスティングタイプ）</p></td>
   </tr>
   <tr>
     <td><p>データ</p></td>
     <td><p>Collection</p></td>
     <td><p>データの意味（スキーマ、フォーマット、インデックス、更新戦略）</p></td>
   </tr>
</table>

各層は独立しています。ストレージ統合内の IAM ロールを変更しても、それを参照するボリュームに変更を加える必要はありません。既存のボリュームに対して新しいコレクションを追加する場合も、ボリュームやストレージ統合に変更を加える必要はありません。この独立性こそが、システムを大規模に管理可能にする要因です。

## リソースの関係\{#resource-relationships}

ストレージ統合、ボリューム、コレクションは、階層的な 1 対多のチェーンを形成します。これらの関係を理解することで、システムが各レベルで設定を繰り返すことなくどのようにスケールするかを説明できます。

### 1 つのストレージ統合と多数の外部ボリューム\{#one-storage-integration-many-external-volumes}

ストレージ統合は、クラウドアカウント用の IAM ロールをラップし、任意の数の外部ボリュームから参照できます。管理者はストレージ統合内で認証情報を一度設定するだけで済み、データエンジニアは認証情報を直接扱うことなく、それを選択してパスを指定することでボリュームを作成できます。Zilliz Cloud はクラウド認証情報を保存することはなく、各操作時に `Assumeロール` を介して一時的な STS 認証情報を取得し、使用後に破棄します。    

```plaintext
Storage Integration: "s3_access"
    │
    ├── External Volume: "product_docs"     → s3://docs/product-manuals/
    ├── External Volume: "partner_kb"       → s3://docs/partner-articles/
    └── External Volume: "changelog"        → s3://docs/changelog/
```

### 1 つのボリューム、多数のコレクション\{#one-volume-many-collections}

ボリュームはフォーマットやスキーマ情報を保持しません。ファイルの場所を知ることはできますが、その中身については知りません。フォーマットの解釈はコレクション層で行われます。つまり、複数のコレクションが同じボリュームを参照でき、それぞれが異なるスキーマを適用したり、異なる目的で利用したりすることが可能です。

```plaintext
External Volume: "product_docs"
    │
    ├── Collection "product_search"
    │   format: parquet
    │   fields: doc_id, chunk_text, embedding FLOAT_VECTOR[1536]
    │
    └── Collection "product_metadata"
        format: parquet
        fields: doc_id, title, last_updated, author
```

## ユースケース\{#use-cases}

ボリュームは、データインポート、データ移行、および外部コレクションに使用できます。

- **データインポート**

    ボリューム内で準備されたデータセットをアップロードまたは参照し、Zilliz Cloud コレクションにインポートします。マネージドボリュームと外部ボリュームの両方をインポートソースとして使用できます。詳細については、[データのインポート (コンソール)](./import-data-on-web-ui#from-a-volume)、[データのインポート (RESTful API)](./import-data-via-restful-api)、および [データのインポート (SDK)](./import-data-via-sdks) を参照してください。

- **データ移行**

    Milvus インスタンスのバックアップファイルをボリュームにアップロードし、Zilliz Cloud クラスターとして復元します。マネージドボリュームと外部ボリュームの両方を使用できます。詳細については、[バックアップファイルを介して Milvus から Zilliz Cloud へ移行する](./via-backup-files) を参照してください。

- **外部コレクション** 

    外部ボリューム内のデータにマップする [外部コレクション](./data-external-and-managed-collections) を作成し、最初にインポートすることなく、独自のバケット内のファイルを Zilliz Cloud から直接クエリできるようにします。